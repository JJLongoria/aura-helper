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
            let stdOutList = process.execSync('sfdx force:mdapi:listmetadata --json -m CustomObject -u ' + user);
            if (stdOutList) {
                let data = JSON.parse(stdOutList.toString());
                if (data.status === 0) {
                    let dataList = [];
                    if (Array.isArray(data.result))
                        dataList = data.result
                    else
                        dataList.push(data.result);
                    for (const data of dataList) {
                        objects.push(data.fullName);
                    }
                }
                result.successData = { message: "Object list obtained", data: { objects: objects } };
            }
        } catch (error) {
            result.errorData = { message: "An error ocurred while listing available metadata for refresh", data: error };
        }
        if (callback)
            callback.call(this, result);
    }, 150);
}