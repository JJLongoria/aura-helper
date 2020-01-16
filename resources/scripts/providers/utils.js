const fileSystem = require('../fileSystem');
const language = require('../languages');
const logger = require('../main/logger');
const config = require('../main/config');
const vscode = require('vscode');
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const SnippetString = vscode.SnippetString;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const FileChecker = fileSystem.FileChecker;
const Tokenizer = language.Tokenizer;
const TokenType = language.TokenType;
const BundleAnalizer = language.BundleAnalizer;
const langUtils = language.Utils;
const ApexParser = language.ApexParser;
const AuraParser = language.AuraParser;

class Utils {

    static getClassesFromClassFolder(document) {
        let classes = {
            classesToLower: [],
            classes: [],
            classesMap: {},
        };
        let classesPath = Paths.getFolderPath(document.uri.fsPath);
        logger.log('classesPath', classesPath);
        let files = FileReader.readDirSync(classesPath);
        if (files && files.length > 0) {
            for (const fileName of files) {
                if (fileName.endsWith('.cls')) {
                    let className = fileName.replace(".cls", "").trim();
                    let nameToLower = className.toLowerCase();
                    classes.classesToLower.push(nameToLower);
                    classes.classes.push(className);
                    classes.classesMap[nameToLower] = className;
                }
            }
        }
        return classes;
    }

    static getClassesFromNamespace(namespace) {
        let classes = {
            classesToLower: [],
            classes: [],
            classesMap: {},
        };
        let classesPath = Paths.getSystemClassesPath() + '/' + namespace;
        logger.log('classesPath', classesPath);
        if (FileChecker.isExists(classesPath)) {
            let files = FileReader.readDirSync(classesPath);
            if (files && files.length > 0) {
                for (const fileName of files) {
                    if (fileName !== 'namespaceMetadata.json') {
                        let className = fileName.replace(".json", "").trim();
                        let nameToLower = className.toLowerCase();
                        classes.classesToLower.push(nameToLower);
                        classes.classes.push(className);
                        classes.classesMap[nameToLower] = className;
                    }
                }
            }
        }
        return classes;
    }

    static getNamespaceMetadataFile(namespace) {
        let nsMetadataPath = Paths.getSystemClassesPath() + '/' + namespace + "/namespaceMetadata.json";
        return JSON.parse(FileReader.readFileSync(nsMetadataPath));
    }

    static getNamespacesFromFolder() {
        let namespaces = {
            namespacesToLower: [],
            namespaces: [],
            namespacesMap: {},
        };
        let classesPath = Paths.getSystemClassesPath();
        logger.log('classesPath', classesPath);
        let files = FileReader.readDirSync(classesPath);
        if (files && files.length > 0) {
            for (const fileName of files) {
                if (fileName !== 'namespacesMetadata.json') {
                    namespaces.namespacesToLower.push(fileName.toLowerCase());
                    namespaces.namespaces.push(fileName);
                    namespaces.namespacesMap[fileName.toLowerCase()] = fileName;
                }
            }
        }
        return namespaces;
    }

    static getObjectsFromMetadataIndex() {
        let sObjects = {
            sObjectsToLower: [],
            sObjects: [],
            sObjectsMap: {},
        };
        let metadataPath = Paths.getMetadataIndexPath();
        let files = FileReader.readDirSync(metadataPath);
        if (files && files.length > 0) {
            for (const fileName of files) {
                let sObjectName = fileName.replace(".json", "").trim();
                let nameToLower = sObjectName.toLowerCase();
                sObjects.sObjectsToLower.push(nameToLower);
                sObjects.sObjects.push(sObjectName);
                sObjects.sObjectsMap[nameToLower] = sObjectName;
            }
        }
        return sObjects;
    }

    static getObjectFromMetadataIndex(object) {
        let metadataObjectPath = Paths.getMetadataIndexPath() + '/' + object + '.json';
        logger.log(metadataObjectPath);
        if (FileChecker.isExists(metadataObjectPath)) {
            return JSON.parse(FileReader.readFileSync(metadataObjectPath));
        } else {
            return undefined;
        }
    }

    static getClassStructure(document, ns, className) {
        let classStructure;
        if (className.indexOf('<') !== -1)
            className = className.split('<')[0];
        if (className.indexOf('[') !== -1 && className.indexOf(']') !== -1)
            className = "List";
        let userClassPath = Paths.getFolderPath(document.uri.fsPath) + "/" + className + ".cls";
        let systemClassPath = Paths.getSystemClassesPath() + "/" + ns + '/' + className + ".json";
        if (FileChecker.isExists(userClassPath))
            classStructure = ApexParser.parse(FileReader.readFileSync(userClassPath));
        else if (FileChecker.isExists(systemClassPath))
            classStructure = JSON.parse(FileReader.readFileSync(systemClassPath));
        return classStructure;

    }

