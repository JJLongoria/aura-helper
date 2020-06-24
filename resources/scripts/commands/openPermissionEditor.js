const vscode = require('vscode');
const Config = require('../core/config');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const PermissionEditor = require('../inputs/permissionEditor');
const ProcessManager = require('../processes').ProcessManager;
const XMLParser = languages.XMLParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const Window = vscode.window;
const ProfileUtils = Metadata.ProfileUtils;
const PermissionSetUtils = Metadata.PermissionSetUtils;
const MetadataUtils = Metadata.Utils;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
let isPermissionSet;
exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = Window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        let profileName = Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', '');
        isPermissionSet = FileChecker.isPermissionSet(filePath);
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Loading Metadata Types from Local",
            cancellable: true
        }, (progress, cancelToken) => {
            return new Promise(async function (resolve) {
                try {
                    let types = await getLocalMetadata(undefined, cancelToken);
                    progress.report({ message: "Loading Auth Org Data" });
                    if (Config.getConfig().graphicUserInterface.enableAdvanceGUI) {
                        openAdvanceGUI(profileName, isPermissionSet, filePath, types);
                    } else {
                        openStandardGUI(profileName, isPermissionSet, filePath, types);
                    }
                    resolve();
                } catch (error) {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                    resolve();
                }
            });
        });
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function readProfile(filePath) {
    return XMLParser.parseXML(FileReader.readFileSync(filePath));
}

function openAdvanceGUI(profileName, isPermissionSet, filePath, types) {
    let root = readProfile(filePath);
    let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
    let viewOptions = Engine.getViewOptions();
    viewOptions.title = profileName;
    viewOptions.showActionBar = true;
    viewOptions.actions.push(Engine.createButtonAction('saveBtn', '{!label.save}', ["w3-btn w3-border w3-border-green save"], "save()"));
    viewOptions.actions.push(Engine.createButtonAction('saveCompressBtn', '{!label.compress_and_save}', ["w3-btn altSave"], "compressAndSave()"));
    viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
    view = Engine.createView((isPermissionSet) ? Routing.PermissionSet : Routing.Profile, viewOptions);
    let model;
    let extraData = { name: profileName };
    if (profileRaw) {
        if (isPermissionSet) {
            let permSet = PermissionSetUtils.createPermissionSet(profileRaw);
            model = permSet;
        } else {
            let profile = ProfileUtils.createProfile(profileRaw);
            if (Config.getConfig().metadata.mergeLocalDataPermissions)
                profile = Metadata.ProfileUtils.mergeProfileWithLocalData(profile, types);
            model = profile;
        }
    }
    view.render(model, extraData);
    view.onReceiveMessage(function (message) {
        if (message.command == 'cancel') {
            view.close();
        } else {
            if (isPermissionSet) {
                let xmlContent = PermissionSetUtils.toXML(message.permSet, message.command == 'compressAndSave');
                FileWriter.createFileSync(filePath, xmlContent);
                view.close();
            } else {
                let xmlContent = ProfileUtils.toXML(message.profile, message.command == 'compressAndSave');
                FileWriter.createFileSync(filePath, xmlContent);
                view.close();
            }
        }
    });
}

function openStandardGUI(profileName, isPermissionSet, filePath, types) {
    let input = new PermissionEditor('Edit ' + profileName + ' ' + ((isPermissionSet) ? "Permission Set" : "Profile"), filePath, types, isPermissionSet);
    input.onValidationError(function (errorMessage) {
        vscode.window.showErrorMessage("Validation Errors: \n" + errorMessage);
    });
    input.onReport(function (report) {
        vscode.window.showInformationMessage(report);
    });
    input.onError(function (message) {
        vscode.window.showInformationMessage("Error: " + message);
    });
    input.onAccept(async function () {
        let compress = await selectCompress();
        if (compress === 'Yes') {
            ProcessManager.auraHelperCompressFile(filePath, true).then(function (out) {
                if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0)
                        vscode.window.showInformationMessage(response.result.message);
                    else
                        vscode.window.showErrorMessage(response.error.message);
                } else {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                }
            }).catch(function (error) {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
            });
        }
    });
    input.show();
}

function selectCompress() {
    return new Promise(async function (resolve) {
        let options = ['Yes', 'No'];
        let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Do you want to compress the file?' });
        resolve(selectedOption);
    });
}

function getLocalMetadata(types, cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: types }, true, cancelToken);
        if (!out) {
            vscode.window.showWarningMessage('Operation Cancelled by User');
            resolve();
        } else if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                resolve(response.result.data);
            } else {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + response.error.message);
                resolve();
            }
        } else {
            vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
            resolve();
        }
    });
}