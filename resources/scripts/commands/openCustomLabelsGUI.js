const vscode = require('vscode');
const Logger = require('../main/logger');
const Config = require('../main/config');
const GUIEngine = require('../guiEngine');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const metadata = require('../metadata');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const StrUtils = require('../utils/strUtils');
const Window = vscode.window;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const AuraParser = languages.AuraParser;
const FileChecker = fileSystem.FileChecker;
const CustomLabelsUtils = metadata.CustomLabelsUtils;
const FileWriter = fileSystem.FileWriter;
const MetadataFactory = metadata.Factory;
const PackageGenerator = metadata.PackageGenerator;
const ProgressLocation = vscode.ProgressLocation;

let view;
let CustomLabels;
let filePath;
let deployJobId;
let labelIndex;
let interval;
let labelToDelete;
let labelDelete;
exports.run = function (fileUri) {
    try {
        if (fileUri) {
            filePath = fileUri.fsPath;
        }
        if (!filePath)
            filePath = Paths.getMetadataRootFolder() + '/labels/CustomLabels.labels-meta.xml';
        if (FileChecker.isExists(filePath)) {
            let customLabelsRoot = AuraParser.parseXML(FileReader.readFileSync(filePath));
            CustomLabels = customLabelsRoot.CustomLabels;
            let viewOptions = Engine.getViewOptions();
            viewOptions.title = '{!label.custom_labels}';
            viewOptions.showActionBar = true;
            viewOptions.actions.push(Engine.createButtonAction('newCustomLabelBtn', '{!label.new_custom_label}', ["w3-btn w3-border w3-border-green save"], "onClickNewLabel()"));
            viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
            view = Engine.createView(Routing.CustomLabels, viewOptions);
            view.render(function (resolve) {
                let labels = [];
                if (Array.isArray(CustomLabels.labels))
                    labels = CustomLabels.labels;
                else
                    labels.push(CustomLabels.labels);
                resolve(labels);
            });
            view.onReceiveMessage(function (message) {
                if (message.command === 'delete')
                    deleteLabel(message.labels, message.index);
                else if (message.command === 'cancel')
                    view.close();
                else if (message.command === 'new')
                    newLabel(message.labels, message.label);
                else if (message.command === 'edit')
                    editLabel(message.labels, message.label);
            });
        } else {
            Window.showErrorMessage('Custom Labels file not found in your local project. Retrieve them if you want to use this tool');
        }
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

async function deleteLabel(labels, index) {
    CustomLabels = labels;
    labelIndex = index;
    labelToDelete = CustomLabels[index];
    let metadataTypes = {
        "CustomLabel": MetadataFactory.createMetadataType("CustomLabel", true)
    };
    metadataTypes["CustomLabel"].childs[labelToDelete.fullName] = MetadataFactory.createMetadataObject(labelToDelete.fullName, true);
    let version = Config.getOrgVersion();
    let user = await Config.getAuthUsername();
    let packageContent = PackageGenerator.createPackage({}, version, true);
    let destructivePackageContent = PackageGenerator.createPackage(metadataTypes, version, true);
    let folder = Paths.getDestructivePackageFolder();
    if (FileChecker.isExists(folder))
        FileWriter.delete(folder);
    FileWriter.createFolderSync(folder);
    FileWriter.createFileSync(folder + '\\package.xml', packageContent);
    FileWriter.createFileSync(folder + '\\destructiveChanges.xml', destructivePackageContent);
    Window.withProgress({
        location: ProgressLocation.Notification,
        title: "Deleting Custom Label " + labelToDelete.fullName + " from Org",
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
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        case ProcessEvent.END:
                            if (bufferError.length > 0) {
                                view.postMessage({ command: "deletedError", model: CustomLabels, error: bufferError.toString() });
                                promiseResolve();
                            } else {
                                processResponse(user, buffer.toString(), cancelToken, promiseResolve);
                            }
                            break;
                        case ProcessEvent.KILLED:
                            view.postMessage({ command: 'processKilled' });
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {
                view.postMessage({ command: "deletedError", error: error });
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
                            if (!labelDelete) {
                                let label = CustomLabels[labelIndex];
                                CustomLabels.splice(labelIndex, 1);
                                let root = {
                                    labels: CustomLabels
                                }
                                labelDelete = true;
                                FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(root), true));
                                view.postMessage({ command: "deleted", model: CustomLabels, extraData: { label: label } });
                            }
                        }
                    }
                    clearInterval(interval);
                    promiseResolve();
                }
                break;
            case ProcessEvent.KILLED:
                view.postMessage({ command: 'processKilled' });
                promiseResolve();
                clearInterval(interval);
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
    Window.withProgress({
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

function newLabel(labels, newLabel) {
    labels.push(newLabel);
    CustomLabels.labels = labels;
    FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(CustomLabels), true));
    view.postMessage({ command: "created", model: CustomLabels.labels, extraData: { label: newLabel } });
}

function editLabel(labels, editLabel) {
    let index = 0;
    labelIndex = 0;
    for (const label of labels) {
        if (editLabel.fullName === label.fullName)
            labelIndex = index;
        index++;
    }
    labels[labelIndex] = editLabel;
    CustomLabels.labels = labels;
    FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(CustomLabels), true));
    view.postMessage({ command: "edited", model: CustomLabels.labels, extraData: { label: editLabel } });
}