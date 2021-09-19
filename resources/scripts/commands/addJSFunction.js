const SnippetUtils = require('../utils/snippetUtils');
const InputValidator = require('../inputs/inputValidator');
const { FileChecker } = require('@aurahelper/core').FileSystem;
const NotificationManager = require('../output/notificationManager');
const vscode = require('vscode');
const window = vscode.window;
const SnippetString = vscode.SnippetString;

exports.run = function() {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isJavaScript(editor.document.uri.fsPath)) {
            addJSFunction(editor);
        } else {
            NotificationManager.showError('The selected file is not a JavaScript File');
        }
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addJSFunction(editor){
    window.showInputBox({
        placeHolder: "Set the function params number",
        validateInput: InputValidator.isInteger
    }).then((numParams) => processInput(numParams, editor));
}

function processInput(numParams, editor){
    if (numParams >= 0) {
        const funcBody = SnippetUtils.getJSFunctionSnippet(numParams);
        editor.insertSnippet(new SnippetString(`${funcBody}`), editor.selection);
    }
}