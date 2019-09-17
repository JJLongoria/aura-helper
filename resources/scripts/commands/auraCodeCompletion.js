const languages = require('../languages');
const snippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const FileChecker = fileSystem.FileChecker;
const FileWriter = fileSystem.FileWriter;
const window = vscode.window;
const Position = vscode.Position;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const JavaScriptParser = languages.JavaScriptParser;
const AuraParser = languages.AuraParser;

exports.run = function(position, selected, data, componentTagData) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        processAuraCodeCompletion(position, selected, data, componentTagData);
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function processAuraCodeCompletion(position, selected, data, componentTagData) {
    var editor = window.activeTextEditor;
    if (selected === 'params') {
        processJSApexParamsCompletion(position, data, editor);
    } else if (selected === 'attribute') {
        processComponentAttributesCompletion(position, data, editor);
    } else if(selected === "snippet"){
        processSnippetsCompletion(position, data, editor);
    }
}

function processSnippetsCompletion(position, data, editor){
    let activation = data.prefix.split('.')[0];
    if(FileChecker.isJavaScript(editor.document.uri.fsPath)){
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
    let startPosition = new Position(position.line, lineData.startIndex);
    let endPosition = new Position(position.line, lineData.startIndex + toReplace.length);
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