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
            //items = provideApexCompletion(document, position);
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
            // Code for support completion on queries
            items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 1) {
            if (fileStructure.posData && fileStructure.posData.isOnMethod) {
                let lastClass = fileStructure;
                for (const actToken of activationTokens) {
                    lastClass = getDatatype(lastClass, actToken, classes, systemMetadata, namespacesMetadata, sObjects, document);
                    logger.logJSON('lastClass', lastClass);
                }
                if (lastClass)
                    items = getApexClassCompletionItems(position, lastClass);
            }
        } else {
            items = [];
            if (fileStructure.posData && fileStructure.posData.isOnMethod) {
                let method = Utils.getMethod(fileStructure, fileStructure.posData.methodSignature);
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
            for (const field of fileStructure.fields) {
                let options = getCompletionItemOptions('Method declared variable', 'Datatype: ' + field.datatype, field.name, true, CompletionItemKind.Field);
                let command = getCommand('ClassField', 'aurahelper.completion.apex', [position, 'ClassField', field]);
                items.push(createItemForCompletion(field.name, options, command));
            }
            for (const method of fileStructure.methods) {
                let options = getCompletionItemOptions(method.signature, method.description + '\nReturn: ' + method.datatype, method.signature, true, CompletionItemKind.Method);
                let command = getCommand('Method', 'aurahelper.completion.apex', [position, 'Method', method]);
                items.push(createItemForCompletion(method.signature, options, command));
            }
            Object.keys(fileStructure.classes).forEach(function (key) {
                let innerClass = fileStructure.classes[key];
                if (innerClass.isInterface) {
                    let options = getCompletionItemOptions(innerClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Interface);
                    let command = getCommand('InnerInterface', 'aurahelper.completion.apex', [position, 'InnerInterface', innerClass]);
                    items.push(createItemForCompletion(innerClass.name, options, command));
                } else {
                    let options = getCompletionItemOptions(innerClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Class);
                    let command = getCommand('InnerClass', 'aurahelper.completion.apex', [position, 'InnerClass', innerClass]);
                    items.push(createItemForCompletion(innerClass.name, options, command));
                }
            });
            Object.keys(fileStructure.enums).forEach(function (key) {
                let innerEnum = fileStructure.enums[key];
                let options = getCompletionItemOptions(innerEnum.name, 'Enum Values: \n' + innerEnum.enumValues.join('\n'), innerEnum.name, true, CompletionItemKind.Enum);
                let command = getCommand('InnerEnum', 'aurahelper.completion.apex', [position, 'InnerClass', innerEnum]);
                items.push(createItemForCompletion(innerEnum.name, options, command));
            });
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
        }
    }
    return items;
}

function getDatatype(classOrObject, actToken, classes, systemMetadata, namespaceMetadata, sObjects, document) {
    if (classOrObject === undefined)
        return classOrObject;
    let actType = Utils.getActivationType(actToken);
    if (actType.type === 'method') {
        let calledMethod = getMethodsFromCall(classOrObject, actType.name, actType.params);
        let datatype;
        if (calledMethod)
            datatype = calledMethod.datatype;
        if (datatype) {
            classOrObject = getStructureFromDatatype(datatype, sObjects, classes, systemMetadata, namespaceMetadata, document);
        }
    } else {
        let classField = Utils.getClassField(classOrObject, actToken);
        if (classOrObject.posData && classOrObject.posData.methodSignature) {
            let method = Utils.getMethod(classOrObject, classOrObject.posData.methodSignature);
            let variable = Utils.getVariable(method, actToken);
            let field = Utils.getClassField(classOrObject, actToken);
            let datatype;
            if (variable) {
                datatype = variable.datatype;
            } else if (field) {
                datatype = field.datatype;
            }
            if (datatype) {
                classOrObject = getStructureFromDatatype(datatype, sObjects, classes, systemMetadata, namespaceMetadata, document);
            }
        } else if (classField) {
            let datatype;
            datatype = classField.datatype;
            if (datatype) {
                classOrObject = getStructureFromDatatype(datatype, sObjects, classes, systemMetadata, namespaceMetadata, document);
            }
        } else if (sObjects.sObjectsToLower.includes(actToken.toLowerCase())) {
            classOrObject = getStructureFromDatatype(actToken, sObjects, classes, systemMetadata, namespaceMetadata, document);
        } else if (classes.classesToLower.includes(actToken.toLowerCase())) {
            classOrObject = getStructureFromDatatype(actToken, sObjects, classes, systemMetadata, namespaceMetadata, document);
        } else if (systemMetadata[actToken.toLowerCase()]) {
            classOrObject = getStructureFromDatatype(actToken, sObjects, classes, systemMetadata, namespaceMetadata, document);
        } else if (namespaceMetadata[actToken.toLowerCase()]) {
            classOrObject = getStructureFromDatatype(actToken, sObjects, classes, systemMetadata, namespaceMetadata, document);
        }
    }
    return classOrObject;
}

