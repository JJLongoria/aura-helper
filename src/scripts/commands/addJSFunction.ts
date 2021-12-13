import * as vscode from 'vscode';
import { SnippetUtils } from '../utils/snippetUtils';
import { InputValidator } from '../inputs/inputValidator';
import { NotificationManager } from '../output';
import { FileChecker } from '@aurahelper/core';
const window = vscode.window;
const SnippetString = vscode.SnippetString;

export function run(): void {
    try {
        const editor = window.activeTextEditor;
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
};

async function addJSFunction(editor: vscode.TextEditor) {
    const numParams = await window.showInputBox({
        placeHolder: "Set the function params number",
        validateInput: InputValidator.isInteger
    });
    if (numParams !== undefined) {
        processInput(Number(numParams), editor);
    }
}

function processInput(numParams: number, editor: vscode.TextEditor) {
    if (numParams >= 0) {
        const funcBody = SnippetUtils.getJSFunctionSnippet(numParams);
        editor.insertSnippet(new SnippetString(`${funcBody}`), editor.selection);
    }
}