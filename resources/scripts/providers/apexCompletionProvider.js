const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const FileChecker = fileSystem.FileChecker;

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}


function provideApexCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    if (line.indexOf('/**') === -1) {
        let activation = Utils.getActivation(document, position);
        let activationTokens = activation.split('.');
        if (activationTokens.length > 0) {
            let sObjects = Utils.getObjectsFromMetadataIndex();
            let similarSobjects = [];
            if (activationTokens.length === 1)
                similarSobjects = Utils.getSimilar(sObjects.sObjectsToLower, activationTokens[0]);
            if (sObjects.sObjectsToLower.includes(activationTokens[0].toLowerCase())) {
                if (!config.getConfig().activeSobjectFieldsSuggestion)
                    return Promise.resolve(undefined);
                let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[activationTokens[0].toLowerCase()]);
                if (activationTokens.length > 1) {
                    let lastObject = sObject;
                    let index = 0;
                    for (const activationToken of activationTokens) {
                        let actToken = activationToken;
                        if (index > 0) {
                            if (actToken.endsWith('__r'))
                                actToken = actToken.substring(0, actToken.length - 3) + '__c';
                            let fielData = Utils.getFieldData(lastObject, actToken);
                            if (fielData) {
                                logger.logJSON("fieldData", fielData);
                                if (fielData.referenceTo.length === 1) {
                                    lastObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                                } else {
                                    lastObject = undefined;
                                }
                            }
                        }
                        index++;
                    }
                    items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.apex');
                }
            } else if (similarSobjects.length > 0) {
                if (!config.getConfig().activeSObjectSuggestion)
                    return Promise.resolve(undefined);
                items = Utils.getSObjectsCompletionItems(position, similarSobjects, sObjects.sObjectsMap, 'aurahelper.completion.apex');
            }
        }
    }
    return items;
}