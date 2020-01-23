const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const Config = require('../main/config');
const Metadata = require('../metadata');
const Logger = require('../main/logger');
const GUIEngine = require('../guiEngine');
const MetadataUtils = Metadata.Utils;
const MetadataConnection = Metadata.Connection;
const PackageGenerator = Metadata.PackageGenerator;
const window = vscode.window;
const MetadataTypes = Metadata.MetadataTypes;
const MetadataFactory = Metadata.Factory;
const ProgressLocation = vscode.ProgressLocation;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;

let view;
let deployJobId;
let interval;
exports.run = function () {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Matching Org Metadata with your local metadata \n (Only affects metadata types that you have in your local project)",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (promiseResolve) {
            let user = await Config.getAuthUsername();
            let orgNamespace = Config.getOrgNamespace(user);
            MetadataConnection.getMetadataObjectsListFromOrg(user, true, progress, cancelToken, async function (metadataObjects) {
                if (metadataObjects) {
                    let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
                    let metadataFromFileSystem = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
                    let objectNames = Object.keys(metadataFromFileSystem);
                    let metadataFromOrg = await MetadataConnection.getSpecificMetadataFromOrg(user, objectNames, orgNamespace, false, progress, cancelToken);
                    let metadataToMatch = getMetadataForMatchOrgAndLocal(metadataFromFileSystem, metadataFromOrg);
                    let viewOptions = Engine.getViewOptions();
                    viewOptions.title = 'Match Org Metadata with Local';
                    viewOptions.showActionBar = true;
                    viewOptions.actions.push(Engine.createButtonAction('deleteBtn', '{!label.delete}', ["w3-btn save"], "deleteMetadata()"));
                    viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn cancel"], "cancel()"));
                    view = Engine.createView(Routing.MatchOrg, viewOptions);
                    view.render(function (resolve) {
                        resolve(metadataToMatch, undefined);
                        promiseResolve();
                    });
                    view.onReceiveMessage(function (message) {
                        if (message.command === 'cancel')
                            view.close();
                        else if (message.command === 'delete')
                            deleteMetadata(message.model);
                    });
                }
            });
        });
    });
}

function getMetadataForMatchOrgAndLocal(metadataFromFileSystem, metadataFromOrg) {
    let metadataTypesForCheck = [
        MetadataTypes.APEX_CLASS,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.RECORD_TYPE,
        MetadataTypes.LAYOUT,
        MetadataTypes.FLOWS,
        MetadataTypes.APEX_PAGE,
        MetadataTypes.APEX_TRIGGER,
        MetadataTypes.APEX_COMPONENT,
        MetadataTypes.APPROVAL_PROCESSES
    ];
    let metadataOnOrg = {};
    let metadataOnLocal = [];
    Object.keys(metadataFromFileSystem).forEach(function (key) {
        let metadataTypeFromFileSystem = metadataFromFileSystem[key];
        let metadataTypeFromOrg = metadataFromOrg[key];
        if (metadataTypeFromOrg) {
            Object.keys(metadataTypeFromOrg.childs).forEach(function (childKey) {
                let childFromOrg = metadataTypeFromOrg.childs[childKey];
                let childFromFile = metadataTypeFromFileSystem.childs[childKey];
                let grandChildsFromOrgKeys = (childFromOrg && childFromOrg.childs) ? Object.keys(childFromOrg.childs) : undefined;
                if (grandChildsFromOrgKeys && grandChildsFromOrgKeys.length > 0) {
                    Object.keys(childFromOrg.childs).forEach(function (grandChildKey) {
                        let grandChildFromOrg = childFromOrg.childs[grandChildKey];
                        let grandChildFromFile = (childFromFile && childFromFile.childs) ? childFromFile.childs[grandChildKey] : undefined;
                        if (!grandChildFromFile) {
                            if (!metadataOnOrg[key])
                                metadataOnOrg[key] = MetadataFactory.createMetadataType(key, false);
                            if (!metadataOnOrg[key].childs[childKey])
                                metadataOnOrg[key].childs[childKey] = MetadataFactory.createMetadataObject(childKey, false);
                            metadataOnOrg[key].childs[childKey].childs[grandChildKey] = grandChildFromOrg;
                        }
                    });
                } else {
                    if (!childFromFile) {
                        if (!metadataOnOrg[key])
                            metadataOnOrg[key] = MetadataFactory.createMetadataType(key, false);
                        metadataOnOrg[key].childs[childKey] = childFromOrg;
                    }
                }
            });
        }
    });
    return {
        metadataOnOrg: metadataOnOrg,
        metadataOnLocal: metadataOnLocal
    };
}

