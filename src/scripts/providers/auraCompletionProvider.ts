import * as vscode from 'vscode';
import { Logger } from "../utils/logger";
import { Config } from '../core/config';
import { applicationContext } from '../core/applicationContext';
import { ActivationToken, ProviderActivationInfo, ProviderUtils } from './utils';
import { MarkDownStringBuilder } from '../output';
const { AuraAttribute, Token } = require('@aurahelper/core').Types;
const Range = vscode.Range;
const Position = vscode.Position;
const { FileChecker, FileReader, PathUtils } = require('@aurahelper/core').FileSystem;
const { AuraBundleAnalyzer, AuraParser, AuraTokenType } = require('@aurahelper/languages').Aura;
const { AuraNodeTypes } = require('@aurahelper/core').Values;
const { Utils } = require('@aurahelper/core').CoreUtils;
const SnippetString = vscode.SnippetString;
const CompletionItemKind = vscode.CompletionItemKind;
const auraIdAttribute = new AuraAttribute();
auraIdAttribute.name = {
    name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, 'name', new Position(0, 0), new Position(0, 'name'.length)),
    value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, 'aura:id', new Position(0, 0), new Position(0, 'aura:id'.length)),
};
auraIdAttribute.type = {
    name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, 'type', new Position(0, 0), new Position(0, 'type'.length)),
    value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, 'String', new Position(0, 0), new Position(0, 'String'.length)),
};
auraIdAttribute.description = {
    name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, 'description', new Position(0, 0), new Position(0, 'description'.length)),
    value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, 'Aura ID of the component', new Position(0, 0), new Position(0, 'Aura ID of the component'.length)),
};
auraIdAttribute.access = {
    name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, 'access', new Position(0, 0), new Position(0, 'access'.length)),
    value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, 'global', new Position(0, 0), new Position(0, 'global'.length)),
};
auraIdAttribute.namespace = 'aura';

export class AuraCompletionProvider implements vscode.CompletionItemProvider<vscode.CompletionItem> {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return new Promise(function (resolve) {
            let items;
            try {
                if (FileChecker.isAuraComponent(document.uri.fsPath)) {
                    items = provideAuraComponentCompletion(document, position);
                }
            } catch (error) {
                Logger.error(error);
            }
            resolve(items);
        });
    }

    static register(): void {
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "xml" }, new AuraCompletionProvider(), '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "html" }, new AuraCompletionProvider(), '.'));
    }
}

function provideAuraComponentCompletion(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
    let items: vscode.CompletionItem[] | undefined = [];
    const orgNamespace = Config.getNamespace();
    const componentInitTag = (orgNamespace) ? orgNamespace + ':' : 'c:';
    const activationInfo = ProviderUtils.getActivation(document, position);
    const activationTokens = activationInfo.activationTokens;
    const auraSnippets = (activationTokens.length > 0) ? getSnippets(applicationContext.snippets.aura, activationTokens[0].activation) : undefined;
    const sldsSnippets = (activationTokens.length > 0) ? getSnippets(applicationContext.snippets.slds, activationTokens[0].activation) : undefined;
    const component = new AuraBundleAnalyzer(document.uri.fsPath, applicationContext.parserData).setActiveFile(document.uri.fsPath).setContent(FileReader.readDocument(document)).setTabSize(Config.getTabSize()).analize(ProviderUtils.fixPositionOffset(document, position));
    if (component.positionData && component.positionData.query) {
        // Code for support completion on queries   
        items = ProviderUtils.getQueryCompletionItems(position, activationInfo, activationTokens, component.positionData);
    } else if (auraSnippets || sldsSnippets) {
        // Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
        items = getSnippetsCompletionItems(position, activationInfo, auraSnippets || sldsSnippets);
    } else if (activationTokens.length > 0 && activationTokens[0].activation.toLowerCase() === 'label') {
        items = getLabelsCompletionItems(position, activationInfo, activationTokens);
    } else if (activationTokens.length > 0 && activationTokens[0].activation === 'v') {
        // Code for completions when user types v.
        if (!Config.getConfig().autoCompletion!.activeAttributeSuggest) {
            return [];
        }
        const attribute = activationTokens.length > 1 ? ProviderUtils.getAttribute(component, activationTokens[1].activation) : undefined;
        if (attribute) {
            items = getComponentAttributeMembersCompletionItems(position, activationInfo, activationTokens, attribute, component.positionData);
        } else {
            items = getAttributesCompletionItems(position, activationInfo, component);
        }
    } else if (activationTokens.length > 0 && (activationTokens[0].activation === 'c')) {
        // Code for completions when user types c.
        if (!Config.getConfig().autoCompletion!.activeControllerFunctionsSuggest) {
            return [];
        }
        items = getControllerFunctionsCompletionItems(position, activationInfo, component);
    } else if (activationTokens.length === 1 && activationTokens[0].activation === componentInitTag) {
        if (!Config.getConfig().autoCompletion!.activeComponentSuggest) {
            return [];
        }
        // Code for completions when user types c:
        items = getComponentsCompletionItems(position, document, activationInfo);
    } else {
        if (component.positionData && component.positionData.tagData) {
            // Code for completions when position is on a start standard component tag <ns:componentName >
            if (!Config.getConfig().autoCompletion!.activeComponentCallSuggest) {
                return [];
            }
            if (!component.positionData.isOnAttributeValue) {
                // Code for completions when position is on attribute value (position to put attributes) <ns:componentName attr="value" [thispos] attr="value">
                items = getComponentsAttributesCompletionItems(component);
            } else if (component.positionData.isOnAttributeValue) {
                // Code for completions when position is on attribute param value and value is empty <ns:componentName attr="[thispos]" attr="value">
                items = getAttributeTypesCompletionItems(position, activationInfo, activationTokens, component);
            }
        }
        if (!items || items.length === 0) {
            if (activationTokens.length > 0) {
                items = ProviderUtils.getApexCompletionItems(position, activationInfo, undefined, component.positionData);
                if (activationInfo.activationTokens.length === 1 && !activationInfo.activationTokens[0].isQuery && activationInfo.activationTokens[0].nextToken && activationInfo.activationTokens[0].nextToken.text !== '.') {
                    items = items.concat(ProviderUtils.getAllAvailableCompletionItems(position, activationInfo));
                }
            } else {
                items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo);
            }
        }
    }
    return items;
}

function getSnippetsCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, snippets: any[]): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    for (const snippet of snippets) {
        const documentation = new MarkDownStringBuilder().appendMarkdown(snippet.description + '\n\n');
        documentation.appendMarkdownSeparator();
        documentation.appendMarkdownH4('Snippet');
        documentation.appendHTMLCodeBlock(snippet.body.join('\n'));
        const options = ProviderUtils.getCompletionItemOptions(snippet.name, documentation.build(), new SnippetString(snippet.body.join('\n')), true, CompletionItemKind.Snippet);
        const item = ProviderUtils.createItemForCompletion(snippet.prefix, options);
        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
        }
        items.push(item);
    }
    return items;
}

function getLabelsCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[]): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const orgNamespace = Config.getNamespace() || 'c';
    if (activationTokens.length === 1 || activationTokens.length === 2) {
        let labels = ProviderUtils.getCustomLabels();
        for (const label of labels) {
            const documentation = new MarkDownStringBuilder();
            documentation.appendMarkdown(label.shortDescription + '\n\n');
            documentation.appendMarkdown('\n\n  - **Name**: `' + label.fullName + '`\n');
            documentation.appendMarkdown('  - **Value**: `' + label.value + '`\n');
            if (label.categories) {
                documentation.appendMarkdown('  - **Category**: `' + label.categories + '`\n');
            }
            documentation.appendMarkdown('  - **Language**: `' + label.language + '`\n');
            documentation.appendMarkdown('  - **Protected**: `' + label.protected + '`\n\n');
            documentation.appendMarkdownSeparator();
            documentation.appendMarkdownH4('Snippet');
            documentation.appendHTMLCodeBlock('{!$Label.' + orgNamespace + '.' + label.fullName + '}');
            const options = ProviderUtils.getCompletionItemOptions(label.fullName, documentation.build(), '{!$Label.' + orgNamespace + '.' + label.fullName + '}', true, CompletionItemKind.Field);
            const item = ProviderUtils.createItemForCompletion('Label.' + label.fullName, options);
            if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
            }
            items.push(item);
        }
    }
    return items;
}

function getComponentAttributeMembersCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], attribute: any, positionData: any): vscode.CompletionItem[] | undefined {
    let items: vscode.CompletionItem[] | undefined;
    const sObject = applicationContext.parserData.sObjectsData[attribute.type.toLowerCase()];
    if (sObject) {
        if (!Config.getConfig().autoCompletion!.activeSobjectFieldsSuggestion) {
            return [];
        }
        if (activationTokens.length >= 2) {
            let lastObject = sObject;
            let index = 0;
            for (const activationToken of activationTokens) {
                let actToken = activationToken.activation;
                if (index > 1) {
                    let fielData;
                    let idField = actToken + 'Id';
                    if (actToken.endsWith('__r')) {
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    }
                    fielData = ProviderUtils.getFieldData(sObject, idField.toLowerCase()) || ProviderUtils.getFieldData(sObject, actToken);
                    if (fielData) {
                        if (fielData.referenceTo.length === 1) {
                            lastObject = applicationContext.parserData.sObjectsData[fielData.referenceTo[0].toLowerCase()];
                        } else {
                            lastObject = undefined;
                        }
                    }
                }
                index++;
            }
            items = ProviderUtils.getSobjectCompletionItems(position, activationInfo, activationTokens, lastObject, positionData);
        }
        Utils.sort(items, ['label']);
    } else {
        // include Apex Classes Completion
    }
    return items;
}

function getAttributesCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, component: any): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    for (const attribute of component.attributes) {
        let detail;
        let doc = '';
        if (attribute.description && attribute.description.value.text) {
            doc += attribute.description.value.text + '\n\n';
        }
        if (attribute.type && attribute.type.value.text) {
            doc += 'Type: `' + attribute.type.value.text + '`\n\n';
            detail = 'Type: ' + attribute.type.value.text + '';
        }
        let insertText = '';
        if (!activationInfo.twoLastToken || (activationInfo.twoLastToken && activationInfo.twoLastToken.text !== '{')) {
            insertText += '{';
        }
        if (!activationInfo.lastToken || (activationInfo.lastToken && activationInfo.lastToken.text !== '!')) {
            insertText += '!';
        }
        insertText += 'v.' + attribute.name.value.text;
        if (!activationInfo.nextToken || (activationInfo.nextToken && activationInfo.nextToken.text !== '}')) {
            insertText += '}';
        }
        let htmlCodeBlock = '<aura:attribute ';
        if (attribute.name) {
            htmlCodeBlock += attribute.name.name.text + '="' + attribute.name.value.text + '" ';
        }
        if (attribute.type) {
            htmlCodeBlock += attribute.type.name.text + '="' + attribute.type.value.text + '" ';
        }
        if (attribute.default) {
            htmlCodeBlock += attribute.default.name.text + '="' + attribute.default.value.text + '" ';
        }
        if (attribute.access) {
            htmlCodeBlock += attribute.access.name.text + '="' + attribute.access.value.text + '" ';
        }
        if (attribute.description) {
            htmlCodeBlock += attribute.description.name.text + '="' + attribute.description.value.text + '" ';
        }
        htmlCodeBlock += '/>';
        const documentation = new MarkDownStringBuilder().appendMarkdown(doc).appendHTMLCodeBlock(htmlCodeBlock);
        documentation.appendMarkdownSeparator();
        documentation.appendMarkdownH4('Snippet');
        documentation.appendHTMLCodeBlock(insertText);
        const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), insertText, true, CompletionItemKind.Field);
        const item = ProviderUtils.createItemForCompletion('v.' + attribute.name.value.text, options);
        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
        }
        items.push(item);
    }
    Utils.sort(items, ['label']);
    return items;
}

function getControllerFunctionsCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, component: any): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    for (const func of component.controllerFunctions) {
        let detail = "Aura Controller Function";
        const documentation = new MarkDownStringBuilder();
        documentation.appendJSCodeBlock(func.auraSignature);
        if (func.comment) {
            documentation.appendMarkdown(func.comment.description + '\n\n');
            for (let i = 0; i < func.params.length; i++) {
                const param = func.params[i];
                const commentData = func.comment.params[param.text];
                if (commentData) {
                    documentation.appendMarkdown('  - *@param* ');
                    documentation.appendMarkdown('`' + param.text + '` &mdash; ' + commentData.description + '  ');
                    if (i < func.params.length - 1) {
                        documentation.appendMarkdown('\n');
                    }
                }
            }
            documentation.appendMarkdown("\n");
        } else {
            documentation.appendMarkdown(detail + '\n\n');
        }
        let insertText = '';
        if (!activationInfo.twoLastToken || (activationInfo.twoLastToken && activationInfo.twoLastToken.text !== '{')) {
            insertText += '{';
        }
        if (!activationInfo.lastToken || (activationInfo.lastToken && activationInfo.lastToken.text !== '!')) {
            insertText += '!';
        }
        insertText += 'c.' + func.name;
        if (!activationInfo.nextToken || (activationInfo.nextToken && activationInfo.nextToken.text !== '}')) {
            insertText += '}';
        }
        documentation.appendMarkdownSeparator();
        documentation.appendMarkdownH4('Snippet');
        documentation.appendHTMLCodeBlock(insertText);
        const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), insertText, true, CompletionItemKind.Function);
        const item = ProviderUtils.createItemForCompletion('c.' + func.name, options);
        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
        }
        items.push(item);
    }
    Utils.sort(items, ['label']);
    return items;
}

