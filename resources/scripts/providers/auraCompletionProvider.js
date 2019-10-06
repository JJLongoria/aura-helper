const languages = require('../languages');
const logger = require('../main/logger');
const applicationContext = require('../main/applicationContext');
const config = require('../main/config');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Utils = require('./utils').Utils;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const SnippetString = vscode.SnippetString;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const MarkdownString = vscode.MarkdownString;
const BundleAnalizer = languages.BundleAnalizer;
const AuraParser = languages.AuraParser;
const Tokenizer = languages.Tokenizer;
const langUtils = languages.Utils;

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isAuraComponent(document.uri.fsPath)) {
            items = provideAuraComponentCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}

function provideAuraComponentCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    let isComponentTag = onComponentTag(document, position);
    let componentTagData;
    if (isComponentTag)
        componentTagData = analizeComponentTag(document, position);
    let activation = Utils.getActivation(document, position);
    let activationTokens = activation.split('.');
    let activationOption1 = line.substring(position.character - 2, position.character);
    let activationOption2 = line.substring(position.character - 3, position.character);
    let similarAuraSnippetsNs = getSimilarSnippetsNS(applicationContext.auraSnippets, activationTokens[0]);
    let similarSldsSnippetsNs = getSimilarSnippetsNS(applicationContext.sldsSnippets, activationTokens[0]);
    let similarJSSnippetsNs = getSimilarSnippetsNS(applicationContext.jsSnippets, activationTokens[0]);
    let queryData = langUtils.getQueryData(document, position);
    let snippets;
    if (FileChecker.isAuraComponent(document.uri.fsPath) && applicationContext.auraSnippets[activationTokens[0]] && applicationContext.auraSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.auraSnippets[activationTokens[0]];
    } else if (FileChecker.isAuraComponent(document.uri.fsPath) && applicationContext.sldsSnippets[activationTokens[0]] && applicationContext.sldsSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.auraSnippets[activationTokens[0]];
    } else if (FileChecker.isJavaScript(document.uri.fsPath) && applicationContext.jsSnippets[activationTokens[0]] && applicationContext.jsSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.jsSnippets[activationTokens[0]];
    }
    if (queryData) {
        // Code for support completion on queries
        items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.aura');
    } else if (snippets && snippets.length > 0) {
        // Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
        items = getSnippetsCompletionItems(position, snippets);
    } else if (similarAuraSnippetsNs.length > 0 && FileChecker.isAuraComponent(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (lt (ltn.), (ltng.) ...)
        items = getSimilarCompletionItems(position, similarAuraSnippetsNs);
    } else if (similarSldsSnippetsNs.length > 0 && FileChecker.isAuraComponent(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (sl (slds.) ...)
        items = getSimilarCompletionItems(position, similarSldsSnippetsNs);
    } else if (similarJSSnippetsNs.length > 0 && FileChecker.isJavaScript(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (au (aura.) ...)
        items = getSimilarCompletionItems(position, similarJSSnippetsNs);
    } else if ((activationTokens[0] === 'v' || activationTokens[0] === 'c')) {
        let componentStructure = BundleAnalizer.getComponentStructure(document.fileName);
        if (activationTokens[0] === 'v' && activationTokens.length > 1) {
            // Code for completions when user types v.
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
            if(activationTokens.length === 2) {
                items = getAttributesCompletionItems(componentStructure, position, componentTagData);
            } else if (attribute) {
                items = getComponentAttributeMembersCompletionItems(attribute, activationTokens, position);
            }
        } else if (activationTokens[0] === 'c' && activationTokens.length === 2) {
            // Code for completions when user types c.
            if (!config.getConfig().activeControllerFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getControllerFunctionsCompletionItems(componentStructure, position, componentTagData);
        }
    } else if (activationOption1 === 'c:' && activationOption2 !== '<c:') {
        if (!config.getConfig().activeComponentSuggest)
            return Promise.resolve(undefined);
        // Code for completions when user types c:
        items = getComponentsCompletionItems(position, document, componentTagData);
    } else if (line.indexOf('<c:') !== -1) {
        if (line.toLowerCase().trim() === '<c:' && !isComponentTag) {
            // Code for completions when user types <c:
            if (!config.getConfig().activeComponentSuggest)
                return Promise.resolve(undefined);
            items = getComponentsCompletionItems(position, document, componentTagData);
        } else if (isComponentTag) {
            // Code for completions when position is on a start custom component tag <c:componentName >
            if (!config.getConfig().activeCustomComponentCallSuggest)
                return Promise.resolve(undefined);
            let lineSplits = line.split(':');
            if (lineSplits.length >= 2) {
                let componentName = lineSplits[1].split(' ')[0];
                if (componentName) {
                    let filePath = Paths.getFolderPath(Paths.getFolderPath(document.uri.fsPath)) + '\\' + componentName + '\\' + componentName + '.cmp';
                    let componentStructure = BundleAnalizer.getComponentStructure(filePath);
                    items = getComponentAttributesCompletionItems(componentStructure, componentTagData, position);
                }
            }
        }
    } else if (isComponentTag) {
        // Code for completions when position is on a start standard component tag <ns:componentName >
        if (!config.getConfig().activeComponentCallSuggest)
            return Promise.resolve(undefined);
        if (!componentTagData.isOnAttributeValue) {
            // Code for completions when position is on attribute value (position to put attributes) <ns:componentName attr="value" [thispos] attr="value">
            items = getBaseComponentsAttributesCompletionItems(componentTagData, position);
        } else if (componentTagData.isOnAttributeValue && componentTagData.isParamEmpty) {
            // Code for completions when position is on attribute param value and value is empty <ns:componentName attr="[thispos]" attr="value">
            items = getAttributeTypesCompletionItems(position, componentTagData, getBaseComponentAttributes(componentTagData));
        } else if (activationTokens.length > 0) {
            // Code for completions when position is on attribute param value and value have value <ns:componentName attr="val[thispos]ue" attr="value">
            //items = Utils.provideSObjetsCompletion(document, position, 'aurahelper.completion.aura');

        }
    } else if (activationTokens.length > 0) {
        // Code for completions when position is on empty line or withot components
        //items = Utils.provideSObjetsCompletion(document, position, 'aurahelper.completion.aura');

    }
    return items;
}

function getComponentAttributeMembersCompletionItems(attribute, activationTokens, position) {
    let items;
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
    } else {
        // include Apex Classes Completion
    }
    return items;
}

function getAttributeTypesCompletionItems(position, componentTagData, componentAttributes) {
    let items = [];
    let attributeData;
    let baseComponentsDetail = applicationContext.componentsDetail;
    let sizes = baseComponentsDetail.sizes;
    let dataTypes = baseComponentsDetail.datatypes;
    let accesses = baseComponentsDetail.access;
    for (const attribute of componentAttributes) {
        if (attribute.name === componentTagData.attributeName) {
            attributeData = attribute;
        }
    }
    if (attributeData) {
        if (componentTagData.namespace === "aura" && componentTagData.name === "attribute" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const dataType of dataTypes) {
                let item = new CompletionItem(dataType, CompletionItemKind.Value);
                item.detail = "Attribute Datatype";
                item.insertText = dataType;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrDataType', dataType]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'size' && attributeData.type.toLowerCase() === 'string') {
            for (const size of sizes) {
                let item = new CompletionItem(size, CompletionItemKind.Value);
                item.detail = "SLDS " + size + " Size";
                item.insertText = size;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrSize', size]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'access' && attributeData.type.toLowerCase() === 'string') {
            for (const access of accesses) {
                let item = new CompletionItem(access, CompletionItemKind.Value);
                item.detail = "Attribute / Component access";
                item.insertText = access;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrAccess', access]
                };
                items.push(item);
            }
        }
    }
    return items;
}

function getSimilarCompletionItems(position, similars) {
    let items = [];
    for (const similar of similars) {
        for (const snippet of similar) {
            let item = new CompletionItem(snippet.prefix, CompletionItemKind.Snippet);
            item.detail = snippet.name + '\n' + snippet.description;
            item.documentation = new MarkdownString(snippet.body.join('\n'));
            item.insertText = new SnippetString(snippet.body.join('\n'));
            item.preselect = true;
            item.command = {
                title: 'Aura Code Completion',
                command: 'aurahelper.completion.aura',
                arguments: [position, 'snippet', snippet]
            };
            items.push(item);
        }
    }
    return items;
}

function getSnippetsCompletionItems(position, snippets) {
    let items = [];
    for (const snippet of snippets) {
        let item = new CompletionItem(snippet.prefix, CompletionItemKind.Snippet);
        item.detail = snippet.name + '\n' + snippet.description;
        item.documentation = new MarkdownString(snippet.body.join('\n'));
        item.insertText = new SnippetString(snippet.body.join('\n'));
        item.preselect = true;
        item.command = {
            title: 'Aura Code Completion',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'snippet', snippet]
        };
        items.push(item);
    }
    return items;
}

function onComponentTag(document, position) {
    let endLoop = false;
    let line = position.line;
    while (!endLoop) {
        if (line <= 0)
            endLoop = true;
        let lineText = document.lineAt(line).text;
        let lineTokens = Tokenizer.tokenize(lineText);
        if (line == position.line) {
            let index = 0;
            let fromIndex = 0;
            while (index < lineTokens.length) {
                let token = lineTokens[index];
                if (position.character > token.startColumn)
                    fromIndex = index;
                index++;
            }
            index = fromIndex;
            if (fromIndex > 0) {
                while (index >= 0) {
                    let token = lineTokens[index];
                    if (token.tokenType === 'lABracket')
                        return true;
                    if (token.tokenType === 'rABracket')
                        return false;
                    index--;
                }
            }
        }
        else {
            let index = lineTokens.length - 1;
            while (index >= 0) {
                let token = lineTokens[index];
                if (token.tokenType === 'lABracket')
                    return true;
                if (token.tokenType === 'rABracket')
                    return false;
                index--;
            }
        }
        line--;
    }
    return false;
}

function analizeComponentTag(document, position) {
    let componentTag = "";
    let line = position.line;
    let startTagLine = line;
    let endLoop = false;
    while (!endLoop) {
        let lineText = document.lineAt(line).text;
        if (lineText.indexOf('<') !== -1) {
            startTagLine = line;
            endLoop = true;
        }
        line--
        if (line < 0)
            endLoop = true;
    }
    endLoop = false;
    line = startTagLine;
    while (!endLoop) {
        let lineText = document.lineAt(line).text;
        if (lineText.indexOf('>') !== -1) {
            componentTag += lineText + '\n';
            endLoop = true;
        } else {
            componentTag += lineText + '\n';
        }
        line++;
    }
    let componentTagData = AuraParser.componentTagData(componentTag, position);
    return componentTagData;
}

function getBaseComponentAttributes(componentTagData) {
    let attributes = [];
    let baseComponentsDetail = applicationContext.componentsDetail;
    attributes.push({
        name: "aura:id",
        access: "global",
        type: "String",
        description: "Aura ID of the component",
        required: false,
        default: false,
    });
    let notRoot = baseComponentsDetail.notRoot;
    if (notRoot[componentTagData.namespace] && !notRoot[componentTagData.namespace].includes(componentTagData.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            attributes.push(attribute);
        }
    }
    if (baseComponentsDetail[componentTagData.namespace]) {
        let baseComponentNS = baseComponentsDetail[componentTagData.namespace];
        if (baseComponentNS[componentTagData.name]) {
            for (const attribute of baseComponentNS[componentTagData.name]) {
                attributes.push(attribute);
            }
        }
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'css', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'input', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'html', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'select', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'inputField', componentTagData)) {
        attributes.push(rootElement);
    }
    return attributes;
}

