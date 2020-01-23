const vscode = require('vscode');
const Logger = require('../main/logger');
const MetadataTypes = require('./metadataTypes');
const FileSystem = require('../fileSystem');
const MetadataFactory = require('./factory');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const Utils = require('./utils');
const FileReader = FileSystem.FileReader;
const FileWriter = FileSystem.FileWriter;
const Paths = FileSystem.Paths;
const FileChecker = FileSystem.FileChecker;

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
let batches;
let metadata;
let increment;
let progressReport;
class Connection {

    static abort() {
        abort = true;
        if (progressReport)
            progressReport.report({ message: "Aborting operation..." });
    }

    static getSpecificMetadataFromOrg(user, objects, orgNamespace, downloadAll, progressReport, cancelToken) {
        abort = false;
        return new Promise(function (resolve) {
            metadata = {};
            if (objects && objects.length > 0) {
                objects = objects.sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                increment = 100 / objects.length;
                let nBatches = 4;
                let recordsPerBatch = Math.ceil(objects.length / nBatches);
                batches = [];
                let counter = 0;
                let batch;
                for (const object of objects) {
                    if (!batch) {
                        batch = {
                            batchId: 'Bacth_' + counter,
                            records: [],
                            completed: false
                        }
                        counter++;
                    }
                    if (batch) {
                        batch.records.push(object);
                        if (batch.records.length === recordsPerBatch) {
                            batches.push(batch);
                            batch = undefined;
                        }
                    }
                }
                if (batch)
                    batches.push(batch);
                for (const batchToProcess of batches) {
                    Connection.getMetadataFromOrg(user, batchToProcess.records, orgNamespace, downloadAll, progressReport, cancelToken, function (downloadedMetadata) {
                        Object.keys(downloadedMetadata).forEach(function (key) {
                            metadata[key] = downloadedMetadata[key];
                        });
                        batchToProcess.completed = true;
                        let nCompleted = 0;
                        for (const resultBatch of batches) {
                            if (resultBatch.completed)
                                nCompleted++;
                        }
                        if (nCompleted === batches.length) {
                            if (metadata) {
                                resolve(metadata);
                            }
                        }
                    });
                }
            }
        });
    }

    static getAllMetadataFromOrg(user, orgNamespace, downloadAll, progressReport, cancelToken) {
        abort = false;
        return new Promise(function (resolve) {
            metadata = {};
            console.time('getAllMetadataFromOrg');
            Connection.getMetadataObjectsListFromOrg(user, true, progressReport, cancelToken, async function (metadataObjectsData) {
                if (metadataObjectsData && metadataObjectsData.length > 0) {
                    metadataObjectsData.sort(function (a, b) {
                        return a.xmlName.toLowerCase().localeCompare(b.xmlName.toLowerCase());
                    });
                    increment = 100 / metadataObjectsData.length;
                    let nBatches = 4;
                    let recordsPerBatch = Math.ceil(metadataObjectsData.length / nBatches);
                    batches = [];
                    let counter = 0;
                    let batch;
                    for (const object of metadataObjectsData) {
                        if (!batch) {
                            batch = {
                                batchId: 'Bacth_' + counter,
                                records: [],
                                completed: false
                            }
                            counter++;
                        }
                        if (batch) {
                            batch.records.push(object);
                            if (batch.records.length === recordsPerBatch) {
                                batches.push(batch);
                                batch = undefined;
                            }
                        }
                    }
                    if (batch)
                        batches.push(batch);
                    for (const batchToProcess of batches) {
                        Connection.getMetadataFromOrg(user, batchToProcess.records, orgNamespace, downloadAll, progressReport, cancelToken, function (downloadedMetadata) {
                            Object.keys(downloadedMetadata).forEach(function (key) {
                                metadata[key] = downloadedMetadata[key];
                            });
                            batchToProcess.completed = true;
                            let nCompleted = 0;
                            for (const resultBatch of batches) {
                                if (resultBatch.completed)
                                    nCompleted++;
                            }
                            if (nCompleted === batches.length) {
                                console.timeEnd('getAllMetadataFromOrg');
                                if (metadata || cancelToken.isCancellationRequested) {
                                    resolve(metadata);
                                }
                            }
                        });
                    }
                }
            });
        });
    }

    static waitForBatches() {
        return new Promise(function (resolve) {
            let finish = false;
            let nCompleted = 0;
            while (!finish) {
                for (const batch of batches) {
                    if (batch.completed)
                        nCompleted++;
                }
                if (nCompleted === batches.length)
                    finish = true;
            }
            resolve();
        });
    }


