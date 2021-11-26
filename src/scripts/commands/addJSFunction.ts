import * as vscode from 'vscode';
const SnippetUtils = require('../utils/snippetUtils');
const InputValidator = require('../inputs/inputValidator');
const { FileChecker } = require('@aurahelper/core').FileSystem;
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const SnippetString = vscode.SnippetString;

export function run() {
    try {
        var editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
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

async function addJSFunction(editor: vscode.TextEditor) {
    let numParams = await window.showInputBox({
        placeHolder: "Set the function params number",
        validateInput: InputValidator.isInteger
    });
    if (numParams !== undefined) {
        processInput(Number(numParams), editor);
    }
}

function processInput(numParams: Number, editor: vscode.TextEditor) {
    if (numParams >= 0) {
        const funcBody = SnippetUtils.getJSFunctionSnippet(numParams);
        editor.insertSnippet(new SnippetString(`${funcBody}`), editor.selection);
    }
}