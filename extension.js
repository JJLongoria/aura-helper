// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const commandManager = require('./resources/scripts/commandManager');
const providers = require('./resources/scripts/providers');
const fileUtils = require('./resources/scripts/fileUtils');
const constants = require('./resources/scripts/constants');
const logger = require('./resources/scripts/logger');
const windowUtils = require('./resources/scripts/windowUtils');

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
	onInit(context);
	let addApexMethodComment = vscode.commands.registerCommand('aurahelper.completion.apex.comment', function () {
		try {
			commandManager.addApexMethodCommentCommand();
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when adding a Method or Class Comment on file");
		}
	});
	let addJSFunction = vscode.commands.registerCommand('aurahelper.completion.js.function', function () {
		try {
			commandManager.addJSFunctionCommand();
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when adding a JavaScript function on file");
		}
	});
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.completion.documentation.method', function () {
		try {
			commandManager.addMethodBlockCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when adding a method block to Aura Documentation");
		}
	});
	let editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.template.apex.comment', function () {
		try {
			commandManager.editApexCommentTemplateCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when editing Apex Comment Template");
		}
	});
	let editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.template.aura.documentation', function () {
		try {
			commandManager.editAuraDocumentationTemplateCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when editing Aura Documentation Template");
		}
	});
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.completion.aura.documentation', function (fileUri) {
		try {
			commandManager.genAuraDocCommand(context, fileUri);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when generating Aura Documentation");
		}
	});
	let help = vscode.commands.registerCommand('aurahelper.help', function () {
		try {
			commandManager.openHelpCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when opening Aura Helper Help");
		}
	});
	let newAuraFile = vscode.commands.registerCommand('aurahelper.file.new.aura', function (fileUri) {
		try {
			commandManager.newAuraFileCommand(context, fileUri);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when creating new Aura file");
		}
	});
	let refreshMetadataIndex = vscode.commands.registerCommand('aurahelper.metadata.refresh.index', function () {
		try {
			commandManager.refreshMetadataIndexCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when Refreshing Metadata Index");
		}
	});
	let refreshMetadataIndexForObject = vscode.commands.registerCommand('aurahelper.metadata.refresh.object', function () {
		try {
			commandManager.refreshMetadataIndexForAnObjectCommand(context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when Refreshing Metadata Index for an specific object");
		}
	});


	vscode.commands.registerCommand('aurahelper.apexComentCompletion', function (position) {
		try {
			commandManager.apexCommentCompletionCommand(position, context);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when analizing Apex code for show completion tools");
		}
	});
	vscode.commands.registerCommand('aurahelper.auraCodeCompletion', function (position, selected, data, componentTagData) {
		try {
			commandManager.auraCodeCompletionCommand(position, selected, data, componentTagData);
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("An error ocurred when analizing Aura code for show completion tools");
		}
	});
	vscode.commands.registerCommand('aurahelper.statusBarItemPressed', function () {
		try {
			commandManager.statusBarItemPressedCommand();
		}
		catch (error) {
			logger.log(error);
			windowUtils.showErrorMessage("");
		}
	});

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.codeCompletionProvider, '*'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('xml', providers.codeCompletionProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', providers.codeCompletionProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', providers.codeCompletionProvider, '.'));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('visualforce', providers.codeCompletionProvider, '.'));
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
	context.subscriptions.push(windowUtils.createStatusBarItem());
}
exports.activate = activate;

function onInit(context) {
	console.log('Aura Helper Extension is now active');
	console.log('Aura Helper Init files');
	init(context, function(){
		console.log('Aura Helper files initialized');
	});
}

async function init(context, callback){
	constants.applicationContext = context;
	constants.componentsDetail = JSON.parse(fileUtils.getFileContent(fileUtils.getBaseComponentsDetailPath(context)));
	if (!fileUtils.isFileExists(context.storagePath))
		fileUtils.createFolder(context.storagePath);
	if (!fileUtils.isFileExists(fileUtils.getUserTemplatesPath(context)))
		fileUtils.createFolder(fileUtils.getUserTemplatesPath(context));
	if (!fileUtils.isFileExists(fileUtils.getAuraDocumentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getAuraDocumentTemplatePath(context), fileUtils.getAuraDocumentUserTemplatePath(context));
	if (!fileUtils.isFileExists(fileUtils.getApexCommentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getApexCommentTemplatePath(context), fileUtils.getApexCommentUserTemplatePath(context));
	if (!fileUtils.isFileExists(fileUtils.getMetadataIndexPath(context)))
		fileUtils.createFolder(fileUtils.getMetadataIndexPath(context));
	if (fileUtils.isFileExists(fileUtils.getOldApexCommentTemplatePath(context)) && !fileUtils.isFileExists(fileUtils.getApexCommentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getOldApexCommentTemplatePath(context), fileUtils.getApexCommentUserTemplatePath(context));
	if (fileUtils.isFileExists(fileUtils.getOldAuraDocumentUserTemplatePath(context)) && !fileUtils.isFileExists(fileUtils.getAuraDocumentUserTemplatePath(context)))
		fileUtils.copyFile(fileUtils.getOldAuraDocumentUserTemplatePath(context), fileUtils.getAuraDocumentUserTemplatePath(context));
	if(callback)
		callback.call(this);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}