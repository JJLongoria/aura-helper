const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const languageUtils = require('./languageUtils');
const logger = require('./logger');
const constants = require('./constants');
const config = require('./config');

let codeCompletionProvider = {
    provideCompletionItems(document, position) {
        logger.log('Run codeCompletionProvider');
        let items;
        if (!isAllowedFile(document))
            return Promise.resolve(items);
        if (isApexFile(document)) {
            items = provideApexCompletion(document, position);
        } else if (isAuraFile(document)) {
            if (isAuraComponentFile(document)) {
                items = provideAuraComponentCompletion(document, position);
            } else if (isAuraJSFile(document)) {
                items = provideJSCompletion(document, position);
            }
        }
        return Promise.resolve(items);
    }
}

function provideApexCompletion(document, position) {
    let items = [];
    const line = document.lineAt(position.line).text;
    if (line.indexOf('/**') !== -1) {
        if (!config.getConfig().activeApexCommentSuggestion)
            return Promise.resolve(undefined);
        let item = new vscode.CompletionItem('/** */', vscode.CompletionItemKind.Snippet);
        item.detail = 'Apex Comment';
        item.insertText = '';
        item.command = {
            title: 'Apex Comment',
            command: 'aurahelper.apexComentCompletion',
            arguments: [position]
        };
        items.push(item);
    }
    return items;
}

