const languages = require('../languages');
const snippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const Position = vscode.Position;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const ApexParser = languages.ApexParser;

exports.run = function (position, type, data) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isApexClass(editor.document.uri.fsPath))
            processApexCodeCompletion(position, type, editor, data);
        else
            NotificationManager.showError('The selected file is not an Apex Class File');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function processApexCodeCompletion(position, type, editor, data) {
    if (type === "comment")
        processCommentCompletion(position, editor);
    if (type === "sObjectPickVal")
        processPicklistValue(position, editor, data);
}

function processCommentCompletion(position, editor) {
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
            if (methodOrClassLine.text.indexOf("{") === -1 && methodOrClassLine.text.indexOf(";") === -1) {
                content += methodOrClassLine.text + "\n";
            } else if (methodOrClassLine.text.indexOf("}") !== -1) {
                endLoop = true;
            } else {
                content += methodOrClassLine.text + "\n";
                endLoop = true;
            }
            lineNum++;
            methodOrClassLine = editor.document.lineAt(lineNum);
        }
        const apexClassOrMethod = ApexParser.parseForComment(content);
        let templateContent;
        if (FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            templateContent = FileReader.readFileSync(Paths.getApexCommentUserTemplatePath());
        if (templateContent) {
            const apexComment = snippetUtils.getApexComment(apexClassOrMethod, JSON.parse(templateContent));
            FileWriter.replaceEditorContent(editor, new Range(position.line, countStartWhitespaces(editor.document.lineAt(position.line).text), position.line, editor.document.lineAt(position.line).text.length), '');
            editor.insertSnippet(new SnippetString(`${apexComment}`), position);
        } else {
            window.showErrorMessage("Apex Comment Template does not exists. Run Edit Apex Comment Template command for create it");
        }
    }
}

function processPicklistValue(position, editor, data) {
    let firstWord = data.activations[0];
    let activationInfo = data.activationInfo;
    let field = data.field;
    let pickVal = data.value;
    let lineEditor = editor.document.lineAt(position.line);
    let lineData = ApexParser.parseLineData(lineEditor.text, position, firstWord);
    let toReplace = firstWord + '.' + field.name + '.' + pickVal.value;
    let startPosition = new Position(position.line, activationInfo.startColumn);
    let endPosition = new Position(position.line, startPosition.character + toReplace.length);
    let content = '';
    if (lineData.isOnText) {
        content = pickVal.value;
    } else {
        content = '\'' + pickVal.value + '\'';
    }
    FileWriter.replaceEditorContent(editor, new Range(startPosition, endPosition), content);
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