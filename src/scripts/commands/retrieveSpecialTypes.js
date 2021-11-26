const vscode = require('vscode');
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');
const { SpecialMetadata } = require('@aurahelper/core').Values;
const CLIManager = require('@aurahelper/cli-manager');
const Connection = require('@aurahelper/connector');
const MetadataFactory = require('@aurahelper/metadata-factory');
const Config = require('../core/config');
const Paths = require('../core/paths');
const { FileChecker, FileWriter } = require('@aurahelper/core/src/fileSystem');

exports.run = async function () {
    try {
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        let input = new MetadataSelectorInput('Select Metadata Types for Retrieve', Object.keys(SpecialMetadata));
        input.setSingleSelectionOptions(true);
        input.addInitOption('From Local', 'Select to Retrieve Special types only with your local project metadata types', MetadataSelectorInput.getLocalAction());
        input.addInitOption('From Org', 'Select to Retrieve Special types only with your Auth org metadata types', MetadataSelectorInput.getDownloadAction());
        input.addInitOption('Mixed', 'Select to Retrieve Special types from yout local project with data from org', MetadataSelectorInput.getMixedAction());

        input.addFinishOption('All Namespaces', 'Select to Download Metadata from All Namespaces (if not select, include only Org Namespaces Metadata.)', MetadataSelectorInput.getDownloadAllAction(), ['From Org', 'Mixed']);
        input.addFinishOption('Compress', 'Select to Compress affected XML Files with Aura Helper Format', MetadataSelectorInput.getCompressAction());
        input.onAccept(async (options, data) => {
            if (options) {
                retrieveMetadata(data, options);
            }
        });
        input.show();
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function retrieveMetadata(objects, options) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Retrieving Metadata. This operation can take several minutes",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(function (resolve, reject) {
            const sortOrder = Config.getXMLSortOrder();
            try {
                if (Config.useAuraHelperCLI()) {
                    let dataToRetrieve = getTypesForAuraHelperCommands(objects);
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        cliManager.abortProcess();
                    });
                    cliManager.setCompressFiles(options[MetadataSelectorInput.getCompressAction()]);
                    cliManager.setSortOrder(sortOrder);
                    if (options[MetadataSelectorInput.getDownloadAction()]) {
                        cliManager.retrieveOrgSpecialMetadata(options[MetadataSelectorInput.getDownloadAllAction()], dataToRetrieve).then((result) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else if (options[MetadataSelectorInput.getMixedAction()]) {
                        cliManager.retrieveMixedSpecialMetadata(options[MetadataSelectorInput.getDownloadAllAction()], dataToRetrieve).then((result) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else {
                        cliManager.retrieveLocalSpecialMetadata(dataToRetrieve).then((result) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    }
                } else {
                    const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    connection.setMultiThread();
                    cancelToken.onCancellationRequested(() => {
                        connection.abortConnection();
                    });
                    if(FileChecker.isExists(Paths.getTemporalFolder()))
                        FileWriter.delete(Paths.getTemporalFolder());
                    if(!FileChecker.isExists(Paths.getTemporalFolder()))
                        FileWriter.createFolderSync(Paths.getTemporalFolder());
                    if (options[MetadataSelectorInput.getDownloadAction()]) {
                        connection.retrieveOrgSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelectorInput.getDownloadAllAction()], options[MetadataSelectorInput.getCompressAction()], sortOrder).then((retrieveResult) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error)
                        });
                    } else if (options[MetadataSelectorInput.getMixedAction()]) {
                        connection.retrieveMixedSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelectorInput.getDownloadAllAction()], options[MetadataSelectorInput.getCompressAction()], sortOrder).then((retrieveResult) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error)
                        });
                    } else {
                        connection.retrieveLocalSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelectorInput.getCompressAction()], sortOrder).then((retrieveResult) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error) => {
                            NotificationManager.showError(error.message);
                            reject(error)
                        });
                    }
                }
            } catch (error) {
                NotificationManager.showCommandError(error);
                resolve();
            }
        });
    });
}

function getTypesForAuraHelperCommands(metadata) {
    let types = [];
    Object.keys(metadata).forEach(function (typeKey) {
        if (metadata[typeKey].checked) {
            types.push(typeKey);
        } else {
            Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                if (metadata[typeKey].childs[objectKey].checked) {
                    types.push(typeKey + ':' + objectKey);
                } else {
                    Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                        if (metadata[typeKey].childs[objectKey].childs[itemKey].checked)
                            types.push(typeKey + ':' + objectKey + ':' + itemKey);
                    });
                }
            });
        }
    });
    return types;
}
