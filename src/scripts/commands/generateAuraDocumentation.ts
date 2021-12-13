import * as vscode from 'vscode';
import { NotificationManager, Editor } from '../output';
import { Paths } from '../core/paths';
import { SnippetUtils } from '../utils/snippetUtils';
import { JavaScript } from '@aurahelper/languages';
import { AuraJSFunction, FileChecker, FileReader } from '@aurahelper/core';
const JSParser = JavaScript.JSParser;
const window = vscode.window;
const Range = vscode.Range;

export function run(fileUri: vscode.Uri): void {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor) {
                filePath = editor.document.uri.fsPath;
            }
        }
        if (filePath) {
            generateDocumentation(filePath);
        } else {
            NotificationManager.showError("Not file selected for generate documentation");
        }
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function generateDocumentation(filePath: string): void {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        createDoc(editor);
    } else {
        window.showTextDocument(Paths.toURI(filePath)).then((editor) => createDoc(editor));
    }
}

function createDoc(editor: vscode.TextEditor): void {
    let filePath = editor.document.uri.fsPath;
    let helperPath = Paths.getAuraBundleHelperPath(filePath);
    let controllerPath = Paths.getAuraBundleControllerPath(filePath);
    let templatePath = Paths.getAuraDocUserTemplate();
    let helper: AuraJSFunction[] | undefined;
    let controller: AuraJSFunction[] | undefined;
    if (FileChecker.isExists(helperPath)) {
        helper = new JSParser(helperPath).parse()!.methods;
    }
    if (FileChecker.isExists(controllerPath)) {
        controller = new JSParser(controllerPath).parse()!.methods;
    }
    if (FileChecker.isExists(templatePath)) {
        let templateContent = FileReader.readFileSync(templatePath);
        var snippet = SnippetUtils.getAuraDocumentationSnippet(controller, helper, templateContent);
        let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
        Editor.replaceEditorContent(editor, replaceRange, snippet);
        editor.revealRange(editor.document.lineAt(0).range);
    }
    else {
        NotificationManager.showError("Aura Documentation Template does not exists. Run Edit Aura Documentation Template command for create it");
    }
}