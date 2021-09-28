const SnippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { StrUtils } = require('@aurahelper/core').CoreUtils;
const applicationContext = require('../core/applicationContext');
const NotificationManager = require('../output/notificationManager');
const Editor = require('../output/editor');
const TemplateUtils = require('../utils/templateUtils');
const Config = require('../core/config');
const window = vscode.window;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;

exports.run = function (position, type, data) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isApexClass(editor.document.uri.fsPath))
            processApexCodeCompletion(position, editor);
        else
            NotificationManager.showError('The selected file is not an Apex Class File');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function processApexCodeCompletion(position, editor) {
    processCommentCompletion(position, editor);  
}

function processCommentCompletion(position, editor) {
    let lineNum;
    if (position !== undefined) {
        lineNum = position.line + 1;
    }
    else {
        lineNum = editor.selection.active.line + 1;
    }
    let declarationLine = editor.document.lineAt(lineNum);
    if (!declarationLine.isEmptyOrWhitespace) {
        const node = new ApexParser().setContent(FileReader.readDocument(editor.document)).setSystemData(applicationContext.parserData).setCursorPosition(position).isDeclarationOnly(true).parse();
        const templateContent = TemplateUtils.getApexCommentTemplate(!Config.getConfig().documentation.useStandardJavaComments);
        if (templateContent) {
            applicationContext.parserData.template = templateContent;
            const apexComment = SnippetUtils.getApexComment(node, applicationContext.parserData.template, editor.document.uri.fsPath);
            Editor.replaceEditorContent(editor, new Range(position.line, StrUtils.countStartWhitespaces(editor.document.lineAt(position.line).text), position.line, editor.document.lineAt(position.line).text.length), '');
            editor.insertSnippet(new SnippetString(`${apexComment}`), position);
        } else {
            window.showErrorMessage("Apex Comment Template does not exists. Run Edit Apex Comment Template command for create it");
        }
    }
}