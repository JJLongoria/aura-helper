// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const editorUtils = require('./resources/scripts/editorUtils');
const fileUtils = require('./resources/scripts/fileUtils');
const auraDocUtils = require('./resources/scripts/auraDocUtils');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Aura Helper Extension is now active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let genAuraDoc = vscode.commands.registerCommand('extension.genAuraDoc', function () {
		genAuraDocCommand(context);
	});
	let addMethodBlock = vscode.commands.registerCommand('extension.addMethodBlock', function () {
		addMethodBlockCommand(context);
	});
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

function genAuraDocCommand(context) {
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.createAuraDocumentation(context, editorUtils.getAllTextRange(editor), editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}

function addMethodBlockCommand(context) {
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		auraDocUtils.addMethodBlock(context, editor.selection, editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}