    static getMetadataObjectsListFromOrg(user, forceDownload, progressReport, cancelToken, callback) {
        abort = false;
        let folder = Paths.getSFDXFolderPath() + '/orgs/' + user + '/metadata';
        let file = Paths.getSFDXFolderPath() + '/orgs/' + user + '/metadata/metadataTypes.json';
        if (progressReport)
            progressReport.report({ message: "Getting all available types for download" });
        if (FileChecker.isExists(file) && !forceDownload) {
            if (callback)
                callback.call(this, Connection.getMetadataObjectsFromSFDXMetadataTypesFile(file));
        } else {
            let buffer = [];
            let bufferError = [];
            ProcessManager.listMetadata(user, cancelToken, function (event, data) {
                switch (event) {
                    case ProcessEvent.STD_OUT:
                        buffer = buffer.concat(data);
                        break;
                    case ProcessEvent.KILLED:
                        if (callback)
                            callback.call(this);
                        break;
                    case ProcessEvent.END:
                        if (!FileChecker.isExists(folder))
                            FileWriter.createFolderSync(folder);
                        FileWriter.createFileSync(file, buffer.toString());
                        if (callback)
                            callback.call(this, Connection.getMetadataObjectsFromSFDXMetadataTypesFile(file));
                        break;
                    default:
                        break;
                }
            });
        }

    }

