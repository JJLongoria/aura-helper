const vscode = require('vscode');
const editorUtils = require('./editorUtils');
const fileUtils = require('./fileUtils');
const documentUtils = require('./documentUtils');
const logger = require('./logger');
const windowUtils = require("./windowUtils");
const snippetUtils = require("./snippetUtils");

function genAuraDocCommand(context, fileUri) {
	logger.log('Run genAuraDocCommand action');
	if (fileUri) {
		if (fileUri.fsPath !== editorUtils.getActiveFileFullPath()) {
			windowUtils.openDocumentOnEditor(fileUri.fsPath, function (editor) {
				if (!editor)
					return;
				if (fileUtils.isAuraDocFile(editor.document.uri.fsPath))
					documentUtils.createAuraDocumentation(context, editor);
				else
					vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
			});
		} else {
			var editor = editorUtils.getActiveEditor();
			if (!editor)
				return;
			if (fileUtils.isAuraDocFile(editor.document.uri.fsPath))
				documentUtils.createAuraDocumentation(context, editor);
			else
				vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
		}
	} else {
		var editor = editorUtils.getActiveEditor();
		if (!editor)
			return;
		if (fileUtils.isAuraDocFile(editor.document.uri.fsPath))
			documentUtils.createAuraDocumentation(context, editor);
		else
			vscode.window.showErrorMessage('The selected file is not an Aura Documentation File');
	}
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
		documentUtils.addAuraCodeCompletion(editor, position, context);
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
	if (fileUtils.isAuraComponentFile(filePath) || fileUtils.isAuraComponentFolder(filePath)) {
		if (fileUtils.isAuraComponentFile(filePath))
			filePath = fileUtils.getFileFolderPath(filePath);
		fileUtils.getFileNamesFromFolder(filePath, function (existingFileNames) {
			var filesForCreate = fileUtils.getNotExistsAuraFiles(existingFileNames);
			logger.logJSON('filesForCreate', filesForCreate);
			windowUtils.showQuickPick(filesForCreate, "Select an Aura File for Create", function (selected) {
				logger.log('selected', selected);
				if (selected) {
					documentUtils.createAuraFile(context, filePath, selected, function (fileCreated) {
						if (fileCreated)
							windowUtils.openDocumentOnEditor(fileCreated);
					});
				}
			});
		});
	}
	else {
		vscode.window.showErrorMessage('The selected file is not a Aura Component File or Folder');
	}
}

function editAuraDocumentationTemplateCommand(context) {
	logger.log('Run editAuraDocumentationTemplateCommand action');
	let baseDocPath = fileUtils.getAuraDocumentUserTemplatePath(context);
	if (!fileUtils.isFileExists(baseDocPath)) {
		fileUtils.createFile(baseDocPath, snippetUtils.getAuraDocumentationBaseTemplate(), function (fileCreated) {
			if (fileCreated)
				windowUtils.openDocumentOnEditor(baseDocPath);
		});
	} else {
		windowUtils.openDocumentOnEditor(baseDocPath);
	}
}

function editApexCommentTemplateCommand(context) {
	logger.log('Run editApexCommentTemplateCommand action');
	let baseDocPath = fileUtils.getApexCommentUserTemplatePath(context);
	if (!fileUtils.isFileExists(baseDocPath)) {
		fileUtils.createFile(baseDocPath, snippetUtils.getApexCommentBaseTemplate(), function (fileCreated) {
			if (fileCreated)
				windowUtils.openDocumentOnEditor(baseDocPath);
		});
	} else {
		windowUtils.openDocumentOnEditor(baseDocPath);
	}
}

function openHelpCommand(context) {
	const panel = vscode.window.createWebviewPanel(
		'help',
		'Help for Aura Helper',
		vscode.ViewColumn.One,
		{
			// Enable scripts in the webview
			enableScripts: true
		}
	);
	fileUtils.getHelp(context, function (help) {
		panel.webview.html = help;
	});
}

function auraCodeCompletionCommand(position, context) {
	logger.log('Run auraCodeCompletionCommand action');
	var editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (fileUtils.isAuraComponentFile(editorUtils.getActiveFileFullPath()) || fileUtils.isJavascriptFile(editorUtils.getActiveFileFullPath()))
		documentUtils.addAuraCodeCompletion(editor, position);
	else
		vscode.window.showErrorMessage('The selected file is not an Apex Class File');
}

module.exports = {
	genAuraDocCommand,
	addMethodBlockCommand,
	addApexMethodCommentCommand,
	apexCommentCompletionCommand,
	addJSFunctionCommand,
	newAuraFileCommand,
	editAuraDocumentationTemplateCommand,
	openHelpCommand,
	editApexCommentTemplateCommand,
	auraCodeCompletionCommand
}