async function deleteMetadata(metadataToMatch) {
    let metadataOnOrg = metadataToMatch.metadataOnOrg;
    let version = Config.getOrgVersion();
    let user = await Config.getAuthUsername();
    let packageContent = PackageGenerator.createPackage({}, version, true);
    let destructivePackageContent = PackageGenerator.createPackage(metadataOnOrg, version, true);
    let folder = Paths.getDestructivePackageFolder();
    if (FileChecker.isExists(folder))
        FileWriter.delete(folder);
    FileWriter.createFolderSync(folder);
    FileWriter.createFileSync(folder + '/package.xml', packageContent);
    FileWriter.createFileSync(folder + '/destructiveChanges.xml', destructivePackageContent);
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Deleting Selected Metadata from Org",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(promiseResolve => {
            try {
                let buffer = [];
                let bufferError = [];
                ProcessManager.destructiveChanges(user, folder, cancelToken, function (event, data) {
                    switch (event) {
                        case ProcessEvent.ERR_OUT:
                        case ProcessEvent.ERROR:
                            bufferError = bufferError.concat(data);
                            break;
                        case ProcessEvent.END:
                            if (bufferError.length > 0)
                                view.postMessage({ command: 'metadataDeletedError', data: { error: bufferError.toString() } });
                            else
                                processResponse(user, buffer.toString(), cancelToken, promiseResolve);
                            break;
                        case ProcessEvent.KILLED:
                            view.postMessage({ command: 'processKilled' });
                            break;
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {
                view.postMessage({ command: 'metadataDeletedError', data: { error: error } });
            }
        });
    });
}

function processResponse(user, stdOut, cancelToken, promiseResolve) {
    let jsonOut = JSON.parse(stdOut);
    if (jsonOut.status === 0) {
        deployJobId = jsonOut.result.id;
        interval = setInterval(() => {
            monitorizeDeploy(user, deployJobId, cancelToken, promiseResolve);
        }, 1000);
    }
}

function monitorizeDeploy(user, deployJobId, cancelToken, promiseResolve) {
    let buffer = [];
    let bufferError = [];
    ProcessManager.deployReport(user, deployJobId, cancelToken, function (event, data) {
        switch (event) {
            case ProcessEvent.ERR_OUT:
            case ProcessEvent.ERROR:
                bufferError = bufferError.concat(data);
                break;
            case ProcessEvent.END:
                if (buffer.length > 0) {
                    let jsonOut = JSON.parse(buffer.toString());
                    if (jsonOut.status === 0) {
                        if (jsonOut.result.done) {
                            promiseResolve();
                            clearInterval(interval);
                            view.postMessage({ command: 'metadataDeleted' });
                        }
                    }
                }
                break;
            case ProcessEvent.KILLED:
                view.postMessage({ command: 'processKilled' });
                clearInterval(interval);
                promiseResolve();
                cancelDeploy();
                break;
            case ProcessEvent.STD_OUT:
                buffer = buffer.concat(data);
                break;
            default:
                break;
        }
    });
}

function cancelDeploy(user, deployJobId) {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Canceling Destructive Deploy Job with Id: " + deployJobId,
        cancellable: false
    }, (progress, cancelToken) => {
        return new Promise(promiseResolve => {
            try {
                let buffer = [];
                let bufferError = [];
                ProcessManager.cancelDeploy(user, deployJobId, undefined, function (event, data) {
                    switch (event) {
                        case ProcessEvent.ERR_OUT:
                        case ProcessEvent.ERROR:
                            bufferError = bufferError.concat(data);
                            break;
                        case ProcessEvent.END:
                            promiseResolve();
                            view.postMessage({ command: 'processKilled' });
                            break;
                        case ProcessEvent.KILLED:
                            view.postMessage({ command: 'processKilled' });
                            break;
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {
                view.postMessage({ command: 'metadataDeletedError', data: { error: error } });
            }
        });
    });
}

