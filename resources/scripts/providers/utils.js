const fileSystem = require('../fileSystem');
const language = require('../languages');
const logger = require('../utils/logger');
const config = require('../core/config');
const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const SnippetString = vscode.SnippetString;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const FileChecker = fileSystem.FileChecker;
const Tokenizer = language.Tokenizer;
const TokenType = language.TokenType;
const XMLParser = language.XMLParser;

class Utils {

    static getFieldData(sObject, fieldName) {
        if (sObject) {
            for (const fieldKey of Object.keys(sObject.fields)) {
                let field = sObject.fields[fieldKey];
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
        let tokenPos = -1;
        let token;
        let startColumn;
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
        if (tokenPos === -1)
            return {
                activation: activation,
                startColumn: 0
            };
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
            } else if (!isOnParams && token && (token.tokenType === TokenType.COMMA || token.tokenType === TokenType.QUOTTE || token.tokenType === TokenType.SQUOTTE)) {
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
            let item = new CompletionItem(objName.name, CompletionItemKind.Class);
            item.detail = objName.name + ' SObject';
            item.insertText = objName.name;
            item.command = {
                title: 'sObject',
                command: command,
                arguments: [position, 'sObject', objName.name]
            };
            items.push(item);
        }
        return items;
    }

    static getSobjectsFieldsCompletionItems(position, sObject, command, activations, activationInfo) {
        let items = [];
        let picklistItems = [];
        if (sObject) {
            for (const fieldKey of Object.keys(sObject.fields)) {
                let field = sObject.fields[fieldKey];
                let itemRel;
                let detail = sObject.name + ' Field';
                let documentation = "Label: " + field.label + '\n';
                documentation += "Length: " + field.length + '\n';
                documentation += "Type: " + field.type + '\n';
                documentation += "Is Custom: " + field.custom + '\n';
                if (field.referenceTo.length > 0) {
                    documentation += "Reference To: " + field.referenceTo.join(", ") + '\n';
                    let name = field.name;
                    if (name.endsWith('__c')) {
                        name = name.substring(0, name.length - 3) + '__r';
                        let options = Utils.getCompletionItemOptions(sObject.name + " Relationsip Field", 'Relationship with ' + field.referenceTo.join(", ") + ' field(s)', name, true, CompletionItemKind.Field);
                        let comm = Utils.getCommand('sObject', command, [position, 'sObjectRelField', field]);
                        itemRel = Utils.createItemForCompletion(name, options, comm);
                    }
                }
                if (field.picklistValues.length > 0 && activations[1] === field.name) {
                    picklistItems = [];
                    documentation += "Picklist Values: \n";
                    for (const pickVal of field.picklistValues) {
                        let pickDetail = field.name + ' Picklist Value';
                        let pickDoc = "Value: " + pickVal.value + '\n';
                        pickDoc += "Label: " + pickVal.label + '\n';
                        pickDoc += "Active: " + pickVal.active + '\n';
                        pickDoc += "Is Default: " + pickVal.defaultValue;
                        let options = Utils.getCompletionItemOptions(pickDetail, pickDoc, pickVal.value, true, CompletionItemKind.Value);
                        let comm = Utils.getCommand('sObject', command, [position, 'sObjectPickVal', { field: field, value: pickVal, activations: activations, activationInfo: activationInfo }]);
                        let pickItem = Utils.createItemForCompletion(pickVal.value, options, comm);
                        picklistItems.push(pickItem);
                        documentation += pickVal.value + " (" + pickVal.label + ") \n";
                    }
                }
                let options = Utils.getCompletionItemOptions(detail, documentation, field.name, true, CompletionItemKind.Field);
                let comm = Utils.getCommand('sObject', command, [position, 'sObjectField', field]);
                let item = Utils.createItemForCompletion(field.name, options, comm);
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
        if (!config.getConfig().autoCompletion.activeQuerySuggestion)
            return Promise.resolve(undefined);
        let sObjects = applicationContext.sObjects;
        let items;
        if (sObjects[queryData.from.toLowerCase()]) {
            let sObject = sObjects[queryData.from.toLowerCase()];
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
                            lastObject = sObjects[queryData.from.toLowerCase()];
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
        let sObjects = applicationContext.sObjects;
        return sObjects && sObjects[objectName.toLowerCase()];
    }

    static isUserClass(className) {
        let classes = applicationContext.userClasses;
        return classes && classes[className.toLowerCase()];
    }

    static isSystemClass(className) {
        let classes = applicationContext.namespacesMetadata['system'];
        return classes && classes[className.toLowerCase()];
    }

    static getSystemClass(ns, className) {
        if (applicationContext.namespacesMetadata[ns.toLowerCase])
            return applicationContext.namespacesMetadata[ns.toLowerCase][className];
        return undefined;
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

    static getApexCompletionItems(position, activationTokens, activationInfo, fileStructure, classes, systemMetadata, allNamespaces, sObjects) {
        let items = [];
        let sObject = sObjects[activationTokens[0].toLowerCase()];
        let lastClass = classes[activationTokens[0].toLowerCase()] || systemMetadata[activationTokens[0].toLowerCase()] || fileStructure;
        if (lastClass && activationTokens[0].toLowerCase() === fileStructure.name.toLowerCase())
            lastClass = fileStructure;
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
                            sObject = sObjects[fielData.referenceTo[0].toLowerCase()];
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
                                    if (allNamespaces[parentClassOrNs.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.namespacesMetadata[parentClassOrNs.toLowerCase()];
                                        if (namespaceMetadata[className.toLowerCase()]) {
                                            lastClass = namespaceMetadata[className.toLowerCase()];
                                            parentStruct = undefined;
                                            sObject = undefined;
                                        }
                                    }
                                    if (!lastClass && systemMetadata[parentClassOrNs.toLowerCase()]) {
                                        parentStruct = systemMetadata[parentClassOrNs.toLowerCase()];
                                    }
                                } else if (splits.length > 2) {
                                    let nsName = splits[0];
                                    let parentClassName = splits[1];
                                    className = splits[2];
                                    if (allNamespaces[nsName.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.namespacesMetadata[nsName.toLowerCase()];
                                        if (namespaceMetadata[parentClassName.toLowerCase()]) {
                                            lastClass = undefined;
                                            parentStruct = namespaceMetadata[parentClassName.toLowerCase()];
                                            sObject = undefined;
                                        }
                                    }
                                    if (!parentStruct && systemMetadata[parentClassName.toLowerCase()]) {
                                        parentStruct = systemMetadata[parentClassName.toLowerCase()];
                                    }
                                }
                            } else {
                                parentStruct = undefined;
                                if (systemMetadata[datatype.toLowerCase()]) {
                                    lastClass = systemMetadata[datatype.toLowerCase()];
                                    sObject = undefined;
                                }
                            }
                            if (parentStruct && className) {
                                let classFound = false;
                                if (parentStruct.classes[className.toLowerCase()]) {
                                    classFound = true;
                                    lastClass = parentStruct.classes[className.toLowerCase()];
                                }
                                if (!classFound) {
                                    if (parentStruct.enums[className.toLowerCase()]) {
                                        classFound = true;
                                        lastClass = parentStruct.enums[className.toLowerCase()];
                                    }
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
                                parentStruct = classes[lastClass.parentClass.toLowerCase()];
                                className = actToken;
                            } else {
                                if (classes[actToken.toLowerCase()]) {
                                    lastClass = classes[actToken.toLowerCase()];
                                    parentStruct = undefined;
                                    sObject = undefined;
                                } else if (systemMetadata[actToken.toLowerCase()]) {
                                    lastClass = systemMetadata[actToken.toLowerCase()];
                                    parentStruct = undefined;
                                    sObject = undefined;
                                } else if (sObjects[actToken.toLowerCase()]) {
                                    sObject = sObjects[actToken.toLowerCase()];
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
                                    if (classes[parentClassOrNs.toLowerCase()]) {
                                        parentStruct = classes[parentClassOrNs.toLowerCase()];
                                    } else if (allNamespaces[parentClassOrNs.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.namespacesMetadata[parentClassOrNs.toLowerCase()];
                                        if (namespaceMetadata[className.toLowerCase()]) {
                                            lastClass = namespaceMetadata[className.toLowerCase()];
                                            parentStruct = undefined;
                                            sObject = undefined;
                                        }
                                    }
                                    if (!lastClass && systemMetadata[parentClassOrNs.toLowerCase()]) {
                                        parentStruct = systemMetadata[parentClassOrNs.toLowerCase()];
                                    }
                                } else if (splits.length > 2) {
                                    let nsName = splits[0];
                                    let parentClassName = splits[1];
                                    className = splits[2];
                                    if (classes[parentClassName.toLowerCase()]) {
                                        parentStruct = classes[parentClassName.toLowerCase()];
                                    } else if (allNamespaces[nsName.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext[nsName.toLowerCase()];
                                        if (namespaceMetadata[parentClassName.toLowerCase()]) {
                                            lastClass = undefined;
                                            parentStruct = namespaceMetadata[parentClassName.toLowerCase()];
                                            sObject = undefined;
                                        }
                                    }
                                    if (!parentStruct && systemMetadata[parentClassName.toLowerCase()]) {
                                        parentStruct = systemMetadata[parentClassName.toLowerCase()];
                                    }
                                }
                            } else {
                                parentStruct = undefined;
                                if (lastClass.parentClass && datatype !== 'List') {
                                    parentStruct = classes[lastClass.parentClass.toLowerCase()];
                                    className = datatype;
                                } else if (classes[datatype.toLowerCase()]) {
                                    lastClass = classes[datatype.toLowerCase()];
                                    sObject = undefined;
                                } if (systemMetadata[datatype.toLowerCase()]) {
                                    lastClass = systemMetadata[datatype.toLowerCase()];
                                    sObject = undefined;
                                } else if (sObjects[datatype.toLowerCase()]) {
                                    sObject = sObjects[datatype.toLowerCase()];
                                    parentStruct = undefined;
                                    lastClass = undefined;
                                }
                            }
                        }
                        if (parentStruct && className) {
                            let classFound = false;
                            if (parentStruct.classes[className.toLowerCase()]) {
                                classFound = true;
                                lastClass = parentStruct.classes[className.toLowerCase()];
                            }
                            if (!classFound) {
                                if (parentStruct.enums[className.toLowerCase()]) {
                                    classFound = true;
                                    lastClass = parentStruct.enums[className.toLowerCase()];
                                }
                            }
                            if (!classFound)
                                lastClass = undefined;
                        }
                    }
                }
            }
            index++;
        }
        if (sObject && config.getConfig().autoCompletion.activeSobjectFieldsSuggestion) {
            items = items.concat(Utils.getSobjectsFieldsCompletionItems(position, sObject, 'aurahelper.completion.apex', activationTokens, activationInfo));
        } else if (lastClass && config.getConfig().autoCompletion.activeApexSuggestion) {
            items = Utils.getApexClassCompletionItems(position, lastClass);
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
                    for (const param of method.params) {
                        let description = '';
                        if (method.comment && method.comment.params) {
                            let commentParam = method.comment.params[param.name];
                            if (commentParam) {
                                if (commentParam.description && commentParam.description.length > 0)
                                    description += ' :' + commentParam.description + '  \n\n';
                            }
                        }
                        description += 'Type: ' + param.datatype;
                        let options = Utils.getCompletionItemOptions(param.datatype + ' ' + param.name, description, param.name, true, CompletionItemKind.Variable);
                        let command = Utils.getCommand('MethodParam', 'aurahelper.completion.apex', [position, 'MethodParam', param]);
                        items.push(Utils.createItemForCompletion(param.name, options, command));
                    }
                    for (const variable of method.declaredVariables) {
                        let options = Utils.getCompletionItemOptions('Method declared variable', 'Datatype: ' + variable.datatype, variable.name, true, CompletionItemKind.Variable);
                        let command = Utils.getCommand('DeclaredVar', 'aurahelper.completion.apex', [position, 'DeclaredVar', variable]);
                        items.push(Utils.createItemForCompletion(variable.name, options, command));
                    }
                }
                for (const field of apexClass.fields) {
                    let description = '';
                    if (field.comment && field.comment.description && field.comment.description.length > 0)
                        description += '### ' + field.comment.description + '  \n';
                    description += 'Type: ' + field.datatype;
                    let options = Utils.getCompletionItemOptions('Class field', description, field.name, true, CompletionItemKind.Field);
                    let command = Utils.getCommand('ClassField', 'aurahelper.completion.apex', [position, 'ClassField', field.name]);
                    items.push(Utils.createItemForCompletion(field.name, options, command));
                }
                for (const method of apexClass.constructors) {
                    let insertText = method.name + "(";
                    let snippetNum = 1;
                    let name = method.name + "(";
                    let description = '';
                    if (method.comment && method.comment.description && method.comment.description.length > 0)
                        description += '### ' + method.comment.description + '  \n';
                    else if (method.description)
                        description += '### ' + method.description + '  \n';
                    if (method.params.length > 0)
                        description += '*Parameters:*   \n\n';
                    if (method.params) {
                        for (const param of method.params) {
                            description += '> **' + param.name + '** (*' + param.datatype + '*)';
                            if (method.comment && method.comment.params) {
                                let commentParam = method.comment.params[param.name];
                                if (commentParam) {
                                    if (commentParam.description && commentParam.description.length > 0)
                                        description += ' :' + commentParam.description + '  \n\n';
                                }
                            } else if (param.description) {
                                description += ' :' + param.description + '  \n\n';
                            }
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
                    let options = Utils.getCompletionItemOptions(method.signature, description, new SnippetString(insertText), true, CompletionItemKind.Constructor);
                    let command = Utils.getCommand('ClassConstructor', 'aurahelper.completion.apex', [position, 'ClassConstructor', method]);
                    items.push(Utils.createItemForCompletion(name, options, command));
                }
                for (const method of apexClass.methods) {
                    let insertText = method.name + "(";
                    let snippetNum = 1;
                    let name = method.name + "(";
                    let description = '';
                    if (method.comment && method.comment.description && method.comment.description.length > 0)
                        description += '### ' + method.comment.description + '  \n';
                    else if (method.description)
                        description += '### ' + method.description + '  \n';
                    if (method.params.length > 0)
                        description += '*Parameters:*   \n\n';
                    for (const param of method.params) {
                        description += '> **' + param.name + '** (*' + param.datatype + '*)';
                        if (method.comment && method.comment.params) {
                            let commentParam = method.comment.params[param.name];
                            if (commentParam) {
                                if (commentParam.description && commentParam.description.length > 0)
                                    description += ' :' + commentParam.description + '  \n\n';
                            }
                        } else if (param.description) {
                            description += ' :' + param.description + '  \n\n';
                        }
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
                    if (method.comment && method.comment.return && method.datatype.toLowerCase() !== 'void') {
                        description += '*Return*:  \n'
                        if (method.comment.return.description && method.comment.return.description.length > 0) {
                            description += '> ' + method.comment.return.description + '  \n';
                        }
                        description += '> *' + method.comment.return.type + '*  \n';
                    }
                    name += ")";
                    insertText += ")";
                    if (method.datatype.toLowerCase() === 'void')
                        insertText += ';';
                    let options = Utils.getCompletionItemOptions(method.signature, description, new SnippetString(insertText), true, CompletionItemKind.Method);
                    let command = Utils.getCommand('ClassMethod', 'aurahelper.completion.apex', [position, 'ClassMethod', method]);
                    items.push(Utils.createItemForCompletion(name, options, command));
                }
                Object.keys(apexClass.classes).forEach(function (key) {
                    let innerClass = apexClass.classes[key];
                    let options;
                    if (innerClass.isInterface) {
                        options = Utils.getCompletionItemOptions('Internal Interface from : ' + apexClass.name, (innerClass.comment) ? innerClass.comment : '', innerClass.name, true, CompletionItemKind.Interface);
                    } else {
                        options = Utils.getCompletionItemOptions('Internal Class from : ' + apexClass.name, (innerClass.comment) ? innerClass.comment : '', innerClass.name, true, CompletionItemKind.Class);
                    }
                    let command = Utils.getCommand('InnerClass', 'aurahelper.completion.apex', [position, 'InnerClass', innerClass]);
                    items.push(Utils.createItemForCompletion(innerClass.name, options, command));
                });
                Object.keys(apexClass.enums).forEach(function (key) {
                    let innerEnum = apexClass.enums[key];
                    let options = Utils.getCompletionItemOptions(innerEnum.name + ' Enum', (innerEnum.comment) ? innerEnum.comment : '', innerEnum.name, true, CompletionItemKind.Enum);
                    let command = Utils.getCommand('InnerEnum', 'aurahelper.completion.apex', [position, 'InnerEnum', innerEnum]);
                    items.push(Utils.createItemForCompletion(innerEnum.name, options, command));
                });
                if (apexClass.extends) {
                    let parentClasss = apexClass;
                    while (!parentClasss.extends) {
                        items = items.concat(Utils.getApexClassCompletionItems(position, parentClasss));
                        parentClasss = parentClasss.extends;
                    }
                }
                if (apexClass.implements.length > 0) {
                    for (const imp of apexClass.implements) {
                        items = items.concat(Utils.getApexClassCompletionItems(position, imp));
                    }
                }
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
        if (!options.documentation)
            options.documentation = '';
        options.documentation += '\n\nPowered by Aura Helper';
        if (options && options.type)
            type = options.type;
        let item = new CompletionItem(name, type);
        if (options && options.detail)
            item.detail = options.detail;
        if (options && options.documentation)
            item.documentation = new vscode.MarkdownString(options.documentation);
        if (options && options.preselect)
            item.preselect = options.preselect;
        if (options && options.insertText)
            item.insertText = options.insertText;
        if (command)
            item.command = command;
        return item;
    }

    static getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, allNamespaces, sObjects) {
        let items = [];
        if (config.getConfig().autoCompletion.activeApexSuggestion) {
            items = Utils.getApexClassCompletionItems(position, fileStructure)
            Object.keys(classes).forEach(function (key) {
                let userClass = classes[key];
                let className = (userClass.name) ? userClass.name : userClass;
                let options = Utils.getCompletionItemOptions(className, (userClass.comment) ? userClass.comment : 'Custom Class', className, true, CompletionItemKind.Class);
                let command = Utils.getCommand('UserClass', 'aurahelper.completion.apex', [position, 'UserClass', className]);
                items.push(Utils.createItemForCompletion(className, options, command));
            });
            Object.keys(systemMetadata).forEach(function (key) {
                let systemClass = systemMetadata[key];
                if (systemClass.isEnum) {
                    let description = systemClass.description + ((systemClass.link) ? ' Documentation:\n ' + systemClass.link : '') + '\nEnum Values: \n' + systemClass.enumValues.join('\n');
                    let options = Utils.getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Enum);
                    let command = Utils.getCommand('SystemEnum', 'aurahelper.completion.apex', [position, 'SystemEnum', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                } else if (systemClass.isInterface) {
                    let description = systemClass.description + ((systemClass.link) ? ' Documentation:\n ' + systemClass.link : '');
                    let options = Utils.getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Interface);
                    let command = Utils.getCommand('SystemInterface', 'aurahelper.completion.apex', [position, 'SystemInterface', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                } else {
                    let description = systemClass.description + ((systemClass.link) ? ' Documentation:\n ' + systemClass.link : '');
                    let options = Utils.getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Class);
                    let command = Utils.getCommand('SystemClass', 'aurahelper.completion.apex', [position, 'SystemClass', systemClass]);
                    items.push(Utils.createItemForCompletion(systemClass.name, options, command));
                }
            });
            Object.keys(allNamespaces).forEach(function (key) {
                let nsMetadata = allNamespaces[key];
                let options = Utils.getCompletionItemOptions(nsMetadata.description, ' Documentation:\n ' + nsMetadata.docLink, nsMetadata.name, true, CompletionItemKind.Module);
                let command = Utils.getCommand('Namespace', 'aurahelper.completion.apex', [position, 'Namespace', nsMetadata]);
                items.push(Utils.createItemForCompletion(nsMetadata.name, options, command));
            });
        }
        if (config.getConfig().autoCompletion.activeSObjectSuggestion) {
            Object.keys(sObjects).forEach(function (key) {
                let sObject = sObjects[key];
                let description = 'Standard SObject';
                if (sObject.custom)
                    description = 'Custom SObject';
                if (sObject.namespace) {
                    description += '\nNamespace: ' + sObject.namespace;
                }
                let options = Utils.getCompletionItemOptions(sObject.name, description, sObject.name, true, CompletionItemKind.Class);
                let command = Utils.getCommand('SObject', 'aurahelper.completion.apex', [position, 'SObject', sObject.name]);
                items.push(Utils.createItemForCompletion(sObject.name, options, command));
            });
        }
        return items;
    }

    static getCustomLabels() {
        let labels = [];
        let labelsFile = Paths.getMetadataRootFolder() + '/labels/CustomLabels.labels-meta.xml';
        if (FileChecker.isExists(labelsFile)) {
            let root = XMLParser.parseXML(FileReader.readFileSync(labelsFile));
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