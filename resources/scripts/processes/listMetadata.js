const process = require('child_process');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;

exports.run = async function (user, callback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let objects = [];
            let stdOutList = process.execSync("sfdx force:schema:sobject:list -c all -u " + user);
            if (stdOutList) {
                let lines = stdOutList.toString().split('\n');
                for (const objName of lines) {
                    if (Utils.isSObject(objName) && objName){
                        objects.push(objName);
                    }
                }
            }
            result.successData = { message: "Object list obtained", data: { objects: objects } };
        } catch (error) {
            result.errorData = { message: "An error ocurred while listing available metadata for refresh", data: error };
        }
        if (callback)
            callback.call(this, result);
    }, 150);
}