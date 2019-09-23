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
            let systemClasses = Utils.getClassesFromNamespace('System');
            let systemNamespaces = Utils.getNamespacesFromFolder();
            let sObjects = Utils.getObjectsFromMetadataIndex();
            let similarClasses;
            let objName = activationTokens[0];
            if (activationTokens.length === 1) {
                similarClasses = Utils.getSimilar(sObjects.sObjects, objName);
                let similarTmp = Utils.getSimilar(classes.classes, activationTokens[0]);
                for (const similar of similarTmp.similar) {
                    if (!similarClasses.similar.includes(similar)) {
                        similarClasses.similarMap[similar.toLowerCase()] = similar;
                        similarClasses.similarToLower.push(similar);
                        similarClasses.similar.push(similar);
                    }
                }
                similarTmp = Utils.getSimilar(systemClasses.classes, activationTokens[0]);
                for (const similar of similarTmp.similar) {
                    if (!similarClasses.similar.includes(similar)) {
                        similarClasses.similarMap[similar.toLowerCase()] = similar;
                        similarClasses.similarToLower.push(similar);
                        similarClasses.similar.push(similar);
                    }
                }
                similarTmp = Utils.getSimilar(systemNamespaces.namespaces, activationTokens[0]);
                for (const similar of similarTmp.similar) {
                    if (!similarClasses.similar.includes(similar)) {
                        similarClasses.similarMap[similar.toLowerCase()] = similar;
                        similarClasses.similarToLower.push(similar);
                        similarClasses.similar.push(similar);
                    }
                }
            }
            if (fileStructure.posData && fileStructure.posData.isOnMethod) {
                let method = Utils.getMethod(fileStructure, fileStructure.posData.methodSignature);
                let variable = Utils.getVariable(method, objName);
                if (objName.toLowerCase() === 'this' && activationTokens.length > 1) {
                    let field = Utils.getClassField(fileStructure, activationTokens[1]);
                    if (field)
                        objName = field.dataType;
                } else if (variable)
                    objName = variable.dataType;
                else {
                    let field = Utils.getClassField(fileStructure, objName);
                    if (field)
                        objName = field.dataType;
                }
                if (objName === undefined)
                    objName = activationTokens[0];
            }
            if (activationTokens.length > 0) {
                if (objName.toLowerCase() === 'this' && activationTokens.length === 2) {
                    // Code completions for same class elements
                    if (!config.getConfig().activeApexSuggestion)
                        return Promise.resolve(undefined);
                    items = getApexClassCompletionItems(position, fileStructure, 'this');
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
                    items = getApexClassesCompletionItems(Utils.getClassStructure(document, '', objName.toLowerCase()), activationTokens, sObjects, document, classes, position, systemNamespaces);
                } else if (systemClasses.classesToLower.includes(objName.toLowerCase())) {
                    let classFromNS = Utils.getClassesFromNamespace(objName.toLowerCase());
                    if(!classFromNS)
                        classFromNS = Utils.getClassesFromNamespace('System');
                    items = getApexClassesCompletionItems(Utils.getSystemClass('System', systemClasses.classesMap[objName.toLowerCase()]), activationTokens, sObjects, document, classFromNS, position, systemNamespaces);
                } else if (systemNamespaces.namespacesToLower.includes(objName.toLowerCase())) {
                    items = getNamespacesCompletionItems(systemNamespaces.namespacesMap[objName.toLowerCase()], activationTokens, position);
                } else if (similarClasses && similarClasses.similar.length > 0) {
                    items = getSimilarClassesCompletionItems(similarClasses, position);
                } else if(objName.indexOf('.') !== -1){
                    let parts = objName.split('.');
                    let nsOrClass = parts[0];
                    let classOrInner = parts[1];
                    if(systemNamespaces.namespacesToLower.includes(nsOrClass.toLowerCase())){
                        let clasFromNS = Utils.getClassStructure(document, nsOrClass, classOrInner);
                        items = getApexClassCompletionItems(position, clasFromNS, activationTokens[0]);
                    } else if(classes.classesToLower.includes(nsOrClass.toLowerCase())){
                        let classFromUser = Utils.getClassStructure(document, '', nsOrClass);
                        if(classFromUser.classes[classOrInner])
                            items = getApexClassCompletionItems(position, classFromUser.classes[classOrInner], activationTokens[0]);
                        else if(classFromUser.enums[classOrInner])
                            items = getApexClassCompletionItems(position, classFromUser.enums[classOrInner], activationTokens[0]);
                    } else if(systemClasses.classesToLower.includes(nsOrClass.toLowerCase())){
                        let classFromSystem = Utils.getClassStructure(document, 'System', nsOrClass);
                        items = getApexClassCompletionItems(position, classFromSystem, activationTokens[0]);
                    }
                }
            }
        }
    }
    return items;
}

