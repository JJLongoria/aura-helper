const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const languageUtils = require('./languageUtils');
const logger = require('./logger');

let apexCommentProvider = {
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
        let items = [];
        if (line.indexOf('v.') !== -1) {
            if (document.fileName.indexOf('Controller.js') === -1 && document.fileName.indexOf('Helper.js') === -1 && document.fileName.indexOf('.cmp') === -1)
                return Promise.resolve(undefined);
            let componentPath = document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp');
            let componentName = fileUtils.basename(componentPath).replace('.cmp', '');
            let componentFileText = fileUtils.getFileContent(componentPath);
            let componentStructure = languageUtils.parseCMPFile(componentFileText);
            let parentComponentStructure = componentStructure;
            while (parentComponentStructure.extends) {
                let parentComponentName = parentComponentStructure.extends.replace('c:', '');
                let parentFileName = componentPath.replace(new RegExp(componentName, 'g'), parentComponentName);
                parentComponentStructure = languageUtils.parseCMPFile(fileUtils.getFileContent(parentFileName));
                for (const attribute of parentComponentStructure.attributes) {
                    componentStructure.attributes.push(attribute);
                }
                for (const implement of parentComponentStructure.implements) {
                    componentStructure.implements.push(implement);
                }
                for (const event of parentComponentStructure.events) {
                    componentStructure.events.push(event);
                }
                for (const handler of parentComponentStructure.handlers) {
                    componentStructure.handlers.push(handler);
                }
            }
            for (const attribute of componentStructure.attributes) {
                let item = new vscode.CompletionItem('v.' + attribute.name, vscode.CompletionItemKind.Field);
                item.detail = 'Type: ' + attribute.type;
                item.documentation = attribute.description;
                item.insertText = attribute.name;
                item.command = {
                    title: 'Aura Component Attribute',
                    command: 'aurahelper.auraCodeCompletion',
                    arguments: [position, 'attribute', attribute.name]
                };
                items.push(item);
            }
        }
        return Promise.resolve(items);
    }
};

module.exports = {
    apexCommentProvider,
    auraComponentProvider
}