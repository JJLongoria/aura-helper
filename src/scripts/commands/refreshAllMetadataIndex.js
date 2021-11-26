const vscode = require('vscode');
const Connection = require('@aurahelper/connector');
const Output = require('../output');
const NotificationManager = require('../output/notificationManager');
const ApexNodeWatcher = require('../watchers/apexCodeWatcher');
const ProjectFilesWatcher = require('../watchers/projectFilesWatcher');
const ProvidersManager = require('../providers/providersManager');
const { FileChecker, FileWriter, FileReader } = require('@aurahelper/core').FileSystem;
const { StrUtils } = require('@aurahelper/core').CoreUtils;
const { MetadataTypes } = require('@aurahelper/core').Values;
const { SObject } = require('@aurahelper/core').Types;
const Config = require('../core/config');
const Paths = require('../core/paths');
const applicationContext = require('../core/applicationContext');
const MetadataFactory = require('@aurahelper/metadata-factory');
const OutputChannel = Output.OutputChannel;


exports.run = function (onbackground) {
    if (!onbackground) {
        try {
            const alias = Config.getOrgAlias();
            if (!alias) {
                NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
                return;
            }
            NotificationManager.showConfirmDialog('Refresh metadata index can will take several minutes. Do you want to continue?', function () {
                showLoadingDialog();
            });
        } catch (error) {
            NotificationManager.showCommandError(error)
        }
    } else {
        setTimeout(() => {
            OutputChannel.outputLine('Refreshing SObject Defintions');
            NotificationManager.showStatusBar('$(sync~spin) Refreshing SObjects Definitions...');
            refreshIndex(false, undefined, undefined, () => {
                NotificationManager.hideStatusBar();
                OutputChannel.outputLine('Refreshing SObject Defintions Finished');
                ProvidersManager.registerProviders();
                ApexNodeWatcher.startWatching();
                ProjectFilesWatcher.startWatching();
            });
        }, 100);
    }
}

function showLoadingDialog() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Refreshing SObjects Definitions",
        cancellable: true
    }, (progress, cancelToken) => {
        OutputChannel.outputLine('Refreshing SObject Defintions');
        return new Promise(resolve => {
            refreshIndex(true, progress, cancelToken, (err) => {
                OutputChannel.outputLine('Refreshing SObject Defintions Finished');
                NotificationManager.hideStatusBar();
                if (!err)
                    NotificationManager.showInfo('Refreshing SObject Definitios finished Succesfully');
                else
                    NotificationManager.showError(err);
                resolve();
            });
        });
    });
}

async function refreshIndex(force, progress, cancelToken, callback) {
    const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
    if (cancelToken)
        cancelToken.onCancellationRequested(() => {
            connection.abortConnection();
        });
    connection.setMultiThread();
    connection.onAfterDownloadSObject((status) => {
        if (status.entityObject && progress) {
            progress.report({
                message: 'SObject: ' + status.entityObject,
                increment: status.increment
            });
        }
        if (status.data) {
            try {
                if (!FileChecker.isExists(Paths.getMetadataIndexFolder()))
                    FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
                FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + status.data.name + '.json', JSON.stringify(status.data, null, 2));
            } catch (error) {
            }
        } else {
            try {
                const obj = new SObject();
                obj.name = status.entityObject;
                if (!FileChecker.isExists(Paths.getMetadataIndexFolder()))
                    FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
                FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + obj.name + '.json', JSON.stringify(obj, null, 2));
            } catch (error) {
            }
        }
    });
    connection.describeMetadataTypes([MetadataTypes.CUSTOM_OBJECT], true).then(async (metadataTypes) => {
        let objectsToDescribe = [];
        const existingObjects = getSObjects();
        if (force) {
            objectsToDescribe = Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs);
            if (!objectsToDescribe.includes('User'))
                objectsToDescribe.push('User');
        } else {
            for (const objKey of Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs)) {
                if (!existingObjects[objKey.toLowerCase()])
                    objectsToDescribe.push(objKey);
            }
            if (!objectsToDescribe.includes('User'))
                objectsToDescribe.push('User');
        }
        if (!objectsToDescribe.includes('Profile') && !existingObjects['profile'])
            objectsToDescribe.push('Profile');
        if (!objectsToDescribe.includes('RecordType') && !existingObjects['recordtype'])
            objectsToDescribe.push('RecordType');
        if (!objectsToDescribe.includes('QueueSobject') && !existingObjects['QueueSobject'])
            objectsToDescribe.push('QueueSobject');
        if (!objectsToDescribe.includes('UserRole') && !existingObjects['userrole'])
            objectsToDescribe.push('UserRole');
        if (!objectsToDescribe.includes('Group') && !existingObjects['group'])
            objectsToDescribe.push('Group');
        if (objectsToDescribe.length > 0) {
            connection.describeSObjects(objectsToDescribe).then(function () {
                applicationContext.parserData.sObjectsData = getSObjects();
                applicationContext.parserData.sObjects = Object.keys(applicationContext.parserData.sObjectsData);
                callback.call(this);
            });
        } else {
            callback.call(this);
        }
    }).catch((error) => {
        callback.call(this, error);
    });
}

