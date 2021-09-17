const logger = require('../utils/logger');
const snippetUtils = require('../utils/snippetUtils');
const { JSParser } = require('@ah/languages').JavaScript;
const vscode = require('vscode');
const { FileChecker, FileReader } = require('@ah/core').FileSystem;
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const Range = vscode.Range;
const Paths = require('../core/paths');
const Editor = require('../output/editor');

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        logger.log('filePath', filePath);
        if (filePath)
            generateDocumentation(filePath);
        else
            NotificationManager.showError("Not file selected for generate documentation");
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function generateDocumentation(filePath) {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        createDoc(editor);
    } else {
        window.showTextDocument(Paths.toURI(filePath)).then((editor) => createDoc(editor));
    }
}

function createDoc(editor) {
    let filePath = editor.document.uri.fsPath;
    let helperPath = Paths.getAuraBundleHelperPath(filePath);
    let controllerPath = Paths.getAuraBundleControllerPath(filePath);
    let templatePath = Paths.getAuraDocUserTemplate();
    let helper;
    let controller;
    if (FileChecker.isExists(helperPath)) {
        helper = new JSParser(helperPath).parse().methods;
    }
    if (FileChecker.isExists(controllerPath)) {
        controller = new JSParser(controllerPath).parse().methods;
    }
    if (FileChecker.isExists(templatePath)) {
        let templateContent = FileReader.readFileSync(templatePath);
        var snippet = snippetUtils.getAuraDocumentationSnippet(controller, helper, templateContent);
        let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
        Editor.replaceEditorContent(editor, replaceRange, snippet);
        editor.revealRange(editor.document.lineAt(0).range);
    }
    else {
        NotificationManager.showError("Aura Documentation Template does not exists. Run Edit Aura Documentation Template command for create it");
    }
}