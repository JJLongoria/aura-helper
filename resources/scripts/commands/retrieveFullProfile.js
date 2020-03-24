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

exports.run = function (uriOrNames) {
    let profileNames = [];
    let filePath;
    let editorOppened = false;
    let wrongFile = false;
    let showOptions = true;
    let isPermissionSets = false;
    try {
        if (uriOrNames && uriOrNames.fsPath) {
            filePath = uriOrNames.fsPath;
            if (FileChecker.isProfile(filePath) || FileChecker.isPermissionSet(filePath)) {
                showOptions = false;
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
                isPermissionSets = FileChecker.isPermissionSet(filePath)
            } else if (FileChecker.isProfileFolder(filePath) || FileChecker.isPermissionSetFolder(filePath)) {
                let files = FileReader.readDirSync(filePath);
                for (const file of files) {
                    profileNames.push(file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
                }
                showOptions = false;
                isPermissionSets = FileChecker.isPermissionSetFolder(filePath);
            } else {
                wrongFile = true;
            }
        } else if (window.activeTextEditor) {
            filePath = window.activeTextEditor.document.uri.fsPath;
            editorOppened = true;
            if (FileChecker.isProfile(filePath) || FileChecker.isPermissionSet(filePath))
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
            isPermissionSets = FileChecker.isPermissionSet(filePath)
        }
        if (!wrongFile) {
            if (showOptions) {
                let options = [];
                if (isPermissionSets) {
                    if (editorOppened && profileNames.length > 0) {
                        options.push("Current Permission set");
                    }
                    options.push("Single Local Permission Set");
                    options.push("Single Permission Set from Org");
                    options.push("All Local Permission Sets");
                    options.push("All Permission Sets from Org");
                } else {
                    if (editorOppened && profileNames.length > 0) {
                        options.push("Current Profile");
                    }
                    options.push("Single Local Profile");
                    options.push("Single Profile from Org");
                    options.push("All Local Profiles");
                    options.push("All Profiles from Org");
                }
                window.showQuickPick(options, { placeHolder: "Select an Options for Retrieve" }).then((selected) => showProfiles(profileNames, selected, isPermissionSets));
            } else {
                showProfiles(profileNames, 'Selected', isPermissionSets)
            }
        } else {
            window.showErrorMessage('The selected file is not a Profile or Permission set File or Folder');
        }
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function showProfiles(profileNames, selectedProfile, isPermissionSets) {
    if (selectedProfile === 'Single Local Profile' || selectedProfile === 'Single Local Permission Set') {
        let options = [];
        let files;
        if (isPermissionSets)
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/permissionsets');
        else
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            options.push(file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
        }
        let placeHolder = (isPermissionSets) ? 'Select one Permission Set for Retrieve' : 'Select one Profile for Retrieve';
        window.showQuickPick(options, { placeHolder: placeHolder }).then((selected) => retrieve([selected], isPermissionSets));
    } else if (selectedProfile === 'Single Profile from Org' || selectedProfile === 'Single Permission Set from Org') {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: (isPermissionSets) ? "Loading Permission Sets from Org" : "Loading Profiles from Org",
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(async function (resolve) {
                let profileNames = await listProfilesFromOrg(isPermissionSets, cancelToken);
                if (profileNames) {
                    resolve();
                    let placeHolder = (isPermissionSets) ? 'Select one Permission Set for Retrieve' : 'Select one Profile for Retrieve';
                    window.showQuickPick(profileNames, { placeHolder: placeHolder }).then((selected) => retrieve([selected], isPermissionSets));
                }
            });
        });
    } else if (selectedProfile === 'All Local Profiles' || selectedProfile === 'All Local Permission Sets') {
        let files;
        if (isPermissionSets)
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/permissionsets');
        else
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            let profileName = file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', '');
            if (!profileNames.includes(profileName))
                profileNames.push(profileName);
        }
        retrieve(profileNames, isPermissionSets)
    } else if (selectedProfile === 'All Profiles from Org' || selectedProfile === 'All Permission Sets from Org') {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: (isPermissionSets) ? "Loading Permission Sets from Org" : "Loading Profiles from Org",
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(async function (resolve) {
                let profileNames = await listProfilesFromOrg(isPermissionSets, cancelToken);
                retrieve(profileNames, isPermissionSets);
                resolve();
            });
        });
    } else if (selectedProfile === 'Selected') {
        retrieve(profileNames, isPermissionSets)
    }
}