function getComponentsCompletionItems(position: vscode.Position, document: vscode.TextDocument, activationInfo: ProviderActivationInfo): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const auraFolder = PathUtils.getDirname(PathUtils.getDirname(document.uri.fsPath));
    const folders = FileReader.readDirSync(auraFolder);
    const orgNamespace = Config.getNamespace();
    for (const folder of folders) {
        if (!FileChecker.isDirectory(auraFolder + '/' + folder)) {
            continue;
        }
        let files = FileReader.readDirSync(auraFolder + '/' + folder);
        let isApp;
        let node;
        for (const file of files) {
            if (file.indexOf('.cmp') !== -1) {
                node = new AuraParser(auraFolder + '/' + folder + '/' + file).parse();
                break;
            } else if (file.indexOf('.evt') !== -1) {
                node = new AuraParser(auraFolder + '/' + folder + '/' + file).parse();
                break;
            } else if (file.indexOf('.app') !== -1) {
                node = new AuraParser(auraFolder + '/' + folder + '/' + file).parse();
                break;
            }
        }

        let name = (orgNamespace ? orgNamespace : 'c') + ':' + folder;
        let detail = '';
        const documentation = new MarkDownStringBuilder();
        if (node.nodeType === AuraNodeTypes.COMPONENT) {
            detail = 'Aura Component';
        } else if (node.nodeType === AuraNodeTypes.APPLICATION && node.type && node.type.value.textToLower === 'component') {
            detail = 'Aura Component Event';
        } else if (node.nodeType === AuraNodeTypes.APPLICATION && node.type && node.type.value.textToLower === 'application') {
            detail = 'Aura Application Event';
        } else if (isApp) {
            detail = 'Aura Application';
        }
        documentation.appendMarkdown(detail + ' `' + folder + '`\n\n');
        if (node.description) {
            documentation.appendMarkdown(node.description.text + '\n\n');
        }
        let insertText = '';
        if (!activationInfo.lastToken || (activationInfo.lastToken && activationInfo.lastToken.text !== '<' && activationInfo.lastToken.text !== '"')) {
            insertText += '<';
        }
        insertText += activationInfo.activation + folder;
        if (activationInfo.nextToken && activationInfo.nextToken.text !== '"') {
            insertText += ' ';
        }
        insertText += ' $0';
        if (!activationInfo.nextToken) {
            insertText += '/>';
        }
        if (node.attributes && node.attributes.length > 0) {
            documentation.appendMarkdown('#### Attributes\n\n');
            for (const attribute of node.attributes) {
                documentation.appendMarkdown('  - ');
                if (attribute.name) {
                    documentation.appendMarkdown('*' + attribute.name.value.text + '* ');
                }
                if (attribute.type) {
                    documentation.appendMarkdown('`' + attribute.type.value.text + '` ');
                }
                if (attribute.description) {
                    documentation.appendMarkdown('&mdash; ' + attribute.description.value.text);
                }
                documentation.appendMarkdown('  \n');
            }
            documentation.appendMarkdown('\n');
        }
        documentation.appendMarkdownSeparator();
        documentation.appendMarkdownH4('Snippet');
        documentation.appendHTMLCodeBlock(insertText);
        const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), new SnippetString(insertText), true, CompletionItemKind.Module);
        const item = ProviderUtils.createItemForCompletion(name, options);
        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
        }
        items.push(item);
    }
    Utils.sort(items, ['label']);
    return items;
}

