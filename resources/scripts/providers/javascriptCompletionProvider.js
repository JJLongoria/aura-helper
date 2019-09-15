const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const languages = require('../languages');
const Utils = require('./utils').Utils;
const FileChecker = fileSystem.FileChecker;
const BundleAnalizer = languages.BundleAnalizer;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isJavaScript(document.uri.fsPath)) {
            items = provideJSCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}

function provideJSCompletion(document, position) {
    let items = [];
    let activation = Utils.getActivation(document, position);
    let activationTokens = activation.split('.');
    if (activationTokens[0] === 'v' || activationTokens[0] === 'c' || activationTokens[0] === 'helper') {
        let componentStructure = BundleAnalizer.getComponentStructure(document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'));
        if (activationTokens[0] === 'v') {
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            items = getAttributes(componentStructure, position, undefined);
        } else if (activationTokens[0] === 'c') {
            if (!config.getConfig().activeControllerMethodsSuggest)
                return Promise.resolve(undefined);
            items = getApexControllerFunctions(componentStructure, position);
        } else if (activationTokens[0] === 'helper') {
            if (!config.getConfig().activeHelperFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getHelperFunctions(componentStructure, position);
        }
    } else {
        let activation = Utils.getActivation(document, position);
        let activationTokens = activation.split('.');
        if (activationTokens.length > 0) {
            if (activationTokens[0] === 'v' && activationTokens.length > 1) {
                let componentStructure = BundleAnalizer.getComponentStructure(document.fileName);
                let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
                if (attribute) {
                    let sObjects = Utils.getObjectsFromMetadataIndex();
                    if (sObjects.sObjectsToLower.includes(attribute.type.toLowerCase())) {
                        if (!config.getConfig().activeSobjectFieldsSuggestion)
                            return Promise.resolve(undefined);
                        let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[attribute.type.toLowerCase()]);
                        if (activationTokens.length > 2) {
                            let lastObject = sObject;
                            let index = 0;
                            for (const activationToken of activationTokens) {
                                let actToken = activationToken;
                                if (index > 1) {
                                    if (actToken.endsWith('__r'))
                                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                                    let fielData = Utils.getFieldData(lastObject, actToken);
                                    if (fielData) {
                                        if (fielData.referenceTo.length === 1) {
                                            lastObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                                        } else {
                                            lastObject = undefined;
                                        }
                                    }
                                }
                                index++;
                            }
                            items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.aura');
                        }
                    }
                }
            } else {
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
                                    if (fielData.referenceTo.length === 1) {
                                        lastObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                                    } else {
                                        lastObject = undefined;
                                    }
                                }
                            }
                            index++;
                        }
                        items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.aura');
                    }
                } else if (similarSobjects.length > 0) {
                    if (!config.getConfig().activeSObjectSuggestion)
                        return Promise.resolve(undefined);
                    items = Utils.getSObjectsCompletionItems(position, similarSobjects, sObjects.sObjectsMap, 'aurahelper.completion.aura');
                }
            }
        }
    }
    return items;
}

function getAttributes(componentStructure, position, componentTagData) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let item = new CompletionItem('v.' + attribute.name, CompletionItemKind.Field);
        item.detail = 'Type: ' + attribute.type;
        item.documentation = attribute.description;
        item.insertText = attribute.name;
        item.command = {
            title: 'Aura Component Attribute',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'attribute', attribute, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getApexControllerFunctions(componentStructure, position) {
    let items = [];
    for (const method of componentStructure.apexFunctions) {
        if (method.annotation && method.annotation == '@AuraEnabled') {
            let item = new CompletionItem('c.' + method.name, CompletionItemKind.Method);
            if (method.comment) {
                item.detail = method.comment.description + '\n';
                for (const commentParam of method.comment.params) {
                    item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                }
            }
            else {
                item.detail = "Apex Controller Function";
            }
            item.preselect = true;
            item.documentation = method.signature;
            item.insertText = method.name;
            item.command = {
                title: 'Apex Controller Function',
                command: 'aurahelper.completion.aura',
                arguments: [position, 'method', method]
            };
            items.push(item);
        }
        if (method.params && method.params.length) {
            let itemParams = new CompletionItem(method.name + '.params', CompletionItemKind.Variable);
            itemParams.detail = "Get method parameters on json object";
            itemParams.preselect = true;
            itemParams.documentation = "Return JSON Object with method params";
            itemParams.insertText = method.name + '.params';
            itemParams.command = {
                title: 'Apex Controller Params',
                command: 'aurahelper.completion.aura',
                arguments: [position, 'params', method]
            };
            items.push(itemParams);
        }
    }
    return items;
}

function getHelperFunctions(componentStructure, position) {
    let items = [];
    for (const func of componentStructure.helperFunctions) {
        let item = new CompletionItem('helper.' + func.name, CompletionItemKind.Function);
        if (func.comment) {
            item.detail = func.comment.description + '\n';
            for (const commentParam of func.comment.params) {
                item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
            }
        }
        else {
            item.detail = "Aura Helper Function";
        }
        item.preselect = true;
        item.documentation = func.auraSignature;
        item.insertText = func.signature;
        item.command = {
            title: 'Aura Helper Function',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'function', func]
        };
        items.push(item);
    }
    return items;
}