    static getFieldData(sObject, fieldName) {
        if (sObject) {
            for (const field of sObject.fields) {
                if (field.name == fieldName)
                    return field;
            }
        }
        return undefined;
    }

    static getSimilar(list, source) {
        let similar = {
            similarToLower: [],
            similar: [],
            similarMap: {}
        };
        source = source.toLowerCase();
        for (const name of list) {
            if (name && name.toLowerCase().indexOf(source) !== -1)
                similar.similarToLower.push(name.toLowerCase());
            similar.similar.push(name);
            similar.similarMap[name.toLowerCase()] = name;
        }
        return similar;
    }

    static getActivation(document, position) {
        let activation = "";
        let line = document.lineAt(position.line);
        let lineText = line.text;
        if (line.isEmptyOrWhitespace)
            return {
                activation: activation,
                startColumn: 0
            };
        let lineTokens = Tokenizer.tokenize(lineText);
        let index = 0;
        let tokenPos = 0;
        let token;
        let startColumn;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (position.character > token.relativeStartColumn) {
                tokenPos = index;
            }
            index++;
        }
        if (token.tokenType == TokenType.RBRACKET)
            tokenPos--;
        let endLoop = false;
        let isOnParams = false;
        while (!endLoop) {
            token = lineTokens[tokenPos];
            let lastToken = (tokenPos - 1 > 0) ? lineTokens[tokenPos - 1] : undefined;
            if (token && token.tokenType === TokenType.RPAREN && !isOnParams) {
                isOnParams = true;
                activation = token.content + activation;
                startColumn = token.startColumn;
            } else if (token && token.tokenType === TokenType.LPAREN && isOnParams) {
                isOnParams = false;
                activation = token.content + activation;
                startColumn = token.startColumn;
            } else if (token && token.tokenType === TokenType.LPAREN && !isOnParams) {
                endLoop = true;
            } else if (token && (token.tokenType === TokenType.DOT || token.tokenType === TokenType.IDENTIFIER || token.tokenType === TokenType.COLON || isOnParams)) {
                if (!isOnParams) {
                    if (lastToken && lastToken.endColumn != token.startColumn) {
                        endLoop = true;
                        activation = token.content + activation;
                        startColumn = token.startColumn;
                    } else {
                        activation = token.content + activation;
                        startColumn = token.startColumn;
                    }
                } else {
                    activation = token.content + activation;
                    startColumn = token.startColumn;
                }
            } else if (!isOnParams && token && (token.tokenType === TokenType.COMMA || token.tokenType === TokenType.QUOTTE || token.tokenType === TokenType.SQUOTTE) && activation.length > 0) {
                endLoop = true;
            } else if (token.tokenType == TokenType.LBRACKET) {
                endLoop = true;
            }
            tokenPos--
            if (tokenPos < 0)
                endLoop = true;
        }
        return {
            activation: activation,
            startColumn: startColumn
        };
    }

    static getSObjectsCompletionItems(position, similarSobjects, sObjectsMap, command) {
        let items = [];
        for (const sobject of similarSobjects) {
            let objName = sObjectsMap[sobject];
            let item = new CompletionItem(objName, CompletionItemKind.Class);
            item.detail = objName + ' SObject';
            item.insertText = objName;
            item.command = {
                title: 'sObject',
                command: command,
                arguments: [position, 'sObject', objName]
            };
            items.push(item);
        }
        return items;
    }

    static getSobjectsFieldsCompletionItems(position, sObject, command, activations, activationInfo) {
        let items = [];
        let picklistItems = [];
        if (sObject) {
            for (const field of sObject.fields) {
                let item = new CompletionItem(field.name, CompletionItemKind.Field);
                let itemRel;
                item.detail = sObject.name + ' Field';
                item.documentation = "Label: " + field.label + '\n';
                item.documentation += "Length: " + field.length + '\n';
                item.documentation += "Type: " + field.type + '\n';
                item.documentation += "Is Custom: " + field.custom + '\n';
                if (field.referenceTo.length > 0) {
                    item.documentation += "Reference To: " + field.referenceTo.join(", ") + '\n';
                    let name = field.name;
                    if (name.endsWith('__c')) {
                        name = name.substring(0, name.length - 3) + '__r';
                        itemRel = new CompletionItem(name, CompletionItemKind.Field);
                        itemRel.detail = sObject.name + " Relationsip Field";
                        itemRel.insertText = name;
                        itemRel.preselect = true;
                        itemRel.command = {
                            title: 'sObject',
                            command: command,
                            arguments: [position, 'sObjectRelField', field]
                        };
                    }
                }
                if (field.picklistValues.length > 0) {
                    picklistItems = [];
                    item.documentation += "Picklist Values: \n";
                    if (activations[0] === sObject.name) {
                        for (const pickVal of field.picklistValues) {
                            let picklistItem = new CompletionItem(field.name + '.' + pickVal.value, CompletionItemKind.Value);
                            picklistItem.detail = field.name + ' Picklist Value';
                            picklistItem.documentation = "Value: " + pickVal.value + '\n';
                            picklistItem.documentation = "Label: " + pickVal.label + '\n';
                            picklistItem.documentation = "Active: " + pickVal.active + '\n';
                            picklistItem.documentation = "Is Default: " + pickVal.defaultValue;
                            picklistItem.insertText = field.name + '.' + pickVal.value;
                            picklistItem.preselect = true;
                            picklistItem.command = {
                                title: 'sObject',
                                command: command,
                                arguments: [position, 'sObjectPickVal', { field: field, value: pickVal, activations: activations, activationInfo: activationInfo }]
                            };
                            picklistItems.push(picklistItem);
                            item.documentation += pickVal.value + " (" + pickVal.label + ") \n";
                        }
                    }
                }
                item.insertText = field.name;
                item.preselect = true;
                item.command = {
                    title: 'sObject',
                    command: command,
                    arguments: [position, 'sObjectField', field]
                };
                items.push(item);
                if (itemRel)
                    items.push(itemRel);
                if (picklistItems.length > 0) {
                    items = items.concat(picklistItems);
                    picklistItems = [];
                }
            }
        }
        return items;
    }

    static getQueryCompletionItems(activationTokens, activationInfo, queryData, position, command) {
        if (!config.getConfig().activeQuerySuggestion)
            return Promise.resolve(undefined);
        let sObjects = Utils.getObjectsFromMetadataIndex();
        let items;
        if (sObjects.sObjectsToLower.includes(queryData.from.toLowerCase())) {
            let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[queryData.from.toLowerCase()]);
            if (activationTokens.length === 0) {
                items = Utils.getSobjectsFieldsCompletionItems(position, sObject, command, activationTokens, activationInfo);
            } else {
                let lastObject = sObject;
                for (const activationToken of activationTokens) {
                    let actToken = activationToken;
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
                items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, command, activationTokens, activationInfo);
            }
        }
        return items;
    }

    static getActivationType(actToken) {
        let memberData = undefined;
        if (actToken.indexOf('(') !== -1 && actToken.indexOf(')') !== -1) {
            let name = actToken.split("(")[0].toLowerCase();
            let params = actToken.substring(actToken.indexOf("(") + 1, actToken.indexOf(")"));
            let paramSplits = [];
            if (params.indexOf(','))
                paramSplits = params.split(',');
            memberData = {
                type: "method",
                name: name,
                params: paramSplits
            };

        } else {
            memberData = {
                type: "field",
                name: actToken
            };
        }
        return memberData;
    }

    static getAttribute(componentStructure, attributeName) {
        if (componentStructure) {
            for (const attribute of componentStructure.attributes) {
                if (attribute.name === attributeName)
                    return attribute;
            }
        }
        return undefined;
    }

    static getVariable(method, varName) {
        if (method) {
            for (const param of method.params) {
                if (param.name.toLowerCase() === varName.toLowerCase())
                    return param;
            }
            for (const variable of method.declaredVariables) {
                if (variable.name.toLowerCase() === varName.toLowerCase())
                    return variable;
            }
        }
        return undefined;
    }

    static getClassField(fielStructure, varName) {
        if (fielStructure) {
            for (const field of fielStructure.fields) {
                if (field.name.toLowerCase() === varName.toLowerCase())
                    return field;
            }
        }
        return undefined;
    }

    static getMethod(fileStructure, methodSignature) {
        if (fileStructure) {
            for (const method of fileStructure.methods) {
                if (method.signature.toLowerCase() === methodSignature.toLowerCase())
                    return method;
            }
            if (fileStructure.constructors) {
                for (const method of fileStructure.constructors) {
                    if (method.signature.toLowerCase() === methodSignature.toLowerCase())
                        return method;
                }
            }
            if (fileStructure.constuctors) {
                for (const method of fileStructure.constuctors) {
                    if (method.signature.toLowerCase() === methodSignature.toLowerCase())
                        return method;
                }
            }
        }
        return undefined;
    }

    static isStaticMember(member) {
        if (member.isStatic)
            return true;
        if (member.signature && member.signature.toLowerCase().indexOf(' static ') !== -1)
            return true;
        return false;
    }

    static isSObject(objectName) {
        let sObjects = Utils.getObjectsFromMetadataIndex();
        return sObjects && sObjects.sObjectsToLower.includes(objectName.toLowerCase());
    }

    static isUserClass(className, document) {
        let classes = Utils.getClassesFromClassFolder(document);
        return classes && classes.classesToLower.includes(className.toLowerCase());
    }

    static isSystemClass(className) {
        let classes = Utils.getClassesFromNamespace('system');
        return classes && classes.classesToLower.includes(className.toLowerCase());
    }

    static getSystemClass(ns, className) {
        let path = Paths.getSystemClassesPath() + '/' + ns + '/' + className + '.json';
        if (FileChecker.isExists(path))
            return JSON.parse(FileReader.readFileSync(path));
        return undefined;
    }

    static getNamespacesMetadataFile() {
        let nsMetadataPath = Paths.getSystemClassesPath() + '/namespacesMetadata.json';
        return JSON.parse(FileReader.readFileSync(nsMetadataPath));
    }

    static isOnPosition(position, lastToken, token, nextToken) {
        if (position && token.line == position.line) {
            if (token.startColumn <= position.character && position.character <= nextToken.startColumn)
                return true;
        } else if (position && lastToken && lastToken.line < position.line && nextToken && position.line < nextToken.line) {
            return true;
        }
        return false;
    }

    static getApexCompletionItems(document, position, activationTokens, activationInfo, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects) {
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
                            let method = Utils.getMethodFromCall(lastClass, actType.name, actType.params);
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
        if (lastClass && config.getConfig().activeApexSuggestion) {
            items = Utils.getApexClassCompletionItems(position, lastClass);
        } else if (sObject && config.getConfig().activeSobjectFieldsSuggestion) {
            items = Utils.getSobjectsFieldsCompletionItems(position, sObject, 'aurahelper.completion.apex', activationTokens, activationInfo);
        }
        return items;
    }

    static getMethodFromCall(apexClass, name, params) {
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

    static getApexClassCompletionItems(position, apexClass) {
        let items = [];
        if (apexClass) {
            if (apexClass.isEnum) {
                for (const value of apexClass.enumValues) {
                    let options = Utils.getCompletionItemOptions('Enum Member', '', value, true, CompletionItemKind.EnumMember);
                    let command = Utils.getCommand('EnumMember', 'aurahelper.completion.apex', [position, 'EnumMember', value]);
                    items.push(Utils.createItemForCompletion(value, options, command));
                }
            } else {
                if (apexClass.posData && apexClass.posData.isOnMethod) {
                    let method = Utils.getMethod(apexClass, apexClass.posData.methodSignature);
                    for (const variable of method.params) {
                        let options = Utils.getCompletionItemOptions(variable.description, 'Datatype: ' + variable.datatype, variable.name, true, CompletionItemKind.Variable);
                        let command = Utils.getCommand('MethodParam', 'aurahelper.completion.apex', [position, 'MethodParam', variable]);
                        items.push(Utils.createItemForCompletion(variable.name, options, command));
                    }
                    for (const variable of method.declaredVariables) {
                        let options = Utils.getCompletionItemOptions('Method declared variable', 'Datatype: ' + variable.datatype, variable.name, true, CompletionItemKind.Variable);
                        let command = Utils.getCommand('DeclaredVar', 'aurahelper.completion.apex', [position, 'DeclaredVar', variable]);
                        items.push(Utils.createItemForCompletion(variable.name, options, command));
                    }
                }
                for (const field of apexClass.fields) {
                    let options = Utils.getCompletionItemOptions('Class field', 'Type: ' + field.type, field.name, true, CompletionItemKind.Field);
                    let command = Utils.getCommand('ClassField', 'aurahelper.completion.apex', [position, 'ClassField', field.name]);
                    items.push(Utils.createItemForCompletion(field.name, options, command));
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
                    let options = Utils.getCompletionItemOptions(method.signature, method.description, new SnippetString(insertText), true, CompletionItemKind.Constructor);
                    let command = Utils.getCommand('ClassConstructor', 'aurahelper.completion.apex', [position, 'ClassConstructor', method]);
                    items.push(Utils.createItemForCompletion(name, options, command));
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
                    let options = Utils.getCompletionItemOptions(method.signature, method.description, new SnippetString(insertText), true, CompletionItemKind.Method);
                    let command = Utils.getCommand('ClassMethod', 'aurahelper.completion.apex', [position, 'ClassMethod', method]);
                    items.push(Utils.createItemForCompletion(name, options, command));
                }
                Object.keys(apexClass.classes).forEach(function (key) {
                    let innerClass = apexClass.classes[key];
                    let options;
                    if (innerClass.isInterface) {
                        options = Utils.getCompletionItemOptions('Internal Interface from : ' + apexClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Interface);
                    } else {
                        options = Utils.getCompletionItemOptions('Internal Class from : ' + apexClass.name, innerClass.description, innerClass.name, true, CompletionItemKind.Class);
                    }
                    let command = Utils.getCommand('InnerClass', 'aurahelper.completion.apex', [position, 'InnerClass', innerClass]);
                    items.push(Utils.createItemForCompletion(innerClass.name, options, command));
                });
                Object.keys(apexClass.enums).forEach(function (key) {
                    let innerEnum = apexClass.enums[key];
                    let options = Utils.getCompletionItemOptions(innerEnum.name + ' Enum', innerEnum.description, innerEnum.name, true, CompletionItemKind.Enum);
                    let command = Utils.getCommand('InnerEnum', 'aurahelper.completion.apex', [position, 'InnerEnum', innerEnum]);
                    items.push(Utils.createItemForCompletion(innerEnum.name, options, command));
                });
            }
        }
        return items;
    }

    static getCommand(title, command, args) {
        return {
            title: title,
            command: command,
            arguments: args
        };
    }

    static getCompletionItemOptions(detail, documentation, insertText, preselect, type) {
        return {
            detail: detail,
            documentation: documentation,
            insertText: insertText,
            preselect: preselect,
            type: type
        };
    }

    static createItemForCompletion(name, options, command) {
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
            item.command = command;
        return item;
    }

    static getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects) {
        let items = [];
        if (config.getConfig().activeApexSuggestion) {
            items = Utils.getApexClassCompletionItems(position, fileStructure)
            for (const userClass of classes.classes) {
                let options = Utils.getCompletionItemOptions(userClass, 'Custom Apex Class', userClass, true, CompletionItemKind.Class);
                let command = Utils.getCommand('UserClass', 'aurahelper.completion.apex', [position, 'UserClass', userClass]);
                items.push(Utils.createItemForCompletion(userClass, options, command));
            }
            Object.keys(systemMetadata).forEach(function (key) {
                let systemClass = systemMetadata[key];
                if (systemClass.isEnum) {
                    let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '') + '\nEnum Values: \n' + systemClass.enumValues.join('\n');
                    let options = Utils.getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Enum);
                    let command = Utils.getCommand('SystemEnum', 'aurahelper.completion.apex', [position, 'SystemEnum', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                } else if (systemClass.isInterface) {
                    let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '');
                    let options = Utils.getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Interface);
                    let command = Utils.getCommand('SystemInterface', 'aurahelper.completion.apex', [position, 'SystemInterface', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                } else {
                    let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '');
                    let options = Utils.getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Class);
                    let command = Utils.getCommand('SystemClass', 'aurahelper.completion.apex', [position, 'SystemClass', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                }
            });
            Object.keys(namespacesMetadata).forEach(function (key) {
                let nsMetadata = namespacesMetadata[key];
                let options = Utils.getCompletionItemOptions(nsMetadata.description, nsMetadata.docLink, nsMetadata.name, true, CompletionItemKind.Module);
                let command = Utils.getCommand('Namespace', 'aurahelper.completion.apex', [position, 'Namespace', nsMetadata]);
                items.push(Utils.createItemForCompletion(nsMetadata.name, options, command));
            });
        }
        if (config.getConfig().activeSObjectSuggestion) {
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
                let options = Utils.getCompletionItemOptions(objName, description, objName, true, CompletionItemKind.Class);
                let command = Utils.getCommand('SObject', 'aurahelper.completion.apex', [position, 'SObject', objName]);
                items.push(Utils.createItemForCompletion(objName, options, command));
            }
        }
        return items;
    }

    static getCustomLabels() {
        let labels = [];
        let labelsFile = Paths.getMetadataRootFolder() + '/labels/CustomLabels.labels-meta.xml';
        if (FileChecker.isExists(labelsFile)) {
            let root = AuraParser.parseXML(FileReader.readFileSync(labelsFile));
            if (root.CustomLabels) {
                if (Array.isArray(root.CustomLabels.labels))
                    labels = root.CustomLabels.labels;
                else
                    labels.push(root.CustomLabels.labels);
            }
        }
        return labels;
    }
}
exports.Utils = Utils;