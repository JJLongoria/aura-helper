const vscode = require('vscode');
const Config = require('../core/config');
const CustomLabelsEditor = require('../inputs/customLabelsEditor');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const { FileChecker, FileWriter } = require('@aurahelper/core').FileSystem;
const { MetadataTypes } = require('@aurahelper/core').Values;
const { MetadataType, MetadataObject } = require('@aurahelper/core').Types;
const PackageGenerator = require('@aurahelper/package-generator');
const Connection = require('@aurahelper/connector');
const Window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;

let filePath;

exports.run = function (fileUri) {
    try {
        if (fileUri) {
            filePath = fileUri.fsPath;
        }
        if (!filePath)
            filePath = Paths.getProjectMetadataFolder() + '/labels/CustomLabels.labels-meta.xml';
        if (FileChecker.isExists(filePath)) {
            openStandardGUI(filePath);
        } else {
            NotificationManager.showError('Custom Labels file not found in your local project. Retrieve them if you want to use this tool');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function openStandardGUI(filePath) {
    let input = new CustomLabelsEditor(filePath);
    input.onValidationError(function (message) {
        vscode.window.showErrorMessage("Validation Errors: \n" + message);
    });
    input.onReport(function (message) {
        vscode.window.showInformationMessage(message);
    });
    input.onError(function (message) {
        vscode.window.showInformationMessage("Error: " + message);
    });
    input.onAccept(async function (options, data) {
        if (options.hasChanges) {
            NotificationManager.showInfo('Custom Labels saved succesfully');
            if (options.delete) {
                await deleteLabels(data.labelsToDelete);
            }
            if (options.deploy) {
                await deployLabels(data.labelsToDeploy);
            }
        }
    });
    input.show();
}

function deleteLabels(labelsToDelete) {
    return new Promise((resolve) => {
        Window.withProgress({
            location: ProgressLocation.Notification,
            title: 'Deleting Custom Labels',
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(resolveProgress => {
                const typesToDelete = {};
                if (labelsToDelete && labelsToDelete.length > 0) {
                    typesToDelete[MetadataTypes.CUSTOM_LABEL] = new MetadataType(MetadataTypes.CUSTOM_LABEL, true);
                    for (const label of labelsToDelete) {
                        typesToDelete[MetadataTypes.CUSTOM_LABEL].addChild(new MetadataObject(label.fullName, true));
                    }
                }
                if (!FileChecker.isExists(Paths.getPackageFolder()))
                    FileWriter.createFolderSync(Paths.getPackageFolder());
                const packageGenerator = new PackageGenerator(Config.getAPIVersion());
                packageGenerator.setExplicit();
                packageGenerator.createPackage({}, Paths.getPackageFolder());
                packageGenerator.createAfterDeployDestructive(typesToDelete, Paths.getPackageFolder());
                const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.setPackageFolder(Paths.getPackageFolder());
                connection.deployPackage(undefined, undefined, true).then((status) => {
                    if (status.done) {
                        NotificationManager.showInfo('Custom Labels deleted succesfully from org');
                    } else {
                        NotificationManager.showError('Deleting finished with status ' + status.status);
                    }
                    resolveProgress();
                    resolve();
                }).catch((error) => {
                    NotificationManager.showError(error.message);
                    resolveProgress();
                    resolve();
                });
            });
        });
    });
}

function deployLabels(labelsToDeploy) {
    return new Promise((resolve) => {
        Window.withProgress({
            location: ProgressLocation.Notification,
            title: 'Deploying Custom Labels',
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(progressResolve => {
                const typesToDeploy = {};
                if (labelsToDeploy && labelsToDeploy.length > 0) {
                    typesToDeploy[MetadataTypes.CUSTOM_LABEL] = new MetadataType(MetadataTypes.CUSTOM_LABEL, true);
                    for (const label of labelsToDeploy) {
                        typesToDeploy[MetadataTypes.CUSTOM_LABEL].addChild(new MetadataObject(label.fullName, true));
                    }
                }
                const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.deploy(typesToDeploy).then((status) => {
                    if (status.done) {
                        NotificationManager.showInfo('Custom Labels deployed succesfully to org');
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