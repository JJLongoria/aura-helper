const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const SnippetString = vscode.SnippetString;
exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath)) {
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
        let queryData = langUtils.getQueryData(document, position);
        if (queryData) {
            // Code for support completion on queries
            items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 0) {
            let fileStructure = ApexParser.parse(FileReader.readDocument(document), position);
            let classes = Utils.getClassesFromClassFolder(document);
            let systemClasses = Utils.getSystemClassesFromFolder();
            let sObjects = Utils.getObjectsFromMetadataIndex();
            let similarSobjects = [];
            let similarClasses = [];
            let objName = activationTokens[0];
            if (activationTokens.length === 1) {
                similarSobjects = Utils.getSimilar(sObjects.sObjectsToLower, objName);
                similarClasses = Utils.getSimilar(classes.classesToLower, activationTokens[0]);
                similarClasses.concat(Utils.getSimilar(systemClasses.classesToLower, activationTokens[0]));
            }
            if (fileStructure.posData && fileStructure.posData.isOnMethod) {
                let method = Utils.getMethod(fileStructure, fileStructure.posData.methodSignature);
                let variable = Utils.getVariable(method, objName);
                if (objName.toLowerCase() === 'this' && activationTokens.length > 1) {
                    let field = Utils.getClassField(fileStructure, activationTokens[1]);
                    if (field)
                        objName = field.type;
                } else if (variable)
                    objName = variable.type;
                else {
                    let field = Utils.getClassField(fileStructure, objName);
                    if (field)
                        objName = field.type;
                }
            }
            if (activationTokens.length > 1) {
                if (objName.toLowerCase() === 'this' && activationTokens.length === 2) {
                    // Code completions for same class elements
                    if (!config.getConfig().activeApexSuggestion)
                        return Promise.resolve(undefined);
                    items = getApexClassCompletionItems(position, fileStructure);
                } else if (sObjects.sObjectsToLower.includes(objName.toLowerCase())) {
                    // Code completions for sObjects
                    if (!config.getConfig().activeSobjectFieldsSuggestion)
                        return Promise.resolve(undefined);
                    let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[objName.toLowerCase()]);
                    let lastObject = sObject;
                    let index = 0;
                    for (const activationToken of activationTokens) {
                        let actToken = activationToken;
                        if (index > 0) {
                            if (lastObject) {
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
                            if (lastObject)
                                items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.apex');
                        }
                        index++;
                    }
                } else if (classes.classesToLower.includes(objName.toLowerCase())) {
                    // Code completions for classes
                    let lastClass = fileStructure;
                    let lastObject;
                    let index = 0;
                    for (const activationToken of activationTokens) {
                        let actToken = activationToken;
                        if (index > 0) {
                            let memberData = Utils.getMemberData(lastClass, actToken);
                            if (memberData) {
                                if (memberData.type === "method" && memberData.data.datatype.toLowerCase() !== 'void') {
                                    let sObjectTmp = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[memberData.data.datatype.toLowerCase()]);
                                    let classStructureTmp = Utils.getClassStructure(document.uri.fsPath, classes.classesMap[memberData.data.datatype.toLowerCase()]);
                                    if (sObjectTmp) {
                                        lastObject = sObjectTmp;
                                        lastClass = undefined;
                                    } else if (classStructureTmp) {
                                        lastClass = classStructureTmp;
                                        lastObject = undefined;
                                    } else {
                                        lastClass = undefined;
                                        lastObject = undefined;
                                    }
                                } else {
                                    let field = memberData.data;
                                    let sObjectTmp = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[field.dataType.toLowerCase()]);
                                    let classStructureTmp = Utils.getClassStructure(document.uri.fsPath, classes.classesMap[field.dataType.toLowerCase()]);
                                    if (sObjectTmp) {
                                        lastObject = sObjectTmp;
                                        lastClass = undefined;
                                    } else if (classStructureTmp) {
                                        lastClass = classStructureTmp;
                                        lastObject = undefined;
                                    } else {
                                        lastClass = undefined;
                                        lastObject = undefined;
                                    }
                                }
                            }
                        }
                        index++;
                    }
                    if (lastObject)
                        items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.apex');
                    else if (lastClass)
                        items = getApexClassCompletionItems(position, lastClass);
                }
            }
        }
    }
    return items;
}

function getApexClassCompletionItems(position, apexClass) {
    let items = [];
    if (apexClass) {
        for (const field of apexClass.fields) {
            let item = new CompletionItem(field.name, CompletionItemKind.Field);
            item.detail = 'Class field';
            item.documentation = 'Type: ' + field.type;
            item.insertText = field.name;
            item.preselect = true;
            item.command = {
                title: 'sObject',
                command: 'aurahelper.completion.apex',
                arguments: [position, 'ClassField', field]
            };
            items.push(item);
        }
        for (const method of apexClass.methods) {
            let insertText = method.name + "(";
            let snippetNum = 1;
            let name = method.name + "(";
            for (const param of method.params) {
                if (snippetNum === 1) {
                    name += param.name;
                    insertText += "${" + snippetNum + ":" + param.name + "}";
                }
                else {
                    name += ", " + param.name;
                    insertText += ", ${" + snippetNum + ":" + param.name + "}";
                }
                snippetNum++;
            }
            name += ")";
            insertText += ")";
            if (method.datatype.toLowerCase() === 'void')
                insertText += ';';
            let item = new CompletionItem(name, CompletionItemKind.Method);
            item.detail = method.signature;
            item.documentation = 'Return: ' + method.datatype;
            item.insertText = new SnippetString(insertText);
            item.preselect = true;
            item.command = {
                title: 'sObject',
                command: 'aurahelper.completion.apex',
                arguments: [position, 'ClassMethod', method]
            };
            items.push(item);
        }
    }
    return items;
}