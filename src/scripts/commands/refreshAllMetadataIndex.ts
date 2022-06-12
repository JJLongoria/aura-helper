import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { NotificationManager, OutputChannel } from '../output';
import { applicationContext } from '../core/applicationContext';
import { ProviderManager } from '../providers/providersManager';
import { ApexCodeWatcher } from '../watchers/apexCodeWatcher';
import { ProjectFilesWatcher } from '../watchers/projectFilesWatcher';
import { CoreUtils, FileChecker, FileReader, FileWriter, MetadataTypes, SObject } from '@aurahelper/core';
import { SFConnector } from '@aurahelper/connector';
import { MetadataFactory } from '@aurahelper/metadata-factory';
const StrUtils = CoreUtils.StrUtils;

export function run(onbackground: boolean): void {
    if (!onbackground) {
        try {
            const alias = Config.getOrgAlias();
            if (!alias) {
                NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
                return;
            }
            showLoadingDialog();
        } catch (error) {
            NotificationManager.showCommandError(error);
        }
    } else {
        setTimeout(() => {
            OutputChannel.outputLine('Refreshing SObject Defintions');
            NotificationManager.showStatusBar('$(sync~spin) Refreshing SObjects Definitions...');
            console.time('refreshIndex');
            refreshIndex(true, undefined, undefined, () => {
                console.timeEnd('refreshIndex');
                NotificationManager.hideStatusBar();
                OutputChannel.outputLine('Refreshing SObject Defintions Finished');
                ProviderManager.registerProviders();
                ApexCodeWatcher.startWatching();
                ProjectFilesWatcher.startWatching();
            });
        }, 100);
    }
}

function showLoadingDialog(): void {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Refreshing SObjects Definitions",
        cancellable: true
    }, (progress, cancelToken) => {
        OutputChannel.outputLine('Refreshing SObject Defintions');
        return new Promise<void>(resolve => {
            refreshIndex(true, progress, cancelToken, (err: Error) => {
                OutputChannel.outputLine('Refreshing SObject Defintions Finished');
                NotificationManager.hideStatusBar();
                if (!err) {
                    NotificationManager.showInfo('Refreshing SObject Definitios finished Succesfully');
                } else {
                    NotificationManager.showError(err);
                }
                resolve();
            });
        });
    });
}

async function refreshIndex(force: boolean, progress?: vscode.Progress<any>, cancelToken?: vscode.CancellationToken, callback?: any) {
    const connection = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
    if (cancelToken) {
        cancelToken.onCancellationRequested(() => {
            connection.abortConnection();
        });
    }
    connection.setMultiThread();
    connection.onAfterDownloadSObject((status: any) => {
        if (status.entityObject && progress) {
            progress.report({
                message: 'SObject: ' + status.entityObject,
                increment: status.increment
            });
        }
        if (status.data) {
            try {
                if (!FileChecker.isExists(Paths.getMetadataIndexFolder())) {
                    FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
                }
                FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + status.data.name + '.json', JSON.stringify(status.data, null, 2));
            } catch (error) {
            }
        } else {
            try {
                const obj = new SObject();
                obj.name = status.entityObject;
                if (!FileChecker.isExists(Paths.getMetadataIndexFolder())) {
                    FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
                }
                FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + obj.name + '.json', JSON.stringify(obj, null, 2));
            } catch (error) {
            }
        }
    });
    connection.describeMetadataTypes([MetadataTypes.CUSTOM_OBJECT], true).then(async (metadataTypes: any) => {
        let objectsToDescribe = [];
        let existingObjects: any = {};
        if (force) {
            objectsToDescribe = Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs);
            if (!objectsToDescribe.includes('User')) {
                objectsToDescribe.push('User');
            }
        } else {
            existingObjects = getSObjects();
            for (const objKey of Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs)) {
                if (!existingObjects[objKey.toLowerCase()]) {
                    objectsToDescribe.push(objKey);
                }
            }
            if (!objectsToDescribe.includes('User')) {
                objectsToDescribe.push('User');
            }
        }
        if (!objectsToDescribe.includes('Profile') && !existingObjects['profile']) {
            objectsToDescribe.push('Profile');
        }
        if (!objectsToDescribe.includes('RecordType') && !existingObjects['recordtype']) {
            objectsToDescribe.push('RecordType');
        }
        if (!objectsToDescribe.includes('QueueSobject') && !existingObjects['QueueSobject']) {
            objectsToDescribe.push('QueueSobject');
        }
        if (!objectsToDescribe.includes('UserRole') && !existingObjects['userrole']) {
            objectsToDescribe.push('UserRole');
        }
        if (!objectsToDescribe.includes('Group') && !existingObjects['group']) {
            objectsToDescribe.push('Group');
        }
        if (objectsToDescribe.length > 0) {
            connection.describeSObjects(objectsToDescribe).then(function () {
                applicationContext.parserData.sObjectsData = getSObjects();
                applicationContext.parserData.sObjects = Object.keys(applicationContext.parserData.sObjectsData);
                callback.call();
            });
        } else {
            callback.call();
        }
    }).catch((error: Error) => {
        callback.call(error);
    });
}

function getSObjects(): any {
    const sObjects: any = {};
    const sObjectsFolder = Paths.getProjectMetadataFolder() + '/objects';
    const objFolders = FileChecker.isExists(sObjectsFolder) ? FileReader.readDirSync(sObjectsFolder) : [];
    const indexObjFiles = FileChecker.isExists(Paths.getMetadataIndexFolder()) ? FileReader.readDirSync(Paths.getMetadataIndexFolder()) : [];
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
                    if (deleted) {
                        continue;
                    }
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
                        if (!objOnIndex.fields[fieldKey]) {
                            sObjects[sObj.name.toLowerCase()].fields[fieldKey] = field;
                        }
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