function getStructureFromDatatype(datatype, sObjects, classes, systemMetadata, namespaceMetadata, document) {
    let classOrObject;
    let parentClass;
    if (datatype.indexOf('.') === -1) {
        if (sObjects.sObjectsToLower.includes(datatype.toLowerCase())) {
            classOrObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[datatype.toLowerCase()]);
        } else if (classes.classesToLower.includes(datatype.toLowerCase())) {
            classOrObject = Utils.getClassStructure(document, '', classes.classesMap[datatype.toLowerCase()]);
        } else if (systemMetadata[datatype.toLowerCase()]) {
            classOrObject = Utils.getClassStructure(document, 'System', systemMetadata[datatype.toLowerCase()].name);
        } else if (namespaceMetadata[datatype.toLowerCase()]) {
            classOrObject = namespaceMetadata[datatype.toLowerCase()];
        }
    } else {
        /*let splits = datatype.split('.');
        if (splits.length === 2) {
            let classOrNS = splits[0];
            let member = splits[1];
            if (classes.classesToLower.includes(classOrNS.toLowerCase())) {
                classOrObject = Utils.getClassStructure(document, '', classes.classesMap[classOrNS.toLowerCase()]);
                let found = false;
                for (const clsMember of classOrObject.classes) {
                    if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                        classOrObject = clsMember;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.enums) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = clsMember;
                            found = true;
                            break;
                        }
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.fields) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = clsMember;
                            found = true;
                            break;
                        }
                    }
                }
            } else if (systemMetadata[classOrNS.toLowerCase()]) {
                classOrObject = Utils.getClassStructure(document, 'System', systemMetadata[classOrNS.toLowerCase()].name);
                let found = false;
                for (const clsMember of classOrObject.classes) {
                    if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                        classOrObject = clsMember;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.enums) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = clsMember;
                            break;
                        }
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.fields) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = Utils.getClassStructure(clsMember.datatype);
                            found = true;
                            break;
                        }
                    }
                }
            } else if (namespaceMetadata[classOrNS.toLowerCase()]) {
                classOrObject = Utils.getClassStructure(document, namespaceMetadata[classOrNS.toLowerCase()].name, member);
            }
        } else if (splits === 3) {
            let ns = splits[0];
            let cls = splits[1];
            let member = splits[2];
            if (namespaceMetadata[ns.toLowerCase()]) {
                classOrObject = Utils.getClassStructure(document, namespaceMetadata[ns.toLowerCase()].name, cls);
                let found = false;
                for (const clsMember of classOrObject.classes) {
                    if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                        classOrObject = clsMember;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.enums) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = clsMember;
                            break;
                        }
                    }
                }
                if (!found) {
                    for (const clsMember of classOrObject.fields) {
                        if (clsMember.name.toLowerCase() === member.toLowerCase()) {
                            classOrObject = Utils.getClassStructure(clsMember.datatype);
                            found = true;
                            break;
                        }
                    }
                }
            }
        }*/
    }
    return classOrObject;
}

function getMethodsFromCall(apexClass, name, params) {
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

function getNamespacesCompletionItems(namespace, activationTokens, position) {
    /*let metadataFile = Utils.getNamespaceMetadataFile(namespace);
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
            items = getApexClassCompletionItems(position, lastClass, activationTokens[activationTokens.length - 2]);
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
    return items;*/
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
    /*let items;
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
    return items;*/
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
                items.push(createItemForCompletion(method.signature, options, command));
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
                items.push(createItemForCompletion(method.signature, options, command));
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


/*if (activationTokens.length === 1) {
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
            }*/