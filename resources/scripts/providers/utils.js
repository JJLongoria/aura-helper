const logger = require('../utils/logger');
const Config = require('../core/config');
const vscode = require('vscode');
const Paths = require('../core/paths');
const Range = vscode.Range;
const Position = vscode.Position;
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { XMLParser } = require('@aurahelper/languages').XML;
const { Tokenizer, TokenType } = require('@aurahelper/languages').System;
const { ApexNodeTypes } = require('@aurahelper/core').Values;
const applicationContext = require('../core/applicationContext');
const { StrUtils, Utils } = require('@aurahelper/core').CoreUtils;
const LanguageUtils = require('@aurahelper/languages').LanguageUtils;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const SnippetString = vscode.SnippetString;
const TemplateUtils = require('../utils/templateUtils');
const { MarkDownStringBuilder } = require('../output');

class ProviderUtils {

    static fixPositionOffset(document, position) {
        const insertSpaces = vscode.window.activeTextEditor.options.insertSpaces;
        if (!insertSpaces) {
            const line = document.lineAt(position.line);
            const nTabs = StrUtils.countStartTabs(line.text);
            const tabSize = vscode.window.activeTextEditor.options.tabSize;
            if (nTabs > 0)
                return new Position(position.line, position.character + ((nTabs * Number(tabSize)) - nTabs));
            else
                return position;
        } else {
            const line = document.lineAt(position.line);
            const nTabs = StrUtils.countStartTabs(line.text);
            const tabSize = vscode.window.activeTextEditor.options.tabSize;
            if (nTabs > 0)
                return new Position(position.line, position.character + ((nTabs * Number(tabSize)) - nTabs));
            else
                return position;
        }

    }

