const vscode = require('vscode');
const MetadataTypes = require('./metadataTypes');
const FileSystem = require('../fileSystem');
const MetadataFactory = require('./factory');
const Processes = require('../processes');
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

    static getMetadataFromOrg(user, metadataObjects, orgNamespace, progressCallback) {
        let metadata = {};
        let counter = 0;
        for (const metadataObject of metadataObjects) {
            if (progressCallback)
                progressCallback.call(this, metadataObject.xmlName);
            let metadataType = Connection.getMetadataObjectsFromOrg(user, metadataObject.xmlName, orgNamespace);
            counter++;
            if (metadataType) {
                metadata[metadataObject.xmlName] = metadataType;
                if (progressCallback)
                    progressCallback.call(this, metadataType, counter, metadataObjects.length);
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
                    let dataList = [];
                    if (Array.isArray(data.result))
                        dataList = data.result
                    else
                        dataList.push(data.result);
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
                            if (!objects[name])
                                objects[name] = MetadataFactory.createMetadataObject(name, false);
                            if (item && obj.namespacePrefix === orgNamespace) {
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