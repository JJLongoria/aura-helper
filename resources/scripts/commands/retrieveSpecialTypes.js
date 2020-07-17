const vscode = require('vscode');
const Metadata = require('../metadata');
const MetadataTypes = Metadata.MetadataTypes;
const ProcessManager = require('../processes').ProcessManager;
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');

const TYPES_FOR_RETRIEVE = {
    Profile: [
        MetadataTypes.CUSTOM_APPLICATION,
        MetadataTypes.APEX_CLASS,
        MetadataTypes.APEX_PAGE,
        MetadataTypes.CUSTOM_METADATA,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.CUSTOM_PERMISSION,
        MetadataTypes.TAB,
        MetadataTypes.LAYOUT,
        MetadataTypes.FLOWS,
        MetadataTypes.RECORD_TYPE
    ],
    PermissionSet: [
        MetadataTypes.CUSTOM_APPLICATION,
        MetadataTypes.APEX_CLASS,
        MetadataTypes.APEX_PAGE,
        MetadataTypes.CUSTOM_METADATA,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.CUSTOM_PERMISSION,
        MetadataTypes.TAB,
        MetadataTypes.RECORD_TYPE
    ],
    Translations: [
        MetadataTypes.CUSTOM_APPLICATION,
        MetadataTypes.CUSTOM_LABEL,
        MetadataTypes.TAB,
        MetadataTypes.FLOWS,
        MetadataTypes.FLOW_DEFINITION,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.QUICK_ACTION,
        MetadataTypes.REPORT_TYPE,
        MetadataTypes.CUSTOM_PAGE_WEB_LINK,
        MetadataTypes.S_CONTROL
    ],
    RecordType: [
        MetadataTypes.COMPACT_LAYOUT,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.BUSINESS_PROCESS
    ],
    CustomObject: []
};

exports.run = async function () {
    let from = await InputFactory.createRetrieveSpecialsSourceSelector();
    if (from) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Loading Metadata Types from " + ((from.startsWith('From Org')) ? 'Org' : 'Local'),
            cancellable: true
        }, (progress, cancelToken) => {
            return new Promise(async function (resolve) {
                try {
                    let types;
                    if (from.startsWith('From Org')) {
                        types = await getOrgMetadata(Object.keys(TYPES_FOR_RETRIEVE), false, cancelToken);
                    } else if (from.startsWith('From Local') || from.startsWith('Mixed')) {
                        types = await getLocalMetadata(Object.keys(TYPES_FOR_RETRIEVE), cancelToken);
                    }
                    let input = new MetadataSelectorInput('Select Metadata Types from Retrieve', types);
                    input.onAccept(async metadata => {
                        let orgNamespace = 'Yes';
                        if (from !== 'From Local') {
                            orgNamespace = await InputFactory.createIncludeOrgNamespaceSelector();
                        }
                        if (orgNamespace) {
                            let compress = await InputFactory.createCompressSelector();
                            if (compress) {
                                let dataToRetrieve = Metadata.Utils.getTypesForAuraHelperCommands(metadata);
                                retrieveMetadata(dataToRetrieve, from, orgNamespace, compress);
                            }
                        }
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
                NotificationManager.showError(response.error.message);
                resolve();
            }
        } else {
            NotificationManager.showCommandError(out.stdErr);
            resolve();
        }
    });
}

function getOrgMetadata(types, orgNamespace, cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: true, types: types, orgNamespace: orgNamespace }, true, cancelToken);
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
    });
}

function retrieveMetadata(objects, from, orgNamespace, compress) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Retrieving Metadata",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (resolve) {
            try {
                let options = {
                    fromOrg: from.startsWith('From Org'),
                    orgNamespace: orgNamespace === 'Org Namespace',
                    compress: compress === 'Yes',
                    types: objects,
                    includeOrg: from.startsWith('Mixed')
                };
                let out = await ProcessManager.auraHelperRetriveAllSpecials(options, true, cancelToken);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            NotificationManager.showInfo(response.result.message);
                        } else {
                            NotificationManager.showError(response.error.message);
                        }
                    } else {
                        NotificationManager.showCommandError(out.stdErr);
                    }
                } else {
                    NotificationManager.showInfo('Operation Canceled by user');
                }
                resolve();
            } catch (error) {
                NotificationManager.showCommandError(error);
                resolve();
            }
        });
    });
}