    static getFieldData(sObject, fieldName) {
        if (sObject && sObject.fields) {
            return sObject.fields[fieldName.toLowerCase()];
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
        const correctedPos = ProviderUtils.fixPositionOffset(document, position);
        const difference = correctedPos.character - position.character;
        const result = {
            activation: "",
            startColumn: 0,
            lastToken: undefined,
            twoLastToken: undefined,
            nextToken: undefined,
            twoNextToken: undefined,
        }
        const line = document.lineAt(correctedPos.line);
        const lineText = line.text;
        if (line.isEmptyOrWhitespace) {
            result.startColumn = correctedPos.character;
            return result;
        }
        const lineTokens = Tokenizer.tokenize(lineText);
        let index = 0;
        let tokenPos = -1;
        let token;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (token.range.end.character <= correctedPos.character) {
                tokenPos = index;
            }
            index++;
        }
        if (token.type == TokenType.BRACKET.CURLY_CLOSE)
            tokenPos--;
        let endLoop = false;
        let isOnParams = false;
        if (tokenPos === -1) {
            result.startColumn = correctedPos.character;
            return result;
        }
        result.nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
        result.lastToken = LanguageUtils.getTwoNextToken(lineTokens, tokenPos);
        while (!endLoop) {
            token = lineTokens[tokenPos];
            const nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
            const lastToken = LanguageUtils.getLastToken(lineTokens, tokenPos);
            const twoLastToken = LanguageUtils.getTwoLastToken(lineTokens, tokenPos);
            if (token && token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE && !isOnParams) {
                isOnParams = true;
                result.activation = token.text + result.activation;
                result.startColumn = token.range.start.character;
                result.lastToken = lastToken;
                result.twoLastToken = twoLastToken;
            } else if (token && token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN && isOnParams) {
                isOnParams = false;
                result.activation = token.text + result.activation;
                result.startColumn = token.range.start.character;
                result.lastToken = lastToken;
                result.twoLastToken = twoLastToken;
            } else if (token && token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN && !isOnParams) {
                endLoop = true;
            } else if (token && (token.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenType.PUNCTUATION.SAFE_OBJECT_ACCESSOR || token.type === TokenType.IDENTIFIER || token.type === TokenType.PUNCTUATION.COLON || isOnParams)) {
                if (!isOnParams) {
                    if (lastToken && lastToken.range.end.character != token.range.start.character) {
                        endLoop = true;
                        result.activation = token.text + result.activation;
                        result.startColumn = token.range.start.character;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                    } else {
                        result.activation = token.text + result.activation;
                        result.startColumn = token.range.start.character;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                    }
                } else {
                    result.activation = token.text + result.activation;
                    result.startColumn = token.range.start.character;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                }
            } else if (!isOnParams && token && (token.type === TokenType.PUNCTUATION.COMMA || token.type === TokenType.PUNCTUATION.QUOTTES || token.type === TokenType.PUNCTUATION.QUOTTES_END || token.type === TokenType.PUNCTUATION.QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                endLoop = true;
                result.lastToken = lastToken;
                result.twoLastToken = twoLastToken;
                result.startColumn = correctedPos.character;
                if (token.type === TokenType.PUNCTUATION.QUOTTES || token.type === TokenType.PUNCTUATION.QUOTTES_END || token.type === TokenType.PUNCTUATION.QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_END) {
                    if (nextToken && (nextToken.type === TokenType.PUNCTUATION.QUOTTES || nextToken.type === TokenType.PUNCTUATION.QUOTTES_END || nextToken.type === TokenType.PUNCTUATION.QUOTTES_START || nextToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES || nextToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_START || nextToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                        endLoop = true;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                        result.startColumn = nextToken.range.start.character;
                    }
                }
            } else if (token.type == TokenType.BRACKET.CURLY_OPEN) {
                endLoop = true;
            } else if (token.type === TokenType.PUNCTUATION.QUOTTES || token.type === TokenType.PUNCTUATION.QUOTTES_END || token.type === TokenType.PUNCTUATION.QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_END) {
                if (lastToken && (lastToken.type === TokenType.PUNCTUATION.QUOTTES || lastToken.type === TokenType.PUNCTUATION.QUOTTES_END || lastToken.type === TokenType.PUNCTUATION.QUOTTES_START || lastToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES || lastToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_START || lastToken.type === TokenType.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                    endLoop = true;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                }
            } else if (token.type == TokenType.LITERAL.STRING) {
                if (lastToken && lastToken.range.end.character === token.range.start.character) {
                    result.activation = token.text + result.activation;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                } else {
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                    result.activation = token.text + result.activation;
                    endLoop = true;
                }
            }
            tokenPos--
            if (tokenPos < 0)
                endLoop = true;
        }
        if (difference > 0 && result.startColumn >= difference)
            result.startColumn = result.startColumn - difference;
        return result;
    }

    static getSObjectFieldCompletionItems(position, activationInfo, activationTokens, sObject, field, positionData) {
        if (!sObject || !field)
            return [];
        let items = [];
        let pickItems = [];
        let itemRel;
        let detail = sObject.name + ' Field';
        const documentation = new MarkDownStringBuilder().appendApexCodeBlock(field.name).appendMarkdown(detail + '\n\n');
        const relDocumentation = new MarkDownStringBuilder();
        let doc = "  - **Label**: `" + field.label + '`  \n';
        if (field.length)
            doc += "  - **Length**: `" + field.length + '`  \n';
        if (field.type)
            doc += "  - **Type**: `" + field.type + '`  \n';
        if (field.custom !== undefined)
            doc += "  - **Is Custom**: `" + field.custom + '`  \n';
        if (field.referenceTo.length > 0) {
            doc += "  - **Reference To**: " + field.referenceTo.join(", ") + '\n';
            let name = field.name;
            if (name.endsWith('__c')) {
                name = name.substring(0, name.length - 3) + '__r';
                relDocumentation.appendApexCodeBlock(name);
                relDocumentation.appendMarkdown('Relationship with ' + field.referenceTo.join(", ") + ' SObject(s) \n\n');
                relDocumentation.appendMarkdown(doc);
                const options = ProviderUtils.getCompletionItemOptions(sObject.name + " Lookup Field", relDocumentation.build(), name, true, CompletionItemKind.Field);
                itemRel = ProviderUtils.createItemForCompletion(name, options);
            } else if (name.endsWith('Id')) {
                name = name.substring(0, name.length - 2);
                relDocumentation.appendApexCodeBlock(name);
                relDocumentation.appendMarkdown('Relationship with ' + field.referenceTo.join(", ") + ' SObject(s) \n\n');
                relDocumentation.appendMarkdown(doc);
                const options = ProviderUtils.getCompletionItemOptions(sObject.name + " Lookup Field", relDocumentation.build(), name, true, CompletionItemKind.Field);
                itemRel = ProviderUtils.createItemForCompletion(name, options);
            }
        }
        if (field.picklistValues.length > 0) {
            pickItems = [];
            documentation.appendMarkdownH4('Picklist Values');
            for (const pickVal of field.picklistValues) {
                if (activationTokens.length <= 3 && activationTokens.length > 0 && activationTokens[0].toLowerCase() === sObject.name.toLowerCase()) {
                    const pickDocumentation = new MarkDownStringBuilder();
                    pickDocumentation.appendApexCodeBlock(field.name);
                    let pickDoc = "  - **Value**: `" + pickVal.value + '`  \n';
                    pickDoc += "  - **Label**: `" + pickVal.label + '`  \n';
                    pickDoc += "  - **Active**: `" + pickVal.active + '`  \n';
                    pickDoc += "  - **Is Default**: `" + pickVal.defaultValue + '`';
                    let pickValue;
                    if (positionData && positionData.onText) {
                        pickValue = pickVal.value;
                    } else if (positionData && (positionData.source === 'Apex') && (!positionData.lastToken || positionData.lastToken.text !== "'") && (!positionData.nextToken || positionData.nextToken.text !== "'")) {
                        pickValue = "'" + pickVal.value + "'";
                    } else if (positionData && (positionData.source === 'Aura') && (!positionData.lastToken || positionData.lastToken.text !== '"') && (!positionData.nextToken || positionData.nextToken.text !== '"')) {
                        pickValue = '"' + pickVal.value + '"';
                    } else if (positionData && (positionData.source === 'JS') && (!positionData.lastToken || (positionData.lastToken.text !== "'" && positionData.lastToken.text !== '"')) && (!positionData.nextToken || (positionData.nextToken.text !== "'" && positionData.nextToken.text !== '"'))) {
                        pickValue = "'" + pickVal.value + "'";
                    } else {
                        pickValue = pickVal.value;
                    }
                    pickDocumentation.appendMarkdown('`' + field.name + '` Picklist Value. Select this option to replace with the picklist value. Replace `' + activationTokens.join('.') + '` with `' + pickValue + '`\n\n');
                    pickDocumentation.appendMarkdown(pickDoc + '\n\n');
                    pickDocumentation.appendMarkdownSeparator();
                    pickDocumentation.appendMarkdownH4('Snippet');
                    pickDocumentation.appendApexCodeBlock(pickValue);
                    const options = ProviderUtils.getCompletionItemOptions(pickVal.label.toString(), pickDocumentation.build(), pickValue.toString(), true, CompletionItemKind.Value);
                    const pickItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + field.name + '.' + pickVal.value.toString(), options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        pickItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    pickItems.push(pickItem);
                }
                documentation.appendMarkdownH4('  - `' + pickVal.value + "` (" + pickVal.label + ")  \n");
            }
        }
        const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), field.name, true, CompletionItemKind.Field);
        const item = ProviderUtils.createItemForCompletion(field.name, options);
        items.push(item);
        if (itemRel)
            items.push(itemRel);
        if (pickItems.length > 0) {
            items = items.concat(pickItems);
            pickItems = [];
        }
        return items;
    }

    static getSobjectsFieldsCompletionItems(position, activationInfo, activationTokens, sObject, positionData) {
        let items = [];
        if (sObject && sObject.fields) {
            for (const fieldKey of Object.keys(sObject.fields)) {
                let field = sObject.fields[fieldKey];
                items = items.concat(ProviderUtils.getSObjectFieldCompletionItems(position, activationInfo, activationTokens, sObject, field, positionData));
            }
            if (Utils.hasKeys(sObject.recordTypes) && activationTokens.length <= 2 && activationTokens.length > 0 && activationTokens[0].toLowerCase() === sObject.name.toLowerCase()) {
                for (const rtKey of Object.keys(sObject.recordTypes)) {
                    const rtNameDocumentation = new MarkDownStringBuilder();
                    const rtDevNameDocumentation = new MarkDownStringBuilder();
                    rtNameDocumentation.appendApexCodeBlock(sObject.name);
                    rtDevNameDocumentation.appendApexCodeBlock(sObject.name);
                    const rt = sObject.recordTypes[rtKey];
                    let rtDoc = "  - **Name**: `" + rt.name + '`\n';
                    rtDoc += "  - **Developer Name**: `" + rt.developerName + '`\n';
                    if (rt.default !== undefined)
                        rtDoc += "  - **Default**: `" + rt.default + '`\n';
                    if (rt.master !== undefined)
                        rtDoc += "  - **Master**: `" + rt.master + '`';
                    let nameValue;
                    let devNameValue;
                    rtNameDocumentation.appendMarkdown(rtDoc);
                    rtDevNameDocumentation.appendMarkdown(rtDoc);
                    if (positionData && positionData.onText) {
                        nameValue = rt.name;
                        devNameValue = rt.developerName;
                    } else if (positionData && (positionData.source === 'Apex') && (!positionData.lastToken || positionData.lastToken.text !== "'") && (!positionData.nextToken || positionData.nextToken.text !== "'")) {
                        nameValue = "'" + rt.name + "'";
                        devNameValue = "'" + rt.developerName + "'";
                    } else if (positionData && (positionData.source === 'Aura') && (!positionData.lastToken || positionData.lastToken.text !== '"') && (!positionData.nextToken || positionData.nextToken.text !== '"')) {
                        nameValue = '"' + rt.name + '"';
                        devNameValue = '"' + rt.developerName + '"';
                    } else if (positionData && (positionData.source === 'JS') && (!positionData.lastToken || (positionData.lastToken.text !== "'" && positionData.lastToken.text !== '"')) && (!positionData.nextToken || (positionData.nextToken.text !== "'" && positionData.nextToken.text !== '"'))) {
                        nameValue = "'" + rt.name + "'";
                        devNameValue = "'" + rt.developerName + "'";
                    } else {
                        nameValue = rt.name;
                        devNameValue = rt.developerName;
                    }
                    rtNameDocumentation.appendMarkdownSeparator();
                    rtNameDocumentation.appendMarkdownH4('Snippet');
                    rtNameDocumentation.appendApexCodeBlock(nameValue);
                    rtDevNameDocumentation.appendMarkdownSeparator();
                    rtDevNameDocumentation.appendMarkdownH4('Snippet');
                    rtDevNameDocumentation.appendApexCodeBlock(devNameValue);
                    const rtNameDetail = '`' + rt.name + '` Record Type Name. Select this option to replace with the record type name value. Replace `' + activationTokens.join('.') + '` with `' + nameValue + '`';
                    const nameOptions = ProviderUtils.getCompletionItemOptions(rtNameDetail, rtNameDocumentation.build(), nameValue, true, CompletionItemKind.Value);
                    const nameRtItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + rt.name, nameOptions);
                    const rtDevNameDetail = '`' + rt.developerName + '` Record Type Developer Name. Select this option to replace with the record type developer name value. Replace `' + activationTokens.join('.') + '` with `' + devNameValue + '`';
                    const devNameoptions = ProviderUtils.getCompletionItemOptions(rtDevNameDetail, rtNameDocumentation.build(), devNameValue, true, CompletionItemKind.Value);
                    const devNameRtItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + rt.developerName, devNameoptions);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        nameRtItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        devNameRtItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(nameRtItem);
                    items.push(devNameRtItem);
                }
            }
            const systemMetadata = applicationContext.parserData.namespacesData['system'];
            if (systemMetadata && systemMetadata['sobject']) {
                items = items.concat(ProviderUtils.getApexClassCompletionItems(position, systemMetadata['sobject']));
            }
        }
        return items;
    }

    static getQueryCompletionItems(position, activationInfo, activationTokens, positionData) {
        if (!Config.getConfig().autoCompletion.activeQuerySuggestion)
            return [];
        let sObjects = applicationContext.parserData.sObjectsData;
        let items = [];
        let sObject = positionData.query.from ? sObjects[positionData.query.from.textToLower] : undefined;
        if (sObject) {
            const existingFields = [];
            for (const projectionField of positionData.query.projection) {
                existingFields.push(projectionField.name.toLowerCase());
            }
            if (activationTokens.length > 0) {
                for (const activationToken of activationTokens) {
                    if (!activationToken)
                        continue;
                    let actToken = activationToken;
                    let fielData;
                    let idField = actToken + 'Id';
                    if (actToken.endsWith('__r'))
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    fielData = ProviderUtils.getFieldData(sObject, idField.toLowerCase()) || ProviderUtils.getFieldData(sObject, actToken);
                    if (fielData) {
                        if (fielData.referenceTo.length === 1) {
                            sObject = sObjects[fielData.referenceTo[0].toLowerCase()];
                        } else {
                            sObject = undefined;
                        }
                    }
                }
            }
            if (sObject) {
                for (const fieldKey of Object.keys(sObject.fields)) {
                    const field = sObject.fields[fieldKey];
                    if (existingFields.includes(fieldKey)) {
                        if (!StrUtils.contains(fieldKey, '.') && fieldKey.endsWith('__c')) {
                            continue;
                        }
                        if (!field.referenceTo || field.referenceTo.length === 0)
                            continue;
                    }
                    items = items.concat(ProviderUtils.getSObjectFieldCompletionItems(position, activationInfo, activationTokens, sObject, field, positionData));
                }
            }
        } else {
            Object.keys(applicationContext.parserData.sObjectsData).forEach(function (key) {
                const sObject = applicationContext.parserData.sObjectsData[key];
                const documentation = new MarkDownStringBuilder();
                let description = 'Standard SObject';
                if (sObject.custom)
                    description = 'Custom SObject';
                if (sObject.namespace) {
                    description += '\nNamespace: ' + sObject.namespace;
                }
                documentation.appendApexCodeBlock(sObject.name);
                documentation.appendMarkdown(description);
                const options = ProviderUtils.getCompletionItemOptions(sObject.name, documentation.build(), sObject.name, true, CompletionItemKind.Class);
                const item = ProviderUtils.createItemForCompletion(sObject.name, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                items.push(item);
            });
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

    static getAttribute(component, attributeName) {
        if (component) {
            for (const attribute of component.attributes) {
                if (Utils.isString(attribute.name) && attribute.name === attributeName)
                    return attribute;
                else if (Utils.isObject(attribute.name) && attribute.name.value.text === attributeName)
                    return attribute;
            }
        }
        return undefined;
    }

    static getVariable(method, varName) {
        if (method) {
            if (method.params[varName])
                return method.params[varName];
            if (method.variables[varName])
                return method.variables[varName];
        }
        return undefined;
    }

    static getClassField(node, varName) {
        if (node) {
            return node.variables[varName];
        }
        return undefined;
    }

    static getMethod(node, methodSignature) {
        if (node) {
            if (node.methods[methodSignature.toLowerCase()])
                return node.methods[methodSignature.toLowerCase()];
            else if (node.constructors[methodSignature.toLowerCase()])
                return node.constructors[methodSignature.toLowerCase()];
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
        let classes = applicationContext.parserData.userClassesData;
        return classes && classes[className.toLowerCase()];
    }

    static isSystemClass(className) {
        let classes = applicationContext.parserData.namespacesData['system'];
        return classes && classes[className.toLowerCase()];
    }

    static getSystemClass(ns, className) {
        if (applicationContext.parserData.namespacesData[ns.toLowerCase])
            return applicationContext.parserData.namespacesData[ns.toLowerCase][className];
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

    static getApexCompletionItems(position, activationTokens, activationInfo, node, positionData) {
        let items = [];
        const systemMetadata = applicationContext.parserData.namespacesData['system'];
        let sObject = applicationContext.parserData.sObjectsData[activationTokens[0].toLowerCase()];
        let lastClass = applicationContext.parserData.userClassesData[activationTokens[0].toLowerCase()] || systemMetadata[activationTokens[0].toLowerCase()] || node;
        if (lastClass && activationTokens[0].toLowerCase() === node.name.toLowerCase())
            lastClass = node;
        let parentStruct;
        let index = 0;
        for (let actToken of activationTokens) {
            if (index < activationTokens.length - 1) {
                let actType = ProviderUtils.getActivationType(actToken);
                let datatype;
                let className;
                if (sObject) {
                    let fielData;
                    let idField = actToken + 'Id';
                    if (actToken.endsWith('__r'))
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    fielData = ProviderUtils.getFieldData(sObject, idField.toLowerCase()) || ProviderUtils.getFieldData(sObject, actToken);
                    if (fielData) {
                        if (fielData.referenceTo.length === 1) {
                            sObject = applicationContext.parserData.sObjectsData[fielData.referenceTo[0].toLowerCase()];
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
                                    if (applicationContext.parserData.namespacesData[parentClassOrNs.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.parserData.namespacesData[parentClassOrNs.toLowerCase()];
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
                                    if (applicationContext.parserData.namespacesData[nsName.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.parserData.namespacesData[nsName.toLowerCase()];
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
                    if (lastClass.nodeType !== ApexNodeTypes.ENUM) {
                        if (actType.type === 'field') {
                            if (lastClass.positionData && lastClass.positionData.nodeType === ApexNodeTypes.METHOD) {
                                const method = ProviderUtils.getMethod(lastClass, lastClass.positionData.signature);
                                const methodVar = ProviderUtils.getVariable(method, actToken.toLowerCase());
                                const classVar = ProviderUtils.getClassField(lastClass, actToken.toLowerCase());
                                if (methodVar)
                                    datatype = methodVar.datatype.name;
                                else if (classVar)
                                    datatype = classVar.datatype.name;
                            } else {
                                const classVar = ProviderUtils.getClassField(lastClass, actToken.toLowerCase());
                                if (classVar)
                                    datatype = classVar.datatype.name;
                            }
                        } else if (actType.type === 'method') {
                            const method = ProviderUtils.getMethodFromCall(lastClass, actType.name, actType.params);
                            if (method)
                                datatype = method.datatype.name;
                        }
                        if (!datatype) {
                            if (lastClass.parentName) {
                                parentStruct = applicationContext.parserData.userClassesData[lastClass.parentName.toLowerCase()];
                                className = actToken;
                            } else {
                                if (applicationContext.parserData.userClassesData[actToken.toLowerCase()]) {
                                    lastClass = applicationContext.parserData.userClassesData[actToken.toLowerCase()];
                                    parentStruct = undefined;
                                    sObject = undefined;
                                } else if (systemMetadata[actToken.toLowerCase()]) {
                                    lastClass = systemMetadata[actToken.toLowerCase()];
                                    parentStruct = undefined;
                                    sObject = undefined;
                                } else if (applicationContext.parserData.sObjectsData[actToken.toLowerCase()]) {
                                    sObject = applicationContext.parserData.sObjectsData[actToken.toLowerCase()];
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
                                    if (applicationContext.parserData.userClassesData[parentClassOrNs.toLowerCase()]) {
                                        parentStruct = applicationContext.parserData.userClassesData[parentClassOrNs.toLowerCase()];
                                    } else if (applicationContext.parserData.namespacesData[parentClassOrNs.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.parserData.namespacesData[parentClassOrNs.toLowerCase()];
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
                                    if (applicationContext.parserData.userClassesData[parentClassName.toLowerCase()]) {
                                        parentStruct = applicationContext.parserData.userClassesData[parentClassName.toLowerCase()];
                                    } else if (applicationContext.parserData.namespacesData[nsName.toLowerCase()]) {
                                        let namespaceMetadata = applicationContext.parserData.namespacesData[nsName.toLowerCase()];
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
                                    parentStruct = applicationContext.parserData.userClassesData[lastClass.parentClass.toLowerCase()];
                                    className = datatype;
                                } else if (applicationContext.parserData.userClassesData[datatype.toLowerCase()]) {
                                    lastClass = applicationContext.parserData.userClassesData[datatype.toLowerCase()];
                                    sObject = undefined;
                                } if (systemMetadata[datatype.toLowerCase()]) {
                                    lastClass = systemMetadata[datatype.toLowerCase()];
                                    sObject = undefined;
                                } else if (applicationContext.parserData.sObjectsData[datatype.toLowerCase()]) {
                                    sObject = applicationContext.parserData.sObjectsData[datatype.toLowerCase()];
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
        if (sObject && Config.getConfig().autoCompletion.activeSobjectFieldsSuggestion) {
            items = items.concat(ProviderUtils.getSobjectsFieldsCompletionItems(position, activationInfo, activationTokens, sObject, positionData));
        } else if (lastClass && Config.getConfig().autoCompletion.activeApexSuggestion) {
            items = ProviderUtils.getApexClassCompletionItems(position, lastClass);
        }
        Utils.sort(items, ['label']);
        return items;
    }

    static getMethodFromCall(apexClass, name, params) {
        for (const methodName of Object.keys(apexClass.methods)) {
            const method = apexClass.methods[methodName];
            if (method.name.toLowerCase() === name.toLowerCase() && Utils.countKeys(method.params) === params.length)
                return method;
        }
        for (const constructName of Object.keys(apexClass.constructors)) {
            const construct = apexClass.constructors[constructName];
            if (construct.name.toLowerCase() === name.toLowerCase() && Utils.countKeys(construct.params) === params.length)
                return construct;
        }
        return undefined;
    }

    static getApexClassCompletionItems(position, node) {
        let items = [];
        if (node) {
            if (node.nodeType === ApexNodeTypes.ENUM) {
                for (const value of node.values) {
                    const options = ProviderUtils.getCompletionItemOptions('Enum Member', '', value.text, true, CompletionItemKind.EnumMember);
                    items.push(ProviderUtils.createItemForCompletion(value.text, options));
                }
            } else {
                if (node.positionData && (node.positionData.nodeType === ApexNodeTypes.METHOD || node.positionData.nodeType === ApexNodeTypes.CONSTRUCTOR)) {
                    const method = node.methods[node.positionData.signature.toLowerCase()];
                    const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                    const paramsTagData = tagsData['params'];
                    for (const paramName of Object.keys(method.params)) {
                        const param = method.params[paramName];
                        const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
                        let description = '';
                        if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                            for (const data of paramsTagData.tagData) {
                                if (data.keywords) {
                                    for (const keyword of paramsTagData.tag.keywords) {
                                        if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                            description += StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n') + '\n\n'
                                        }
                                    }
                                }
                            }
                        }
                        description += 'Type: ' + datatype;
                        const options = ProviderUtils.getCompletionItemOptions(datatype + ' ' + param.name, description, param.name, true, CompletionItemKind.Variable);
                        items.push(ProviderUtils.createItemForCompletion(param.name, options));
                    }
                    for (const varName of Object.keys(method.variables)) {
                        const variable = method.variables[varName];
                        const datatype = StrUtils.replace(variable.datatype.name, ',', ', ');
                        let description = '';
                        if (variable.description && variable.description.length > 0) {
                            description += StrUtils.replace(variable.description, '\n', '\n\n') + '\n\n';
                        } else if (variable.comment && variable.comment.description && variable.comment.description.length > 0) {
                            description += StrUtils.replace(variable.comment.description, '\n', '\n\n') + '\n\n';
                        }
                        description += 'Type: ' + datatype;
                        const options = ProviderUtils.getCompletionItemOptions(datatype + ' ' + variable.name, description, variable.name, true, CompletionItemKind.Variable);
                        items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                    }
                }
                for (const varName of Object.keys(node.variables)) {
                    const variable = node.variables[varName];
                    const datatype = StrUtils.replace(variable.datatype.name, ',', ', ');
                    let description = '';
                    if (variable.description && variable.description.length > 0) {
                        description += StrUtils.replace(variable.description, '\n', '\n\n') + '\n\n';
                    } else if (variable.comment && variable.comment.description && variable.comment.description.length > 0) {
                        description += StrUtils.replace(variable.comment.description, '\n', '\n\n') + '\n\n';
                    }
                    description += 'Type: ' + datatype;
                    if (variable.nodeType === ApexNodeTypes.PROPERTY) {
                        const options = ProviderUtils.getCompletionItemOptions('Class Property', description, variable.name, true, CompletionItemKind.Property);
                        items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                    } else if (variable.final) {
                        const options = ProviderUtils.getCompletionItemOptions('Class field', description, variable.name, true, CompletionItemKind.Constant);
                        items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                    } else {
                        const options = ProviderUtils.getCompletionItemOptions('Class field', description, variable.name, true, CompletionItemKind.Field);
                        items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                    }
                }
                for (const constructorName of Object.keys(node.constructors)) {
                    const construct = node.constructors[constructorName];
                    let insertText = construct.name + "(";
                    let snippetNum = 1;
                    let name = construct.name + "(";
                    let description = '';
                    if (construct.description && construct.description.length > 0) {
                        description += StrUtils.replace(construct.description, '\n', '\n\n') + '\n\n';
                    } else if (construct.comment && construct.comment.description && construct.comment.description.length > 0) {
                        description += StrUtils.replace(construct.comment.description, '\n', '\n\n');
                    }
                    if (Utils.hasKeys(construct.params)) {
                        const tagsData = TemplateUtils.getTagsDataBySource(['params'], construct.comment);
                        const paramsTagData = tagsData['params'];
                        description += '**Parameters**:   \n\n';
                        for (const paramName of Object.keys(construct.params)) {
                            const param = construct.params[paramName];
                            const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
                            description += '  - **' + param.name + '** `' + datatype + '`';
                            if (param.description) {
                                description += ' :' + StrUtils.replace(param.description, '\n', '\n\n') + '\n';
                            } else if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                                for (const data of paramsTagData.tagData) {
                                    if (data.keywords) {
                                        for (const keyword of paramsTagData.tag.keywords) {
                                            if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n') + '\n';
                                            }
                                        }
                                    }
                                }
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
                    }
                    name += ")";
                    insertText += ")";
                    let options = ProviderUtils.getCompletionItemOptions(construct.signature, description, new SnippetString(insertText), true, CompletionItemKind.Constructor);
                    items.push(ProviderUtils.createItemForCompletion(name, options));
                }
                for (const methodName of Object.keys(node.methods)) {
                    const method = node.methods[methodName];
                    const datatype = StrUtils.replace(method.datatype.name, ',', ', ');
                    let insertText = method.name + "(";
                    let snippetNum = 1;
                    let name = method.name + "(";
                    let description = '';
                    if (method.description && method.description.length > 0) {
                        description += method.description + '\n\n';
                    } else if (method.comment && method.comment.description && method.comment.description.length > 0) {
                        description += method.comment.description + '\n\n';
                    }
                    const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                    if (Utils.hasKeys(method.params)) {
                        const paramsTagData = tagsData['params'];
                        description += '**Parameters**:   \n\n';
                        for (const paramName of Object.keys(method.params)) {
                            const param = method.params[paramName];
                            const paramDatatype = StrUtils.replace(param.datatype.name, ',', ', ');
                            description += '  - **' + param.name + '** `' + paramDatatype + '`';
                            if (param.description) {
                                description += ' :' + StrUtils.replace(param.description, '\n', '\n\n') + '\n';
                            } else if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                                for (const data of paramsTagData.tagData) {
                                    if (data.keywords) {
                                        for (const keyword of paramsTagData.tag.keywords) {
                                            if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n') + '\n';
                                            }
                                        }
                                    }
                                }
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
                    }
                    if (method.datatype && method.datatype.name !== 'void') {
                        description += '**Return**  `' + method.datatype.name + '`';
                        const returnTagData = tagsData['return'];
                        if (returnTagData && returnTagData.tag && returnTagData.tagData && returnTagData.tagName) {
                            for (const data of returnTagData.tagData) {
                                if (data.keywords) {
                                    for (const keyword of returnTagData.tag.keywords) {
                                        if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                            description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n'); + '\n';
                                        }
                                    }
                                }
                            }
                        }
                    }
                    name += ")";
                    insertText += ")";
                    if (datatype === 'void')
                        insertText += ';';
                    const options = ProviderUtils.getCompletionItemOptions(method.signature, description, new SnippetString(insertText), true, CompletionItemKind.Method);
                    items.push(ProviderUtils.createItemForCompletion(name, options));
                }
                for (const className of Object.keys(node.classes)) {
                    const innerClass = node.classes[className];
                    const options = ProviderUtils.getCompletionItemOptions('Internal Class from : ' + node.name, (innerClass.description) ? innerClass.description : '', innerClass.name, true, CompletionItemKind.Class);
                    items.push(ProviderUtils.createItemForCompletion(innerClass.name, options));
                }
                for (const interfaceName of Object.keys(node.interfaces)) {
                    const innerInterface = node.interfaces[interfaceName];
                    const options = ProviderUtils.getCompletionItemOptions('Internal Interface from : ' + node.name, (innerInterface.description) ? innerInterface.description : '', innerInterface.name, true, CompletionItemKind.Interface);
                    items.push(ProviderUtils.createItemForCompletion(innerInterface.name, options));
                }
                for (const enumName of Object.keys(node.enums)) {
                    const innerEnum = node.enums[enumName];
                    const options = ProviderUtils.getCompletionItemOptions(innerEnum.name + ' Enum', (innerEnum.comment && innerEnum.comment.description) ? innerEnum.comment.description : '', innerEnum.name, true, CompletionItemKind.Enum);
                    items.push(ProviderUtils.createItemForCompletion(innerEnum.name, options));
                }
                if (node.extends) {
                    let parentClasss = node;
                    while (!parentClasss.extends) {
                        items = items.concat(ProviderUtils.getApexClassCompletionItems(position, parentClasss));
                        parentClasss = parentClasss.extends;
                    }
                }
                if (Utils.hasKeys(node.implements)) {
                    for (const imp of Object.keys(node.implements)) {
                        items = items.concat(ProviderUtils.getApexClassCompletionItems(position, node.implements[imp]));
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
            options.documentation = new MarkDownStringBuilder().build();
        else if (Utils.isString(options.documentation))
            options.documentation = new MarkDownStringBuilder().appendMarkdown(options.documentation).build();
        if (options && options.type)
            type = options.type;
        const item = new CompletionItem(name, type);
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

    static getAllAvailableCompletionItems(position, activationInfo, node) {
        let items = [];
        if (Config.getConfig().autoCompletion.activeApexSuggestion) {
            const systemMetadata = applicationContext.parserData.namespacesData['system'];
            items = ProviderUtils.getApexClassCompletionItems(position, node)
            Object.keys(applicationContext.parserData.userClassesData).forEach(function (key) {
                const userClass = applicationContext.parserData.userClassesData[key];
                const className = (userClass.name) ? userClass.name : userClass;
                let description = '';
                if (userClass.comment && userClass.comment.description && userClass.comment.description.length > 0) {
                    description += userClass.comment.description + '\n\n';
                } else {
                    description = className;
                }
                if (userClass.nodeType === ApexNodeTypes.ENUM) {
                    const enumValues = [];
                    for (const value of userClass.values) {
                        if (Utils.isString(value))
                            enumValues.push('  - `' + value + '`');
                        else
                            enumValues.push('  - `' + value.text + '`');
                    }
                    description += '\n\nEnum Values: \n' + enumValues.join('\n');
                    const options = ProviderUtils.getCompletionItemOptions(className, description, className, true, CompletionItemKind.Enum);
                    const item = ProviderUtils.createItemForCompletion(className, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                } else if (userClass.nodeType === ApexNodeTypes.INTERFACE) {
                    const options = ProviderUtils.getCompletionItemOptions(className, description, className, true, CompletionItemKind.Interface);
                    const item = ProviderUtils.createItemForCompletion(className, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                } else {
                    const options = ProviderUtils.getCompletionItemOptions(className, description, className, true, CompletionItemKind.Class);
                    const item = ProviderUtils.createItemForCompletion(className, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                }
            });
            Object.keys(systemMetadata).forEach(function (key) {
                const systemClass = systemMetadata[key];
                if (systemClass.nodeType === ApexNodeTypes.ENUM) {
                    const enumValues = [];
                    for (const value of systemClass.values) {
                        if (Utils.isString(value))
                            enumValues.push('  - `' + value + '`');
                        else
                            enumValues.push('  - `' + value.text + '`');
                    }
                    const description = systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '') + '\n\nEnum Values: \n' + enumValues.join('\n');
                    const options = ProviderUtils.getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Enum);
                    const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                } else if (systemClass.nodeType === ApexNodeTypes.INTERFACE) {
                    const description = systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '');
                    const options = ProviderUtils.getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Interface);
                    const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                } else {
                    const description = systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '');
                    const options = ProviderUtils.getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Class);
                    const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    items.push(item);
                }
            });
            for (const ns of applicationContext.parserData.namespaces) {
                const options = ProviderUtils.getCompletionItemOptions('Salesforce Namespace', undefined, ns, true, CompletionItemKind.Module);
                const item = ProviderUtils.createItemForCompletion(ns, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                items.push(item);
            }
        }
        if (Config.getConfig().autoCompletion.activeSObjectSuggestion) {
            Object.keys(applicationContext.parserData.sObjectsData).forEach(function (key) {
                const sObject = applicationContext.parserData.sObjectsData[key];
                let description = 'Standard SObject';
                if (sObject.custom)
                    description = 'Custom SObject';
                if (sObject.namespace) {
                    description += '\nNamespace: ' + sObject.namespace;
                }
                const options = ProviderUtils.getCompletionItemOptions(sObject.name, description, sObject.name, true, CompletionItemKind.Class);
                const item = ProviderUtils.createItemForCompletion(sObject.name, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                items.push(item);
            });
        }
        Utils.sort(items, ['label']);
        return items;
    }

    static getCustomLabels() {
        let labels = [];
        let labelsFile = Paths.getProjectMetadataFolder() + '/labels/CustomLabels.labels-meta.xml';
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
module.exports = ProviderUtils;