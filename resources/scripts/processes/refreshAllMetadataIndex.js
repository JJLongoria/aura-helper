const Worker = require('worker_threads');
const process = require('child_process');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const fileSystem = require('../fileSystem');
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;

let batchsForProcess = {};
exports.run = function (user, objCallback, finishCalback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let count = 0;
            let total = 0;
            let stdOutList = process.execSync('sfdx force:mdapi:listmetadata --json -m CustomObject -u ' + user);
            if (stdOutList) {
                let data = JSON.parse(stdOutList.toString());
                if (data.status === 0) {
                    let objNames = [];
                    let dataList = [];
                    if (Array.isArray(data.result))
                        dataList = data.result
                    else
                        dataList.push(data.result);
                    for (const data of dataList) {
                        objNames.push(data.fullName);
                    }
                    let totalBatchs = 1;
                    let recordsPerBatch = Math.ceil((objNames.length / totalBatchs));
                    let recordsForProcessPerBatch = [];
                    batchsForProcess = {};
                    let count = 1;
                    let batchCount = 0;
                    for (const objName of objNames) {
                        if (count === recordsPerBatch) {
                            let batchId = 'batchId_' + batchCount;
                            batchCount++;
                            batchsForProcess[batchId] = {
                                batchId: batchId,
                                records: recordsForProcessPerBatch
                            };
                            recordsForProcessPerBatch = [];
                            count = 0;
                        } else {
                            recordsForProcessPerBatch.push(objName);
                        }
                        count++;
                    }
                    if (recordsForProcessPerBatch.length > 0) {
                        let batchId = 'batchId_' + batchCount;
                        batchCount++;
                        batchsForProcess[batchId] = {
                            batchId: batchId,
                            records: recordsForProcessPerBatch,
                            completed: false,
                        };
                        recordsForProcessPerBatch = [];
                    }
                    Object.keys(batchsForProcess).forEach(function (key) {
                        let batchData = batchsForProcess[key];
                        refreshMetadataIndexForObjects(key, batchData.records, user, finishCalback);
                    });
                }
            }
        } catch (error) {
            result.errorData = { message: "An error ocurred while refresing metadata index", data: error };
            finishCalback.call(this, result);
        }
    }, 150);
}

async function refreshMetadataIndexForObjects(batchId, objectList, user, callback) {
    let result = {
        successData: undefined,
        errorData: undefined
    }
    for (const objName of objectList) {
        try {
            let stdout = process.execSync('sfdx force:schema:sobject:describe --json -s ' + objName + ' -u ' + user, { maxBuffer: 1024 * 500000 });
            if (stdout) {
                let metadataIndex = Utils.getMetadata(stdout.toString());
                FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + objName + ".json", JSON.stringify(metadataIndex, null, 2));
            }
        } catch (error) {
            logger.log(error);
        }
    }
    batchsForProcess[batchId].completed = true;
    let allCompleted = true;
    Object.keys(batchsForProcess).forEach(function (key) {
        let batchData = batchsForProcess[key];
        if (!batchData.completed)
            allCompleted = false;
    });
    result.successData = { message: "Metadata index refreshed succesfully" };
    if (callback && allCompleted)
        callback.call(this, result);
}
