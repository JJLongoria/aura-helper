const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;

exports.run = function(line, column, item) {
    let editor = vscode.window.activeTextEditor;
    if(!editor)
        return;
    let selectionRange;
    if (item) {
        let lineData = findProfileLine(editor, item);
        line = lineData.line;
        column = 0;
        selectionRange = new vscode.Selection(new vscode.Position(line, lineData.valueStartColumn), new vscode.Position(line, lineData.valueEndColumn));
    }
    let range = new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, column + 1));
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    if (selectionRange)
        editor.selection = selectionRange;
}

function findProfileLine(editor, item) {
    let xmlContent = FileReader.readFileSync(editor.document.uri.fsPath);
    let xmlLines = xmlContent.split('\n');
    let lineNumber = 0;
    let valueStartColumn = 0;
    let valueEndColumn = 0;
    let found = false;
    let onParent = false;
    let onMember = false;
    for (const line of xmlLines) {
        if (line.indexOf('<' + item.parentMember + '>') != -1)
            onParent = true;
        if (onParent) { 
            if (line.indexOf('<' + item.memberName + '>') != -1)
                onMember = true;
            if (onMember && line.indexOf(item.memberValue) != -1) { 
                valueStartColumn = line.indexOf(item.memberValue);
                valueEndColumn = valueStartColumn + item.memberValue.length;
                found = true;
            }
            if (onMember && line.indexOf('</' + item.memberName + '>') != -1)
                onMember = false;
        }
        if (onParent && line.indexOf('</' + item.parentMember + '>') != -1)
            onParent = false;
        if (found)
            break;
        lineNumber++;
    }
    return { 
        line: lineNumber,
        valueStartColumn: valueStartColumn,
        valueEndColumn: valueEndColumn
    }
}