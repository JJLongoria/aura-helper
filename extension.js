// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const commandManager = require('./resources/scripts/commandManager');
const providers = require('./resources/scripts/providers');
const fileUtils = require('./resources/scripts/fileUtils');
const constants = require('./resources/scripts/constants');

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
	init(context);

	let addApexMethodComment = vscode.commands.registerCommand('aurahelper.addApexComment', function () {
		commandManager.addApexMethodCommentCommand();
	});
	let addJSFunction = vscode.commands.registerCommand('aurahelper.addJsFunction', function () {
		commandManager.addJSFunctionCommand();
	});
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.addMethodBlock', function () {
		commandManager.addMethodBlockCommand(context);
	});
	let editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.editApexCommentTemplate', function () {
		commandManager.editApexCommentTemplateCommand(context);
	});
	let editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.editAuraDocumentationTemplate', function () {
		commandManager.editAuraDocumentationTemplateCommand(context);
	});
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.genAuraDoc', function (fileUri) {
		commandManager.genAuraDocCommand(context, fileUri);
	});
	let help = vscode.commands.registerCommand('aurahelper.help', function () {
		commandManager.openHelpCommand(context);
	});
	let newAuraFile = vscode.commands.registerCommand('aurahelper.newAuraFile', function (fileUri) {
		commandManager.newAuraFileCommand(context, fileUri);
	});


	vscode.commands.registerCommand('aurahelper.apexComentCompletion', function (position) {
		commandManager.apexCommentCompletionCommand(position, context);
	});
	vscode.commands.registerCommand('aurahelper.auraCodeCompletion', function (position) {
		commandManager.auraCodeCompletionCommand(position, context);
	});

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.apexProvider, '*'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('xml', providers.auraComponentProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', providers.auraComponentProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', providers.auraComponentProvider, '.'));
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
	context.subscriptions.push(addApexMethodComment);
	context.subscriptions.push(addJSFunction);
	context.subscriptions.push(newAuraFile);
	context.subscriptions.push(editAuraDocBaseTemplate);
	context.subscriptions.push(help);
	context.subscriptions.push(editApexCommentTemplate);
}
exports.activate = activate;

function init(context) {
	constants.applicationContext = context;
	if (!fileUtils.isFileExists(fileUtils.getUserTemplatesPath(context)))
		fileUtils.createFolder(fileUtils.getUserTemplatesPath(context));
	if (!fileUtils.isFileExists(fileUtils.getAuraDocumentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getAuraDocumentTemplatePath(context), fileUtils.getAuraDocumentUserTemplatePath(context));
	if (!fileUtils.isFileExists(fileUtils.getApexCommentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getApexCommentTemplatePath(context), fileUtils.getApexCommentUserTemplatePath(context));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}