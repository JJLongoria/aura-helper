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
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}


function provideApexCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    if (!line.trim().startsWith('/**')) {
        let activation = Utils.getActivation(document, position);
        let activationTokens = getActivationTokens(activation);
        let queryData = langUtils.getQueryData(document, position);
        let fileStructure = ApexParser.parse(FileReader.readDocument(document), position);
        let classes = Utils.getClassesFromClassFolder(document);
        let systemMetadata = Utils.getNamespaceMetadataFile('System');
        let namespacesMetadata = Utils.getNamespacesMetadataFile();
        let sObjects = Utils.getObjectsFromMetadataIndex();
        if (queryData) {
            items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 1) {
            items = getCompletionItems(document, position, activationTokens, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        } else {
            items = getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        }
    }
    return items;
}

function getCompletionItems(document, position, activationTokens, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects) {
    let items = [];
    let sObject;
    let lastClass = fileStructure;
    let parentStruct;
    let index = 0;
    for (let actToken of activationTokens) {
        if (index < activationTokens.length - 1) {
            let actType = Utils.getActivationType(actToken);
            let datatype;
            let className;
            if (sObject) {
                if (actToken.endsWith('__r'))
                    actToken = actToken.substring(0, actToken.length - 3) + '__c';
                let fielData = Utils.getFieldData(sObject, actToken);
                if (fielData) {
                    if (fielData.referenceTo.length === 1) {
                        sObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                    } else {
                        datatype = fielData.type;
                        if (datatype.indexOf('<') !== -1)
                            datatype = datatype.split('<')[0];
                        if (datatype.indexOf('[') !== -1 && datatype.indexOf(']') !== -1)
                            datatype = "List";
                        if (datatype.indexOf('.') !== -1) {
                            let splits = datatype.split('.');
                            if (splits.length === 2) {
                                let parentClassOrNs = splits[0];
                                className = splits[1];
                                if (systemMetadata[parentClassOrNs]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassOrNs);
                                } else if (namespacesMetadata[parentClassOrNs]) {
                                    lastClass = Utils.getClassStructure(document, parentClassOrNs, className);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            } else if (splits.length === 2) {
                                let nsName = splits[0];
                                let parentClassName = splits[1];
                                className = splits[2];
                                if (systemMetadata[parentClassName.toLowerCase()]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassName);
                                } else if (namespacesMetadata[nsName.toLowerCase()]) {
                                    lastClass = Utils.getClassStructure(document, nsName, parentClassName);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            }
                        } else {
                            parentStruct = undefined;
                            if (systemMetadata[datatype.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', datatype);
                                sObject = undefined;
                            }
                        }
                        if (parentStruct && className) {
                            let classFound = false;
                            Object.keys(parentStruct.classes).forEach(function (key) {
                                let innerClass = parentStruct.classes[key];
                                if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                                    classFound = true;
                                    lastClass = innerClass;
                                }
                            });
                            if (!classFound) {
                                Object.keys(parentStruct.enums).forEach(function (key) {
                                    let innerEnum = parentStruct.enums[key];
                                    if (innerEnum.name.toLowerCase() === className.toLowerCase()) {
                                        lastClass = innerEnum;
                                        classFound = true;
                                    }
                                });
                            }
                            if (!classFound)
                                lastClass = undefined;
                        }
                    }
                }
            } else if (lastClass) {
                if (!lastClass.isEnum) {
                    if (actType.type === 'field') {
                        if (lastClass.posData && lastClass.posData.isOnMethod) {
                            let method = Utils.getMethod(lastClass, lastClass.posData.methodSignature);
                            let methodVar = Utils.getVariable(method, actToken);
                            let classVar = Utils.getClassField(lastClass, actToken);
                            if (methodVar)
                                datatype = methodVar.datatype;
                            else if (classVar)
                                datatype = classVar.datatype;
                        } else {
                            let classVar = Utils.getClassField(lastClass, actToken);
                            if (classVar)
                                datatype = classVar.datatype;
                        }
                    } else if (actType.type === 'method') {
                        let method = getMethodFromCall(lastClass, actType.name, actType.params);
                        if (method)
                            datatype = method.datatype;
                    }
                    if (!datatype) {
                        if (lastClass.parentClass) {
                            parentStruct = Utils.getClassStructure(document, undefined, lastClass.parentClass);
                            className = actToken;
                        } else {
                            if (classes.classesToLower.includes(actToken.toLowerCase())) {
                                lastClass = Utils.getClassStructure(document, undefined, actToken);
                                parentStruct = undefined;
                                sObject = undefined;
                            } else if (systemMetadata[actToken.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', actToken);
                                parentStruct = undefined;
                                sObject = undefined;
                            } else if (sObjects.sObjectsToLower.includes(actToken.toLowerCase())) {
                                sObject = Utils.getObjectFromMetadataIndex(actToken);
                                parentStruct = undefined;
                                lastClass = undefined;
                            }
                        }
                    } else {
                        if (datatype.indexOf('<') !== -1)
                            datatype = datatype.split('<')[0];
                        if (datatype.indexOf('[') !== -1 && datatype.indexOf(']') !== -1)
                            datatype = "List";
                        if (datatype.indexOf('.') !== -1) {
                            let splits = datatype.split('.');
                            if (splits.length === 2) {
                                let parentClassOrNs = splits[0];
                                className = splits[1];
                                if (classes.classesToLower.includes(parentClassOrNs.toLowerCase())) {
                                    parentStruct = Utils.getClassStructure(document, undefined, parentClassOrNs);
                                } else if (systemMetadata[parentClassOrNs]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassOrNs);
                                } else if (namespacesMetadata[parentClassOrNs]) {
                                    lastClass = Utils.getClassStructure(document, parentClassOrNs, className);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            } else if (splits.length === 2) {
                                let nsName = splits[0];
                                let parentClassName = splits[1];
                                className = splits[2];
                                if (classes.classesToLower.includes(parentClassName.toLowerCase())) {
                                    parentStruct = Utils.getClassStructure(document, undefined, parentClassName);
                                } else if (systemMetadata[parentClassName.toLowerCase()]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassName);
                                } else if (namespacesMetadata[nsName.toLowerCase()]) {
                                    lastClass = Utils.getClassStructure(document, nsName, parentClassName);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            }
                        } else {
                            parentStruct = undefined;
                            if (lastClass.parentClass && datatype !== 'List') {
                                parentStruct = Utils.getClassStructure(document, undefined, lastClass.parentClass);
                                className = datatype;
                            } else if (classes.classesToLower.includes(datatype.toLowerCase())) {
                                lastClass = Utils.getClassStructure(document, undefined, datatype);
                                sObject = undefined;
                            } else if (systemMetadata[datatype.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', datatype);
                                sObject = undefined;
                            } else if (sObjects.sObjectsToLower.includes(datatype.toLowerCase())) {
                                sObject = Utils.getObjectFromMetadataIndex(datatype);
                                parentStruct = undefined;
                                lastClass = undefined;
                            }
                        }
                    }
                    if (parentStruct && className) {
                        let classFound = false;
                        Object.keys(parentStruct.classes).forEach(function (key) {
                            let innerClass = parentStruct.classes[key];
                            if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                                classFound = true;
                                lastClass = innerClass;
                            }
                        });
                        if (!classFound) {
                            Object.keys(parentStruct.enums).forEach(function (key) {
                                let innerEnum = parentStruct.enums[key];
                                if (innerEnum.name.toLowerCase() === className.toLowerCase()) {
                                    lastClass = innerEnum;
                                    classFound = true;
                                }
                            });
                        }
                        if (!classFound)
                            lastClass = undefined;
                    }
                }
            }
        }
        index++;
    }
    if (lastClass) {
        items = getApexClassCompletionItems(position, lastClass);
    } else if (sObject) {
        items = Utils.getSobjectsFieldsCompletionItems(position, sObject, 'aurahelper.completion.apex');
    }
    return items;
}

function getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects) {
    let items = [];
    items = getApexClassCompletionItems(position, fileStructure)
    for (const userClass of classes.classes) {
        let options = getCompletionItemOptions(userClass, 'Custom Apex Class', userClass, true, CompletionItemKind.Class);
        let command = getCommand('UserClass', 'aurahelper.completion.apex', [position, 'UserClass', userClass]);
        items.push(createItemForCompletion(userClass, options, command));
    }
    Object.keys(systemMetadata).forEach(function (key) {
        let systemClass = systemMetadata[key];
        if (systemClass.isEnum) {
            let options = getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', systemClass.description + '\nEnum Values: \n' + systemClass.enumValues.join('\n'), systemClass.name, true, CompletionItemKind.Enum);
            let command = getCommand('SystemEnum', 'aurahelper.completion.apex', [position, 'SystemEnum', systemClass]);
            items.push(createItemForCompletion(systemClass.name, options, command));
        } else if (systemClass.isInterface) {
            let options = getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', systemClass.description, systemClass.name, true, CompletionItemKind.Interface);
            let command = getCommand('SystemInterface', 'aurahelper.completion.apex', [position, 'SystemInterface', systemClass]);
            items.push(createItemForCompletion(systemClass.name, options, command));
        } else {
            let options = getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', systemClass.description, systemClass.name, true, CompletionItemKind.Class);
            let command = getCommand('SystemClass', 'aurahelper.completion.apex', [position, 'SystemClass', systemClass]);
            items.push(createItemForCompletion(systemClass.name, options, command));
        }
    });
    Object.keys(namespacesMetadata).forEach(function (key) {
        let nsMetadata = namespacesMetadata[key];
        let options = getCompletionItemOptions(nsMetadata.description, nsMetadata.docLink, nsMetadata.name, true, CompletionItemKind.Module);
        let command = getCommand('Namespace', 'aurahelper.completion.apex', [position, 'Namespace', nsMetadata]);
        items.push(createItemForCompletion(nsMetadata.name, options, command));
    });
    for (const sobject of sObjects.sObjectsToLower) {
        let objName = sObjects.sObjectsMap[sobject];
        let splits = objName.split('__');
        let namespace = '';
        let description = 'Standard SObject';
        if (objName.indexOf('__c') !== -1)
            description = 'Custom SObject';
        if (splits.length > 2) {
            namespace = splits[0].trim();
            description += '\nNamespace: ' + namespace;
        }
        let options = getCompletionItemOptions(objName, description, objName, true, CompletionItemKind.Class);
        let command = getCommand('SObject', 'aurahelper.completion.apex', [position, 'SObject', objName]);
        items.push(createItemForCompletion(objName, options, command));
    }
    return items;
}

