const ProcessManager = require('../processes').ProcessManager;
const AppContext = require('../core/applicationContext');
const Config = require('../core/config');
const fileSystem = require('../fileSystem');
const Metadata = require('../metadata');
const FileWriter = fileSystem.FileWriter;
const MetadataFactory = Metadata.Factory;
const Paths = fileSystem.Paths;

let increment;
let batches;

class Connection {

    static refreshSObjectsIndex(objProgress, cancelToken) {
        return new Promise(async function (resolve, reject) {
            let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: true, types: ['CustomObject'] }, false, cancelToken);
            if (!out) {
                reject('Operation Cancelled by User');
            } else if (out.stdOut) {
                let response = JSON.parse(out.stdOut);
                if (response.status === 0) {
                    let user = await Config.getAuthUsername();
                    await Connection.processCustomObjectsOut(user, response.result.data, objProgress, cancelToken);
                    resolve();
                } else {
                    reject('An error ocurred while processing command. Error: \n' + response.error.message);
                }
            } else {
                reject('An error ocurred while processing command. Error: \n' + out.stdErr);
            }
        });
    }

    static processCustomObjectsOut(user, objects, objProgress, cancelToken) {
        return new Promise(function (resolve) {
            let objNames = Object.keys(objects['CustomObject'].childs);
            increment = 100 / objNames.length;
            let nBatches = Config.getAvailableCPUs();
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
                Connection.refreshMetadataIndexForObjects(batchToProcess.records, user, objProgress, cancelToken).then(function () {
                    batchToProcess.completed = true;
                    let nCompleted = 0;
                    for (const resultBatch of batches) {
                        if (resultBatch.completed)
                            nCompleted++;
                    }
                    if (nCompleted === batches.length)
                        resolve();
                }).catch(function () {
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

    static async refreshMetadataIndexForObjects(objectList, user, objProgress, cancelToken) {
        return new Promise(async function (resolve, reject) {
            objectList.sort();
            for (const objName of objectList) {
                try {
                    if(objProgress)
                        objProgress.report({ increment: increment, message: "Refreshing Index for: " + objName });
                    await Connection.refresh(user, objName, cancelToken);
                } catch (error) {
                    reject(error);
                }
            }
            resolve();
        });
    }

    static refresh(user, objName, cancelToken) {
        return new Promise(async function (resolve, reject) {
            let out = await ProcessManager.describeSchemaMetadata(user, objName, cancelToken);
            if (out) {
                if (out.stdOut) {
                    let metadataIndex = MetadataFactory.createMetadataFromJSONSchema(out.stdOut);
                    if (metadataIndex) {
                        FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + objName + ".json", JSON.stringify(metadataIndex, null, 2));
                    }
                    AppContext.sObjects = MetadataFactory.getSObjects(false);
                    resolve();
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }

}
module.exports = Connection;