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
const BundleAnalizer = languages.BundleAnalizer;
const AuraParser = languages.AuraParser;
const Tokenizer = languages.Tokenizer;

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
    let items = [];
    const line = document.lineAt(position.line).text;
    let isComponentTag = onComponentTag(document, position);
    let componentTagData;
    if (isComponentTag)
        componentTagData = analizeComponentTag(document, position);
    let activationOption1 = line.substring(position.character - 2, position.character);
    let activationOption2 = line.substring(position.character - 3, position.character);
    if (activationOption1 === 'v.' || activationOption1 === 'c.') {
        let componentStructure = BundleAnalizer.getComponentStructure(document.fileName);
        if (activationOption1 === 'v.') {
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            items = getAttributes(componentStructure, position, componentTagData);
        } else if (activationOption1 === 'c.') {
            if (!config.getConfig().activeControllerFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getControllerFunctions(componentStructure, position, componentTagData);
        }
    } else if (activationOption1 === 'c:' && activationOption2 !== '<c:') {
        if (!config.getConfig().activeComponentSuggest)
            return Promise.resolve(undefined);
        items = getComponents(position, document, componentTagData);
    } else if (line.indexOf('<c:') !== -1) {
        if (line.toLowerCase().trim() === '<c:' && !isComponentTag) {
            if (!config.getConfig().activeComponentSuggest)
                return Promise.resolve(undefined);
            items = getComponents(position, document, componentTagData);
        }
        else if (isComponentTag) {
            if (!config.getConfig().activeCustomComponentCallSuggest)
                return Promise.resolve(undefined);
            let lineSplits = line.split(':');
            if (lineSplits.length >= 2) {
                let componentName = lineSplits[1].split(' ')[0];
                if (componentName) {
                    let filePath = Paths.getFolderPath(Paths.getFolderPath(document.uri.fsPath)) + '\\' + componentName + '\\' + componentName + '.cmp';
                    let componentStructure = BundleAnalizer.getComponentStructure(filePath);
                    items = getComponentAttributes(componentStructure, componentTagData, position);
                }
            }
        }
    } else if (isComponentTag) {
        if (!config.getConfig().activeComponentCallSuggest)
            return Promise.resolve(undefined);
        items = getBaseComponentsAttributes(componentTagData, position);
    } else {
        let activation = Utils.getActivation(document, position);
        let activationTokens = activation.split('.');
        if (activationTokens.length > 0) {
            if (activationTokens[0] === 'v' && activationTokens.length > 1) {
                let componentStructure = BundleAnalizer.getComponentStructure(document.fileName);
                let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
                if (attribute) {
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
                    }
                }
            } else {
                let sObjects = Utils.getObjectsFromMetadataIndex();
                let similarSobjects = [];
                if (activationTokens.length === 1)
                    similarSobjects = Utils.getSimilar(sObjects.sObjectsToLower, activationTokens[0]);
                if (sObjects.sObjectsToLower.includes(activationTokens[0].toLowerCase())) {
                    if (!config.getConfig().activeSobjectFieldsSuggestion)
                        return Promise.resolve(undefined);
                    let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[activationTokens[0].toLowerCase()]);
                    if (activationTokens.length > 1) {
                        let lastObject = sObject;
                        let index = 0;
                        for (const activationToken of activationTokens) {
                            let actToken = activationToken;
                            if (index > 0) {
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
                } else if (similarSobjects.length > 0) {
                    if (!config.getConfig().activeSObjectSuggestion)
                        return Promise.resolve(undefined);
                    items = Utils.getSObjectsCompletionItems(position, similarSobjects, sObjects.sObjectsMap, 'aurahelper.completion.aura');
                }
            }
        }
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
    let componentTagData = AuraParser.componentTagData(componentTag);
    return componentTagData;
}

function getBaseComponentsAttributes(componentTagData, position) {
    let baseComponentsDetail = applicationContext.componentsDetail;
    let items = [];
    let haveAuraId = false;
    for (const existingAttributes of componentTagData.attributes) {
        if (existingAttributes.name === 'aura:id') {
            haveAuraId = true;
            break;
        }
    }
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

function getRootItems(baseComponentsDetail, rootElement, componentTagData, position) {
    let items = [];
    if (baseComponentsDetail.components[componentTagData.namespace] && baseComponentsDetail.components[componentTagData.namespace][rootElement]) {
        let inputComponentes = baseComponentsDetail.components[componentTagData.namespace][rootElement];
        if (inputComponentes.includes(componentTagData.name)) {
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

function getComponentAttributes(componentStructure, componentTagData, position) {
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

function getAttributes(componentStructure, position, componentTagData) {
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

function getControllerFunctions(componentStructure, position, componentTagData) {
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

function getComponents(position, document, componentTagData) {
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

function getAuraSnippetsActivation(position, line) {
    let activation = undefined;
    let auraActivation = line.substring(position.character - 5, position.character);
    let ltngActivation = line.substring(position.character - 5, position.character);
    let forceActivation = line.substring(position.character - 6, position.character);
    let forceChatterActivation = line.substring(position.character - 13, position.character);
    let forceCommunityActivation = line.substring(position.character - 15, position.character);
    let ltnActivation = line.substring(position.character - 4, position.character);
    let ltnCommunityActivation = line.substring(position.character - 13, position.character);
    let ltnSnapinActivation = line.substring(position.character - 10, position.character);
    let uiActivation = line.substring(position.character - 3, position.character);
    let sldslActivation = line.substring(position.character - 5, position.character);
    if (auraActivation === 'aura.')
        activation = auraActivation;
    if (ltngActivation === 'ltng.')
        activation = ltngActivation;
    if (forceActivation === 'force.')
        activation = forceActivation;
    if (forceChatterActivation === 'forceChatter.')
        activation = forceChatterActivation;
    if (forceCommunityActivation === 'forceCommunity.')
        activation = forceCommunityActivation;
    if (ltnActivation === 'ltn.')
        activation = ltnActivation;
    if (ltnCommunityActivation === 'ltnCommunity.')
        activation = ltnCommunityActivation;
    if (ltnSnapinActivation === 'ltnSnapin.')
        activation = ltnSnapinActivation;
    if (uiActivation === 'ui.')
        activation = uiActivation;
    if (sldslActivation === 'slds.')
        activation = sldslActivation;
    if (activation)
        activation = activation.replace(".", "");
    return activation;
}

function isAuraSnippetActivation(position, line) {
    if (getAuraSnippetsActivation(position, line))
        return true;
    return false;
}