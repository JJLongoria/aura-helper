const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../core/config');
const logger = require('../utils/logger');
const FileChecker = fileSystem.FileChecker;
const CompletionItem = vscode.CompletionItem;
const CompletionItemKind = vscode.CompletionItemKind;

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}

function provideApexCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    if (line.indexOf('/**') !== -1) {
        if (!config.getConfig().autoCompletion.activeApexCommentSuggestion)
            return Promise.resolve(undefined);
        items = getCommentCompletionItem(position);
    }
    return items;
}

function getCommentCompletionItem(position) {
    let items = [];
    if (!config.getConfig().autoCompletion.activeApexCommentSuggestion)
        return Promise.resolve(undefined);
    let item = new CompletionItem('/** */', CompletionItemKind.Snippet);
    item.detail = 'Apex Comment';
    item.insertText = '';
    item.command = {
        title: 'Apex Comment',
        command: 'aurahelper.completion.apex',
        arguments: [position, "comment"]
    };
    items.push(item);
    return items;
}