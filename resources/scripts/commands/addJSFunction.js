const logger = require('../utils/logger');
const snippetUtils = require('../utils/snippetUtils');
const inputValidator = require('../inputs/inputValidator');
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
            window.showErrorMessage('The selected file is not a JavaScript File');
        }
    }
    catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function addJSFunction(editor){
    window.showInputBox({
        placeHolder: "Set the function params number",
        validateInput: inputValidator.integerValidation
    }).then((numParams) => processInput(numParams, editor));
}

function processInput(numParams, editor){
    if (numParams >= 0) {
        const funcBody = snippetUtils.getJSFunctionSnippet(numParams);
        editor.insertSnippet(new SnippetString(`${funcBody}`), editor.selection);
    }
}