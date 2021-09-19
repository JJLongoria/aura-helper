const vscode = require('vscode');
const Connection = require('@aurahelper/connector');
const Output = require('../output');
const NotificationManager = require('../output/notificationManager');
const ApexNodeWatcher = require('../watchers/apexCodeWatcher');
const ProvidersManager = require('../providers/providersManager');
const { FileChecker, FileWriter, FileReader } = require('@aurahelper/core').FileSystem;
const { MetadataTypes } = require('@aurahelper/core').Values;
const { SObject } = require('@aurahelper/core').Types;
const Config = require('../core/config');
const Paths = require('../core/paths');
const applicationContext = require('../core/applicationContext');
const OutputChannel = Output.OutputChannel;


exports.run = function (onbackground) {
    if (!onbackground) {
        try {
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
            if (!FileChecker.isExists(Paths.getMetadataIndexFolder()))
                FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
            FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + status.data.name, JSON.stringify(status.data, null, 2));
        }
    });
    connection.describeMetadataTypes([MetadataTypes.CUSTOM_OBJECT], true).then(async (metadataTypes) => {
        let objectsToDescribe = [];
        if (force) {
            objectsToDescribe = Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs);
        } else {
            const existingObjects = getSObjects();
            for (const objKey of Object.keys(metadataTypes[MetadataTypes.CUSTOM_OBJECT].childs)) {
                if (!existingObjects[objKey.toLowerCase()])
                    objectsToDescribe.push(objKey);
            }
        }
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
    let indexObjFiles = FileChecker.isExists(Paths.getMetadataIndexFolder()) ? FileReader.readDirSync(Paths.getMetadataIndexFolder()) : [];
    if (indexObjFiles.length > 0) {
        for (const fileName of indexObjFiles) {
            let obj = JSON.parse(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
            sObjects[obj.name.toLowerCase()] = new SObject(obj);
        }
    }
    return sObjects;
}
