import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { NotificationManager, DiagnosticsManager } from '../output';
import { MetadataSelector } from '../inputs/metadataSelector';
import { DependenciesManager } from '@aurahelper/dependencies-manager';
import { CLIManager } from '@aurahelper/cli-manager';
import { SFConnector } from '@aurahelper/connector';
import { MetadataType } from '@aurahelper/core';
import { applicationContext } from '../core/applicationContext';


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

async function repair(options: any, typesForRepair: { [key: string]: MetadataType }, callback: any) {
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
                    if(applicationContext.ahSFDXPluginInstalled){
                        cliManager.useAuraHelperSFDX(applicationContext.ahSFDXPluginInstalled);
                    } else if(applicationContext.ahSFPluginInstalled){
                        cliManager.useAuraHelperSF(applicationContext.ahSFPluginInstalled);
                    }
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
                    cliManager.repairDependencies(typesForRepair, options[MetadataSelector.getCheckErrorsAction()], false).then((result: any) => {
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
                    const connection = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
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