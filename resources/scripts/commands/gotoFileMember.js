const vscode = require('vscode');

exports.run = function(line, column) {
    let editor = vscode.window.activeTextEditor;
    if(!editor)
        return;
    let range = new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, column + 1));
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
}