function getBaseComponentsAttributesCompletionItems(componentTagData, position) {
    logger.logJSON("componentTagData", componentTagData);
    let baseComponentsDetail = applicationContext.componentsDetail;
    let items = [];
    let haveAuraId = false;
    Object.keys(componentTagData.attributes).forEach(function (key) {
        if (key === 'aura:id') {
            haveAuraId = true;
        }
    });
    if (!haveAuraId)
        items.push(getCodeCompletionItemAttribute('aura:id', 'Type: String', 'Aura ID of the component', 'String', position, 'aura:id'));
    let notRoot = baseComponentsDetail.notRoot;
    if (notRoot[componentTagData.namespace] && !notRoot[componentTagData.namespace].includes(componentTagData.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
            items.push(item);
        }
    }
    if (baseComponentsDetail[componentTagData.namespace]) {
        let baseComponentNS = baseComponentsDetail[componentTagData.namespace];
        if (baseComponentNS[componentTagData.name]) {
            for (const attribute of baseComponentNS[componentTagData.name]) {
                let exists = false;
                let existingAttributes = componentTagData.attributes;
                Object.keys(existingAttributes).forEach(function (key) {
                    if (key === attribute.name) {
                        exists = true;
                    }
                });
                if (!exists) {
                    let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
                    items.push(item);
                }
            }
        }
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'css', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'input', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'html', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'select', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'inputField', componentTagData, position)) {
        items.push(rootElement);
    }
    return items;
}

