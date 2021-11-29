import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { applicationContext } from '../core/applicationContext';
import { NotificationManager, DiagnosticsManager } from '../output';
import { MetadataSelector, MetadataSelectorOption } from '../inputs/metadataSelector';
import { InputFactory } from '../inputs/factory';
const DependenciesManager = require('@aurahelper/dependencies-manager');
const CLIManager = require('@aurahelper/cli-manager');
const Connection = require('@aurahelper/connector');

export async function run() {
    try {
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        let input = new MetadataSelector('Select Metadata Types to Repair', DependenciesManager.getSupportedTypes());
        input.setSingleSelectionOptions(true);
        input.addInitOption('Repair', 'Select to Fix dependency errors automatically', MetadataSelector.getRepairAction());
        input.addInitOption('Check Errors', 'Select to Check for dependency errors in the project', MetadataSelector.getCheckErrorsAction());

        input.addFinishOption('Compress', 'Select to Compress affected XML Files with Aura Helper Format', MetadataSelector.getCompressAction(), 'Repair');
        input.onAccept(async (options, data) => {
            repair(options, data, function (result: any) {
                if (result && options[MetadataSelector.getCheckErrorsAction()]) {
                    showErrors(result);
                }
            });
        });
        input.show();
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

async function repair(options: any, typesForRepair: string[], callback: any) {
    const sortOrder = Config.getXMLSortOrder();
    DiagnosticsManager.clearDiagnostic("xml");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Repair Project Dependencies",
        cancellable: true
    }, (progress) => {
        return new Promise<void>(async function (resolve) {
            try {
                if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.setCompressFiles(options[MetadataSelector.getCompressAction()]);
                    cliManager.setSortOrder(sortOrder);
                    cliManager.onProgress((status: any) => {
                        if (status.result.percentage !== undefined && status.result.percentage > -1) {
                            progress.report({
                                message: status.message,
                                increment: status.result.percentage
                            });
                        } else {
                            progress.report({
                                message: status.message,
                            });
                        }
                    });
                    const dataToRepair = getTypesForAuraHelperCommands(typesForRepair);
                    cliManager.repairDependencies(dataToRepair, options[MetadataSelector.getCheckErrorsAction()], false).then((result: any) => {
                        if (options[MetadataSelector.getCheckErrorsAction()]) {
                            NotificationManager.showInfo("Checking errors finished. See the result in problems window");
                        } else {
                            NotificationManager.showInfo('All errors repaired');
                        }
                        resolve(result);
                        if (callback) {
                            callback.call(result);
                        }
                    }).catch((error: Error) => {
                        NotificationManager.showError(error);
                        resolve();
                        if (callback) {
                            callback.call();
                        }
                    });
                } else {
                    const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    const metadataDetails = await connection.listMetadataTypes();
                    const manager = new DependenciesManager(Paths.getProjectFolder(), metadataDetails);
                    manager.setTypesToRepair(typesForRepair).setCompress(options[MetadataSelector.getCompressAction()]).setSortOrder(sortOrder);
                    manager.onStartObject((status: any) => {
                        progress.report({
                            message: 'Processing object ' + status.entityObject + ' from ' + status.entityType,
                        });
                    });
                    manager.onStartItem((status: any) => {
                        progress.report({
                            message: 'Processing item ' + status.entityItem + '(' + status.entityObject + ') from ' + status.entityType,
                        });
                    });
                    let result;
                    if (options[MetadataSelector.getCheckErrorsAction()]) {
                        result = manager.checkErrors();
                        NotificationManager.showInfo("Checking errors finished. See the result in problems window");
                    }
                    else {
                        result = manager.repairDependencies();
                        NotificationManager.showInfo('All errors repaired');
                    }
                    resolve();
                    if (callback) {
                        callback.call(result);
                    }
                }
            } catch (error) {
                NotificationManager.showCommandError(error);
                resolve();
                if (callback) {
                    callback.call();
                }
            }
        });
    });
}

async function showErrors(errors: any) {
    const errorsByType: any = {};
    Object.keys(errors).forEach(function (typeError) {
        if (!errorsByType[typeError]) {
            errorsByType[typeError] = {};
        }
        for (const error of errors[typeError]) {
            if (!errorsByType[typeError][error.object]) {
                errorsByType[typeError][error.object] = [];
            }
            errorsByType[typeError][error.object].push(error);
        }
    });
    Object.keys(errorsByType).forEach(function (type) {
        Object.keys(errorsByType[type]).forEach(function (obj) {
            let diags = [];
            let path: vscode.Uri | undefined;
            for (const error of errorsByType[type][obj]) {
                path = Paths.toURI(error.file);
                let range = new vscode.Range(error.line - 1, error.startColumn, error.line - 1, error.endColumn);
                let diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Warning);
                diagnostic.source = 'Salesforce XML';
                diagnostic.code = type + ':' + obj;
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(new vscode.Location(path, range), error.message)
                ];
                diags.push(diagnostic);
            }
            if (path) {
                DiagnosticsManager.setDiagnostics("xml", path, diags);
            }
        });
    });
}

function getTypesForAuraHelperCommands(metadata: any): string[] {
    const types: string[] = [];
    Object.keys(metadata).forEach((typeKey) => {
        if (metadata[typeKey].checked) {
            types.push(typeKey);
        } else {
            Object.keys(metadata[typeKey].childs).forEach((objectKey) => {
                if (metadata[typeKey].childs[objectKey].checked) {
                    types.push(typeKey + ':' + objectKey);
                } else {
                    Object.keys(metadata[typeKey].childs[objectKey].childs).forEach((itemKey) => {
                        if (metadata[typeKey].childs[objectKey].childs[itemKey].checked) {
                            types.push(typeKey + ':' + objectKey + ':' + itemKey);
                        }
                    });
                }
            });
        }
    });
    return types;
}