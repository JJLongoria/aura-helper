const vscode = require('vscode');

function getActiveFileFullPath(){
	return getActiveEditor().document.uri.fsPath
}

function getActiveEditor(){
	return vscode.window.activeTextEditor;
}

function getAllTextRange(editor){
    var firstLine = editor.document.lineAt(0);
	var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
	return new vscode.Range(0, firstLine.range.start.character, editor.document.lineCount - 1, lastLine.range.end.character);
}

function replaceContent(editor, range, content){
	editor.edit(editBuilder =>{
		editBuilder.replace(range, content);
	});
}


module.exports = {
	getAllTextRange,
	getActiveEditor,
	getActiveFileFullPath,
	replaceContent
}