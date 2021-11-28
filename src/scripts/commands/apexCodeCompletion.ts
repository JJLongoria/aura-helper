import * as vscode from 'vscode';
import { SnippetUtils } from '../utils/snippetUtils';
import { NotificationManager, Editor } from '../output';
import { TemplateUtils } from '../utils/templateUtils';
import applicationContext from '../core/applicationContext';
import { Config } from '../core/config';
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { StrUtils } = require('@aurahelper/core').CoreUtils;
const window = vscode.window;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const ProviderUtils = require('../providers/utils');

export function run(position: vscode.Position): void {
    try {
        var editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (FileChecker.isApexClass(editor.document.uri.fsPath)) {
            processApexCodeCompletion(position, editor);
        } else {
            NotificationManager.showError('The selected file is not an Apex Class File');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function processApexCodeCompletion(position: vscode.Position, editor: vscode.TextEditor): void {
    processCommentCompletion(position, editor);
}

function processCommentCompletion(position: vscode.Position, editor: vscode.TextEditor): void {
    let lineNum;
    if (position !== undefined) {
        lineNum = position.line + 1;
    }
    else {
        lineNum = editor.selection.active.line + 1;
    }
    let declarationLine = editor.document.lineAt(lineNum);
    if (!declarationLine.isEmptyOrWhitespace) {
        const node = new ApexParser().setContent(FileReader.readDocument(editor.document)).setSystemData(applicationContext.parserData).setCursorPosition(ProviderUtils.fixPositionOffset(editor.document, position)).isDeclarationOnly(true).parse();
        const templateContent = TemplateUtils.getApexCommentTemplate(!Config.getConfig().documentation.useStandardJavaComments);
        if (templateContent) {
            applicationContext.parserData.template = templateContent;
            const apexComment = SnippetUtils.getApexComment(node, applicationContext.parserData.template, editor.document.uri.fsPath, declarationLine);
            Editor.replaceEditorContent(editor, new Range(position.line, 0, position.line, editor.document.lineAt(position.line).text.length), '');
            editor.insertSnippet(new SnippetString(`${apexComment}`), position);
        } else {
            window.showErrorMessage("Apex Comment Template does not exists. Run Edit Apex Comment Template command for create it");
        }
    }
}