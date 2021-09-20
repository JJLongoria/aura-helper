const vscode = require('vscode');
const PermissionEditor = require('../inputs/permissionEditor');
const NotificationManager = require('../output/notificationManager');
const { MetadataType, MetadataObject } = require('@aurahelper/core').Types;
const Connection = require('@aurahelper/connector');
const Paths = require('../core/paths');
const Config = require('../core/config');

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        openStandardGUI(filePath);
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function openStandardGUI(filePath) {
    let input = new PermissionEditor(filePath);
    input.onValidationError(function (errorMessage) {
        NotificationManager.showError("Validation Errors: \n" + errorMessage);
    });
    input.onReport(function (report) {
        NotificationManager.showInfo(report);
    });
    input.onError(function (message) {
        NotificationManager.showError("Error: " + message);
    });
    input.onAccept(async function (options, data) {
        if (options.hasChanges) {
            NotificationManager.showInfo('The ' + data.type + ' ' + data.file + ' saved succesfully');
            if (options.deploy) {
                await deploy(data.file);
            }
        }
    });
    input.show();
}

function deploy(data) {
    return new Promise((resolve) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Deploying ' + data.type + ' ' + data.file,
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(progressResolve => {
                const typesToDeploy = {};
                typesToDeploy[data.type] = new MetadataType(data.type, true);
                typesToDeploy[data.type].addChild(new MetadataObject(data.file, true));
                const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.deploy(typesToDeploy).then((status) => {
                    if (status.done) {
                        NotificationManager.showInfo('Permissions deployed succesfully to org');
                    } else {
                        NotificationManager.showError('Deployment finished with status ' + status.status);
                    }
                    progressResolve();
                    resolve();
                }).catch((error) => {
                    NotificationManager.showError(error.message);
                    progressResolve();
                    resolve();
                });
            });
        });
    });
}