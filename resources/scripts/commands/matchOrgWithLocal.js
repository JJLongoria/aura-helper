const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Process = require('../processes').Process;
const Config = require('../main/config');
const Metadata = require('../metadata');
const MetadataUtils = Metadata.Utils;
const MetadataConnection = Metadata.Connection;
const window = vscode.window;
const MetadataTypes = Metadata.MetadataTypes;
const MetadataFactory = Metadata.Factory;
const ProgressLocation = vscode.ProgressLocation;

exports.run = function () {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Matching Org Metadata with your local metadata \n (Only affects metadata types that you have in your local project)",
        cancellable: true
    }, (progress, token) => {
        return new Promise(resolve => {
            token.onCancellationRequested(() => {
                MetadataConnection.abort();
            });
            setTimeout(() => {
                let user = Config.getAuthUsername();
                let orgNamespace = Config.getOrgNamespace();
                let metadataObjects = MetadataConnection.getMetadataObjectsListFromOrg(user);
                if (metadataObjects) {
                    let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
                    let metadataFromFileSystem = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
                    let metadataFromOrg = MetadataConnection.getMetadataFromOrg(user, metadataObjects, orgNamespace);
                    let metadataForDelete = getMetadataForDeleteFromOrg(metadataFromFileSystem, metadataFromOrg);
                }

            }, 100);
        });
    });
}

function getMetadataForDeleteFromOrg(metadataFromFileSystem, metadataFromOrg) {
    let metadataTypesForCheck = [
        MetadataTypes.APEX_CLASS,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.RECORD_TYPE,
        MetadataTypes.LAYOUT,
        MetadataTypes.FLOWS,
        MetadataTypes.APEX_PAGE,
        MetadataTypes.APEX_TRIGGER,
        MetadataTypes.APEX_COMPONENT,
        MetadataTypes.APPROVAL_PROCESSES
    ];
    let metadataForDelete = [];
    Object.keys(metadataFromFileSystem).forEach(function (key) {
        let metadataTypeFromFileSystem = metadataFromFileSystem[key];
        let metadataTypeFromOrg = metadataFromOrg[key];
        if (metadataTypeFromOrg) {
            if (metadataTypesForCheck.includes(key)) {
                Object.keys(metadataTypeFromOrg.childs).forEach(function (childKey) {
                    let childObj = metadataTypeFromOrg.childs[childKey];
                    let grandChildsKeys = Object.keys(childObj.childs);
                    if (grandChildsKeys.length > 0) {
                        Object.keys(childObj.childs).forEach(function (grandChildKey) {
                            if (!metadataTypeFromFileSystem[childKey])
                                metadataForDelete.push({ type: key, parent: childKey, name: grandChildKey });
                        });
                    } else {
                        if (!metadataTypeFromFileSystem[childKey])
                            metadataForDelete.push({ type: key, parent: undefined, name: childKey });
                    }
                });
            }
        }
    });
    return metadataForDelete;
}