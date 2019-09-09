const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const languageUtils = require('./languageUtils');
const logger = require('./logger');
const constants = require('./constants');

let apexProvider = {
    provideCompletionItems(document, position) {
        const line = document.lineAt(position.line).text;
        if (line.indexOf('/**') === -1) {
            return Promise.resolve(undefined);
        }
        let item = new vscode.CompletionItem('/** */', vscode.CompletionItemKind.Snippet);
        item.detail = 'Apex Comment';
        item.insertText = '';
        item.command = {
            title: 'Apex Comment',
            command: 'aurahelper.apexComentCompletion',
            arguments: [position]
        };
        return Promise.resolve([item]);
    }
};

let auraComponentProvider = {

    provideCompletionItems(document, position) {
        logger.log('Run auraComponentProvider');
        if (document.fileName.indexOf('Controller.js') === -1 && document.fileName.indexOf('Helper.js') === -1 && document.fileName.indexOf('.cmp') === -1)
            return Promise.resolve(undefined);
        const line = document.lineAt(position.line).text;
        let isComponentTag = onComponentTag(document, position);
        logger.log('isComponentTag', isComponentTag);
        if (line.indexOf('v.') === -1 && line.indexOf('c.') === -1 && line.indexOf('helper.') === -1 && line.indexOf('c:') === -1 && line.indexOf('<') === -1 && line.indexOf(':') === -1 && !isComponentTag) {
            return Promise.resolve(undefined);
        }
        let items = [];
        let activationOption1 = line.substring(position.character - 2, position.character);
        let activationOption2 = line.substring(position.character - 3, position.character);
        let helperActivationOption = line.substring(position.character - 7, position.character);
        let componentTagData;
        logger.log('activationOption1', activationOption1);
        logger.log('activationOption2', activationOption2);
        logger.log('helperActivationOption', helperActivationOption);
        if (isComponentTag)
            componentTagData = analizeComponentTag(document, position);
        if (activationOption1 === 'v.' || activationOption1 === 'c.' || helperActivationOption === 'helper.') {
            let componentPath = document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp');
            let componentStructure = languageUtils.getComponentStructure(componentPath);
            if (activationOption1 === 'v.') {
                logger.log('Provider', 'v.');
                items = getAttributes(componentStructure, position);
            } else if (activationOption1 === 'c.') {
                logger.log('Provider', 'c.');
                if (document.fileName.indexOf('.cmp') !== -1) {
                    items = getControllerFunctions(componentStructure, position);
                } else if (document.fileName.indexOf('.js') !== -1) {
                    items = getApexControllerFunctions(componentStructure, position);
                }
            } else if (helperActivationOption === 'helper.') {
                logger.log('Provider', 'helper.');
                if (document.fileName.indexOf('.js') !== -1) {
                    items = getHelperFunctions(componentStructure, position);
                }
            }
        } else if (activationOption1 === 'c:' && activationOption2 !== '<c:') {
            logger.log('Provider', 'c:');
            items = getComponents(position, document);
        } else if (line.indexOf('<c:') !== -1) {
            if (line.toLowerCase().trim() === '<c:' && !isComponentTag) {
                logger.log('Provider', '<c:');
                items = getComponents(position, document);
            }
            else if (isComponentTag) {
                logger.log('Provider', '<c:ComponentName');
                let componentName = line.split(':')[1].split(' ')[0];
                let filePath = fileUtils.getFileFolderPath(fileUtils.getFileFolderPath(document.uri.fsPath)) + '\\' + componentName + '\\' + componentName + '.cmp';
                let componentStructure = languageUtils.getComponentStructure(filePath);
                items = getComponentAttributes(componentStructure, componentTagData, position);
            }
        } else if ((line.indexOf('<') !== -1 && line.indexOf(':') !== -1) || (isComponentTag)) {
            logger.log('Provider', '<NS:ComponentName');
            items = getBaseComponentsAttributes(componentTagData, position);
        }
        return Promise.resolve(items);
    }
};

function onComponentTag(document, position) {
    let endLoop = false;
    let line = position.line;
    while (!endLoop) {
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
                while (index != -1) {
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
            while (index != -1) {
                let token = lineTokens[index];
                if (token.tokenType === 'lABracket')
                    return true;
                if (token.tokenType === 'rABracket')
                    return false;
                index--;
            }
        }
        line--;
        if (line < 0)
            endLoop = true;
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
    return languageUtils.analizeComponentTag(componentTag, position);
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
    for (const rootElement of getRootItems(baseComponentsDetail, 'css',componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'input',componentTagData, position)) {
        items.push(rootElement);
    } 
    for (const rootElement of getRootItems(baseComponentsDetail, 'html',componentTagData, position)) {
        items.push(rootElement);
    } 
    for (const rootElement of getRootItems(baseComponentsDetail, 'select',componentTagData, position)) {
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
        arguments: [position, data]
    };
    return item;
}

function getRootItems(baseComponentsDetail, rootElement,componentTagData, position){
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

function getAttributes(componentStructure, position) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let item = new vscode.CompletionItem('v.' + attribute.name, vscode.CompletionItemKind.Field);
        item.detail = 'Type: ' + attribute.type;
        item.documentation = attribute.description;
        item.insertText = attribute.name;
        item.command = {
            title: 'Aura Component Attribute',
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, 'attribute', attribute]
        };
        items.push(item);
    }
    return items;
}

function getControllerFunctions(componentStructure, position) {
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
            arguments: [position, 'function', func]
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

function getComponents(position, document) {
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
        item.command = {
            title: title,
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, title, document.uri.fsPath]
        };
        items.push(item);
    }
    return items;
}

module.exports = {
    apexProvider,
    auraComponentProvider
}