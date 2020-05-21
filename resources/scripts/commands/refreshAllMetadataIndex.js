const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const FileWriter = fileSystem.FileWriter;
const Config = require('../core/config');
const AppContext = require('../core/applicationContext');
const Metadata = require('../metadata');
const Logger = require('../utils/logger');
const MetadataFactory = Metadata.Factory;
const Paths = fileSystem.Paths;
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;

let batches;
let increment;
exports.run = function () {
    try {
        window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function onButtonClick(selected) {
    if (selected === 'Ok') {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Refreshing Metadata Index",
            cancellable: true
        }, (objProgress, cancelToken) => {
            return new Promise(async resolve => {
                let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: ['CustomObject'] }, false, cancelToken);
                if (!out) {
                    vscode.window.showWarningMessage('Operation Cancelled by User');
                    resolve();
                } else if (out.stdOut) {
                    let response = JSON.parse(out.stdOut);
                    if (response.status === 0) {
                        let user = await Config.getAuthUsername();
                        await processCustomObjectsOut(user, response.result.data, objProgress, cancelToken);
                        resolve();
                    } else {
                        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + response.error.message);
                        resolve();
                    }
                } else {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                    resolve();
                }
            });
        });
    }
}

function processCustomObjectsOut(user, objects, objProgress, cancelToken) {
    return new Promise(function (resolve) {
        let objNames = Object.keys(objects['CustomObject'].childs);
        increment = 100 / objNames.length;
        let nBatches = 4;
        let recordsPerBatch = Math.ceil(objNames.length / nBatches);
        batches = [];
        let counter = 0;
        let batch;
        for (const object of objNames) {
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
            refreshMetadataIndexForObjects(batchToProcess.records, user, objProgress, cancelToken, function () {
                batchToProcess.completed = true;
                let nCompleted = 0;
                for (const resultBatch of batches) {
                    if (resultBatch.completed)
                        nCompleted++;
                }
                if (nCompleted === batches.length)
                    resolve();
            });
        }
    });
}

async function refreshMetadataIndexForObjects(objectList, user, objProgress, cancelToken, callback) {
    objectList.sort();
    for (const objName of objectList) {
        try {
            objProgress.report({ increment: increment, message: "Refreshing Index for: " + objName });
            await processPromise(user, objName, cancelToken);
        } catch (error) {
            Logger.log(error);
        }
    }
    if (callback)
        callback.call(this);
}

function processPromise(user, objName, cancelToken) {
    return new Promise(function (resolve) {
        let buffer = [];
        let bufferError = [];
        ProcessManager.describeSchemaMetadata(user, objName, cancelToken, function (event, data) {
            switch (event) {
                case ProcessEvent.STD_OUT:
                    buffer = buffer.concat(data);
                    break;
                case ProcessEvent.ERR_OUT:
                case ProcessEvent.ERROR:
                    resolve();
                    break;
                case ProcessEvent.END:
                    if (buffer.length > 0) {
                        let metadataIndex = MetadataFactory.createMetadataFromJSONSchema(buffer.toString());
                        if (metadataIndex) {
                            FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + objName + ".json", JSON.stringify(metadataIndex, null, 2));
                        }
                        AppContext.sObjects = MetadataFactory.getSObjects(false);
                        resolve();
                    }
                    break;
                default:
                    break;
            }
        });
    });
}