function getComponentsAttributesCompletionItems(component: any): vscode.CompletionItem[] {
    const baseComponentsDetail = applicationContext.componentsDetail;
    const items: vscode.CompletionItem[] = [];
    if (!component.positionData.tagData.attributes['aura:id']) {
        items.push(getCodeCompletionItemAttribute(auraIdAttribute));
    }
    if (component.attributes) {
        for (const attribute of component.attributes) {
            if (attribute.name && !component.positionData.tagData.attributes[attribute.name.name.text]) {
                items.push(getCodeCompletionItemAttribute(attribute));
            }
        }
    }
    if (baseComponentsDetail.notRoot[component.namespace] && !baseComponentsDetail.notRoot[component.namespace].includes(component.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            const newAttribute = new AuraAttribute();
            for (const field of Object.keys(attribute)) {
                newAttribute[field] = {
                    name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, field, new Position(0, 0), new Position(0, field.length)),
                    value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, attribute[field].toString(), new Position(0, 0), new Position(0, attribute[field].length)),
                };
            }
            items.push(getCodeCompletionItemAttribute(newAttribute));
        }
    }
    if (baseComponentsDetail[component.positionData.tagData.namespace]) {
        let baseComponentNS = baseComponentsDetail[component.positionData.tagData.namespace];
        if (baseComponentNS[component.positionData.tagData.name]) {
            for (const attribute of baseComponentNS[component.positionData.tagData.name]) {
                const existingAttributes = component.positionData.tagData.attributes;
                if (!existingAttributes[attribute.name.toLowerCase()]) {
                    const newAttribute = new AuraAttribute();
                    for (const field of Object.keys(attribute)) {
                        newAttribute[field] = {
                            name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, field, new Position(0, 0), new Position(0, field.length)),
                            value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, attribute[field].toString(), new Position(0, 0), new Position(0, attribute[field].length)),
                        };
                    }
                    items.push(getCodeCompletionItemAttribute(newAttribute));
                }
            }
        }
    }
    for (const rootElement of getRootItems(component, 'css')) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(component, 'input')) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(component, 'html')) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(component, 'select')) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(component, 'inputField')) {
        items.push(rootElement);
    }
    Utils.sort(items, ['label']);
    return items;
}

function getCodeCompletionItemAttribute(attribute: any): vscode.CompletionItem {
    const detail = (attribute.type && attribute.type.value.text) ? ('Type: ' + attribute.type.value.text) : '';
    let insertText;
    const documentation = new MarkDownStringBuilder();
    if (attribute.description) {
        documentation.appendMarkdown(attribute.description.value.text + '\n\n');
    }
    if (attribute.type) {
        documentation.appendMarkdown('Type: `' + attribute.type.value.text + '`\n\n');
    }
    if (attribute.type && attribute.type.value.text === 'action') {
        insertText = new SnippetString(attribute.name.value.text + '="${1:jsAction}" $0');
    } else if (attribute.type) {
        insertText = new SnippetString(attribute.name.value.text + '="${1:' + attribute.type.value.text + '}" $0');
    } else {
        insertText = new SnippetString(attribute.name.value.text + '="$1" $0');
    }
    documentation.appendMarkdownSeparator();
    documentation.appendMarkdownH4('Snippet');
    documentation.appendHTMLCodeBlock(insertText.value);
    const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), insertText, true, CompletionItemKind.Field);
    const item = ProviderUtils.createItemForCompletion(attribute.name.value.text, options);
    /*if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);*/
    return item;
}

function getRootItems(component: any, rootElement: any): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    if (applicationContext.componentsDetail.components[component.positionData.tagData.namespace] && applicationContext.componentsDetail.components[component.positionData.tagData.namespace][rootElement]) {
        let rootAttributes = applicationContext.componentsDetail.components[component.positionData.tagData.namespace][rootElement];
        if (rootAttributes.includes(component.positionData.tagData.name)) {
            for (const attribute of applicationContext.componentsDetail['root'][rootElement]) {
                const existingAttributes = component.positionData.tagData.attributes;
                if (!existingAttributes[attribute.name.toLowerCase()]) {
                    const newAttribute = new AuraAttribute();
                    for (const field of Object.keys(attribute)) {
                        newAttribute[field] = {
                            name: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE, field, new Position(0, 0), new Position(0, field.length)),
                            value: new Token(AuraTokenType.ENTITY.TAG.ATTRIBUTE_VALUE, attribute[field].toString(), new Position(0, 0), new Position(0, attribute[field].length)),
                        };
                    }
                    items.push(getCodeCompletionItemAttribute(newAttribute));
                }
            }
        }
    }
    return items;
}

function getAttributeTypesCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], component: any): vscode.CompletionItem[] {
    let items: vscode.CompletionItem[] = [];
    const baseComponentsDetail = applicationContext.componentsDetail;
    const baseAttributes = getBaseComponentAttributes(component.positionData.tagData);
    const attributeData = baseAttributes[component.positionData.activeAttributeName];
    if (attributeData) {
        if (component.positionData.tagData.namespace === "aura" && component.positionData.tagData.name === "attribute" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const dataType of baseComponentsDetail.datatypes) {
                const options = ProviderUtils.getCompletionItemOptions("Attribute Datatype", '', dataType, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(dataType, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
            if (activationTokens.length > 1) {
                items = items.concat(ProviderUtils.getApexCompletionItems(position, activationInfo, undefined, component.positionData));
            } else {
                items = items.concat(ProviderUtils.getAllAvailableCompletionItems(position, activationInfo));
            }
        } else if ((attributeData.name === 'pullToBoundary' || attributeData.name === 'size' || attributeData.name === 'iconSize') && attributeData.type.toLowerCase() === 'string') {
            for (const size of baseComponentsDetail.sizes) {
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "avatar" || component.positionData.tagData.name === "buttonIcon") && size === "x-smal" && size !== 'small' && size !== 'medium' && size !== 'large') {
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonIconStateful" && size !== 'xx-small' && size === "x-smal" && size !== 'small' && size !== 'medium') {
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonMenu" && size === "x-smal" && size !== 'small' && size !== 'medium' && size !== 'large') {
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "layout" || component.positionData.tagData.name === "spinner") && size !== 'small' && size !== 'medium' && size !== 'large') {
                    continue;
                }
                const options = ProviderUtils.getCompletionItemOptions("SLDS " + size + " Size", undefined, size, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(size, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'access' && attributeData.type.toLowerCase() === 'string') {
            for (const access of baseComponentsDetail.access) {
                const options = ProviderUtils.getCompletionItemOptions("Attribute / Component access", undefined, access, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(access, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'flexibility' && attributeData.type.toLowerCase() === 'object') {
            for (const flexibility of baseComponentsDetail.flexibilities) {
                const options = ProviderUtils.getCompletionItemOptions("Flexibility Value", undefined, flexibility, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(flexibility, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'timeZoneName' && attributeData.type.toLowerCase() === 'string') {
            for (const timeZoneName of baseComponentsDetail.timeZoneNames) {
                const options = ProviderUtils.getCompletionItemOptions("Time Zone Style", undefined, timeZoneName, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(timeZoneName, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'padding' && attributeData.type.toLowerCase() === 'string') {
            for (const padding of baseComponentsDetail.paddings) {
                const options = ProviderUtils.getCompletionItemOptions("Padding Value", undefined, padding, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(padding, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'density' && attributeData.type.toLowerCase() === 'string') {
            for (const density of baseComponentsDetail.densities) {
                const options = ProviderUtils.getCompletionItemOptions("Density Value", undefined, density, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(density, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'severity' && attributeData.type.toLowerCase() === 'string') {
            for (const severity of baseComponentsDetail.severities) {
                const options = ProviderUtils.getCompletionItemOptions("Severity Value", undefined, severity, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(severity, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if ((attributeData.name === 'sortedDirection' || attributeData.name === 'defaultSortDirection') && attributeData.type.toLowerCase() === 'string') {
            for (const sort of baseComponentsDetail.sortValues) {
                const options = ProviderUtils.getCompletionItemOptions("Sort Value", undefined, sort, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(sort, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.type.toLowerCase() === 'boolean') {
            for (const boolValue of baseComponentsDetail.booleans) {
                const options = ProviderUtils.getCompletionItemOptions("Boolean Value", undefined, boolValue, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(boolValue, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.type.toLowerCase() === 'action') {
            for (const func of component.controllerFunctions) {
                const options = ProviderUtils.getCompletionItemOptions("Aura Controller Function", func.auraSignature, '{!c.' + func.name + '}', true, CompletionItemKind.Function);
                const item = ProviderUtils.createItemForCompletion(func.name, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (attributeData.name === 'variant' && attributeData.type.toLowerCase() === 'string') {
            for (const variant of baseComponentsDetail.variants) {
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "outputField" || component.positionData.tagData.name === "slider") && variant !== 'standard' && variant !== 'label-hidden'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "path" || component.positionData.tagData.name === "picklistPath") && variant !== 'linear' && variant !== 'non-linear'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "avatar" && variant !== 'circle' && variant !== 'square'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "spinner" && variant !== 'base' && variant !== 'brand' && variant !== 'inverse'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "tabset" && variant !== 'default' && variant !== 'scoped' && variant !== 'vertical'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "progressIndicator" && variant !== 'base' && variant !== 'shaded'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "progressBar" && variant !== 'base' && variant !== 'circular'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "inputRichText" && variant !== 'bottom-toolbar'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "textarea" || component.positionData.tagData.name === "select" || component.positionData.tagData.name === "radioGroup" || component.positionData.tagData.name === "inputName" || component.positionData.tagData.name === "inputLocation" || component.positionData.tagData.name === "checkboxGroup" || component.positionData.tagData.name === "combobox" || component.positionData.tagData.name === "input" || component.positionData.tagData.name === "inputAddress") && variant !== 'standard' && variant !== 'label-hidden' && variant !== 'label-inline' && variant !== 'label-stacked'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "card" && variant !== 'base' && variant !== 'narrow'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "button" || component.positionData.tagData.name === "buttonStateful") && variant !== 'base' && variant !== 'neutral' && variant !== 'brand' && variant !== 'destructive' && variant !== 'inverse' && variant !== 'success'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonIcon" && variant !== 'bare' && variant !== 'container' && variant !== 'brand' && variant !== 'border' && variant !== 'border-filled' && variant !== 'bare-inverse' && variant !== 'border-inverse'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonIconStateful" && variant !== 'border' && variant !== 'border-filled' && variant !== 'border-inverse'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonMenu" && variant !== 'bare' && variant !== 'container' && variant !== 'border' && variant !== 'border-filled' && variant !== 'bare-inverse' && variant !== 'border-inverse'){
                    continue;
                }
                const options = ProviderUtils.getCompletionItemOptions("Variant Value", undefined, variant, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(variant, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if ((attributeData.name === 'type' || attributeData.name === 'buttonType') && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.buttonTypes) {
                if (component.positionData.tagData.namespace === "lightning" && (component.positionData.tagData.name === "button" || component.positionData.tagData.name === "buttonIcon") && type !== 'button' && type !== 'reset' && type !== 'submit'){
                    continue;
                }
                if (component.positionData.tagData.namespace === "ui" && (component.positionData.tagData.name === "button") && type !== 'button' && type !== 'reset' && type !== 'submit'){
                    continue;
                }
                const options = ProviderUtils.getCompletionItemOptions("Button Type Value", undefined, type, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(type, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if ((attributeData.name === 'alignmentBump' || attributeData.name === 'verticalAlign' || attributeData.name === 'horizontalAlign' || attributeData.name === 'menuAlignment' || attributeData.name === 'iconPosition' || attributeData.name === 'dropdownAlignment') && attributeData.type.toLowerCase() === 'string') {
            for (const componentPosition of baseComponentsDetail.positions) {
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "button" && componentPosition !== "left" && componentPosition !== "right"){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "layoutItem" && componentPosition !== "left" && componentPosition !== "right" && componentPosition !== "top" && componentPosition !== "bottom"){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "layoutcomponent" && attributeData.name === 'horizontalAlign' && componentPosition !== "center" && componentPosition !== "space" && componentPosition !== "spread" && componentPosition !== "end"){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "layoutcomponent" && attributeData.name === 'verticalAlign' && componentPosition !== "start" && componentPosition !== "center" && componentPosition !== "end" && componentPosition !== "stretch"){
                    continue;
                }
                if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "buttonMenu" && componentPosition !== "left" && componentPosition !== "right" && componentPosition !== "auto" && componentPosition !== "center" && componentPosition !== "bottom-left" && componentPosition !== "bottom-center" && componentPosition !== "bottom-right"){
                    continue;
                }
                let detail;
                if (attributeData.name === 'alignmentBump' || attributeData.name === 'verticalAlign' || attributeData.name === 'horizontalAlign' || attributeData.name === 'menuAlignment' || attributeData.name === 'dropdownAlignment'){
                    detail = "Allignment Value";
                } else{
                    detail = "Icon Position Value";
                }
                const options = ProviderUtils.getCompletionItemOptions(detail, undefined, componentPosition, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(componentPosition, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "dynamicIcon" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.dynamicIcons) {
                const options = ProviderUtils.getCompletionItemOptions('Dynamic Icon Type', undefined, type, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(type, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "formattedName" && attributeData.name === 'format' && attributeData.type.toLowerCase() === 'string') {
            for (const format of baseComponentsDetail.nameFormats) {
                const options = ProviderUtils.getCompletionItemOptions('Name Format', undefined, format, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(format, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "formattedNumber" && attributeData.name === 'style' && attributeData.type.toLowerCase() === 'string') {
            for (const style of baseComponentsDetail.numberStyles) {
                const options = ProviderUtils.getCompletionItemOptions('Number Style', undefined, style, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(style, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "formattedNumber" && attributeData.name === 'currencyDisplayAs' && attributeData.type.toLowerCase() === 'string') {
            for (const display of baseComponentsDetail.currencyDisplays) {
                const options = ProviderUtils.getCompletionItemOptions('Currency Display', undefined, display, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(display, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "formattedUrl" && attributeData.name === 'target' && attributeData.type.toLowerCase() === 'string') {
            for (const target of baseComponentsDetail.urlTargets) {
                const options = ProviderUtils.getCompletionItemOptions('Target Value', undefined, target, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(target, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "progressIndicator" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.progressTypes) {
                const options = ProviderUtils.getCompletionItemOptions('Progress Type Value', undefined, type, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(type, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "radioGroup" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.inputTypes) {
                const options = ProviderUtils.getCompletionItemOptions('Input Type Value', undefined, type, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(type, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "lightning" && component.positionData.tagData.name === "slider" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const componentPosition of baseComponentsDetail.positions) {
                const options = ProviderUtils.getCompletionItemOptions('Component Position Value', undefined, componentPosition, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(componentPosition, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "force" && component.positionData.tagData.name === "recordData" && attributeData.name === 'mode' && attributeData.type.toLowerCase() === 'string') {
            for (const mode of baseComponentsDetail.recordModes) {
                const options = ProviderUtils.getCompletionItemOptions('Record Mode', undefined, mode, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(mode, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "forceChatter" && component.positionData.tagData.name === "feed" && attributeData.name === 'feedDesign' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.feedDesigns) {
                const options = ProviderUtils.getCompletionItemOptions('Feed Design', undefined, feed, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(feed, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "forceChatter" && component.positionData.tagData.name === "feed" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.feedTypes) {
                const options = ProviderUtils.getCompletionItemOptions('Feed Type', undefined, feed, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(feed, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "forceChatter" && component.positionData.tagData.name === "fullFeed" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.fullFeedTypes) {
                const options = ProviderUtils.getCompletionItemOptions('Full Feed Type', undefined, feed, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(feed, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (component.positionData.tagData.namespace === "forceChatter" && component.positionData.tagData.name === "publisher" && attributeData.name === 'context' && attributeData.type.toLowerCase() === 'string') {
            for (const ctx of baseComponentsDetail.publisherContexts) {
                const options = ProviderUtils.getCompletionItemOptions('Publisher Context', undefined, ctx, true, CompletionItemKind.Value);
                const item = ProviderUtils.createItemForCompletion(ctx, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn){
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            }
        } else if (activationTokens.length > 1) {
            items = items.concat(ProviderUtils.getApexCompletionItems(position, activationInfo, undefined, component.positionData));
        } else {
            items = items.concat(ProviderUtils.getAllAvailableCompletionItems(position, activationInfo));
        }
    }
    return items;
}

function getBaseComponentAttributes(tagData: any): any {
    const attributes: any = {};
    const baseComponentsDetail = applicationContext.componentsDetail;
    attributes['aura:id'] = {
        name: "aura:id",
        access: "global",
        type: "String",
        description: "Aura ID of the component",
        required: false,
        default: false,
    };
    const notRoot = baseComponentsDetail.notRoot;
    if (notRoot[tagData.namespace] && !notRoot[tagData.namespace].includes(tagData.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            attributes[attribute.name] = attribute;
        }
    }
    if (baseComponentsDetail[tagData.namespace]) {
        const baseComponentNS = baseComponentsDetail[tagData.namespace];
        if (baseComponentNS[tagData.name]) {
            for (const attribute of baseComponentNS[tagData.name]) {
                attributes[attribute.name] = attribute;
            }
        }
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'css', tagData)) {
        attributes[rootElement.name] = rootElement;
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'input', tagData)) {
        attributes[rootElement.name] = rootElement;
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'html', tagData)) {
        attributes[rootElement.name] = rootElement;
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'select', tagData)) {
        attributes[rootElement.name] = rootElement;
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'inputField', tagData)) {
        attributes[rootElement.name] = rootElement;
    }
    return attributes;
}

function getRootAttributes(baseComponentsDetail: any, rootElement: any, tagData: any): any[] {
    const attributes = [];
    if (baseComponentsDetail.components[tagData.namespace] && baseComponentsDetail.components[tagData.namespace][rootElement]) {
        const rootAttributes = baseComponentsDetail.components[tagData.namespace][rootElement];
        if (rootAttributes.includes(tagData.name)) {
            for (const attribute of baseComponentsDetail['root'][rootElement]) {
                attributes.push(attribute);
            }
        }
    }
    return attributes;
}

function getSnippets(snippets: any, activationToken: string): any {
    if (!activationToken || activationToken.length === 0){
        return undefined;
    }
    return snippets[activationToken];
}