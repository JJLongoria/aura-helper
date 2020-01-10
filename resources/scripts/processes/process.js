const process = require('child_process');

const BUFFER_SIZE = 1024 * 500000;

class Process { 

    static listMetadata(user) { 
        return process.execSync('sfdx force:mdapi:describemetadata --json -u ' + user, { maxBuffer: BUFFER_SIZE });
    }

    static async listMetadataAsync(user, callback) { 
        let out = process.execSync('sfdx force:mdapi:describemetadata --json -u ' + user, { maxBuffer: BUFFER_SIZE });
        callback.call(this, out);
    }

    static describeMetadata(user, metadata) { 
        return process.execSync('sfdx force:mdapi:listmetadata --json -m ' + metadata + ' -u ' + user, { maxBuffer: BUFFER_SIZE });
    }

    static async describeMetadataAsync(user, metadata, callback) { 
        let out = process.execSync('sfdx force:mdapi:listmetadata --json -m ' + metadata + ' -u ' + user, { maxBuffer: BUFFER_SIZE });
        callback.call(this, out);
    }

    static retrieve(user, packageFolder, packageFile) { 
        return process.execSync('sfdx force:mdapi:retrieve --json -s -r "' + packageFolder + '" -k "' + packageFile + '" -u ' + user, { maxBuffer: BUFFER_SIZE });
    }

    static async retrieveAsync(user, packageFolder, packageFile, callback) { 
        let out = process.execSync('sfdx force:mdapi:retrieve --json -s -r "' + packageFolder + '" -k "' + packageFile + '" -u ' + user, { maxBuffer: BUFFER_SIZE });
        callback.call(this, out);
    }

    static destructiveChanges(user, destructiveFolder) { 
        return process.execSync('sfdx force:mdapi:deploy --json -d "' + destructiveFolder + '" -u ' + user, { maxBuffer: BUFFER_SIZE });
    }

    static async destructiveChangesAsync(user, destructiveFolder, callback) { 
        let out = process.execSync('sfdx force:mdapi:deploy --json -d "' + destructiveFolder + '" -u ' + user, { maxBuffer: BUFFER_SIZE });
        callback.call(this, out);
    }

}
module.exports = Process;