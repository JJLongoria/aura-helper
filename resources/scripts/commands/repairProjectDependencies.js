const vscode = require('vscode');
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const Output = require('../output');
const NotificationManager = require('../output/notificationManager');
const DependenciesManager = require('@ah/dependencies-manager');
const CLIManager = require('@ah/cli-manager');
const Connection = require('@ah/connector');
const Config = require('../core/config');
const Paths = require('../core/paths');
const DiagnosticsMananger = Output.DiagnosticsManager;

exports.run = async function () {
    try {
        let input = new MetadataSelectorInput('Select Metadata Types to Repair', DependenciesManager.getSupportedTypes());
        input.setSingleSelectionOptions(true);
        input.addInitOption('Repair', 'Select to Fix dependency errors automatically', MetadataSelectorInput.getRepairAction());
        input.addInitOption('Check Errors', 'Select to Check for dependency errors in the project', MetadataSelectorInput.getCheckErrorsAction());

        input.addFinishOption('Compress', 'Select to Compress affected XML Files with Aura Helper Format', MetadataSelectorInput.getCompressAction(), 'Repair');
        input.onAccept(async (options, data) => {
            repair(options, data, function (result) {
                if (result && options[MetadataSelectorInput.getCheckErrorsAction()]) {
                    showErrors(result);
                }
            });
        });
        input.show();
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

async function repair(options, typesForRepair, callback) {
    const sortOrder = Config.getXMLSortOrder();
    DiagnosticsMananger.clearDiagnostic("xml");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Repair Project Dependencies",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (resolve) {
            try {
                if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.setCompressFiles(options[MetadataSelectorInput.getCompressAction()]);
                    cliManager.setSortOrder(sortOrder);
                    cliManager.onProgress((status) => {
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
                    cliManager.repairDependencies(dataToRepair, options[MetadataSelectorInput.getCheckErrorsAction()], false).then((result) => {
                        if (options[MetadataSelectorInput.getCheckErrorsAction()]) {
                            NotificationManager.showInfo("Checking errors finished. See the result in problems window");
                        } else {
                            NotificationManager.showInfo('All errors repaired');
                        }
                        resolve(result);
                        if (callback)
                            callback.call(this, result);
                    }).catch((error) => {
                        NotificationManager.showError(error);
                        resolve();
                        if (callback)
                            callback.call(this);
                    });
                } else {
                    const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    const metadataDetails = await connection.listMetadataTypes();
                    const manager = new DependenciesManager(Paths.getProjectFolder(), metadataDetails);
                    manager.setTypesToRepair(typesForRepair).setCompress(options[MetadataSelectorInput.getCompressAction()]).setSortOrder(sortOrder);
                    manager.onStartObject((status) => {
                        progress.report({
                            message: 'Processing object ' + status.entityObject + ' from ' + status.entityType,
                        });
                    });
                    manager.onStartItem((status) => {
                        progress.report({
                            message: 'Processing item ' + status.entityItem + '(' + status.entityObject + ') from ' + status.entityType,
                        });
                    });
                    let result;
                    if (options[MetadataSelectorInput.getCheckErrorsAction()]) {
                        result = manager.checkErrors();
                        NotificationManager.showInfo("Checking errors finished. See the result in problems window");
                    }
                    else {
                        result = manager.repairDependencies();
                        NotificationManager.showInfo('All errors repaired');
                    }
                    resolve();
                    if (callback)
                        callback.call(this, result);
                }
            } catch (error) {
                NotificationManager.showCommandError(error);
                resolve();
                if (callback)
                    callback.call(this);
            }
        });
    });
}

async function showErrors(errors) {
    let errorsByType = {};
    Object.keys(errors).forEach(function (typeError) {
        if (!errorsByType[typeError])
            errorsByType[typeError] = {};
        for (const error of errors[typeError]) {
            if (!errorsByType[typeError][error.object])
                errorsByType[typeError][error.object] = [];
            errorsByType[typeError][error.object].push(error);
        }
    });
    Object.keys(errorsByType).forEach(function (type) {
        Object.keys(errorsByType[type]).forEach(function (obj) {
            let diags = [];
            let path;
            for (const error of errorsByType[type][obj]) {
                path = vscode.Uri.file(error.file).toString();
                let range = new vscode.Range(error.line - 1, error.startColumn, error.line - 1, error.endColumn);
                let diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Warning);
                diagnostic.source = 'Salesforce XML';
                diagnostic.code = type + ':' + obj;
                diags.push(diagnostic);
            }
            DiagnosticsMananger.setDiagnostics("xml", vscode.Uri.parse(path), diags);
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