function getSObjects() {
    let sObjects = {};
    const sObjectsFolder = Paths.getProjectMetadataFolder() + '/objects';
    let objFolders = FileChecker.isExists(sObjectsFolder) ? FileReader.readDirSync(sObjectsFolder) : [];
    let indexObjFiles = FileChecker.isExists(Paths.getMetadataIndexFolder()) ? FileReader.readDirSync(Paths.getMetadataIndexFolder()) : [];
    const namespace = Config.getNamespace();
    if (indexObjFiles.length > 0) {
        for (const fileName of indexObjFiles) {
            if (!fileName.endsWith('.json')) {
                FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                continue;
            }
            let obj = JSON.parse(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
            if (!Object.keys(obj).includes('description')) {
                FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                continue;
            } else {
                if (obj.fields) {
                    let deleted = false;
                    for (const fieldKey of Object.keys(obj.fields)) {
                        const field = obj.fields[fieldKey];
                        if (!Object.keys(field).includes('inlineHelpText')) {
                            FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                            deleted = true;
                            break;
                        }
                    }
                    if (deleted)
                        continue;
                }
            }
            const sObj = new SObject(obj);
            sObj.addSystemFields();
            sObj.fixFieldTypes();
            sObjects[sObj.name.toLowerCase()] = sObj;
        }

        if (objFolders.length > 0) {
            let sObjectsTmp = MetadataFactory.createSObjectsFromFileSystem(sObjectsFolder);
            for (const objKey of Object.keys(sObjectsTmp)) {
                const sObj = sObjectsTmp[objKey];
                if (!sObjects[sObj.name.toLowerCase()]) {
                    sObjects[sObj.name.toLowerCase()] = sObj;
                    FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + sObj.name + '.json', JSON.stringify(sObj, null, 2));
                } else {
                    const objOnIndex = sObjects[sObj.name.toLowerCase()];
                    for (const fieldKey of Object.keys(sObj.fields)) {
                        const field = sObj.fields[fieldKey];
                        if (!objOnIndex.fields[fieldKey])
                            sObjects[sObj.name.toLowerCase()].fields[fieldKey] = field;
                    }
                }
            }
        }
    }

    if (namespace) {
        for (const objKey of Object.keys(sObjects)) {
            if (StrUtils.contains(objKey, '__')) {
                const objSplits = objKey.split('__');
                const nsObjKey = namespace + '__' + objKey;
                if (sObjects[objKey] && !sObjects[nsObjKey] && objSplits.length < 3) {
                    const obj = sObjects[objKey];
                    delete sObjects[objKey];
                    obj.name = namespace + '__' + obj.name;
                    for (const fieldKey of Object.keys(obj.fields)) {
                        const fieldSplits = fieldKey.split('__');
                        const nsFieldKey = namespace + '__' + fieldKey;
                        if (StrUtils.contains(fieldKey, '__')) {
                            if (obj.fields[fieldKey] && !obj.fields[nsFieldKey] && fieldSplits.length < 3) {
                                const field = obj.fields[fieldKey];
                                delete obj.fields[fieldKey];
                                field.name = namespace + '__' + field.name;
                                obj.fields[nsFieldKey] = field;
                            }
                        }
                    }
                    sObjects[nsObjKey] = obj;
                }
            } else {
                for (const fieldKey of Object.keys(sObjects[objKey].fields)) {
                    const fieldSplits = fieldKey.split('__');
                    const nsFieldKey = namespace + '__' + fieldKey;
                    if (StrUtils.contains(fieldKey, '__')) {
                        if (sObjects[objKey].fields[fieldKey] && !sObjects[objKey].fields[nsFieldKey] && fieldSplits.length < 3) {
                            const field = sObjects[objKey].fields[fieldKey];
                            delete sObjects[objKey].fields[fieldKey];
                            field.name = namespace + '__' + field.name;
                            sObjects[objKey].fields[nsFieldKey] = field;
                        }
                    }
                }
            }
        }
    }
    return sObjects;
}
