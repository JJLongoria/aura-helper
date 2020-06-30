const logger = require('../utils/logger');
const snippetUtils = require('../utils/snippetUtils');
const languages = require('../languages');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const Range = vscode.Range;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const JavaScriptParser = languages.JavaScriptParser;

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
        window.showTextDocument(Paths.asUri(filePath)).then((editor) => createDoc(editor));
    }
}

function createDoc(editor) {
    let filePath = editor.document.uri.fsPath;
    let helperPath = Paths.getBundleHelperPath(filePath);
    let controllerPath = Paths.getBundleControllerPath(filePath);
    let templatePath = Paths.getAuraDocumentUserTemplatePath();
    let helper;
    let controller;
    if (FileChecker.isExists(helperPath)) {
        helper = JavaScriptParser.parse(FileReader.readFileSync(helperPath));
    }
    if (FileChecker.isExists(controllerPath)) {
        controller = JavaScriptParser.parse(FileReader.readFileSync(controllerPath));
    }
    if (FileChecker.isExists(templatePath)) {
        let templateContent = FileReader.readFileSync(templatePath);
        var snippet = snippetUtils.getAuraDocumentationSnippet(controller, helper, templateContent);
        let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
        FileWriter.replaceEditorContent(editor, replaceRange, snippet);
        editor.revealRange(editor.document.lineAt(0).range);
    }
    else {
        NotificationManager.showError("Aura Documentation Template does not exists. Run Edit Aura Documentation Template command for create it");
    }
}