function listProfilesFromOrg(isPermissionSets, cancelToken) {
    return new Promise(async function (resolve) {
        let profileNames = [];
        let user = await Config.getAuthUsername();
        let object = '';
        if (isPermissionSets)
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

async function retrieve(profileNames, isPermissionSets) {
    let selectedToDownload = await window.showQuickPick(['Only Org Namespace', 'All'], { placeHolder: "Choose for retrieve all permissions or only from org namespaces" });
    if (selectedToDownload) {
        let downloadAll = selectedToDownload === 'All';
        let compressOnSave = await window.showQuickPick(['Yes', 'No'], { placeHolder: "Do you want to save compressed?" });
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Getting Metadata from Org",
            cancellable: true
        }, (progress, canceltoken) => {
            return new Promise(resolve => {
                retrieveProfiles(profileNames, isPermissionSets, downloadAll, compressOnSave === 'Yes', progress, canceltoken, function () {
                    resolve();
                    window.showInformationMessage((isPermissionSets) ? "Permission Retrieved Succesfully" : "Profiles Retrieved Succesfully");
                });
            });
        });
    }
}

async function retrieveProfiles(profileNames, isPermissionSets, downloadAll, compress, progress, cancelToken, callback) {
    let user = await Config.getAuthUsername();
    let orgNamespace = Config.getOrgNamespace(user);
    MetadataConnection.getMetadataFromOrg(user, metadataForGetPermissions, orgNamespace, downloadAll, progress, cancelToken, function (metadata) {
        let profileMetadata;
        if (isPermissionSets)
            profileMetadata = MetadataFactory.createMetadataType('PermissionSet', true);
        else
            profileMetadata = MetadataFactory.createMetadataType('Profile', true);
        for (const profile of profileNames) {
            profileMetadata.childs[profile] = MetadataFactory.createMetadataObject(profile, true);
        }
        if (metadata && Object.keys(metadata).length > 0) {
            progress.report({ message: "Retrieving " + ((isPermissionSets) ? "Permission Sets" : "Profiles") + " from Org" });
            if (isPermissionSets)
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
            retrieveMetadata(user, metadata, compress, isPermissionSets, progress, cancelToken, callback);
        } else {
            if (callback)
                callback.call(this);
        }
    });
}

async function retrieveMetadata(user, metadata, compress, isPermissionSets, progress, cancelToken, callback) {
    let packageContent = PackageGenerator.createPackage(metadata, Config.getOrgVersion());
    let buffer = [];
    let bufferError = [];
    let packageFolder = Paths.getPackageFolder();
    let parent = Paths.getFolderPath(packageFolder);
    packageFolder = parent + '/projectTemp';
    if (FileChecker.isExists(packageFolder))
        FileWriter.delete(packageFolder);
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
                if (isPermissionSets) {
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
                                FileWriter.createFile(sourceFile, PermissionSetUtils.toXML(profile, true), function () { });
                            }
                        }
                        FileWriter.copyFile(sourceFile, targetFile, function () { });
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
                                FileWriter.createFile(sourceFile, ProfileUtils.toXML(profile, true), function () { });
                            }
                        }
                        FileWriter.copyFile(sourceFile, targetFile, function () { });
                    }
                }
            }
        }
    } else {
        window.showInformationMessage("Operation cancelled by the user");
    }
    if (callback)
        callback.call(this);
    /*let packageContent = PackageGenerator.createPackage(metadata, Config.getOrgVersion());
    let packageFolder = Paths.getPackageFolder();
    let packageFile = packageFolder + '\\' + PACKAGE_FILE_NAME;
    if (FileChecker.isExists(packageFolder))
        FileWriter.delete(packageFolder);
    FileWriter.createFolderSync(packageFolder);
    FileWriter.createFileSync(packageFile, packageContent);
    let buffer = [];
    let bufferError = [];
    ProcessManager.retrieve(user, packageFolder, packageFile, cancelToken, function (event, data) {
        switch (event) {
            case ProcessEvent.STD_OUT:
                buffer = buffer.concat(data);
                break;
            case ProcessEvent.END:
                let outJson = JSON.parse(buffer.toString());
                if (outJson.status === 0) {
                    FileWriter.unzip(packageFolder + '\\unpackaged.zip', packageFolder, function () {
                        if (isPermissionSets) {
                            let profiles = FileReader.readDirSync(packageFolder + '\\permissionsets');
                            if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '\\permissionsets'))
                                FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '\\permissionsets');
                            for (const profile of profiles) {
                                let targetFile = Paths.getMetadataRootFolder() + '\\permissionsets\\' + profile + '-meta.xml';
                                let sourceFile = packageFolder + '\\permissionsets\\' + profile;
                                if (compress) {
                                    let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                                    let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                                    if (profileRaw) {
                                        let profile = PermissionSetUtils.createPermissionSet(profileRaw);
                                        FileWriter.createFileSync(sourceFile, PermissionSetUtils.toXML(profile, true));
                                    }
                                }
                                FileWriter.copyFileSync(sourceFile, targetFile);
                            }
                        } else {
                            let profiles = FileReader.readDirSync(packageFolder + '\\profiles');
                            if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '\\profiles'))
                                FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '\\profiles');
                            for (const profile of profiles) {
                                let targetFile = Paths.getMetadataRootFolder() + '\\profiles\\' + profile + '-meta.xml';
                                let sourceFile = packageFolder + '\\profiles\\' + profile;
                                if (compress) {
                                    let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                                    let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                                    if (profileRaw) {
                                        let profile = ProfileUtils.createProfile(profileRaw);
                                        FileWriter.createFileSync(sourceFile, ProfileUtils.toXML(profile, true));
                                    }
                                }
                                FileWriter.copyFileSync(sourceFile, targetFile);
                            }
                        }
                        if (callback)
                            callback.call(this);
                    });
                }
                break;
            default:
                break;
        }
    });*/
}