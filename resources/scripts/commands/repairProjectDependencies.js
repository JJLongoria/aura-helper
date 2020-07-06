const vscode = require('vscode');
const Metadata = require('../metadata');
const ProcessManager = require('../processes').ProcessManager;
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const Output = require('../output');
const NotificationManager = require('../output/notificationManager');
const DiagnosticsMananger = Output.DiagnosticsManager;

const SUPPORTED_TYPES = [
    Metadata.MetadataTypes.PROFILE,
    Metadata.MetadataTypes.PERMISSION_SET,
    Metadata.MetadataTypes.CUSTOM_APPLICATION
];

exports.run = async function () {
    let option = await InputFactory.createRepairOptionSelector();
    if (option) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Loading Metadata Types from Local",
            cancellable: true
        }, (progress, cancelToken) => {
            return new Promise(async function (resolve) {
                try {
                    let types = await getLocalMetadata(SUPPORTED_TYPES, cancelToken);
                    let input = new MetadataSelectorInput('Select Metadata Types from Repair', types);
                    input.onAccept(async metadata => {
                        let dataToRepair = Metadata.Utils.getTypesForAuraHelperCommands(metadata);
                        repair(option, dataToRepair, function (data) {
                            if (data && option !== 'Repair') {
                                showErrors(data);
                            }
                        });
                    });
                    input.show();
                    resolve();
                } catch (error) {
                    NotificationManager.showCommandError(error);
                    resolve();
                }
            });
        });
    }
}

async function repair(option, typesForRepair, callback) {
    let compress = 'No';
    if (option === 'Repair')
        compress = await InputFactory.createCompressSelector();
    DiagnosticsMananger.clearDiagnostic("xml");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Repair Project Dependencies",
        cancellable: true
    }, () => {
        return new Promise(async function (resolve) {
            try {
                let options = {
                    onlyCheck: option !== 'Repair',
                    types: typesForRepair,
                    compress: compress === 'Yes'
                };
                let out = await ProcessManager.auraHelperRepairDependencies(options, true);
                if (!out) {
                    NotificationManager.showInfo('Operation Cancelled by User');
                    resolve();
                    if (callback)
                        callback.call(this);
                } else if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0) {
                        if (option !== 'Repair')
                            NotificationManager.showInfo("Checking errors finished. See the result in problems window");
                        else
                            NotificationManager.showInfo(response.result.message);
                        resolve();
                        if (callback)
                            callback.call(this, response.result.data);
                    } else {
                        NotificationManager.showError(response.error.message);
                        resolve();
                        if (callback)
                            callback.call(this);
                    }
                } else {
                    NotificationManager.showCommandError(out.stdErr);
                    resolve();
                    if (callback)
                        callback.call(this);
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

function getLocalMetadata(types, cancelToken) {
    return new Promise(async function (resolve) {
        try {
            let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: types }, true, cancelToken);
            if (!out) {
                NotificationManager.showInfo('Operation Cancelled by User');
                resolve();
            } else if (out.stdOut) {
                let response = JSON.parse(out.stdOut);
                if (response.status === 0) {
                    resolve(response.result.data);
                } else {
                    NotificationManager.showError(response.error.message);
                    resolve();
                }
            } else {
                NotificationManager.showCommandError(out.stdErr);
                resolve();
            }
        } catch (error) {
            NotificationManager.showCommandError(error);
            resolve();
        }
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