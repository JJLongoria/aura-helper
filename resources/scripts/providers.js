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

    provideCompletionItems(document, position) {
        logger.log('Run auraComponentProvider');
        const line = document.lineAt(position.line).text;
        if (line.indexOf('v.') === -1 && line.indexOf('c.') === -1) {
            return Promise.resolve(undefined);
        }
        if (document.fileName.indexOf('Controller.js') === -1 && document.fileName.indexOf('Helper.js') === -1 && document.fileName.indexOf('.cmp') === -1)
            return Promise.resolve(undefined);
        let componentPath = document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp');
        let componentStructure = languageUtils.getComponentStructure(componentPath);
        let items = [];
        if (line.indexOf('v.') !== -1) {
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
        } else if (line.indexOf('c.') !== -1) {
            if (document.fileName.indexOf('.cmp') !== -1) {
                for (const func of componentStructure.controllerFunctions) {
                    let item = new vscode.CompletionItem('c.' + func.name, vscode.CompletionItemKind.Function);
                    if(func.comment){
                        item.detail = func.comment.description + '\n';
                        for (const commentParam of func.comment.params) {
                            item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                        }
                    }
                    else{
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
            } else if (document.fileName.indexOf('.js') !== -1) {
                for (const method of componentStructure.apexFunctions) {
                    let item = new vscode.CompletionItem('c.' + method.name, vscode.CompletionItemKind.Method);
                    if(method.comment){
                        item.detail = method.comment.description + '\n';
                        for (const commentParam of method.comment.params) {
                            item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                        }
                    }
                    else{
                        item.detail = "Apex Controller Function";
                    }
                    item.documentation = method.signature;
                    item.insertText = method.name;
                    item.command = {
                        title: 'Aura Controller Function',
                        command: 'aurahelper.auraCodeCompletion',
                        arguments: [position, 'method', method]
                    };
                    items.push(item);
                }
            }
        }
        return Promise.resolve(items);
    }
};

module.exports = {
    apexProvider,
    auraComponentProvider
}