import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import applicationContext from '../core/applicationContext';
import { NotificationManager, DiagnosticsManager } from '../output';
import { MetadataSelector, MetadataSelectorOption } from '../inputs/metadataSelector';
import { InputFactory } from '../inputs/factory';
const { SpecialMetadata } = require('@aurahelper/core').Values;
const CLIManager = require('@aurahelper/cli-manager');
const Connection = require('@aurahelper/connector');
const MetadataFactory = require('@aurahelper/metadata-factory');
const { FileChecker, FileWriter } = require('@aurahelper/core/src/fileSystem');

export async function run() {
    try {
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        let input = new MetadataSelector('Select Metadata Types for Retrieve', Object.keys(SpecialMetadata));
        input.setSingleSelectionOptions(true);
        input.addInitOption('From Local', 'Select to Retrieve Special types only with your local project metadata types', MetadataSelector.getLocalAction());
        input.addInitOption('From Org', 'Select to Retrieve Special types only with your Auth org metadata types', MetadataSelector.getDownloadAction());
        input.addInitOption('Mixed', 'Select to Retrieve Special types from yout local project with data from org', MetadataSelector.getMixedAction());

        input.addFinishOption('All Namespaces', 'Select to Download Metadata from All Namespaces (if not select, include only Org Namespaces Metadata.)', MetadataSelector.getDownloadAllAction(), ['From Org', 'Mixed']);
        input.addFinishOption('Compress', 'Select to Compress affected XML Files with Aura Helper Format', MetadataSelector.getCompressAction());
        input.onAccept(async (options, data) => {
            if (options) {
                retrieveMetadata(data, options);
            }
        });
        input.show();
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function retrieveMetadata(objects: any, options: any): void {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Retrieving Metadata. This operation can take several minutes",
        cancellable: true
    }, (_progress, cancelToken) => {
        return new Promise<void>(function (resolve, reject) {
            const sortOrder = Config.getXMLSortOrder();
            try {
                if (Config.useAuraHelperCLI()) {
                    let dataToRetrieve = getTypesForAuraHelperCommands(objects);
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        cliManager.abortProcess();
                    });
                    cliManager.setCompressFiles(options[MetadataSelector.getCompressAction()]);
                    cliManager.setSortOrder(sortOrder);
                    if (options[MetadataSelector.getDownloadAction()]) {
                        cliManager.retrieveOrgSpecialMetadata(options[MetadataSelector.getDownloadAllAction()], dataToRetrieve).then((_result: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else if (options[MetadataSelector.getMixedAction()]) {
                        cliManager.retrieveMixedSpecialMetadata(options[MetadataSelector.getDownloadAllAction()], dataToRetrieve).then((_result: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else {
                        cliManager.retrieveLocalSpecialMetadata(dataToRetrieve).then((_result: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
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
                    if(FileChecker.isExists(Paths.getTemporalFolder())){
                        FileWriter.delete(Paths.getTemporalFolder());
                    }
                    if(!FileChecker.isExists(Paths.getTemporalFolder())){
                        FileWriter.createFolderSync(Paths.getTemporalFolder());
                    }
                    if (options[MetadataSelector.getDownloadAction()]) {
                        connection.retrieveOrgSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelector.getDownloadAllAction()], options[MetadataSelector.getCompressAction()], sortOrder).then((_retrieveResult: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else if (options[MetadataSelector.getMixedAction()]) {
                        connection.retrieveMixedSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelector.getDownloadAllAction()], options[MetadataSelector.getCompressAction()], sortOrder).then((_retrieveResult: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
                        });
                    } else {
                        connection.retrieveLocalSpecialTypes(Paths.getTemporalFolder(), objects, options[MetadataSelector.getCompressAction()], sortOrder).then((_retrieveResult: any) => {
                            NotificationManager.showInfo("Data retrieved successfully");
                            resolve();
                        }).catch((error: Error) => {
                            NotificationManager.showError(error.message);
                            reject(error);
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

function getTypesForAuraHelperCommands(metadata: any) {
    const types: string[] = [];
    Object.keys(metadata).forEach(function (typeKey) {
        if (metadata[typeKey].checked) {
            types.push(typeKey);
        } else {
            Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                if (metadata[typeKey].childs[objectKey].checked) {
                    types.push(typeKey + ':' + objectKey);
                } else {
                    Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                        if (metadata[typeKey].childs[objectKey].childs[itemKey].checked){
                            types.push(typeKey + ':' + objectKey + ':' + itemKey);
                        }
                    });
                }
            });
        }
    });
    return types;
}
