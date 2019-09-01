// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const commandManager = require('./resources/scripts/commandManager');
const providers = require('./resources/scripts/providers');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Aura Helper Extension is now active');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.genAuraDoc', function () {
		commandManager.genAuraDocCommand(context);
	});
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.addMethodBlock', function () {
		commandManager.addMethodBlockCommand(context);
	});
	let addApexMethodComment = vscode.commands.registerCommand('aurahelper.addApexComment', function () {
		commandManager.addApexMethodCommentCommand();
	});
	let addJSFunction = vscode.commands.registerCommand('aurahelper.addJsFunction', function () {
		commandManager.addJSFunctionCommand();
	});
	let newAuraFile = vscode.commands.registerCommand('auraHelper.newAuraFile', function () {
		commandManager.newAuraFileCommand(context);
	});


	vscode.commands.registerCommand('aurahelper.apexComentCompletion', function(commentPosition){
		commandManager.apexCommentCompletionCommand(commentPosition);
	});

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.getApexCommentProvider(), '*'));
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
	context.subscriptions.push(addApexMethodComment);
	context.subscriptions.push(addJSFunction);
	context.subscriptions.push(newAuraFile);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}