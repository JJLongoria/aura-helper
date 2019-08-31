const vscode = require('vscode');
const fileUtils = require('./fileUtils');
const editorUtils = require("./editorUtils");
const languageUtils = require("./languageUtils");

function getDocumentTemplatePath(context) {
	return context.asAbsolutePath("./resources/templates/auraDocumentation.auradoc");
}

function getDocumentMethodTemplatePath(context) {
	return context.asAbsolutePath("./resources/templates/auraDocumentationMethod.auradoc");
}

function getDocumentMethodParamTemplatePath(context) {
	return context.asAbsolutePath("./resources/templates/auraDocumentationMethodParam.auradoc");
}

function getMethodsContent(methods, methodTemplate, paramTemplate) {
	var content = "";
	for (let i = 0; i < methods.length; i++) {
		content += getMethodContent(methods[i], methodTemplate, paramTemplate);
	}
	return content;
}

function getMethodContent(method, methodTemplate, paramTemplate) {
	var content = fileUtils.getDocumentText(methodTemplate);
	var paramsContent = "";
	for (let i = 0; i < method.params.length; i++) {
		paramsContent += getParamContent(method.params[i], paramTemplate);
	}
	content = content.replace("{!method.name}", method.name);
	content = content.replace("{!method.signature}", method.signature);
	content = content.replace("{!method.params}", paramsContent);
	return content;
}

function getParamContent(param, paramTemplate) {
	var content = fileUtils.getDocumentText(paramTemplate);
	content = content.replace("{!param.name}", param);
	return content;
}

function createAuraDocumentation(context, editor) {
	fileUtils.getDocumentObject(editor.document.uri.fsPath.replace('.auradoc', 'helper.js'), function (helperDoc) {
		fileUtils.getDocumentObject(editor.document.uri.fsPath.replace('.auradoc', 'controller.js'), function (controllerDoc) {
			fileUtils.getDocumentObject(getDocumentTemplatePath(context), function (auraDocTemplate) {
				fileUtils.getDocumentObject(getDocumentMethodTemplatePath(context), function (auraDocMethodTemplate) {
					fileUtils.getDocumentObject(getDocumentMethodParamTemplatePath(context), function (auraDocMethodParamTemplate) {
						var helperMethods = fileUtils.getMethods(helperDoc);
						var controllerMethods = fileUtils.getMethods(controllerDoc);
						var documentationText = fileUtils.getDocumentText(auraDocTemplate);
						var helperMethodsContent = getMethodsContent(helperMethods, auraDocMethodTemplate, auraDocMethodParamTemplate);
						var controllerMethodsContent = getMethodsContent(controllerMethods, auraDocMethodTemplate, auraDocMethodParamTemplate);
						documentationText = documentationText.replace("{!helperMethods}", helperMethodsContent).replace("{!controllerMethods}", controllerMethodsContent);
						editorUtils.replaceContent(editor, editorUtils.getAllTextRange(), documentationText);
						editor.revealRange(editor.document.lineAt(0).range);
					});
				});
			});
		});
	});
}

function addMethodBlock(context, editor) {
	fileUtils.getDocumentObject(editor.document.uri.fsPath.replace('.auradoc', 'helper.js'), function (helperDoc) {
		fileUtils.getDocumentObject(editor.document.uri.fsPath.replace('.auradoc', 'controller.js'), function (controllerDoc) {
			fileUtils.getDocumentObject(getDocumentMethodTemplatePath(context), function (auraDocMethodTemplate) {
				fileUtils.getDocumentObject(getDocumentMethodParamTemplatePath(context), function (auraDocMethodParamTemplate) {
					var helperMethods = fileUtils.getMethods(helperDoc);
					var controllerMethods = fileUtils.getMethods(controllerDoc);
					vscode.window.showQuickPick(["Controller Methods", "Helper Methods"]).then(fileSelected => {
						var methodNames = [];
						if (fileSelected == "Controller Methods") {
							console.log("Controller Methods Selected");
							for (let i = 0; i < controllerMethods.length; i++) {
								const method = controllerMethods[i];
								methodNames.push(method.signature);
							}
						}
						else if (fileSelected == "Helper Methods") {
							console.log("Helper Methods Selected");
							var methodNames = [];
							for (let i = 0; i < helperMethods.length; i++) {
								const method = helperMethods[i];
								methodNames.push(method.signature);
							}
						}
						if (methodNames.length > 0) {
							vscode.window.showQuickPick(methodNames).then(methodSelected => {
								var methods = [];
								console.log("Method Selected: " + methodSelected);
								if (fileSelected == "Controller Methods") {
									methods = controllerMethods;
								}
								else if (fileSelected == "Helper Methods") {
									methods = helperMethods;
								}
								for (let i = 0; i < methods.length; i++) {
									const method = methods[i];
									if (method.signature == methodSelected) {
										var methodContent = getMethodContent(method, auraDocMethodTemplate, auraDocMethodParamTemplate);
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
		});
	});
}

function addApexCommentBlock(editor) {
	// Get the line that we are currently on
	const lineNum = editor.selection.active.line;
	var funcLine = editor.document.lineAt(lineNum);
	// If the line starts with a @, then it's a @AuraEnabled or @RemoteAction and look at the next line
	var currLine = lineNum;
	while (funcLine.text.trim().startsWith('@')) {
		currLine++;
		funcLine = editor.document.lineAt(currLine);
	}
	// If the line is not empty, parse it and add in a snippet on the line above.
	if (!funcLine.isEmptyOrWhitespace) {
		const apexComment = languageUtils.getCommentForApexMethod(funcLine.text, true);
		const position = new vscode.Position(lineNum, 0);
		editor.insertSnippet(new vscode.SnippetString(`${apexComment}\n`), position);
	}
}

module.exports = {
	createAuraDocumentation,
	addMethodBlock,
	addApexCommentBlock
}