const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const editorUtils = require("./editorUtils");
const languageUtils = require("./languageUtils");
const windowUtils = require("./windowUtils");
const snippetUtils = require('./snippetUtils');
const logger = require('./logger');

function createAuraDocumentation(context, editor) {
	let helperPath = editor.document.uri.fsPath.replace('.auradoc', 'Helper.js');
	let controllerPath = editor.document.uri.fsPath.replace('.auradoc', 'Controller.js');
	if (fileUtils.isFileExists(helperPath)) {
		fileUtils.getDocumentObject(helperPath, function (helperDoc) {
			if (fileUtils.isFileExists(controllerPath)) {
				fileUtils.getDocumentObject(controllerPath, function (controllerDoc) {
					fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
						var helperMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(helperDoc));
						var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
						var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
						editorUtils.replaceContent(editor, editorUtils.getAllTextRange(editor), snippet);
						editor.revealRange(editor.document.lineAt(0).range);
					});
				});
			} else {
				fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
					var helperMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(helperDoc));
					var controllerMethods = [];
					var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
					editorUtils.replaceContent(editor, editorUtils.getAllTextRange(editor), snippet);
					editor.revealRange(editor.document.lineAt(0).range);
				});
			}
		});
	} else {
		if (fileUtils.isFileExists(controllerPath)) {
			fileUtils.getDocumentObject(controllerPath, function (controllerDoc) {
				fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
					var helperMethods = [];
					var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
					var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
					editorUtils.replaceContent(editor, editorUtils.getAllTextRange(editor), snippet);
					editor.revealRange(editor.document.lineAt(0).range);
				});
			});
		} else {
			fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
				var helperMethods = [];
				var controllerMethods = [];
				var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
				editorUtils.replaceContent(editor, editorUtils.getAllTextRange(editor), snippet);
				editor.revealRange(editor.document.lineAt(0).range);
			});
		}
	}
}

function createNewAuraDocumentation(context, filePath, callback) {
	logger.log('Execute createNewAuraDocumentation method');
	let helperPath = filePath.replace('.auradoc', 'Helper.js');
	let controllerPath = filePath.replace('.auradoc', 'Controller.js');
	logger.log('helperPath', helperPath);
	logger.log('controllerPath', controllerPath);
	if (fileUtils.isFileExists(helperPath)) {
		fileUtils.getDocumentObject(helperPath, function (helperDoc) {
			if (fileUtils.isFileExists(controllerPath)) {
				fileUtils.getDocumentObject(controllerPath, function (controllerDoc) {
					fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
						var helperMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(helperDoc));
						var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
						var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
						callback.call(this, snippet);
					});
				});
			} else {
				fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
					var helperMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(helperDoc));
					var controllerMethods = [];
					var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
					callback.call(this, snippet);
				});
			}
		});
	} else {
		if (fileUtils.isFileExists(controllerPath)) {
			fileUtils.getDocumentObject(controllerPath, function (controllerDoc) {
				fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
					var helperMethods = [];
					var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
					var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
					callback.call(this, snippet);
				});
			});
		} else {
			fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
				var helperMethods = [];
				var controllerMethods = [];
				var snippet = snippetUtils.getAuraDocumentationSnippet(controllerMethods, helperMethods, auraDocTemplate);
				callback.call(this, snippet);
			});
		}
	}
}

function addMethodBlock(context, editor) {
	let helperPath = editor.document.uri.fsPath.replace('.auradoc', 'Helper.js');
	let controllerPath = editor.document.uri.fsPath.replace('.auradoc', 'Controller.js');
	if (fileUtils.isFileExists(helperPath)) {
		fileUtils.getDocumentObject(helperPath, function (helperDoc) {
			if (fileUtils.isFileExists(controllerPath)) {
				fileUtils.getDocumentObject(controllerPath, function (controllerDoc) {
					fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
						var helperMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(helperDoc));
						var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
						windowUtils.showQuickPick(["Controller Methods", "Helper Methods"], "Select a file for get a method", function (fileSelected) {
							var methodNames = [];
							if (fileSelected == "Controller Methods") {
								logger.log("Controller Methods Selected");
								for (let i = 0; i < controllerMethods.functions.length; i++) {
									const method = controllerMethods.functions[i];
									if (method.type == 'func')
										methodNames.push(method.signature);
								}
							}
							else if (fileSelected == "Helper Methods") {
								logger.log("Helper Methods Selected");
								var methodNames = [];
								for (let i = 0; i < helperMethods.functions.length; i++) {
									const method = helperMethods.functions[i];
									if (method.type == 'func')
										methodNames.push(method.signature);
								}
							}
							if (methodNames.length > 0) {
								windowUtils.showQuickPick(methodNames, "Select a method to add", function (methodSelected) {
									var methods = [];
									logger.log("Method Selected: " + methodSelected);
									if (fileSelected == "Controller Methods") {
										methods = controllerMethods.functions;
									}
									else if (fileSelected == "Helper Methods") {
										methods = helperMethods.functions;
									}
									for (let i = 0; i < methods.length; i++) {
										const method = methods[i];
										if (method.signature == methodSelected) {
											let auraDocTemplateJSON = JSON.parse(fileUtils.getDocumentText(auraDocTemplate));
											var methodContent = snippetUtils.getMethodContent(method, auraDocTemplateJSON.methodBody, auraDocTemplateJSON.paramBody, snippetUtils.getWhitespaces(editor.selection.start.character)).trimLeft();
											editorUtils.replaceContent(editor, editor.selection, methodContent);
										}
									}
								});
							}
							else {
								vscode.window.showInformationMessage("Not methods found in selected file");
							}
						});
					});
				});
			} else {
				windowUtils.showInformationMessage("Files not found. No have methods to add because controller and helper file not exists");
			}
		});
	} else {
		if (fileUtils.isFileExists(controllerPath)) {
			fileUtils.getDocumentObject(editor.document.uri.fsPath.replace('.auradoc', 'controller.js'), function (controllerDoc) {
				fileUtils.getDocumentObject(fileUtils.getAuraDocumentUserTemplatePath(context), function (auraDocTemplate) {
					var controllerMethods = languageUtils.parseJSFile(fileUtils.getDocumentText(controllerDoc));
					windowUtils.showQuickPick(["Controller Methods"], "Select a file for get a method", function (fileSelected) {
						var methodNames = [];
						if (fileSelected == "Controller Methods") {
							logger.log("Controller Methods Selected");
							for (let i = 0; i < controllerMethods.functions.length; i++) {
								const method = controllerMethods.functions[i];
								if (method.type == 'func')
									methodNames.push(method.signature);
							}
						}
						if (methodNames.length > 0) {
							windowUtils.showQuickPick(methodNames, "Select a method to add", function (methodSelected) {
								var methods = [];
								logger.log("Method Selected: " + methodSelected);
								if (fileSelected == "Controller Methods") {
									methods = controllerMethods.functions;
								}
								for (let i = 0; i < methods.length; i++) {
									const method = methods[i];
									if (method.signature == methodSelected) {
										let auraDocTemplateJSON = JSON.parse(fileUtils.getDocumentText(auraDocTemplate));
										var methodContent = snippetUtils.getMethodContent(method, auraDocTemplateJSON.methodBody, auraDocTemplateJSON.paramBody, snippetUtils.getWhitespaces(editor.selection.start.character)).trimLeft();
										editorUtils.replaceContent(editor, editor.selection, methodContent);
									}
								}
							});
						}
						else {
							vscode.window.showInformationMessage("Not methods found in selected file");
						}
					});
				});
			});
		} else {
			windowUtils.showInformationMessage("Files not found. No have methods to add because controller and helper file not exists");
		}
	}
}