function provideAuraComponentCompletion(document, position) {
    logger.log("run provideAuraComponentCompletion method");
    let items = [];
    const line = document.lineAt(position.line).text;
    let isComponentTag = onComponentTag(document, position);
    let componentTagData;
    if (!isAuraProvider(line, isComponentTag))
        return Promise.resolve(undefined);
    if (isComponentTag)
        componentTagData = analizeComponentTag(document, position);
    let activationOption1 = line.substring(position.character - 2, position.character);
    let activationOption2 = line.substring(position.character - 3, position.character);
    logger.log("isComponentTag", isComponentTag);
    if (activationOption1 === 'v.' || activationOption1 === 'c.') {
        let componentStructure = languageUtils.getComponentStructure(document.fileName);
        if (activationOption1 === 'v.') {
            logger.log('Provider', 'v.');
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            items = getAttributes(componentStructure, position, componentTagData);
        } else if (activationOption1 === 'c.') {
            logger.log('Provider', 'c.');
            if (!config.getConfig().activeControllerFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getControllerFunctions(componentStructure, position, componentTagData);
        }
    } else if (activationOption1 === 'c:' && activationOption2 !== '<c:') {
        logger.log('Provider', 'c:');
        if (!config.getConfig().activeComponentSuggest)
            return Promise.resolve(undefined);
        items = getComponents(position, document, componentTagData);
    } else if (line.indexOf('<c:') !== -1) {
        if (line.toLowerCase().trim() === '<c:' && !isComponentTag) {
            logger.log('Provider', '<c:');
            if (!config.getConfig().activeComponentSuggest)
                return Promise.resolve(undefined);
            items = getComponents(position, document, componentTagData);
        }
        else if (isComponentTag) {
            logger.log('Provider', '<c:ComponentName');
            if (!config.getConfig().activeCustomComponentCallSuggest)
                return Promise.resolve(undefined);
            let lineSplits = line.split(':');
            if (lineSplits.length >= 2) {
                let componentName = lineSplits[1].split(' ')[0];
                if (componentName) {
                    let filePath = fileUtils.getFileFolderPath(fileUtils.getFileFolderPath(document.uri.fsPath)) + '\\' + componentName + '\\' + componentName + '.cmp';
                    let componentStructure = languageUtils.getComponentStructure(filePath);
                    items = getComponentAttributes(componentStructure, componentTagData, position);
                }
            }
        }
    } else if (isComponentTag) {
        logger.log('Provider', '<NS:ComponentName');
        if (!config.getConfig().activeComponentCallSuggest)
            return Promise.resolve(undefined);
        items = getBaseComponentsAttributes(componentTagData, position);
    }
    return items;
}

function provideJSCompletion(document, position) {
    let items = [];
    const line = document.lineAt(position.line).text;
    let activationOption1 = line.substring(position.character - 2, position.character);
    let helperActivationOption = line.substring(position.character - 7, position.character);
    if (activationOption1 === 'v.' || activationOption1 === 'c.' || helperActivationOption === 'helper.') {
        let componentStructure = languageUtils.getComponentStructure(document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'));
        if (activationOption1 === 'v.') {
            logger.log('Provider', 'v.');
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            items = getAttributes(componentStructure, position, undefined);
        } else if (activationOption1 === 'c.') {
            logger.log('Provider', 'c.');
            if (!config.getConfig().activeControllerMethodsSuggest)
                return Promise.resolve(undefined);
            items = getApexControllerFunctions(componentStructure, position);
        } else if (helperActivationOption === 'helper.') {
            logger.log('Provider', 'helper.');
            if (!config.getConfig().activeHelperFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getHelperFunctions(componentStructure, position);
        }
    }
    return items;
}

function isAllowedFile(document) {
    return !(document.fileName.indexOf('.js') === -1 && document.fileName.indexOf('.cmp') === -1 && document.fileName.indexOf('.cls') === -1 && document.fileName.indexOf('.trigger') === -1 && document.fileName.indexOf('.page') === -1 && document.fileName.indexOf('.component') === -1);
}

function isApexFile(document) {
    return document.fileName.indexOf('.cls') !== -1 || document.fileName.indexOf('.trigger') !== -1;
}

function isAuraFile(document) {
    return document.fileName.indexOf('Controller.js') !== -1 || document.fileName.indexOf('Helper.js') !== -1 || document.fileName.indexOf('.cmp') !== -1;
}

function isAuraComponentFile(document) {
    return document.fileName.indexOf('.cmp') !== -1
}

function isAuraJSFile(document) {
    return document.fileName.indexOf('Controller.js') !== -1 || document.fileName.indexOf('Helper.js') !== -1;
}

function isAuraProvider(line, isComponentTag) {
    return !(line.indexOf('v.') === -1 && line.indexOf('c.') === -1 && line.indexOf('helper.') === -1 && line.indexOf('c:') === -1 && line.indexOf('<') === -1 && line.indexOf(':') === -1 && !isComponentTag);
}

function onComponentTag(document, position) {
    let endLoop = false;
    let line = position.line;
    while (!endLoop) {
        if (line <= 0)
            endLoop = true;
        let lineText = document.lineAt(line).text;
        let lineTokens = languageUtils.tokenize(lineText);
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
    let componentTagData = languageUtils.analizeComponentTag(componentTag);
    return componentTagData;
}

function getBaseComponentsAttributes(componentTagData, position) {
    let baseComponentsDetail = constants.componentsDetail;
    let items = [];
    let item = getCodeCompletionItemAttribute('aura:id', 'Type: String', 'Aura ID of the component', 'String', position, 'aura:id');
    items.push(item);
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
    let item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
    item.detail = detail;
    item.documentation = description;
    if (datatype === 'action') {
        item.insertText = new vscode.SnippetString(name + '="${1:{!c.jsAction}}" ');
    }
    else {
        item.insertText = new vscode.SnippetString(name + '="$1" $0');
    }
    item.preselect = true;
    item.command = {
        title: 'Aura Code Completion',
        command: 'aurahelper.auraCodeCompletion',
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
        let item = new vscode.CompletionItem('v.' + attribute.name, vscode.CompletionItemKind.Field);
        item.detail = 'Type: ' + attribute.type;
        item.documentation = attribute.description;
        item.insertText = attribute.name;
        item.command = {
            title: 'Aura Component Attribute',
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, 'attribute', attribute, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getControllerFunctions(componentStructure, position, componentTagData) {
    let items = [];
    for (const func of componentStructure.controllerFunctions) {
        let item = new vscode.CompletionItem('c.' + func.name, vscode.CompletionItemKind.Function);
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
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, 'function', func, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getApexControllerFunctions(componentStructure, position) {
    let items = [];
    for (const method of componentStructure.apexFunctions) {
        if (method.annotation && method.annotation == '@AuraEnabled') {
            let item = new vscode.CompletionItem('c.' + method.name, vscode.CompletionItemKind.Method);
            if (method.comment) {
                item.detail = method.comment.description + '\n';
                for (const commentParam of method.comment.params) {
                    item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                }
            }
            else {
                item.detail = "Apex Controller Function";
            }
            item.preselect = true;
            item.documentation = method.signature;
            item.insertText = method.name;
            item.command = {
                title: 'Apex Controller Function',
                command: 'aurahelper.auraCodeCompletion',
                arguments: [position, 'method', method]
            };
            items.push(item);
        }
        if (method.params && method.params.length) {
            let itemParams = new vscode.CompletionItem(method.name + '.params', vscode.CompletionItemKind.Variable);
            itemParams.detail = "Get method parameters on json object";
            itemParams.preselect = true;
            itemParams.documentation = "Return JSON Object with method params";
            itemParams.insertText = method.name + '.params';
            itemParams.command = {
                title: 'Apex Controller Params',
                command: 'aurahelper.auraCodeCompletion',
                arguments: [position, 'params', method]
            };
            items.push(itemParams);
        }
    }
    return items;
}

function getHelperFunctions(componentStructure, position) {
    let items = [];
    for (const func of componentStructure.helperFunctions) {
        let item = new vscode.CompletionItem('helper.' + func.name, vscode.CompletionItemKind.Function);
        if (func.comment) {
            item.detail = func.comment.description + '\n';
            for (const commentParam of func.comment.params) {
                item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
            }
        }
        else {
            item.detail = "Aura Helper Function";
        }
        item.preselect = true;
        item.documentation = func.auraSignature;
        item.insertText = func.signature;
        item.command = {
            title: 'Aura Helper Function',
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, 'function', func]
        };
        items.push(item);
    }
    return items;
}

function getComponents(position, document, componentTagData) {
    let items = [];
    let auraFolder = fileUtils.getFileFolderPath(fileUtils.getFileFolderPath(document.uri.fsPath));
    let folders = fileUtils.getFilesFromFolderSync(auraFolder);
    for (const folder of folders) {
        let files = fileUtils.getFilesFromFolderSync(auraFolder + '\\' + folder);
        let isAppEvent;
        let isCompEvent;
        let isComponent;
        let isApp;
        for (const file of files) {
            if (file.indexOf('.cmp') !== -1) {
                isComponent = true;
                break;
            } else if (file.indexOf('.evt') !== -1) {
                isCompEvent = fileUtils.getFileContent(auraFolder + '\\' + folder + '\\' + file).toLowerCase().indexOf('type="component"')
                isAppEvent = fileUtils.getFileContent(auraFolder + '\\' + folder + '\\' + file).toLowerCase().indexOf('type="application"');
                break;
            } else if (file.indexOf('.app') !== -1) {
                isApp = true;
                break;
            }
        }
        let item = new vscode.CompletionItem('c:' + folder, vscode.CompletionItemKind.Module);
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
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, title, data, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getSobjects() {
    let objects = [];
    let files = fileUtils.getFilesFromFolderSync(fileUtils.getMetadataIndexPath(constants.applicationContext));
    for (const file of files) {
        objects.push(file.replace(".json", ""));
    }
}

module.exports = {
    codeCompletionProvider,
}