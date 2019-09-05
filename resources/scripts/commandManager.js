const vscode = require('vscode');
const editorUtils = require('./editorUtils');
const fileUtils = require('./fileUtils');
const documentUtils = require('./documentUtils');
const logger = require('./logger');
const windowUtils = require("./windowUtils");
const snippetUtils = require("./snippetUtils");

function genAuraDocCommand(context) {
	logger.log('Run genAuraDocCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		documentUtils.createAuraDocumentation(context, editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}

function addMethodBlockCommand(context) {
	logger.log('Run addMethodBlockCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraDocFile(editorUtils.getActiveFileFullPath()))
		documentUtils.addMethodBlock(context, editor);
	else
		vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
}

function addApexMethodCommentCommand() {
	logger.log('Run addApexMethodCommentCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isApexClassFile(editorUtils.getActiveFileFullPath()))
		documentUtils.addApexCommentBlock(editor, undefined);
	else
		vscode.window.showErrorMessage('The selected file is not an Apex Class File');
}

function apexCommentCompletionCommand(position, context) {
	logger.log('Run apexCommentCompletion action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isApexClassFile(editorUtils.getActiveFileFullPath()))
		documentUtils.addApexCommentBlock(editor, position, context);
	else
		vscode.window.showErrorMessage('The selected file is not an Apex Class File');
}

function addJSFunctionCommand() {
	logger.log('Run addJSFunction action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isJavascriptFile(editorUtils.getActiveFileFullPath()))
		documentUtils.addJSFunction(editor);
	else
		vscode.window.showErrorMessage('The selected file is not a JavaScript File');
}

function newAuraFileCommand(context, fileUri) {
	logger.log('Run newAuraFileCommand action');
	var filePath;
	if (!fileUri) {
		var editor = editorUtils.getActiveEditor();
		if (!editor)
			return;
		filePath = editorUtils.getActiveFileFullPath();
	}
	else if (fileUri) {
		filePath = fileUri.fsPath;
	} else {
		return;
	}
	logger.log('filePath', filePath);
	if (fileUtils.isAuraComponentFile(filePath) || fileUtils.isAuraComponentFile(filePath)) {
		if (fileUtils.isAuraComponentFile(filePath))
			filePath = fileUtils.getFileFolderPath(filePath);
		fileUtils.getFileNamesFromFolder(filePath, function (existingFileNames) {
			var filesForCreate = fileUtils.getNotExistsAuraFiles(existingFileNames);
			logger.logJSON('filesForCreate', filesForCreate);
			windowUtils.showQuickPick(filesForCreate, "Select an Aura File for Create", function (selected) {
				logger.log('selected', selected);
				if (selected){
					documentUtils.createAuraFile(context, filePath, selected, function(fileCreated){
						if(fileCreated)
							windowUtils.openDocumentOnEditor(fileCreated);
					});
				}
			});
		});
	}
	else {
		vscode.window.showErrorMessage('The selected file is not a Aura Component File');
	}
}

function editAuraDocumentationTemplateCommand(context){
	logger.log('Run editAuraDocumentationTemplateCommand action');
	let baseDocPath = fileUtils.getDocumentTemplatePath(context);
	if(!fileUtils.isFileExists(baseDocPath)){
		fileUtils.createFile(baseDocPath, snippetUtils.getAuraDocumentationBaseTemplate(), function(fileCreated){
			if(fileCreated)
				windowUtils.openDocumentOnEditor(baseDocPath);
		});
	} else{
		windowUtils.openDocumentOnEditor(baseDocPath);
	}
}

function openHelpCommand(context){
	const panel = vscode.window.createWebviewPanel(
        'help',
        'Help for Aura Helper',
        vscode.ViewColumn.One,
        {
          // Enable scripts in the webview
          enableScripts: true
        }
      );
	  fileUtils.getHelp(context, function(help){
		panel.webview.html = help;
	  });
}

module.exports = {
	genAuraDocCommand,
	addMethodBlockCommand,
	addApexMethodCommentCommand,
	apexCommentCompletionCommand,
	addJSFunctionCommand,
	newAuraFileCommand,
	editAuraDocumentationTemplateCommand,
	openHelpCommand
}