    static getMetadataObjectsFromSFDXMetadataTypesFile(file) {
        let metadataObjects = [];
        let metadataFromSFDX = JSON.parse(FileReader.readFileSync(file)).result.metadataObjects;
        for (const metadata of metadataFromSFDX) {
            if (abort) {
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

    static async getMetadataFromOrg(user, metadataObjects, orgNamespace, downloadAll, progressReport, cancelToken, callback) {
        let metadata = {};
        if (cancelToken) {
            cancelToken.onCancellationRequested(() => {
                Connection.abort();
            });
            if (cancelToken.isCancellationRequested) {
                if (callback)
                    callback.call(this, metadata);
                return;
            }

        }
        let folders = await Connection.getFolders(user, cancelToken);
        for (const metadataObject of metadataObjects) {
            if (abort) {
                if (callback)
                    callback.call(this, metadata);
                return;
            }
            let objName = (metadataObject.xmlName) ? metadataObject.xmlName : metadataObject;
            let foldersByType = Connection.getFoldersByType(folders, objName);
            let metadataType;
            Logger.log('percentage', increment);
            if (objName === MetadataTypes.REPORTS || objName === MetadataTypes.DASHBOARD || objName === MetadataTypes.DOCUMENT) {
                for (const folder of foldersByType) {
                    let folderName = "unfiled$public";
                    if (folder.DeveloperName) {
                        folderName = folder.DeveloperName;
                    }
                    if (progressReport)
                        progressReport.report({ message: "Downloading " + objName + " from Folder: " + folderName });
                    metadataType = await Connection.describeMetadataFromFolder(user, objName, orgNamespace, downloadAll, folderName, cancelToken);
                    if (metadataType) {
                        if (!metadata[objName])
                            metadata[objName] = metadataType;
                        else {
                            Object.keys(metadataType.childs).forEach(function (key) {
                                metadata[objName].childs[key] = metadataType.childs[key];
                            });
                        }
                    }
                }
            } else if (objName === MetadataTypes.EMAIL_TEMPLATE) {
                if (progressReport)
                    progressReport.report({ increment: increment, message: "Downloading " + objName });
                metadataType = await Connection.getEmailTemplates(user, objName, orgNamespace, folders, downloadAll, cancelToken);
                if (metadataType)
                    metadata[objName] = metadataType;
            } else {
                if (progressReport)
                    progressReport.report({ increment: increment, message: "Downloading " + objName });
                metadataType = await Connection.getMetadataObjectsFromOrg(user, objName, orgNamespace, folders, downloadAll, cancelToken);
                if (metadataType)
                    metadata[objName] = metadataType;
            }
        }
        if (callback)
            callback.call(this, metadata);
    }

    static getFolders(user, cancelToken, callback) {
        return new Promise(function (resolve) {
            let query = 'Select Id, Name, DeveloperName, NamespacePrefix, Type FROM Folder';
            try {
                let buffer = [];
                let bufferError = [];
                ProcessManager.query(user, query, cancelToken, function (event, data) {
                    switch (event) {
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        case ProcessEvent.ERROR:
                        case ProcessEvent.ERR_OUT:
                            bufferError = bufferError.concat(data);
                            break;
                        case ProcessEvent.KILLED:
                            if (callback)
                                callback.call(this);
                            resolve([]);
                            break;
                        case ProcessEvent.END:
                            if (buffer.length > 0) {
                                let outJson = JSON.parse(buffer.toString());
                                if (outJson.status === 0) {
                                    resolve(Utils.forceArray(outJson.result.records));
                                } else {
                                    resolve([])
                                }
                            } else
                                resolve([]);
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {

            }

        });
    }

    static getEmailTemplates(user, metadataTypeName, orgNamespace, folders, downloadAll, cancelToken, callback) {
        return new Promise(function (resolve) {
            let metadataType = MetadataFactory.createMetadataType(metadataTypeName, false);
            let query = 'Select Id, Name, DeveloperName, NamespacePrefix, FolderId FROM EmailTemplate';
            try {
                let buffer = [];
                let bufferError = [];
                ProcessManager.query(user, query, cancelToken, function (event, data) {
                    switch (event) {
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        case ProcessEvent.ERROR:
                        case ProcessEvent.ERR_OUT:
                            bufferError = bufferError.concat(data);
                            break;
                        case ProcessEvent.KILLED:
                            if (callback)
                                callback.call(this);
                            resolve(undefined);
                            break;
                        case ProcessEvent.END:
                            if (buffer.length > 0) {
                                let outJson = JSON.parse(buffer.toString());
                                if (outJson.status === 0) {
                                    let records = Utils.forceArray(outJson.result.records);
                                    for (const email of records) {
                                        let folder = Connection.getFolderDevName(folders, email.FolderId);
                                        if (downloadAll) {
                                            if (!metadataType.childs[folder])
                                                metadataType.childs[folder] = MetadataFactory.createMetadataObject(folder, false);
                                            metadataType.childs[folder].childs[email.DeveloperName] = MetadataFactory.createMetadataItem(email.DeveloperName, false);
                                        } else if (!email.NamespacePrefix || email.NamespacePrefix === orgNamespace) {
                                            if (!metadataType.childs[folder])
                                                metadataType.childs[folder] = MetadataFactory.createMetadataObject(folder, false);
                                            metadataType.childs[folder].childs[email.DeveloperName] = MetadataFactory.createMetadataItem(email.DeveloperName, false);
                                        }
                                    }
                                    resolve(metadataType);
                                } else {
                                    resolve(undefined)
                                }
                            } else
                                resolve(undefined);
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {

            }

        });
    }

    static getMetadataObjectsFromOrg(user, metadataTypeName, orgNamespace, folders, downloadAll, cancelToken, callback) {
        return new Promise(async function (resolve) {
            let metadataType;
            try {
                let buffer = [];
                let bufferError = [];
                ProcessManager.describeMetadata(user, metadataTypeName, undefined, cancelToken, function (event, data) {
                    switch (event) {
                        case ProcessEvent.STD_OUT:
                            buffer = buffer.concat(data);
                            break;
                        case ProcessEvent.KILLED:
                            if (callback)
                                callback.call(this);
                            resolve(undefined);
                            break;
                        case ProcessEvent.END:
                            metadataType = Connection.processMetadataType(buffer.toString(), metadataTypeName, orgNamespace, downloadAll);
                            resolve(metadataType);
                            break;
                        default:
                            break;
                    }
                });
            } catch (error) {

            }
        });
    }

    static describeMetadataFromFolder(user, metadataTypeName, orgNamespace, downloadAll, folderName, cancelToken) {
        return new Promise(function (resolve) {
            let buffer = [];
            let bufferError = [];
            let metadataType;
            ProcessManager.describeMetadata(user, metadataTypeName, folderName, cancelToken, function (event, data) {
                switch (event) {
                    case ProcessEvent.STD_OUT:
                        buffer = buffer.concat(data);
                        break;
                    case ProcessEvent.KILLED:
                        resolve(undefined);
                        break;
                    case ProcessEvent.END:
                        metadataType = Connection.processMetadataType(buffer.toString(), metadataTypeName, orgNamespace, downloadAll);
                        resolve(metadataType);
                        break;
                    default:
                        break;
                }
            });
        });
    }

    static getFoldersByType(folders, type) {
        let result = [];
        for (const folder of folders) {
            if (folder.Type === type) {
                result.push(folder);
            }
        }
        return result;
    }

    static getFolderDevName(folders, folderId) {
        for (const folder of folders) {
            if (folder.Id === folderId) {
                return folder.DeveloperName;
            }
        }
        return 'unfiled$public'
    }

    static processMetadataType(stdOut, metadataTypeName, orgNamespace, downloadAll) {
        if (!stdOut || stdOut.length === 0)
            return undefined;
        let metadataType;
        let data = JSON.parse(stdOut);
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
                    if (downloadAll) {
                        if (!item) {
                            if (!objects[name])
                                objects[name] = MetadataFactory.createMetadataObject(name, false);
                        } else {
                            if (!objects[name])
                                objects[name] = MetadataFactory.createMetadataObject(name, false);
                            objects[name].childs[item] = MetadataFactory.createMetadataItem(item, false);
                        }
                    } else {
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
            }
            Object.keys(objects).forEach(function (key) {
                metadataType.childs[key] = objects[key];
            });
        }
        return metadataType;
    }

}
module.exports = Connection;