const vscode = require('vscode');
const Metadata = require('../metadata');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const fileSystem = require('../fileSystem');
const Config = require('../main/config');
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const MetadataTypes = Metadata.MetadataTypes;
const ProgressLocation = vscode.ProgressLocation;
const MetadataConnection = Metadata.Connection;
const MetadataFactory = Metadata.Factory;
const MetadataUtils = Metadata.Utils;
const PackageGenerator = Metadata.PackageGenerator;
const AuraParser = languages.AuraParser;
const CustomObjectUtils = Metadata.CustomObjectUtils;
const Window = vscode.window;


const PACKAGE_FILE_NAME = "package.xml";
let user;

const metadataForUpdateRecordTypes = [
    MetadataTypes.COMPACT_LAYOUT,
    MetadataTypes.CUSTOM_FIELDS,
    MetadataTypes.BUSINESS_PROCESS
];

exports.run = async function () {
    try {
        user = await Config.getAuthUsername();
        let orgNamesace = Config.getOrgNamespace(user);
        let options = ["From Local", "From Org"];
        let retrieveFrom = await Window.showQuickPick(options, { placeHolder: "Load Record Types from" });
        if (retrieveFrom) {
            const selectedForRetrieve = await Window.showQuickPick(['All Record Types', 'From SObject'], { placeHolder: 'Select Option for Retrieve Record Types.' });
            if (selectedForRetrieve) {
                Window.withProgress({
                    location: ProgressLocation.Notification,
                    title: "Loading Record Types",
                    cancellable: true
                }, (progress, cancelToken) => {
                    return new Promise(async function (resolve) {
                        let metadataTypesObjects;
                        if (retrieveFrom === "From Org") {
                            let metadataForDownload = [MetadataTypes.RECORD_TYPE];
                            metadataTypesObjects = await MetadataConnection.downloadMatadataFromOrg(user, metadataForDownload, orgNamesace, false, undefined, cancelToken);
                        } else {
                            const metadataTypes = await MetadataConnection.getMetadataTypesFromOrg(user);
                            let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataTypes);
                            metadataTypesObjects = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
                        }
                        if (selectedForRetrieve === 'All Record Types') {
                            retrieveRecordTypes(user, { retrieveOption: 'all', source: retrieveFrom, orgNamesace: orgNamesace }, metadataTypesObjects, cancelToken, function(){
                                resolve();
                            });
                        } else {
                            let recordTypesByObject = metadataTypesObjects[MetadataTypes.RECORD_TYPE].childs;
                            let sobjects = Object.keys(recordTypesByObject);
                            const sObjectSelected = await Window.showQuickPick(sobjects, { placeHolder: 'Select an SObject for Retrieve Record Types.' });
                            if (sObjectSelected) {
                                let sObjectOption = 'All Record Types from ' + sObjectSelected;
                                let options = [sObjectOption];
                                let recordTypesFromObject = recordTypesByObject[sObjectSelected].childs;
                                options = options.concat(Object.keys(recordTypesFromObject));
                                const selectedRecordType = await Window.showQuickPick(options, { placeHolder: 'Select a Record Type for Retrieve.' });
                                if (selectedRecordType === sObjectOption) {
                                    retrieveRecordTypes(user, { retrieveOption: 'byObject', sObject: sObjectSelected, source: retrieveFrom, orgNamesace: orgNamesace }, metadataTypesObjects, cancelToken, function(){
                                        resolve();
                                    });
                                } else if (selectedRecordType) {
                                    retrieveRecordTypes(user, { retrieveOption: 'single', sObject: sObjectSelected, recordType: selectedRecordType, source: retrieveFrom, orgNamesace: orgNamesace }, metadataTypesObjects, cancelToken, function(){
                                        resolve();
                                    });
                                }
                            }
                        }
                    });
                });
            }
        }
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

async function retrieveRecordTypes(user, options, metadata, cancelToken, callback) {
    if (options.source === "From Org") {
        let metadataForDownload = [MetadataTypes.RECORD_TYPE];
        metadataForDownload = metadataForDownload.concat(metadataForUpdateRecordTypes);
        metadata = await MetadataConnection.downloadMatadataFromOrg(user, metadataForDownload, options.orgNamesace, false, undefined, cancelToken);
    }
    if (options.retrieveOption === 'all') {
        Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs).forEach(function (key) {
            metadata[MetadataTypes.RECORD_TYPE].childs[key].checked = true;
            Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs[key].childs).forEach(function (childKey) {
                metadata[MetadataTypes.RECORD_TYPE].childs[key].childs[childKey].checked = true;
            });
        });
        for (const metadataForRecordtype of metadataForUpdateRecordTypes) {
            Object.keys(metadata[metadataForRecordtype].childs).forEach(function (key) {
                metadata[metadataForRecordtype].childs[key].checked = true;
                Object.keys(metadata[metadataForRecordtype].childs[key].childs).forEach(function (childKey) {
                    metadata[metadataForRecordtype].childs[key].childs[childKey].checked = true;
                });
            });
        }
    } else if (options.retrieveOption === 'byObject') {
        metadata[MetadataTypes.RECORD_TYPE].childs[options.sObject].checked = true;
        Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs[options.sObject].childs).forEach(function (childKey) {
            metadata[MetadataTypes.RECORD_TYPE].childs[options.sObject].childs[childKey].checked = true;
        });
        for (const metadataForRecordtype of metadataForUpdateRecordTypes) {
            Object.keys(metadata[metadataForRecordtype].childs).forEach(function (key) {
                if (metadata[metadataForRecordtype].childs[options.sObject]) {
                    metadata[metadataForRecordtype].childs[options.sObject].checked = true;
                    Object.keys(metadata[metadataForRecordtype].childs[options.sObject].childs).forEach(function (childKey) {
                        if (metadata[metadataForRecordtype].childs[options.sObject].childs[childKey])
                            metadata[metadataForRecordtype].childs[options.sObject].childs[childKey].checked = true;
                    });
                }
            });
        }
    } else if (options.retrieveOption === 'single') {
        metadata[MetadataTypes.RECORD_TYPE].childs[options.sObject].childs[options.recordType].checked = true;
        for (const metadataForRecordtype of metadataForUpdateRecordTypes) {
            Object.keys(metadata[metadataForRecordtype].childs).forEach(function (key) {
                if (metadata[metadataForRecordtype].childs[options.sObject]) {
                    metadata[metadataForRecordtype].childs[options.sObject].checked = true;
                    Object.keys(metadata[metadataForRecordtype].childs[options.sObject].childs).forEach(function (childKey) {
                        if (metadata[metadataForRecordtype].childs[options.sObject].childs[childKey])
                            metadata[metadataForRecordtype].childs[options.sObject].childs[childKey].checked = true;
                    });
                }
            });
        }
    }
    retrieveSFDXFormat(user, metadata, options, callback);
}

