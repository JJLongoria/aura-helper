const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const ProcessManager = require('../processes').ProcessManager;
const Config = require('../core/config');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const MetadataSelectorInput = require('../inputs/metadataSelector');
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
        return new Promise(async function (resolve) {
            ProcessManager.auraHelperOrgCompare(true, cancelToken).then(function (out) {
                if (!out) {
                    vscode.window.showWarningMessage('Operation cancelled by user');
                } else if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0) {
                        if (Config.getConfig().graphicUserInterface.enableAdvanceGUI) {
                            openAdvanceGUI(response.result.data);
                        } else {
                            openStandardGUI(response.result.data);
                        }
                    } else {
                        vscode.window.showErrorMessage(response.error.message);
                    }
                } else {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                }
                resolve();
            }).catch(function (error) {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                resolve();
            });
        });
    });
}

function openAdvanceGUI(metadata) {
    let viewOptions = Engine.getViewOptions();
    viewOptions.title = '{!label.match_metadata_with_local}';
    viewOptions.showActionBar = true;
    viewOptions.actions.push(Engine.createButtonAction('deleteBtn', '{!label.delete}', ["w3-btn save"], "deleteMetadata()"));
    viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn cancel"], "cancel()"));
    view = Engine.createView(Routing.MatchOrg, viewOptions);
    view.render(metadata);
    view.onReceiveMessage(function (message) {
        if (message.command === 'cancel')
            view.close();
        else if (message.command === 'delete')
            deleteMetadata(message.model.metadataOnOrg);
    });
}

function openStandardGUI(metadata) {
    let input = new MetadataSelectorInput('Select Metadata Types for Delete from your Org', metadata);
    input.allowDelete(true);
    input.onDelete(async metadata => {
        deleteMetadata(metadata, function (message, isError) {
            if (isError) {
                vscode.window.showErrorMessage(message);
            } else {
                metadata  = Metadata.Utils.deleteCheckedMetadata(metadata);
                vscode.window.showInformationMessage(message);
                input.setMetadata(metadata);
                input.reset();
            }
        });
    });
    input.show();
}

async function deleteMetadata(metadataToMatch, callback) {
    let metadataOnOrg = metadataToMatch;
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
        return new Promise(async resolve => {
            try {
                let out = await ProcessManager.destructiveChanges(user, folder, cancelToken);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            if (callback) {
                                callback.call(this, 'Metadata Deleted Successfully', false);
                            } else {
                                view.postMessage({ command: 'metadataDeleted', data: { metadata: Metadata.Utils.deleteCheckedMetadata(metadataToMatch) } });
                            }
                        } else {
                            if (callback) {
                                let errors = '';
                                if (response.result.details && response.result.details.componentFailures && response.result.details.componentFailures.length > 0) {
                                    for (const fail of response.result.details.componentFailures) {
                                        errors += '- ' + fail.fullName + ': ' + fail.problem + '\n';
                                    }
                                }
                                callback.call(this, errors, true)
                            } else {
                                let errors = '';
                                if (response.result.details && response.result.details.componentFailures && response.result.details.componentFailures.length > 0) {
                                    for (const fail of response.result.details.componentFailures) {
                                        errors += '<b>' + fail.fullName + '</b>: ' + fail.problem + '\n';
                                    }
                                }
                                view.postMessage({ command: 'metadataDeletedError', data: { error: errors } });
                            }
                        }
                    } else {
                        if (callback) {
                            callback.call(this, out.stdErr, true)
                        } else {
                            view.postMessage({ command: 'metadataDeletedError', data: { error: out.stdErr } });
                        }
                    }
                } else {
                    if (callback) {
                        callback.call(this, 'Operation Cancelled by User', true)
                    } else {
                        view.postMessage({ command: 'processKilled' });
                    }
                }
                resolve();
            } catch (error) {
                if (callback) {
                    callback.call(this, error.toString(), true);
                } else {
                    view.postMessage({ command: 'metadataDeletedError', data: { error: error } });
                }
            }
        });
    });
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