function getMethodFromCall(apexClass, name, params) {
    for (const method of apexClass.methods) {
        if (method.name.toLowerCase() === name.toLowerCase() && method.params.length === params.length)
            return method;
    }
    for (const method of apexClass.constructors) {
        if (method.name.toLowerCase() === name.toLowerCase() && method.params.length === params.length)
            return method;
    }
    return undefined;
}

function getActivationTokens(activation) {
    let activationTokens = [];
    if (activation.startsWith('this.'))
        activation = activation.replace('this.', '');
    if (activation.indexOf('.') !== -1)
        activationTokens = activation.split('.');
    else if (activation.length > 0)
        activationTokens.push(activation);
    return activationTokens;
}

function getCommand(title, command, args) {
    return {
        title: title,
        command: command,
        arguments: args
    };
}

function getCompletionItemOptions(detail, documentation, insertText, preselect, type) {
    return {
        detail: detail,
        documentation: documentation,
        insertText: insertText,
        preselect: preselect,
        type: type
    };
}

function createItemForCompletion(name, options, command) {
    let type = CompletionItemKind.Value;
    if (options && options.type)
        type = options.type;
    let item = new CompletionItem(name, type);
    if (options && options.detail)
        item.detail = options.detail;
    if (options && options.documentation)
        item.documentation = options.documentation;
    if (options && options.preselect)
        item.preselect = options.preselect;
    if (options && options.insertText)
        item.insertText = options.insertText;
    if (command)
        item.command = options.command;
    return item;
}