function getNamespacesCompletionItems(namespace, activationTokens, position) {
    let metadataFile = Utils.getNamespaceMetadataFile(namespace);
    let lastClass = Utils.getSystemClass(namespace, activationTokens[1]);
    let items = [];
    let index = 0;
    let datatype;
    if (lastClass && activationTokens) {
        for (const activationToken of activationTokens) {
            let actToken = activationToken;
            if (index > 0) {
                let memberData = Utils.getMemberData(lastClass, actToken);
                if (memberData) {
                    if (memberData.type === "method" && memberData.data.datatype.toLowerCase() !== 'void') {
                        datatype = memberData.data.datatype.toLowerCase();
                        let classStructureTmp = Utils.getSystemClass(namespace, datatype);
                        if (classStructureTmp) {
                            lastClass = classStructureTmp;
                        } else {
                            lastClass = undefined;
                        }
                    } else {
                        datatype = memberData.data.dataType.toLowerCase();
                        let classStructureTmp = Utils.getSystemClass(namespace, datatype);
                        if (classStructureTmp) {
                            lastClass = classStructureTmp;
                        } else {
                            lastClass = undefined;
                        }
                    }
                }
            }
            index++;
        }
        if (lastClass)
            items = getApexClassCompletionItems(position, lastClass, activationTokens[activationTokens.length -2]);
    } else {
        Object.keys(metadataFile).forEach(function (key) {
            let classMetadata = metadataFile[key];
            let item;
            if (classMetadata.isEnum) {
                item = new CompletionItem(classMetadata.name, CompletionItemKind.Enum);
                item.detail = 'Enum from ' + classMetadata.namespace + ' Namespace';
                item.documentation = classMetadata.description;
                item.documentation += '\nEnum Values: \n' + classMetadata.enumValues.join('\n');
            } else if (classMetadata.isInterface) {
                item = new CompletionItem(classMetadata.name, CompletionItemKind.Interface);
                item.detail = 'Interface from ' + classMetadata.namespace + ' Namespace';
                item.documentation = classMetadata.description;
            } else {
                item = new CompletionItem(classMetadata.name, CompletionItemKind.Class);
                item.detail = 'Class from ' + classMetadata.namespace + ' Namespace';
                item.documentation = classMetadata.description;
            }
            item.insertText = classMetadata.name;
            item.preselect = true;
            item.command = {
                title: 'Namespace',
                command: 'aurahelper.completion.apex',
                arguments: [position, 'ClassFromNamespace', classMetadata]
            };
            items.push(item);
        });
    }
    return items;
}

function getSimilarClassesCompletionItems(similarClasses, position) {
    let items = [];
    for (const className of similarClasses.similar) {
        let item = new CompletionItem(className, CompletionItemKind.Class);
        item.detail = 'Class';
        item.insertText = className;
        item.preselect = true;
        item.command = {
            title: 'Similars',
            command: 'aurahelper.completion.apex',
            arguments: [position, 'SimilarClasses', className]
        };
        items.push(item);
    }

    return items;
}

