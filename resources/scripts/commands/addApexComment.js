const snippetUtils = require('../utils/snippetUtils');
const languages = require('../languages');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const NotificationManager = require('../output/notificationManager');
const FileChecker = fileSystem.FileChecker
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const window = vscode.window;
const workspace = vscode.workspace;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const ApexParser = languages.ApexParser;

exports.run =  function(position) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isApexClass(editor.document.uri.fsPath)) {
            addApexComment(editor, position);
        } else {
            NotificationManager.showError('The selected file is not an Apex Class');
        }
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addApexComment(editor, position) {
    let lineNum;
    if (position !== undefined) {
        lineNum = position.line + 1;
    }
    else {
        lineNum = editor.selection.active.line + 1;
    }
    var methodOrClassLine = editor.document.lineAt(lineNum);
    if (!methodOrClassLine.isEmptyOrWhitespace) {
        let endLoop = false;
        let content = "";
        while (!endLoop) {
            if (methodOrClassLine.text.indexOf("{") === -1 || methodOrClassLine.text.indexOf(";") === -1) {
                content += methodOrClassLine.text + "\n";
            } else {
                content += methodOrClassLine.text + "\n";
                endLoop = true;
            }
            lineNum++;
            methodOrClassLine = editor.document.lineAt(lineNum);
        }
        const apexClassOrMethod = ApexParser.parseForComment(methodOrClassLine);
        workspace.openTextDocument(Paths.getApexCommentUserTemplatePath()).then((template) => processTemplate(template, apexClassOrMethod, position, editor))
    } else { 
        
    }
}

function processTemplate(template, apexClassOrMethod, position, editor) {
    let commentTemplate = JSON.parse(FileReader.readDocument(template));
    const apexComment = snippetUtils.getApexComment(apexClassOrMethod, commentTemplate);
    let replaceRange = new Range(position.line, countStartWhitespaces(editor.document.lineAt(position.line).text), position.line, editor.document.lineAt(position.line).text.length);
    FileWriter.replaceEditorContent(editor, replaceRange, '');
    editor.insertSnippet(new SnippetString(`${apexComment}`), position);
}

function countStartWhitespaces(str) {
    let number = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ' ')
            number++;
        else
            break;
    }
    return number;
}