function getApexClassCompletionItems(position, apexClass) {
    let items = [];
    if (apexClass) {
        if (apexClass.isEnum) {
            for (const value of apexClass.enumValues) {
                let options = getCompletionItemOptions('Enum Member', '', value, true, CompletionItemKind.EnumMember);
                let command = getCommand('EnumMember', 'aurahelper.completion.apex', [position, 'EnumMember', value]);
                items.push(createItemForCompletion(value, options, command));
            }
        } else {
            if (apexClass.posData && apexClass.posData.isOnMethod) {
                let method = Utils.getMethod(apexClass, apexClass.posData.methodSignature);
                for (const variable of method.params) {
                    let options = getCompletionItemOptions(variable.description, 'Datatype: ' + variable.datatype, variable.name, true, CompletionItemKind.Variable);
                    let command = getCommand('MethodParam', 'aurahelper.completion.apex', [position, 'MethodParam', variable]);
                    items.push(createItemForCompletion(variable.name, options, command));
                }
                for (const variable of method.declaredVariables) {
                    let options = getCompletionItemOptions('Method declared variable', 'Datatype: ' + variable.datatype, variable.name, true, CompletionItemKind.Variable);
                    let command = getCommand('DeclaredVar', 'aurahelper.completion.apex', [position, 'DeclaredVar', variable]);
                    items.push(createItemForCompletion(variable.name, options, command));
                }
            }
            for (const field of apexClass.fields) {
                let options = getCompletionItemOptions('Class field', 'Type: ' + field.type, field.name, true, CompletionItemKind.Field);
                let command = getCommand('ClassField', 'aurahelper.completion.apex', [position, 'ClassField', field.name]);
                items.push(createItemForCompletion(field.name, options, command));
            }
            for (const method of apexClass.constructors) {
                let insertText = method.name + "(";
                let snippetNum = 1;
                let name = method.name + "(";
                if (method.params) {
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
                } else if (method.methodParams) {
                    for (const param of method.methodParams) {
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
                }
                name += ")";
                insertText += ")";
                let options = getCompletionItemOptions(method.signature, method.description, new SnippetString(insertText), true, CompletionItemKind.Constructor);
                let command = getCommand('ClassConstructor', 'aurahelper.completion.apex', [position, 'ClassConstructor', method]);
                items.push(createItemForCompletion(name, options, command));
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
                let options = getCompletionItemOptions(method.signature, method.description, new SnippetString(insertText), true, CompletionItemKind.Method);
                let command = getCommand('ClassMethod', 'aurahelper.completion.apex', [position, 'ClassMethod', method]);
                items.push(createItemForCompletion(name, options, command));
            }
            Object.keys(apexClass.classes).forEach(function (key) {
                let innerClass = apexClass.classes[key];
                let options;
                if (innerClass.isInterface) {
                    options = getCompletionItemOptions('Internal Interface from : ' + apexClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Interface);
                } else {
                    options = getCompletionItemOptions('Internal Class from : ' + apexClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Class);
                }
                let command = getCommand('InnerClass', 'aurahelper.completion.apex', [position, 'InnerClass', innerClass]);
                items.push(createItemForCompletion(innerClass.name, options, command));
            });
            Object.keys(apexClass.enums).forEach(function (key) {
                let innerEnum = apexClass.enums[key];
                let options = getCompletionItemOptions(innerEnum.name + ' Enum', innerEnum.description, innerEnum.name, true, CompletionItemKind.Enum);
                let command = getCommand('InnerEnum', 'aurahelper.completion.apex', [position, 'InnerEnum', innerEnum]);
                items.push(createItemForCompletion(innerEnum.name, options, command));
            });
        }
    }
    return items;
}