function countStartWhitespaces(str) {
	let number = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] == ' ')
			number++;
		else
			break;
	}
	return number;
}

function addApexCommentBlock(editor, position, context) {
	logger.log('Execute addApexCommentBlock method');
	logger.log('position', position);
	// Get the line that we are currently on
	let lineNum;
	if (position !== undefined) {
		lineNum = position.line + 1;
	}
	else {
		lineNum = editor.selection.active.line + 1;
	}
	var methodOrClassLine = editor.document.lineAt(lineNum);
	// If the line starts with a @, then it's a @AuraEnabled or @RemoteAction and look at the next line
	var currLine = lineNum;
	while (methodOrClassLine.text.trim().startsWith('@')) {
		currLine++;
		methodOrClassLine = editor.document.lineAt(currLine);
	}
	// If the line is not empty, parse it and add in a snippet on the line above.
	if (!methodOrClassLine.isEmptyOrWhitespace) {
		const apexClassOrMethod = languageUtils.parseApexClassOrMethod(methodOrClassLine.text);
		fileUtils.getDocumentObject(fileUtils.getApexCommentUserTemplatePath(context), function (commentTemplateDoc) {
			let commentTemplate = JSON.parse(fileUtils.getDocumentText(commentTemplateDoc));
			const apexComment = snippetUtils.getApexComment(apexClassOrMethod, commentTemplate);

			editorUtils.replaceContent(editor, new vscode.Range(position.line, countStartWhitespaces(editor.document.lineAt(position.line).text), position.line, editor.document.lineAt(position.line).text.length), '');
			editor.insertSnippet(new vscode.SnippetString(`${apexComment}`), position);
		});
	}
}

function addJSFunction(editor) {
	logger.log('Execute addJSFunction method');
	windowUtils.showInputBoxNumber("Set the function params number", function (number) {
		if (number >= 0) {
			const funcBody = snippetUtils.getJSFunctionSnippet(number);
			editor.insertSnippet(new vscode.SnippetString(`${funcBody}`), editor.selection);
		}
	});
}

function createAuraFile(context, folderPath, selected, callback) {
	logger.log('Execute createAuraFile method');
	var fileForCreate;
	var content;
	var fileType = fileUtils.getAuraFileTypeFromName(selected);
	if (fileType)
		fileForCreate = fileUtils.basename(folderPath) + fileType;
	logger.log('fileForCreate', fileForCreate);
	if (fileForCreate) {
		fileForCreate = folderPath + '/' + fileForCreate;
		if (fileForCreate.indexOf('.auradoc') !== -1) {
			createNewAuraDocumentation(context, fileForCreate, function (content) {
				fileUtils.createFile(fileForCreate, content, callback);
			});
		} else if (fileForCreate.indexOf('.css') !== -1) {
			content = snippetUtils.getCSSFileSnippet();
			fileUtils.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('.design') !== -1) {
			content = snippetUtils.getDesignFileSnippet();
			fileUtils.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('.svg') !== -1) {
			content = snippetUtils.getSVGFileSnippet();
			fileUtils.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Controller.js') !== -1) {
			content = snippetUtils.getControllerHelperFileSnippet('controllerMethod');
			fileUtils.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Helper.js') !== -1) {
			content = snippetUtils.getControllerHelperFileSnippet('helperMethod');
			fileUtils.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Renderer.js') !== -1) {
			content = snippetUtils.getRendererFileSnippet();
			fileUtils.createFile(fileForCreate, content, callback);
		}
	}
}

function addAuraCodeCompletion(editor, position, context) {

}

module.exports = {
	createAuraDocumentation,
	createNewAuraDocumentation,
	addMethodBlock,
	addApexCommentBlock,
	addJSFunction,
	createAuraFile,
	addAuraCodeCompletion
}