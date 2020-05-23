const vscode = require('vscode');
const AppContext = require('../core/applicationContext');
const Metadata = require('../metadata');
const ProcessManager = require('../processes').ProcessManager;
const MetadataSelectorInput = require('../inputs/metadataSelector');

const SUPPORTED_TYPES = [
    Metadata.MetadataTypes.PROFILE,
    Metadata.MetadataTypes.PERMISSION_SET,
    Metadata.MetadataTypes.CUSTOM_APPLICATION
];

exports.run = async function () {
    let option = await selectOptions();
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
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                    resolve();
                }
            });
        });
    }
}

function selectOptions() {
    return new Promise(async function (resolve) {
        let options = ['Repair', 'Check Errors'];
        let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select repair automatically or only check errors' });
        resolve(selectedOption);
    });
}

function selectCompress() {
    return new Promise(async function (resolve) {
        let options = ['Yes', 'No'];
        let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Do you want to compress repaired files?' });
        resolve(selectedOption);
    });
}


async function repair(option, typesForRepair, callback) {
    let compress = 'No';
    if (option === 'Repair')
        compress = await selectCompress();
    AppContext.diagnosticCollection.clear();
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
                    vscode.window.showWarningMessage('Operation Cancelled by User');
                    resolve();
                    if (callback)
                        callback.call(this);
                } else if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0) {
                        if (option !== 'Repair')
                            vscode.window.showInformationMessage("Checking errors finished. See the result in problems window");
                        else
                            vscode.window.showInformationMessage(response.result.message);
                        resolve();
                        if (callback)
                            callback.call(this, response.result.data);
                    } else {
                        vscode.window.showErrorMessage(response.error.message);
                        resolve();
                        if (callback)
                            callback.call(this);
                    }
                } else {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                    resolve();
                    if (callback)
                        callback.call(this);
                }
            } catch (error) {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                resolve();
                if (callback)
                    callback.call(this);
            }
        });
    });
}

function getLocalMetadata(types, cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: types }, true, cancelToken);
        if (!out) {
            vscode.window.showWarningMessage('Operation Cancelled by User');
            resolve();
        } else if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                resolve(response.result.data);
            } else {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + response.error.message);
                resolve();
            }
        } else {
            vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
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
            AppContext.diagnosticCollection.set(vscode.Uri.parse(path), diags);
        });
    });
}