function getApexClassesCompletionItems(fileStructure, activationTokens, sObjects, document, classes, position, systemNamespaces) {
    // Code completions for classes
    let items;
    let lastClass = fileStructure;
    let lastObject;
    let index = 0;
    let datatype;
    for (const activationToken of activationTokens) {
        let actToken = activationToken;
        if (index > 0) {
            let memberData = Utils.getMemberData(lastClass, actToken);
            if (memberData) {
                if (memberData.type === "method" && memberData.data.datatype.toLowerCase() !== 'void') {
                    datatype = memberData.data.datatype.toLowerCase();
                    let sObjectTmp = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[datatype]);
                    let classStructureTmp = Utils.getClassStructure(document, 'System', classes.classesMap[datatype]);
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
                    datatype = memberData.data.datatype.toLowerCase();
                    let sObjectTmp = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[datatype]);
                    let classStructureTmp = Utils.getClassStructure(document, 'System', classes.classesMap[datatype]);
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
        items = getApexClassCompletionItems(position, lastClass, activationTokens[activationTokens.length - 2]);
    if (datatype && systemNamespaces && systemNamespaces.includes(datatype)) {
        items.concat(getNamespacesCompletionItems(datatype, undefined, position));
    }
    return items;
}

function getApexClassCompletionItems(position, apexClass, actToken) {
    let items = [];
    if (apexClass) {
        if (apexClass.isEnum) {
            for (const value of apexClass.enumValues) {
                let item = new CompletionItem(value, CompletionItemKind.EnumMember);
                item.detail = 'Enum Member';
                item.insertText = value;
                item.preselect = true;
                item.command = {
                    title: 'EnumMember',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'EnumMember', value]
                };
                items.push(item);
            }
        } else {
            for (const field of apexClass.fields) {
                let item = new CompletionItem(field.name, CompletionItemKind.Field);
                item.detail = 'Class field';
                item.documentation = 'Type: ' + field.type;
                item.insertText = field.name;
                item.preselect = true;
                item.command = {
                    title: 'ClassField',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'ClassField', field]
                };
                if (actToken.toLowerCase() === apexClass.name.toLowerCase() && Utils.isStaticMember(field))
                    items.push(item);
                else if (actToken.toLowerCase() !== apexClass.name.toLowerCase() && !Utils.isStaticMember(field))
                    items.push(item);
            }
            let constructors = apexClass.constructors || apexClass.constuctors;
            for (const method of constructors) {
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
                let item = new CompletionItem(name, CompletionItemKind.Method);
                item.detail = method.signature;
                item.documentation = 'New instance of ' + apexClass.name;
                item.insertText = new SnippetString(insertText);
                item.preselect = true;
                item.command = {
                    title: 'ClassConstructor',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'ClassConstructor', method]
                };
                if (actToken.toLowerCase() === apexClass.name.toLowerCase() && Utils.isStaticMember(method))
                    items.push(item);
                else if (actToken.toLowerCase() !== apexClass.name.toLowerCase() && !Utils.isStaticMember(method))
                    items.push(item);
            }
            for (const method of apexClass.methods) {
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
                if (method.datatype.toLowerCase() === 'void')
                    insertText += ';';
                let item = new CompletionItem(name, CompletionItemKind.Method);
                item.detail = method.signature;
                item.documentation = 'Return: ' + method.datatype;
                item.insertText = new SnippetString(insertText);
                item.preselect = true;
                item.command = {
                    title: 'ClassMethod',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'ClassMethod', method]
                };
                if (actToken.toLowerCase() === apexClass.name.toLowerCase() && Utils.isStaticMember(method))
                    items.push(item);
                else if (actToken.toLowerCase() !== apexClass.name.toLowerCase() && !Utils.isStaticMember(method))
                    items.push(item);
            }
            Object.keys(apexClass.classes).forEach(function (key) {
                let innerClass = apexClass.classes[key];
                let item;
                if (innerClass.isInterface) {
                    item = new CompletionItem(innerClass.name, CompletionItemKind.Interface);
                    item.detail = innerClass.name + 'Interface';
                } else {
                    item = new CompletionItem(innerClass.name, CompletionItemKind.Class);
                    item.detail = innerClass.name + 'Class';
                }
                item.detail = innerClass.description;
                item.documentation = innerClass.description;
                item.insertText = innerClass.name;
                item.preselect = true;
                item.command = {
                    title: 'InnerClass',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'InnerClass', innerClass]
                };
                if (actToken.toLowerCase() === apexClass.name.toLowerCase())
                    items.push(item);
            });
            Object.keys(apexClass.enums).forEach(function (key) {
                let innerEnum = apexClass.enums[key];
                let item = new CompletionItem(innerEnum.name, CompletionItemKind.Enum);
                item.detail = innerEnum.name + ' Enum';
                item.detail = innerEnum.description;
                item.documentation = innerEnum.description;
                item.insertText = innerEnum.name;
                item.preselect = true;
                item.command = {
                    title: 'InnerEnum',
                    command: 'aurahelper.completion.apex',
                    arguments: [position, 'InnerEnum', innerEnum]
                };
                if (actToken.toLowerCase() === apexClass.name.toLowerCase())
                    items.push(item);
            });
        }
    }
    return items;
}