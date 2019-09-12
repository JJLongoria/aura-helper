const process = require('child_process');
const fileUtils = require('./fileUtils');
const logger = require('./logger');

async function listMetadataForRefresh(user, callback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            logger.log("user", user);
            let objects = [];
            let stdOutList = process.execSync("sfdx force:schema:sobject:list -c all -u " + user);
            if (stdOutList) {
                let lines = stdOutList.toString().split('\n');
                for (const objName of lines) {
                    if (isSObject(objName) && objName){
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

async function refreshMetadataForObject(user, context, objectName, callback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let stdOut = process.execSync('sfdx force:schema:sobject:describe --json -s ' + objectName + ' -u ' + user, { maxBuffer: 1024 * 500000 });
            if (stdOut) {
                let metadataIndex = getMetadata(stdOut.toString());
                fileUtils.createFileSync(fileUtils.getMetadataIndexPath(context) + "/" + objectName + ".json", JSON.stringify(metadataIndex, null, 2));
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

async function refreshMetadataIndex(user, context, callback) {
    setTimeout(() => {
        let result = {
            successData: undefined,
            errorData: undefined
        }
        try {
            let count = 0;
            let stdOutList = process.execSync("sfdx force:schema:sobject:list -c all -u " + user);
            if (stdOutList) {
                let lines = stdOutList.toString().split('\n');
                for (const objName of lines) {
                    if (isSObject(objName) && objName) {
                        let stdOut = process.execSync('sfdx force:schema:sobject:describe --json -s ' + objName + ' -u ' + user, { maxBuffer: 1024 * 500000 });
                        if (stdOut) {
                            let metadataIndex = getMetadata(stdOut.toString());
                            if (metadataIndex.queryable) {
                                count++;
                                fileUtils.createFileSync(fileUtils.getMetadataIndexPath(context) + "/" + objName + ".json", JSON.stringify(metadataIndex, null, 2));
                            }
                        }
                    }
                }
            }
            result.successData = { message: "Metadata index refreshed succesfully", data: { processed: count } };
        } catch (error) {
            result.errorData = { message: "An error ocurred while refresing metadata index", data: error };
        }
        callback.call(this, result);
    }, 150);
}

function getMetadata(strJson) {
    let isOnFields = false;
    let isOnRts = false;
    let isOnReference = false;
    let isOnPicklistVal = false;
    let bracketIndent = 0;
    let metadataIndex = {
        name: undefined,
        label: undefined,
        labelPlural: undefined,
        keyPrefix: undefined,
        queryable: undefined,
        fields: [],
        recordTypes: []
    };
    let field = {
        name: undefined,
        label: undefined,
        length: undefined,
        type: undefined,
        custom: undefined,
        relationshipName: undefined,
        picklistValues: [],
        referenceTo: []
    };
    let pickVal = {
        active: undefined,
        defaultValue: undefined,
        label: undefined,
        value: undefined
    };
    let rt = {
        devName: undefined,
        name: undefined,
        default: undefined
    };
    for (let line of strJson.split('\n')) {
        line = line.trim();
        if (line.indexOf('{') !== -1)
            bracketIndent++;
        else if (line.indexOf('}') !== -1) {
            bracketIndent--;
            if (isOnRts) {
                if (rt.name)
                    metadataIndex.recordTypes.push(rt);
                rt = {
                    devName: undefined,
                    name: undefined,
                    default: undefined
                };
            }
            if (isOnPicklistVal) {
                if (pickVal.value)
                    field.picklistValues.push(pickVal);
                pickVal = {
                    active: undefined,
                    defaultValue: undefined,
                    label: undefined,
                    value: undefined
                };
            }
            else if (isOnFields) {
                if (field.name)
                    metadataIndex.fields.push(field);
                field = {
                    name: undefined,
                    label: undefined,
                    length: undefined,
                    type: undefined,
                    custom: undefined,
                    relationshipName: undefined,
                    picklistValues: [],
                    referenceTo: []
                };
            }
        }
        if (bracketIndent === 2) {
            if (line.indexOf('fields') !== -1 && line.indexOf(':') !== -1 && line.indexOf('[') !== -1)
                isOnFields = true;
            if (isOnFields && line.indexOf(']') !== -1 && line.indexOf('[') === -1) {
                isOnFields = false;
                isOnReference = false;
                isOnPicklistVal = false;
                if (field.name)
                    metadataIndex.fields.push(field);
                field = {
                    name: undefined,
                    label: undefined,
                    length: undefined,
                    type: undefined,
                    custom: undefined,
                    relationshipName: undefined,
                    picklistValues: [],
                    referenceTo: []
                };
            }

            if (line.indexOf('recordTypeInfos') !== -1 && line.indexOf(':') !== -1 && line.indexOf('[') !== -1)
                isOnRts = true;
            if (isOnRts && line.indexOf(']') !== -1 && line.indexOf('[') === -1) {
                isOnRts = false;
                if (rt.name)
                    metadataIndex.recordTypes.push(rt);
                rt = {
                    devName: undefined,
                    name: undefined,
                    default: undefined
                };
            }
        }
        if (isOnReference && line.indexOf(']') !== -1) {
            isOnReference = false;
        }
        if (isOnPicklistVal && line.indexOf(']') !== -1) {
            isOnPicklistVal = false;
        }
        if (bracketIndent === 2 && !isOnFields && !isOnRts) {
            let keyValue = getJSONNameValuePair(line);
            if (keyValue.name === 'name')
                metadataIndex.name = keyValue.value;
            if (keyValue.name === 'label')
                metadataIndex.label = keyValue.value;
            if (keyValue.name === 'labelPlural')
                metadataIndex.labelPlural = keyValue.value;
            if (keyValue.name === 'keyPrefix')
                metadataIndex.keyPrefix = keyValue.value;
            if (keyValue.name === 'queryable')
                metadataIndex.queryable = keyValue.value;
        } else if (isOnReference && line.indexOf('[') === -1) {
            field.referenceTo.push(line.replace(new RegExp('"', 'g'), "").trim());
        } else if (isOnPicklistVal && line.indexOf('[') === -1) {
            let keyValue = getJSONNameValuePair(line);
            if (keyValue.name === 'active')
                pickVal.active = keyValue.value;
            if (keyValue.name === 'defaultValue')
                pickVal.defaultValue = keyValue.value;
            if (keyValue.name === 'label')
                pickVal.label = keyValue.value;
            if (keyValue.name === 'value')
                pickVal.value = keyValue.value;
        } else if (isOnFields && !isOnPicklistVal && !isOnReference) {
            if (bracketIndent === 3) {
                let keyValue = getJSONNameValuePair(line);
                if (keyValue.name === 'name')
                    field.name = keyValue.value;
                if (keyValue.name === 'label')
                    field.label = keyValue.value;
                if (keyValue.name === 'type')
                    field.type = keyValue.value;
                if (keyValue.name === 'length')
                    field.length = keyValue.value;
                if (keyValue.name === 'custom')
                    field.custom = keyValue.value;
                if (keyValue.name === 'relationshipName' && keyValue.value != 'null')
                    field.relationshipName = keyValue.value;
                if (keyValue.name === "referenceTo" && line.indexOf(']') === -1) {
                    isOnReference = true;
                    isOnPicklistVal = false;
                }
                if (keyValue.name === "picklistValues" && line.indexOf(']') === -1) {
                    isOnPicklistVal = true;
                    isOnReference = false;
                }
            }
        } else if (isOnRts) {
            if (bracketIndent === 3) {
                let keyValue = getJSONNameValuePair(line);
                if (keyValue.name === 'name')
                    rt.name = keyValue.value;
                if (keyValue.name === 'developerName')
                    rt.developerName = keyValue.value;
                if (keyValue.name === 'defaultRecordTypeMapping')
                    rt.default = keyValue.value;
            }
        }
    }
    return metadataIndex;
}

function getJSONNameValuePair(line) {
    let tmpLine = line.replace('{', "").replace("}", "");
    if (tmpLine.indexOf('[') !== -1 && tmpLine.indexOf(']') === -1)
        tmpLine = tmpLine.replace("[", "");
    let splits = tmpLine.split(':');
    let fieldName;
    let fieldValue;
    if (splits.length >= 0 && splits[0])
        fieldName = splits[0].trim().replace(new RegExp('"', "g"), "").replace(new RegExp("'", "g"), "");
    if (splits.length >= 1 && splits[1]) {
        fieldValue = splits[1].trim().replace(new RegExp('"', "g"), "").replace(new RegExp("'", "g"), "");
        fieldValue = fieldValue.substring(fieldValue, fieldValue.length - 1);
    }
    return {
        name: fieldName,
        value: fieldValue
    };
}

function isSObject(objectName) {
    let startsWith = [
        "Apex",
        "Topic",
        "Web",
        "Work",
        "Forecasting",
        "Process",
        "Lightning",
        "Live",
        "Permission",
        "Category",
        "Chatter",
        "Collaboration",
        "Content",
        "Auth",
        "Brand",
        "Business",
        "App",
        "Async",
        "Aura",
        "User",
        "Email",
        "Secur",
        "Search",
        "Scontrol",
        "Platform",
        "List",
        "Idea",
        "Flow",
        "Field",
        "External",
        "Expression",
        "Event",
        "Entity",
        "Duplicate",
        "Data",
        "Dash",
        "Custom",
        "Case",
        "Cal",
        "Ass",
        "Action",
        "Task",
        "Stamp",
        "Lo",
        "Embed",
        "Domain",
        "Csp",
        "Color",
        "AcceptedEventRelation",
        "Sol",
        "Skill",
        "Site",
        "Setup",
        "Session",
        "Saml",
        "Relation",
        "Recommendation",
        "RecentlyViewed",
        "Quote"
    ];

    let containsTokens = [
        "Share",
        "History",
        "ChangeEvent",
        "Feed",
    ];
    let starts = false;
    let contains = false;
    for (const sw of startsWith) {
        if (objectName.startsWith(sw) && !objectName.endsWith('__c')) {
            if (objectName != 'Quote' && objectName != 'Test' && objectName != 'Task' && objectName != 'Asset' && objectName != 'User' && objectName != 'EmailMessage' && objectName != 'EmailTemplate' && objectName != 'Event' && objectName != 'Case' && objectName != 'CaseComment') {
                starts = true;
                break;
            }
        }
    }
    if (!starts) {
        for (const cont of containsTokens) {
            if (objectName.indexOf(cont) !== -1) {
                contains = true;
                break;
            }
        }
    }
    return !starts && !contains;
}

module.exports = {
    refreshMetadataIndex,
    listMetadataForRefresh,
    refreshMetadataForObject
}