function getCodeCompletionItemAttribute(name, detail, description, datatype, position, data) {
    let item = new CompletionItem(name, CompletionItemKind.Variable);
    item.detail = detail;
    item.documentation = description;
    if (datatype === 'action') {
        item.insertText = new SnippetString(name + '="${1:{!c.jsAction}}" ');
    }
    else {
        item.insertText = new SnippetString(name + '="$1" $0');
    }
    item.preselect = true;
    item.command = {
        title: 'Aura Code Completion',
        command: 'aurahelper.completion.aura',
        arguments: [position, 'itemAttribute', data]
    };
    return item;
}

function getRootAttributes(baseComponentsDetail, rootElement, componentTagData) {
    let attributes = [];
    if (baseComponentsDetail.components[componentTagData.namespace] && baseComponentsDetail.components[componentTagData.namespace][rootElement]) {
        let rootAttributes = baseComponentsDetail.components[componentTagData.namespace][rootElement];
        if (rootAttributes.includes(componentTagData.name)) {
            for (const attribute of baseComponentsDetail['root'][rootElement]) {
                attributes.push(attribute);
            }
        }
    }
    return attributes;
}

function getRootItems(baseComponentsDetail, rootElement, componentTagData, position) {
    let items = [];
    if (baseComponentsDetail.components[componentTagData.namespace] && baseComponentsDetail.components[componentTagData.namespace][rootElement]) {
        let rootAttributes = baseComponentsDetail.components[componentTagData.namespace][rootElement];
        if (rootAttributes.includes(componentTagData.name)) {
            for (const attribute of baseComponentsDetail['root'][rootElement]) {
                let exists = false;
                let existingAttributes = componentTagData.attributes;
                Object.keys(existingAttributes).forEach(function (key) {
                    if (key === attribute.name) {
                        exists = true;
                    }
                });
                if (!exists) {
                    let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
                    items.push(item);
                }
            }
        }
    }
    return items;
}

