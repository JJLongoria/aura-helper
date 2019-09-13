// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const providers = require('./resources/scripts/providers');
const commands = require('./resources/scripts/commands');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	commands.initialization(context);
	let addApexMethodComment = vscode.commands.registerCommand('aurahelper.completion.apex.comment.command', commands.addApexComment);
	let addJSFunction = vscode.commands.registerCommand('aurahelper.completion.js.function', commands.addJSFunction);
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.completion.documentation.method', commands.addMethodBlock);
	let editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.template.apex.comment', commands.editApexCommentTemplate);
	let editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.template.aura.documentation', commands.editAuraDocumentationTemplate);
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.completion.aura.documentation', commands.generateAuraDocumentation);
	let help = vscode.commands.registerCommand('aurahelper.help', commands.help);
	let newAuraFile = vscode.commands.registerCommand('aurahelper.file.new.aura', commands.newAuraFile);
	let refreshMetadataIndex = vscode.commands.registerCommand('aurahelper.metadata.refresh.index', commands.refreshAllMetadataIndex);
	let refreshMetadataIndexForObject = vscode.commands.registerCommand('aurahelper.metadata.refresh.object', commands.refreshObjectMetadataIndex);

	vscode.commands.registerCommand('aurahelper.completion.apex.comment', commands.apexCodeCompletion);
	vscode.commands.registerCommand('aurahelper.completion.aura', commands.auraCodeCompletion);
	
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.apexCompletionProvider, '*'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('xml', providers.auraCompletionProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', providers.auraCompletionProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', providers.javascriptCompletionProvider, '.'));
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
	context.subscriptions.push(addApexMethodComment);
	context.subscriptions.push(addJSFunction);
	context.subscriptions.push(newAuraFile);
	context.subscriptions.push(editAuraDocBaseTemplate);
	context.subscriptions.push(help);
	context.subscriptions.push(editApexCommentTemplate);
	context.subscriptions.push(refreshMetadataIndex);
	context.subscriptions.push(refreshMetadataIndexForObject);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}