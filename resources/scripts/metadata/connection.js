const vscode = require('vscode');
const MetadataTypes = require('./metadataTypes');
const FileSystem = require('../fileSystem');
const MetadataFactory = require('./factory');
const Processes = require('../processes');
const Utils = require('./utils');
const FileReader = FileSystem.FileReader;

const suffixByMetadataType = {
    CustomField: 'field',
    BusinessProcess: 'businessProcess',
    RecordType: 'recordType',
    CompactLayout: 'compactLayout',
    WebLink: 'webLink',
    ValidationRule: 'validationRule',
    SharingReason: 'sharingReason',
    ListView: 'listView',
    FieldSet: 'fieldSet'
}

let abort = false;

class Connection {

    static abort() {
        abort = true;
    }

    static async getAllMetadataFromOrg(user, orgNamespace, progressCallback, finishCallback) {
        let metadataObjectsData = Connection.getMetadataObjectsListFromOrg(user);
        let metadata = Connection.getMetadataFromOrg(user, metadataObjectsData, orgNamespace, progressCallback);
        if (finishCallback)
            finishCallback.call(this, metadata);
    }

    static getMetadataObjectsListFromOrg(user) {
        let metadataObjects = [];
        let metadataFromSFDXFile = JSON.parse(FileReader.readFileSync(vscode.workspace.rootPath + '/.sfdx/orgs/' + user + '/metadata/metadataTypes.json')).result.metadataObjects;
        for (const metadata of metadataFromSFDXFile) {
            if (abort) {
                abort = false;
                return;
            }
            metadataObjects.push({
                directoryName: metadata.directoryName,
                inFolder: metadata.inFolder,
                metaFile: metadata.metaFile,
                suffix: metadata.suffix,
                xmlName: metadata.xmlName
            });
            if (metadata.childXmlNames && metadata.childXmlNames.length > 0) {
                for (const childXMLName of metadata.childXmlNames) {
                    metadataObjects.push({
                        directoryName: metadata.directoryName,
                        inFolder: metadata.inFolder,
                        metaFile: metadata.metaFile,
                        suffix: (suffixByMetadataType[childXMLName]) ? suffixByMetadataType[childXMLName] : metadata.suffix,
                        xmlName: childXMLName
                    });
                }
            }
        }
        return metadataObjects;
    }

    static getMetadataFromOrg(user, metadataObjects, orgNamespace, progress, cancelToken) {
        let metadata = {};
        let counter = 1;
        for (const metadataObject of metadataObjects) {
            if (progress)
                progress.report({ message: "Downloading " + metadataObject.xmlName + " (" + counter + "/)" });
            let metadataType = Connection.getMetadataObjectsFromOrg(user, metadataObject.xmlName, orgNamespace);
            if (metadataType) {
                metadata[metadataObject.xmlName] = metadataType;
                if (progress)
                    progress.report({ message: "Downloading " + metadataObject.xmlName + " (" + counter + "/" + metadataObjects.length + ")", increment: (counter / metadataObjects.length) });
            }
            counter++;
            if (cancelToken) {
                cancelToken.onCancellationRequested(function (event) {
                    abort = true;
                });
            }
            if (abort) {
                abort = false;
                return metadata;
            }
        }
        return metadata;
    }

    static getMetadataObjectsFromOrg(user, metadataTypeName, orgNamespace) {
        let metadataType;
        try {
            let processOut = Processes.Process.describeMetadata(user, metadataTypeName);
            if (processOut) {
                let data = JSON.parse(processOut.toString());
                if (data.status === 0) {
                    let dataList = Utils.forceArray(data.result);
                    metadataType = MetadataFactory.createMetadataType(metadataTypeName, false);
                    let objects = {};
                    for (const obj of dataList) {
                        let separator;
                        if (metadataTypeName === MetadataTypes.EMAIL_TEMPLATE || metadataTypeName === MetadataTypes.DOCUMENT || metadataTypeName === MetadataTypes.REPORTS || metadataTypeName === MetadataTypes.DASHBOARD) {
                            separator = '/';
                        } else if (metadataTypeName === MetadataTypes.LAYOUT || metadataTypeName === MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS || metadataTypeName === MetadataTypes.FLOWS) {
                            separator = '-';
                        } else {
                            separator = '.';
                        }
                        let name;
                        let item;
                        if (obj) {
                            if (obj.fullName.indexOf(separator) != -1) {
                                name = obj.fullName.substring(0, obj.fullName.indexOf(separator));
                                item = obj.fullName.substring(obj.fullName.indexOf(separator) + 1);
                            } else {
                                name = obj.fullName;
                            }
                            if (!item && (!obj.namespacePrefix || obj.namespacePrefix === orgNamespace)) {
                                if (!objects[name])
                                    objects[name] = MetadataFactory.createMetadataObject(name, false);
                            } else if (!obj.namespacePrefix || obj.namespacePrefix === orgNamespace) {
                                if (!objects[name])
                                    objects[name] = MetadataFactory.createMetadataObject(name, false);
                                objects[name].childs[item] = MetadataFactory.createMetadataItem(item, false);
                            }

                        }
                    }
                    Object.keys(objects).forEach(function (key) {
                        metadataType.childs[key] = objects[key];
                    });
                }
            }
        } catch (error) {

        }
        return metadataType;
    }

}
module.exports = Connection;