function getComponentAttributesCompletionItems(componentStructure, componentTagData, position) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let exists = false;
        Object.keys(componentTagData.attributes).forEach(function (key) {
            if (key === attribute.name) {
                exists = true;
            }
        });
        if (!exists) {
            let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
            items.push(item);
        }
    }
    return items;
}

function getAttributesCompletionItems(componentStructure, position, componentTagData) {
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

function getControllerFunctionsCompletionItems(componentStructure, position, componentTagData) {
    let items = [];
    for (const func of componentStructure.controllerFunctions) {
        let item = new CompletionItem('c.' + func.name, CompletionItemKind.Function);
        if (func.comment) {
            item.detail = func.comment.description + '\n';
            for (const commentParam of func.comment.params) {
                item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
            }
        }
        else {
            item.detail = "Aura Controller Function";
        }
        item.preselect = true;
        item.documentation = func.auraSignature;
        item.insertText = func.name;
        item.command = {
            title: 'Aura Controller Function',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'function', func, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getComponentsCompletionItems(position, document, componentTagData) {
    let items = [];
    let auraFolder = Paths.getFolderPath(Paths.getFolderPath(document.uri.fsPath));
    let folders = FileReader.readDirSync(auraFolder);
    for (const folder of folders) {
        let files = FileReader.readDirSync(auraFolder + '\\' + folder);
        let isAppEvent;
        let isCompEvent;
        let isComponent;
        let isApp;
        for (const file of files) {
            if (file.indexOf('.cmp') !== -1) {
                isComponent = true;
                break;
            } else if (file.indexOf('.evt') !== -1) {
                isCompEvent = FileReader.readFileSync(auraFolder + '\\' + folder + '\\' + file).toLowerCase().indexOf('type="component"')
                isAppEvent = FileReader.readFileSync(auraFolder + '\\' + folder + '\\' + file).toLowerCase().indexOf('type="application"');
                break;
            } else if (file.indexOf('.app') !== -1) {
                isApp = true;
                break;
            }
        }
        let item = new CompletionItem('c:' + folder, CompletionItemKind.Module);
        let title = '';
        if (isComponent) {
            item.documentation = 'Aura Component ' + folder;
            title = 'Aura Component';
        } else if (isCompEvent) {
            item.documentation = 'Aura Component Event ' + folder;
            title = 'Aura Component Event';
        } else if (isAppEvent) {
            item.documentation = 'Aura Application Event ' + folder;
            title = 'Aura Application Event';
        } else if (isApp) {
            item.documentation = 'Aura Application ' + folder;
            title = 'Aura Application';
        }
        item.preselect = true;
        item.detail = title;
        item.insertText = folder;
        let data = {
            name: folder
        };
        item.command = {
            title: title,
            command: 'aurahelper.completion.aura',
            arguments: [position, title, data, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getSimilarSnippetsNS(snippets, activationToken) {
    let similarSnippets = [];
    if (!activationToken || activationToken.length === 0)
        return similarSnippets;
    Object.keys(snippets).forEach(function (key) {
        if (key.startsWith(activationToken))
            similarSnippets.push(snippets[key]);
    });
    return similarSnippets;
}