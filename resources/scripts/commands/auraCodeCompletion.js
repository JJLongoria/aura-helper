const languages = require('../languages');
const snippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Config = require('../core/config');
const NotificationManager = require('../output/notificationManager');
const FileChecker = fileSystem.FileChecker;
const FileWriter = fileSystem.FileWriter;
const window = vscode.window;
const Position = vscode.Position;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const JavaScriptParser = languages.JavaScriptParser;
const AuraParser = languages.AuraParser;

exports.run = function (position, selected, data, componentTagData) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        processAuraCodeCompletion(position, selected, data, componentTagData);
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function processAuraCodeCompletion(position, selected, data, componentTagData) {
    var editor = window.activeTextEditor;
    if (selected === 'params') {
        processJSApexParamsCompletion(position, data, editor);
    } else if (selected === 'attribute') {
        processComponentAttributesCompletion(position, data, editor);
    } else if (selected === "snippet") {
        processSnippetsCompletion(position, data, editor);
    } else if (selected === "CustomLabelJS") {
        processCustomLabelCompletionInJS(position, data, editor);
    } else if (selected === "CustomLabelAura") {
        processCustomLabelCompletionInAura(position, data, editor);
    } else if (selected === "sObjectPickVal")
        processPicklistValue(position, editor, data);
}

function processPicklistValue(position, editor, data) {
    let firstWord = data.activations[0];
    let activationInfo = data.activationInfo;
    let field = data.field;
    let pickVal = data.value;
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = AuraParser.parseForPutPickVals(lineEditor.text, position);
    let toReplace = firstWord + '.' + field.name + '.' + pickVal.value;
    let startPosition = new Position(position.line, activationInfo.startColumn);
    let endPosition = new Position(position.line, startPosition.character + toReplace.length);
    let content = '';
    if (FileChecker.isAuraComponent(editor.document.uri.fsPath)) {
        content = pickVal.value;
    } else if (FileChecker.isJavaScript(editor.document.uri.fsPath)) {
        if (lineData.isOnText)
            content = pickVal.value;
        else
            content = "'" + pickVal.value + "'";

    }
    FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), content);
}

async function processCustomLabelCompletionInJS(position, data, editor) {
    if (!FileChecker.isJavaScript(editor.document.uri.fsPath))
        return;
    let orgNamespace = Config.getOrgNamespace();
    if (!orgNamespace || orgNamespace.length === 0)
        orgNamespace = 'c';
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = AuraParser.parseForPutLabels(lineEditor.text, position);
    let toReplace = 'label.' + data.label.fullName;
    let startPosition = new Position(position.line, lineData.startColumn);
    let endPosition = new Position(position.line, startPosition.character + toReplace.length);
    let content = "$A.get(\"$Label." + orgNamespace + "." + data.label.fullName + "\")";
    FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), content);
}

async function processCustomLabelCompletionInAura(position, data, editor) {
    if (!FileChecker.isAuraComponent(editor.document.uri.fsPath))
        return;
    let orgNamespace = Config.getOrgNamespace();
    if (!orgNamespace || orgNamespace.length === 0)
        orgNamespace = 'c';
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = AuraParser.parseForPutLabels(lineEditor.text, position);
    let toReplace = 'label.' + data.label.fullName;
    let startPosition = new Position(position.line, lineData.startColumn);
    let endPosition = new Position(position.line, startPosition.character + toReplace.length);
    let content = "{!$Label." + orgNamespace + "." + data.label.fullName + "}";
    FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), content);
}

function processSnippetsCompletion(position, data, editor) {
    let activation = data.prefix.split('.')[0];
    if (FileChecker.isJavaScript(editor.document.uri.fsPath)) {
        let data = JavaScriptParser.analizeForPutSnippets(editor.document.lineAt(position.line).text, activation);
        let startPosition = new Position(position.line, data.startColumn);
        let endPosition = new Position(position.line, data.endColum);
        FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), "");
    } else {
        let data = AuraParser.analizeForPutSnippets(editor.document.lineAt(position.line).text, activation);
        let startPosition = new Position(position.line, data.startColumn);
        let endPosition = new Position(position.line, data.endColumn);
        FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), "");
    }
}

function processJSApexParamsCompletion(position, data, editor) {
    if (!FileChecker.isJavaScript(editor.document.uri.fsPath))
        return;
    let toReplace = 'c.' + data.name + '.params';
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = JavaScriptParser.analizeForPutApexParams(lineEditor.text);
    let startPosition = new Position(position.line, lineData.startColumn);
    let endPosition = new Position(position.line, startPosition.character + toReplace.length);
    let content = snippetUtils.getJSApexParamsSnippet(data, lineData);
    FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), "");
    editor.insertSnippet(new SnippetString(`${content}`), startPosition);
}

function processComponentAttributesCompletion(position, data, editor) {
    if (!FileChecker.isAuraComponent(editor.document.uri.fsPath))
        return;
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = AuraParser.parseForPutAttributes(lineEditor.text, position);
    if (!lineData.openBracket) {
        let toReplace = 'v.' + data.name;
        let startPosition = new Position(position.line, lineData.startColumn);
        let endPosition = new Position(position.line, lineData.startColumn + toReplace.length);
        let content = "{!v." + data.name + "}"
        FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), "");
        editor.insertSnippet(new SnippetString(`${content}`), startPosition);
    }
}