function retrieveSFDXFormat(user, metadata, options, callback) {
    let packageContent = PackageGenerator.createPackage(metadata, Config.getOrgVersion());
    let buffer = [];
    let bufferError = [];
    let packageFolder = Paths.getPackageFolder();
    let parent = Paths.getFolderPath(packageFolder);
    packageFolder = parent + '/projectTemp';
    if (FileChecker.isExists(packageFolder))
        FileWriter.delete(packageFolder);
    if (!FileChecker.isExists(parent))
        FileWriter.createFolderSync(parent);
    Window.withProgress({
        location: ProgressLocation.Notification,
        title: "Retrieving Record Types from Org",
        cancellable: true
    }, (progress, canceltoken) => {
        return new Promise(async resolve => {
            let out = await ProcessManager.createSFDXProject('projectTemp', parent, canceltoken);
            if (out) {
                if (out.stdErr) {
                    Window.showErrorMessage("An error ocurred when converting project to SFDX: \n" + out.stdErr);
                } else {
                    let packageFile = packageFolder + '/manifest/' + PACKAGE_FILE_NAME;
                    FileWriter.createFileSync(packageFile, packageContent);
                    let setDefaultOrgOut = await ProcessManager.setDefaultOrg('projectTemp', packageFolder, canceltoken);
                    if (setDefaultOrgOut.stdErr) {
                        Window.showErrorMessage("An error ocurred when converting project to SFDX: \n" + setDefaultOrgOut.stdErr);
                    } else {
                        let retrieveOut = await ProcessManager.retrieveSFDX(user, packageFile, packageFolder, canceltoken);
                        progress.report({ message: "Copying retrieved files into your project folder" });
                        let objectsSourceFolder = packageFolder + '/force-app/main/default/objects';
                        let objectsTargetFolder = Paths.getMetadataRootFolder() + '/objects'
                        if (options.retrieveOption === 'all') {
                            Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs).forEach(function (key) {
                                Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs[key].childs).forEach(function (childKey) {
                                    let recordTypeSourceFile = objectsSourceFolder + '/' + key + '/recordTypes/' + childKey + '.recordType-meta.xml';
                                    if (FileChecker.isExists(recordTypeSourceFile)) {
                                        let recordTypeTargetFile = objectsTargetFolder + '/' + key + '/recordTypes/' + childKey + '.recordType-meta.xml';
                                        FileWriter.copyFile(recordTypeSourceFile, recordTypeTargetFile, function (err) {
                                            console.log(err);
                                        });
                                    }
                                });
                            });
                        } else if (options.retrieveOption === 'byObject') {
                            Object.keys(metadata[MetadataTypes.RECORD_TYPE].childs[options.sObject].childs).forEach(function (childKey) {
                                let recordTypeSourceFile = objectsSourceFolder + '/' + options.sObject + '/recordTypes/' + childKey + '.recordType-meta.xml';
                                if (FileChecker.isExists(recordTypeSourceFile)) {
                                    let recordTypeTargetFile = objectsTargetFolder + '/' + options.sObject + '/recordTypes/' + childKey + '.recordType-meta.xml';
                                    FileWriter.copyFileSync(recordTypeSourceFile, recordTypeTargetFile);
                                    /*FileWriter.copyFile(recordTypeSourceFile, recordTypeTargetFile, function (err) { 
                                        console.log(err);
                                    });*/
                                }
                            });
                        } else if (options.retrieveOption === 'single') {
                            let recordTypeSourceFile = objectsSourceFolder + '/' + options.sObject + '/recordTypes/' + options.recordType + '.recordType-meta.xml';
                            if (FileChecker.isExists(recordTypeSourceFile)) {
                                let recordTypeTargetFile = objectsTargetFolder + '/' + options.sObject + '/recordTypes/' + options.recordType + '.recordType-meta.xml';
                                FileWriter.copyFile(recordTypeSourceFile, recordTypeTargetFile, function (err) {
                                    console.log(err);
                                });
                            }
                        }
                    }
                }
            } else {
                Window.showInformationMessage("Operation cancelled by the user");
            }
            if (callback)
                callback.call(this);
            resolve();
        });
    });
}