const process = require('child_process');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const fileSystem = require('../fileSystem');
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;

exports.run = async function (user, objectName, callback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let stdOut = process.execSync('sfdx force:schema:sobject:describe --json -s ' + objectName + ' -u ' + user, { maxBuffer: 1024 * 500000 });
            if (stdOut) {
                let metadataIndex = Utils.getMetadata(stdOut.toString());
                FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + objectName + ".json", JSON.stringify(metadataIndex, null, 2));
                result.successData = { message: "Metadata Index for " + objectName + " refreshed succesfully", data: { processed: 1 } };
            } else{
                result.errorData = { message: "Not metadata available", data: { error: {}} };
            }
        } catch (error) {
            result.errorData = { message: "An error ocurred while refresing metadata index for " + objectName, data: error };
        }
        if (callback)
            callback.call(this, result);
    }, 150);
}