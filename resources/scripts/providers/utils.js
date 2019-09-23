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
                namespaces.namespacesToLower.push(fileName.toLowerCase());
                namespaces.namespaces.push(fileName);
                namespaces.namespacesMap[fileName.toLowerCase()] = fileName;
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
            return activation;
        let lineTokens = Tokenizer.tokenize(lineText);
        let index = 0;
        let tokenPos = 0;
        let token;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (position.character >= token.startColumn) {
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
            if (token && token.tokenType === TokenType.RPAREN) {
                isOnParams = true;
                activation = token.content + activation;
            } else if (token && token.tokenType === TokenType.LPAREN) {
                isOnParams = false;
                activation = token.content + activation;
            } else if (token && (token.tokenType === TokenType.DOT || token.tokenType === TokenType.IDENTIFIER || isOnParams)) {
                activation = token.content + activation;
            } else {
                endLoop = true;
            }
            tokenPos--
            if (tokenPos < 0)
                endLoop = true;
        }
        return activation;
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

    static getSobjectsFieldsCompletionItems(position, sObject, command) {
        let items = [];
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
                        itemRel.command = {
                            title: 'sObject',
                            command: command,
                            arguments: [position, 'sObjectRelField', field]
                        };
                    }
                }
                if (field.picklistValues.length > 0) {
                    item.documentation += "Picklist Values: \n";
                    for (const pickVal of field.picklistValues) {
                        item.documentation += pickVal.value + " (" + pickVal.label + ") \n";
                    }
                }
                item.insertText = field.name;
                item.command = {
                    title: 'sObject',
                    command: command,
                    arguments: [position, 'sObjectField', field]
                };
                items.push(item);
                if (itemRel)
                    items.push(itemRel);
            }
        }
        return items;
    }

    static getAllAvailableCompletionItems(similarClasses, similarSobjects, fileStructure, position, command, classes, sObjects) {
        let items = [];
        if (config.getConfig().activeApexSuggestion) {
            if (fileStructure.posData && fileStructure.posData.isOnMethod) {
                let method = this.getMethod(fileStructure, fileStructure.posData.methodSignature);
                for (const param of method.params) {
                    let item = new CompletionItem(param.name, CompletionItemKind.Field);
                    item.detail = 'Method Param';
                    item.documentation = 'Type: ' + param.type;
                    item.insertText = param.name;
                    item.preselect = true;
                    item.command = {
                        title: 'Method Field',
                        command: command,
                        arguments: [position, 'MethodParam', param]
                    };
                    items.push(item);
                }
                for (const field of method.declaredVariables) {
                    let item = new CompletionItem(field.name, CompletionItemKind.Field);
                    item.detail = 'Declared variable';
                    item.documentation = 'Type: ' + field.type;
                    item.insertText = field.name;
                    item.preselect = true;
                    item.command = {
                        title: 'Method Field',
                        command: command,
                        arguments: [position, 'MethodField', field]
                    };
                    items.push(item);
                }
            }
            for (const method of fileStructure.methods) {
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
                    title: 'Class Method',
                    command: command,
                    arguments: [position, 'ClassMethod', method]
                };
                items.push(item);
            }
            for (const field of fileStructure.fields) {
                let item = new CompletionItem(field.name, CompletionItemKind.Field);
                item.detail = field.name + ' Class field';
                item.documentation = 'Type: ' + field.type;
                item.insertText = field.name;
                item.preselect = true;
                item.command = {
                    title: 'sObject',
                    command: command,
                    arguments: [position, 'ClassField', field]
                };
                items.push(item);
            }
            for (const cls of similarClasses) {
                let clsName = classes.classesMap[cls];
                let item = new CompletionItem(clsName, CompletionItemKind.Class);
                item.detail = clsName + ' Class';
                item.documentation = clsName;
                item.insertText = clsName;
                item.command = {
                    title: 'Class',
                    command: command,
                    arguments: [position, 'Class', cls]
                };
                items.push(item);
            }
        }
        if (config.getConfig().activeSObjectSuggestion) {
            for (const sobject of similarSobjects) {
                let objName = sObjects.sObjectsMap[sobject];
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
        }
        return items;
    }

    static getQueryCompletionItems(activationTokens, queryData, position, command) {
        if (!config.getConfig().activeQuerySuggestion)
            return Promise.resolve(undefined);
        let sObjects = Utils.getObjectsFromMetadataIndex();
        let similarSobjects;
        let items;
        if (activationTokens.length === 1)
            similarSobjects = Utils.getSimilar(sObjects.sObjectsToLower, activationTokens[0]);
        if (sObjects.sObjectsToLower.includes(queryData.from.toLowerCase())) {
            let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[queryData.from.toLowerCase()]);
            if (activationTokens.length === 0) {
                items = Utils.getSobjectsFieldsCompletionItems(position, sObject, command);
            } else {
                let lastObject = sObject;
                let index = 0;
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
                    index++;
                }
                items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, command);
            }
        }
        return items;
    }

    static getMemberData(lastClass, actToken) {
        let memberData = undefined;
        if (actToken.indexOf('(') !== -1 && actToken.indexOf(')') !== -1) {
            let name = actToken.split("(")[0].toLowerCase();
            let params = actToken.substring(actToken.indexOf("(") + 1, actToken.indexOf(")"));
            let paramSplits = [];
            if (params.indexOf(',') !== -1)
                params.split(",");
            for (const method of lastClass.methods) {
                if (method.params) {
                    if (method.name.toLowerCase() === name && method.params.length === paramSplits.length) {
                        memberData = {
                            type: "method",
                            data: method
                        };
                        return memberData;
                    }
                } else if (method.methodParams) {
                    if (method.name.toLowerCase() === name && method.methodParams.length === paramSplits.length) {
                        memberData = {
                            type: "method",
                            data: method
                        };
                        return memberData;
                    }
                }
            }
        } else {
            for (const field of lastClass.fields) {
                if (field.name.toLowerCase() === actToken.toLowerCase()) {
                    memberData = {
                        type: "field",
                        data: field
                    };
                    return memberData;
                }
            }
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
}
exports.Utils = Utils;