const vscode = require('vscode');
const editorUtils = require('./editorUtils');
const fileUtils = require('./fileUtils');
const auraDocUtils = require('./auraDocUtils');
const logger = require('./logger');

function genAuraDocCommand(context) {
	logger.log('Run genAuraDocCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.createAuraDocumentation(context, editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}

function addMethodBlockCommand(context) {
	logger.log('Run addMethodBlockCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.addMethodBlock(context, editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}

function addApexMethodCommentCommand(){
	logger.log('Run addApexMethodCommentCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isApexClassFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.addApexCommentBlock(editor, undefined);
	else
		vscode.window.showErrorMessage('The selected file is not an Apex Class File');
}

function apexCommentCompletionCommand(position){
	logger.log('Run apexCommentCompletion action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isApexClassFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.addApexCommentBlock(editor, position);
	else
		vscode.window.showErrorMessage('The selected file is not an Apex Class File');
}

function addJSFunctionCommand(){
	logger.log('Run addJSFunction action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if(fileUtils.isJavascriptFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.addJSFunction(editor);
	else
		vscode.window.showErrorMessage('The selected file is not a JavaScript File');
}

function newAuraFileCommand(context){
	logger.log('Run newAuraFileCommand action');
}

module.exports = {
    genAuraDocCommand,
    addMethodBlockCommand,
    addApexMethodCommentCommand,
    apexCommentCompletionCommand,
	addJSFunctionCommand,
	newAuraFileCommand
}