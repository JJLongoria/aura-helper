const snippetUtils = require('../utils/snippetUtils');
const InputValidator = require('../inputs/inputValidator');
const NotificationManager = require('../output/notificationManager');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const window = vscode.window;
const SnippetString = vscode.SnippetString;
const FileChecker = fileSystem.FileChecker;

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
        const funcBody = snippetUtils.getJSFunctionSnippet(numParams);
        editor.insertSnippet(new SnippetString(`${funcBody}`), editor.selection);
    }
}