const vscode = require('vscode');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const fileSystem = require('../fileSystem');
const Metadata = require('../metadata');
const Config = require('../main/config');
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;
const MetadataConnection = Metadata.Connection;
const MetadataFactory = Metadata.Factory;
const MetadataUtils = Metadata.Utils;
const MetadataType = Metadata.MetadataTypes;
const PackageGenerator = Metadata.PackageGenerator;
const AuraParser = languages.AuraParser;
const ProfileUtils = Metadata.ProfileUtils;
const PermissionSetUtils = Metadata.PermissionSetUtils;

const PACKAGE_FILE_NAME = "package.xml";

const metadataForGetPermissions = [
    "CustomApplication",
    "ApexClass",
    "ApexPage",
    "CustomMetadata",
    "CustomObject",
    "CustomField",
    "CustomPermission",
    "CustomTab",
    "Flow",
    "Layout",
    "RecordType",
];

let user;

exports.run = async function () {
    let profileNames = [];
    let filePath;
    let editorOppened = false;
    let wrongFile = false;
    let showOptions = true;
    let typeForRetrieve = 'Permission Set';
    try {
        user = await Config.getAuthUsername();
        let options = ["From Local", "From Org"];
        window.showQuickPick(options, { placeHolder: "Load " + typeForRetrieve + "s from" }).then((selected) => showProfiles(profileNames, selected, typeForRetrieve));
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function showProfiles(profileNames, retrieveFrom, typeForRetrieve) {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Loading " + typeForRetrieve + "s",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (resolve) {
            if (retrieveFrom === 'From Org') {
                profileNames = await listProfilesFromOrg(typeForRetrieve, cancelToken);
            } else if (retrieveFrom === 'From Local') {
                const metadataTypes = await MetadataConnection.getMetadataTypesFromOrg(user);
                let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataTypes);
                let metadataFromFileSystem = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
                if (metadataFromFileSystem[MetadataType.PERMISSION_SET] && Object.keys(metadataFromFileSystem[MetadataType.PERMISSION_SET].childs).length > 0) {
                    profileNames = Object.keys(metadataFromFileSystem[MetadataType.PERMISSION_SET].childs);
                }
            }
            if (profileNames && profileNames.length > 0) {
                retrieve(profileNames, typeForRetrieve);
            } else {
                window.showErrorMessage(typeForRetrieve + "s not found");
            }
            resolve();
        });
    });
}

function listProfilesFromOrg(typeForRetrieve, cancelToken) {
    return new Promise(async function (resolve) {
        let profileNames = [];
        let user = await Config.getAuthUsername();
        let object = '';
        if (typeForRetrieve === 'Permission Set')
            object = 'PermissionSet';
        else
            object = 'Profile';
        let out = await ProcessManager.mdApiDescribeMetadata(user, object, undefined, cancelToken);
        if (out) {
            if (out.stdErr) {

            } else {
                let outJson = JSON.parse(out.stdOut);
                let profiles = (Array.isArray(outJson.result)) ? outJson.result : [outJson.result];
                for (const profile of profiles) {
                    profileNames.push(profile.fullName);
                }
                resolve(profileNames);
            }
        }
    });
}

async function retrieve(profileNames, typeForRetrieve) {
    let profileOptions = [];
    profileOptions.push('All ' + typeForRetrieve + 's');
    profileOptions = profileOptions.concat(profileNames);
    let profileSelectedOption = await window.showQuickPick(profileOptions, { placeHolder: "Select an option for retrieve" });
    if (profileSelectedOption) {
        if (profileSelectedOption !== 'All ' + typeForRetrieve + 's') {
            profileNames = [profileSelectedOption];
        }
        let selectedToDownload = await window.showQuickPick(['Org Namespace Permissions', 'All Permissions'], { placeHolder: "Choose for retrieve all permissions or only from org namespaces" });
        if (selectedToDownload) {
            let downloadAll = selectedToDownload === 'All Permissions';
            let compressOnSave = await window.showQuickPick(['Yes', 'No'], { placeHolder: "Do you want to save compressed?" });
            if (compressOnSave) {
                window.withProgress({
                    location: ProgressLocation.Notification,
                    title: "Getting Metadata from Org",
                    cancellable: true
                }, (progress, canceltoken) => {
                    return new Promise(resolve => {
                        retrieveProfiles(profileNames, typeForRetrieve, downloadAll, compressOnSave === 'Yes', progress, canceltoken, function () {
                            resolve();
                            window.showInformationMessage(typeForRetrieve + "s Retrieved Succesfully");
                        });
                    });
                });
            }
        }
    }
}

