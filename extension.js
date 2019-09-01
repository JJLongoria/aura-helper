// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const editorUtils = require('./resources/scripts/editorUtils');
const fileUtils = require('./resources/scripts/fileUtils');
const auraDocUtils = require('./resources/scripts/auraDocUtils');
const logger = require('./resources/scripts/logger');

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
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.genAuraDoc', function () {
		genAuraDocCommand(context);
	});
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.addMethodBlock', function () {
		addMethodBlockCommand(context);
	});
	let addApexMethodComment = vscode.commands.registerCommand('aurahelper.addApexComment', function () {
		addApexMethodCommentCommand();
	});
	let addJSFunction = vscode.commands.registerCommand('aurahelper.addJsFunction', function () {
		addJSFunctionCommand();
	});

	vscode.commands.registerCommand('aurahelper.apexComentCompletion', (commentPosition) => apexCommentCompletion(commentPosition));
    let apexCommentProvider = {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line).text;
            if (line.indexOf('/**') === -1) {
                return Promise.resolve(undefined);
            }
            let item = new vscode.CompletionItem('/** */', vscode.CompletionItemKind.Snippet);
            item.detail = 'Apex Comment';
            item.insertText = '';
            item.command = {
                title: 'Apex Comment',
                command: 'aurahelper.apexComentCompletion',
                arguments: [position]
            };
            return Promise.resolve([item]);
        }
	};
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', apexCommentProvider, '*'));
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
	context.subscriptions.push(addApexMethodComment);
	context.subscriptions.push(addJSFunction);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

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

function apexCommentCompletion(position){
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