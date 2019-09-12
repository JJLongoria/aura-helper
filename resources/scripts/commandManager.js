const vscode = require('vscode');
const editorUtils = require('./editorUtils');
const fileUtils = require('./fileUtils');
const documentUtils = require('./documentUtils');
const logger = require('./logger');
const windowUtils = require("./windowUtils");
const snippetUtils = require("./snippetUtils");
const languageUtils = require("./languageUtils");
const processManager = require("./processManager");

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

function refreshMetadataIndexCommand(context) {
	vscode.window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then(selection => {
		if (selection === 'Ok') {
			let activeOrgs;
			let activeOrgsPath = fileUtils.getStoredOrgsPath(context);
			if (!fileUtils.isFileExists(activeOrgsPath))
				fileUtils.createFileSync(activeOrgsPath, "[\n\n]");
			activeOrgs = JSON.parse(fileUtils.getFileContent(activeOrgsPath));
			if (activeOrgs.length > 0) {
				selectOrganizationForRefresh(activeOrgs, activeOrgsPath, function (username) {
					windowUtils.updateStatusBarItem(true, "Refreshing Metadata Index", 'load');
					processManager.refreshMetadataIndex(username, context, onFinishRefresh);
				});
			}
			else {
				addNewOrgForm(function (org) {
					let added = addNewOrg(org, activeOrgs, activeOrgsPath);
					if (added) {
						windowUtils.updateStatusBarItem(true, "Refreshing Metadata Index", 'load');
						processManager.refreshMetadataIndex(org.username, context, onFinishRefresh);
					}
				});
			}
		}
	});
}

function refreshMetadataIndexForAnObjectCommand(context) {
	vscode.window.showInformationMessage('Refresh metadata can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then(selection => {
		if (selection === 'Ok') {
			let activeOrgs;
			let activeOrgsPath = fileUtils.getStoredOrgsPath(context);
			if (!fileUtils.isFileExists(activeOrgsPath))
				fileUtils.createFileSync(activeOrgsPath, "[\n\n]");
			activeOrgs = JSON.parse(fileUtils.getFileContent(activeOrgsPath));
			if (activeOrgs.length > 0) {
				selectOrganizationForRefresh(activeOrgs, activeOrgsPath, function (username) {
					windowUtils.updateStatusBarItem(true, "Getting Metadata for Refresh", 'load');
					processManager.listMetadataForRefresh(username, function (result) {
						logger.log("result.objets", result.successData.data.objects);
						if (result.successData) {
							vscode.window.showQuickPick(result.successData.data.objects).then((selected) => {
								windowUtils.updateStatusBarItem(true, "Refreshing Metadata Index", 'load');
								processManager.refreshMetadataForObject(username, context, selected, onFinishRefresh);
							});
						}
						else {
							vscode.window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
						}
					});
				});
			}
			else {
				addNewOrgForm(function (org) {
					let added = addNewOrg(org, activeOrgs, activeOrgsPath);
					if (added) {
						processManager.listMetadataForRefresh(context, function (result) {
							if (result.successData) {
								vscode.window.showQuickPick(result.successData.data.objects).then((selected) => {
									processManager.refreshMetadataForObject(org.username, context, selected, onFinishRefresh);
								});
							}
							else {
								vscode.window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
							}
						});
					}
				});
			}
		}
	});
}

function selectOrganizationForRefresh(activeOrgs, activeOrgsPath, callback) {
	let options = [];
	for (const org of activeOrgs) {
		options.push(org.name + " (" + org.username + ")");
	}
	options.push("Add new organization");
	vscode.window.showQuickPick(options).then((selected) => {
		if (selected === 'Add new organization') {
			addNewOrgForm(function (org) {
				let added = addNewOrg(org.username, activeOrgs, activeOrgsPath);
				if (added) {
					if (callback)
						callback.call(this, org.username);
				}
			});
		} else {
			windowUtils.updateStatusBarItem(true, "Refreshing Metadata Index", 'load');
			let username = selected.substring(selected.indexOf("(") + 1, selected.indexOf(")"));
			if (callback)
				callback.call(this, username);
		}
	});
}

function onFinishRefresh(result) {
	windowUtils.updateStatusBarItem(false, "", '');
	if (result.successData) {
		vscode.window.showInformationMessage(result.successData.message + ". Total: " + result.successData.data.processed);
	} else {
		vscode.window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
	}
}

function addNewOrg(org, activeOrgs, activeOrgsPath) {
	let duplicateUsername = false;
	let duplicateName = false;
	for (const activeOrg of activeOrgs) {
		if (activeOrgs.name === org.name && !duplicateName)
			duplicateName = true;
		if (activeOrg.username === org.username && !duplicateUsername)
			duplicateUsername = true;
	}
	if (duplicateUsername || duplicateName) {
		let message = "Error when adding new org for refresh metadata:";
		if (duplicateName)
			message += "\nOrg Name alredy exists";
		if (duplicateUsername)
			message += "\nOrg Username alredy exists";
		vscode.window.showErrorMessage(message);
	} else {
		activeOrgs.push(org);
		fileUtils.createFileSync(activeOrgsPath, JSON.stringify(activeOrgs, null, 2));
	}
	return !duplicateUsername && !duplicateName;
}

function addNewOrgForm(callback) {
	vscode.window.showInputBox({ placeHolder: "Type your salesforce sfdx authorized org username on SFDX" }).then(username => {
		if (username) {
			vscode.window.showInputBox({ placeHolder: "Type the Name or Alias for your org" }).then(orgName => {
				if (orgName) {
					if (callback)
						callback.call(this, { name: orgName, username: username });
				}
			});
		}
	});
}

function auraCodeCompletionCommand(position, selected, data, componentTagData) {
	logger.log('Run auraCodeCompletionCommand action');
	logger.logJSON('position', position);
	logger.logJSON('selected', selected);
	logger.logJSON('data', data);
	logger.logJSON('componentTagData', componentTagData);
	let editor = editorUtils.getActiveEditor();
	if (!editor)
		return;
	if (selected === 'params') {
		let toReplace = 'c.' + data.name + '.params';
		let lineEditor = editor.document.lineAt(position.line);
		let lineData = languageUtils.analizeJSForPutApexParams(lineEditor.text);
		let startPosition = new vscode.Position(position.line, lineData.startIndex);
		let endPosition = new vscode.Position(position.line, lineData.startIndex + toReplace.length);
		let content = snippetUtils.getJSApexParamsSnippet(data, lineData);
		editorUtils.replaceContent(editor, new vscode.Range(startPosition, endPosition), "");
		editor.insertSnippet(new vscode.SnippetString(`${content}`), startPosition);
	} else if (selected === 'attribute') {
		if (editor.document.uri.fsPath.indexOf('.cmp') === -1)
			return;
		let lineEditor = editor.document.lineAt(position.line);
		let lineData = languageUtils.analizeCMPForPutAttributes(lineEditor.text, position);
		if (!lineData.openBracket) {
			let toReplace = 'v.' + data.name;
			let startPosition = new vscode.Position(position.line, lineData.startColumn);
			let endPosition = new vscode.Position(position.line, lineData.startColumn + toReplace.length);
			let content = "{!v." + data.name + "}"
			editorUtils.replaceContent(editor, new vscode.Range(startPosition, endPosition), "");
			editor.insertSnippet(new vscode.SnippetString(`${content}`), startPosition);
		}
	}
}

function statusBarItemPressedCommand() {

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
	auraCodeCompletionCommand,
	refreshMetadataIndexCommand,
	statusBarItemPressedCommand,
	refreshMetadataIndexForAnObjectCommand
}