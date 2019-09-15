const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const FileChecker = fileSystem.FileChecker;

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
    if (line.indexOf('/**') === -1) {
        items = Utils.provideSObjetsCompletion(document, position, 'aurahelper.completion.apex');
    }
    return items;
}