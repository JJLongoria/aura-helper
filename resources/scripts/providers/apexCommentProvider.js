const vscode = require('vscode');
const config = require('../core/config');
const { FileChecker } = require('@ah/core').FileSystem;
const CompletionItem = vscode.CompletionItem;
const CompletionItemKind = vscode.CompletionItemKind;
const ProviderUtils = require('./utils');

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
    const items = [];
    if (!config.getConfig().autoCompletion.activeApexCommentSuggestion)
        return Promise.resolve(undefined);
    const options = ProviderUtils.getCompletionItemOptions('Apex Comment', 'Add an Apex Comment with the user defined template', '', true, CompletionItemKind.Snippet);
    const command = ProviderUtils.getCommand('Apex Comment', 'aurahelper.completion.apex', [position, "comment"]);
    const item = ProviderUtils.createItemForCompletion('/** */', options, command);
    items.push(item);
    return items;
}