const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const languageUtils = require('./languageUtils');
const logger = require('./logger');

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

    provideCompletionItems(document, position, cancelToken, context) {
        logger.log('Run auraComponentProvider');
        logger.logJSON('context', context);
        const line = document.lineAt(position.line).text;
        if (line.indexOf('v.') === -1 && line.indexOf('c.') === -1 && line.indexOf('helper.') === -1 && line.indexOf('c:') === -1) {
            return Promise.resolve(undefined);
        }
        if (document.fileName.indexOf('Controller.js') === -1 && document.fileName.indexOf('Helper.js') === -1 && document.fileName.indexOf('.cmp') === -1)
            return Promise.resolve(undefined);
        let items = [];
        let activation = line.substring(position.character - 2, position.character);
        if (activation === 'v.' || activation === 'c.' || line.indexOf('helper.') !== -1) {
            let componentPath = document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp');
            let componentStructure = languageUtils.getComponentStructure(componentPath);
            if (activation === 'v.') {
                logger.log('Provider', 'v.');
                items = getAttributes(componentStructure, position);
            } else if (activation === 'c.') {
                logger.log('Provider', 'c.');
                if (document.fileName.indexOf('.cmp') !== -1) {
                    items = getControllerFunctions(componentStructure, position);
                } else if (document.fileName.indexOf('.js') !== -1) {
                    items = getApexControllerFunctions(componentStructure, position);
                }
            } else if (line.indexOf('helper.') !== -1) {
                logger.log('Provider', 'helper.');
                items = getHelperFunctions(componentStructure, position);
            }
        } else if (line.indexOf('<c:') === -1) {
            logger.log('Provider', 'c:');
            items = getComponents(position, document);
        } else if (line.indexOf('<c:') !== -1) {
            if (line.toLowerCase().trim() === '<c:') {
                logger.log('Provider', '<c:');
                items = getComponents(position, document);
            }
            else {
                logger.log('Provider', '<c:ComponentName');
                let componentName = line.split(':')[1].split(' ')[0];
                let filePath = fileUtils.getFileFolderPath(fileUtils.getFileFolderPath(document.uri.fsPath)) + '\\' + componentName + '\\' + componentName + '.cmp';
                let componentStructure = languageUtils.getComponentStructure(filePath);
                items = getComponentAttributes(componentStructure, position);
            }
        }
        return Promise.resolve(items);
    }
};

function getComponentAttributes(componentStructure, position) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let item = new vscode.CompletionItem(attribute.name, vscode.CompletionItemKind.Field);
        item.detail = 'Type: ' + attribute.type;
        item.documentation = attribute.description;
        item.insertText = new vscode.SnippetString(attribute.name + '="${1:attribute.name}"');
        item.command = {
            title: 'Aura Component Attribute',
            command: 'aurahelper.auraCodeCompletion',
            arguments: [position, 'attribute', attribute]
        };
        items.push(item);
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