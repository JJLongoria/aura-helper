const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const Config = require('../core/config');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;

let view;
exports.run = function () {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Comparing Org Metadata with your local metadata \n (Only affects metadata types that you have in your local project)",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (promiseResolve) {
            ProcessManager.auraHelperOrgCompare(true, cancelToken).then(function (out) {
                if (!out) {
                    vscode.window.showWarningMessage('Operation cancelled by user');
                } else if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0) {
                        let metadata = response.result.data;
                        let viewOptions = Engine.getViewOptions();
                        viewOptions.title = 'Match Org Metadata with Local';
                        viewOptions.showActionBar = true;
                        viewOptions.actions.push(Engine.createButtonAction('deleteBtn', '{!label.delete}', ["w3-btn save"], "deleteMetadata()"));
                        viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn cancel"], "cancel()"));
                        view = Engine.createView(Routing.MatchOrg, viewOptions);
                        view.render(metadata);
                        view.onReceiveMessage(function (message) {
                            if (message.command === 'cancel')
                                view.close();
                            else if (message.command === 'delete')
                                deleteMetadata(message.model);
                        });
                    } else {
                        vscode.window.showErrorMessage(response.error.message);
                    }
                } else {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                }
                promiseResolve();
            }).catch(function (error) {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                promiseResolve();
            });
        });
    });
}

async function deleteMetadata(metadataToMatch) {
    let metadataOnOrg = metadataToMatch.metadataOnOrg;
    let version = Config.getOrgVersion();
    let user = await Config.getAuthUsername();
    let folder = Paths.getPackageFolder();
    if (!FileChecker.isExists(folder))
        FileWriter.createFolderSync(folder);
    let jsonPackagePath = folder + '/package.json';
    let jsonDestructivePath = folder + '/destructive.json';
    FileWriter.createFileSync(jsonPackagePath, JSON.stringify({}, null, 2));
    FileWriter.createFileSync(jsonDestructivePath, JSON.stringify(metadataOnOrg, null, 2));
    await createPackage(version, jsonPackagePath, false);
    await createPackage(version, jsonDestructivePath, true);
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
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
                                processResponse(buffer.toString(), promiseResolve);
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

function processResponse(stdOut, promiseResolve) {
    let jsonOut = JSON.parse(stdOut);
    if (jsonOut.status === 0) {
        view.postMessage({ command: 'metadataDeleted', data: {} });
    } else if (jsonOut.status === 1) {
        let errors = '';
        if (jsonOut.result.details && jsonOut.result.details.componentFailures && jsonOut.result.details.componentFailures.length > 0) {
            for (const fail of jsonOut.result.details.componentFailures) {
                errors += '<b>' + fail.fullName + '</b>: ' + fail.problem + '\n';
            }
        }
        view.postMessage({ command: 'metadataDeletedError', data: { error: errors } });
    }
    promiseResolve();
}

function createPackage(version, filePath, isDestructive) {
    return new Promise(async function (resolve) {
        try {
            let options = {
                outputPath: Paths.getPackageFolder(),
                createFrom: 'json',
                createType: (isDestructive) ? 'destructive ' : 'package',
                version: version,
                source: filePath,
                explicit: true
            };
            await ProcessManager.auraHelperPackageGenerator(options, true);
        } catch (error) {
            resolve();
        }
        resolve();
    });
}