async function retrieveProfiles(profileNames, typeForRetrieve, downloadAll, compress, progress, cancelToken, callback) {
    let user = await Config.getAuthUsername();
    let orgNamespace = Config.getOrgNamespace(user);
    MetadataConnection.getMetadataFromOrg(user, metadataForGetPermissions, orgNamespace, downloadAll, progress, cancelToken, function (metadata) {
        let profileMetadata;
        if (typeForRetrieve === 'Permission Set')
            profileMetadata = MetadataFactory.createMetadataType('PermissionSet', true);
        else
            profileMetadata = MetadataFactory.createMetadataType('Profile', true);
        for (const profile of profileNames) {
            profileMetadata.childs[profile] = MetadataFactory.createMetadataObject(profile, true);
        }
        if (metadata && Object.keys(metadata).length > 0) {
            progress.report({ message: "Retrieving " + typeForRetrieve + "s from Org" });
            if (typeForRetrieve === 'Permission Set')
                metadata['PermissionSet'] = profileMetadata;
            else
                metadata['Profile'] = profileMetadata;
            Object.keys(metadata).forEach(function (key) {
                metadata[key].checked = true;
                Object.keys(metadata[key].childs).forEach(function (childKey) {
                    if (metadata[key].childs[childKey]) {
                        metadata[key].childs[childKey].checked = true;
                        Object.keys(metadata[key].childs[childKey].childs).forEach(function (grandChildKey) {
                            if (metadata[key].childs[childKey].childs[grandChildKey])
                                metadata[key].childs[childKey].childs[grandChildKey].checked = true;
                        });
                    }
                });
            });
            retrieveMetadata(user, metadata, compress, typeForRetrieve, progress, cancelToken, callback);
        } else {
            if (callback)
                callback.call(this);
        }
    });
}

async function retrieveMetadata(user, metadata, compress, typeForRetrieve, progress, cancelToken, callback) {
    let packageContent = PackageGenerator.createPackage(metadata, Config.getOrgVersion());
    let packageFolder = Paths.getPackageFolder();
    let parent = Paths.getFolderPath(packageFolder);
    packageFolder = parent + '/projectTemp';
    if (FileChecker.isExists(packageFolder))
        FileWriter.delete(packageFolder);
    if (!FileChecker.isExists(parent))
        FileWriter.createFolderSync(parent);
    let out = await ProcessManager.createSFDXProject('projectTemp', parent, cancelToken);
    if (out) {
        if (out.stdErr) {
            window.showErrorMessage("An error ocurred when converting project to SFDX: \n" + out.stdErr);
        } else {
            let packageFile = packageFolder + '/manifest/' + PACKAGE_FILE_NAME;
            FileWriter.createFileSync(packageFile, packageContent);
            let setDefaultOrgOut = await ProcessManager.setDefaultOrg('projectTemp', packageFolder, cancelToken);
            if (setDefaultOrgOut.stdErr) {
                window.showErrorMessage("An error ocurred when converting project to SFDX: \n" + setDefaultOrgOut.stdErr);
            } else {
                let retrieveOut = await ProcessManager.retrieveSFDX(user, packageFile, packageFolder, cancelToken);
                progress.report({ message: "Copying retrieved files into your project folder" });
                if (typeForRetrieve === 'Permission Set') {
                    let profiles = FileReader.readDirSync(packageFolder + '/force-app/main/default/permissionsets');
                    if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '/permissionsets'))
                        FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '/permissionsets');
                    for (const profile of profiles) {
                        let targetFile = Paths.getMetadataRootFolder() + '/permissionsets/' + profile;
                        let sourceFile = packageFolder + '/force-app/main/default/permissionsets/' + profile;
                        if (compress) {
                            let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                            let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                            if (profileRaw) {
                                let profile = PermissionSetUtils.createPermissionSet(profileRaw);
                                FileWriter.createFileSync(targetFile, PermissionSetUtils.toXML(profile, true));
                            }
                        }
                        //FileWriter.copyFile(sourceFile, targetFile, function () { });
                    }
                } else {
                    let profiles = FileReader.readDirSync(packageFolder + '/force-app/main/default/profiles');
                    if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '/profiles'))
                        FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '/profiles');
                    for (const profile of profiles) {
                        let targetFile = Paths.getMetadataRootFolder() + '/profiles/' + profile;
                        let sourceFile = packageFolder + '/force-app/main/default/profiles/' + profile;
                        if (compress) {
                            let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                            let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                            if (profileRaw) {
                                let profile = ProfileUtils.createProfile(profileRaw);
                                FileWriter.createFileSync(targetFile, ProfileUtils.toXML(profile, true));
                            }
                        }
                        //FileWriter.copyFile(sourceFile, targetFile, function () { });
                    }
                }
            }
        }
    } else {
        window.showInformationMessage("Operation cancelled by the user");
    }
    if (callback)
        callback.call(this);
}