const process = require('child_process');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const fileSystem = require('../fileSystem');
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;

exports.run = function (user, objCallback, finishCalback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let count = 0;
            let total = 0;
            let stdOutList = process.execSync("sfdx force:schema:sobject:list -c all -u " + user);
            if (stdOutList) {
                let lines = stdOutList.toString().split('\n');
                for (const objName of lines) {
                    if (Utils.isSObject(objName) && objName) {
                        total++;
                    }
                }
                for (const objName of lines) {
                    if (Utils.isSObject(objName) && objName) {
                        count++;
                        if (objCallback)
                            objCallback.call(this, objName, count, total)
                        let stdOut = process.execSync('sfdx force:schema:sobject:describe --json -s ' + objName + ' -u ' + user, { maxBuffer: 1024 * 500000 });
                        if (stdOut) {
                            let metadataIndex = Utils.getMetadata(stdOut.toString());
                            FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + objName + ".json", JSON.stringify(metadataIndex, null, 2));
                        }
                    }
                }
            }
            result.successData = { message: "Metadata index refreshed succesfully", data: { processed: count } };
        } catch (error) {
            result.errorData = { message: "An error ocurred while refresing metadata index", data: error };
        }
        finishCalback.call(this, result);
    }, 150);
}
