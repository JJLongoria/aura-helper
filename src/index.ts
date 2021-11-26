// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const commands = require('./scripts/commands');
const Output = require('./scripts/output');
const applicationContext = require('./scripts/core/applicationContext');
const DiagnosticsMananger = Output.DiagnosticsManager;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
 export function activate(context: vscode.ExtensionContext) {
	applicationContext.context = context;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// prepare and register commands
	let init = vscode.commands.registerCommand('aurahelper.init', commands.initialization);
	let addJSFunction = vscode.commands.registerCommand('aurahelper.completion.js.function', commands.addJSFunction);
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.completion.documentation.method', commands.addMethodBlock);
	let editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.template.apex.comment', commands.editApexCommentTemplate);
	let editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.template.aura.documentation', commands.editAuraDocumentationTemplate);
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.completion.aura.documentation', commands.generateAuraDocumentation);
	let newAuraFile = vscode.commands.registerCommand('aurahelper.file.new.aura', commands.newAuraFile);
	let refreshMetadataIndex = vscode.commands.registerCommand('aurahelper.metadata.refresh.index', commands.refreshAllMetadataIndex);
	let refreshMetadataIndexForObject = vscode.commands.registerCommand('aurahelper.metadata.refresh.object', commands.refreshObjectMetadataIndex);
	let compressXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml', commands.compressXML);
	let compressAllXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml.all', commands.compressAllXML);
	let permissionEditor = vscode.commands.registerCommand('aurahelper.metadata.permission.editor', commands.openPermissionEditor);
	let retrieveSpecialTypes = vscode.commands.registerCommand('aurahelper.metadata.retrieve.special', commands.retrieveSpecialTypes);
	let packageGenerator = vscode.commands.registerCommand('aurahelper.metadata.package.generate', commands.packageGenerator);
	let orgCompare = vscode.commands.registerCommand('aurahelper.metadata.org.comparator', commands.orgCompare);
	let openCustomLabelsEditor = vscode.commands.registerCommand('aurahelper.metadata.customlabels.editor', commands.openCustomLabelsEditor);
	let createProjectDocumentation = vscode.commands.registerCommand('aurahelper.documentation.project.create', commands.createProjectDocumentation);
	let implementInterfaces = vscode.commands.registerCommand('aurahelper.completion.apex.implement.interface', commands.implementInterfaces);
	let implementExtendedClasses = vscode.commands.registerCommand('aurahelper.completion.apex.implement.extend', commands.implementExtendedClasses);
	let repairProjectDependencies = vscode.commands.registerCommand('aurahelper.metadata.project.repair', commands.repairProjectDependencies);
	let ignoreMetadata = vscode.commands.registerCommand('aurahelper.metadata.ignore', commands.ignoreMetadata);
	let modifyPermissions = vscode.commands.registerCommand('aurahelper.metadata.permission.modify', commands.modifyPermissions);
	let help = vscode.commands.registerCommand('aurahelper.help', commands.help);
	let clearProblemsOutput = vscode.commands.registerCommand('aurahelper.output.problems.clear', function () {
		DiagnosticsMananger.clearDiagnostics();
	});

	vscode.commands.registerCommand('aurahelper.completion.apex', commands.apexCodeCompletion);
	// Add commands to subscriptions
	context.subscriptions.push(genAuraDoc);
	context.subscriptions.push(addMethodBlock);
	context.subscriptions.push(addJSFunction);
	context.subscriptions.push(newAuraFile);
	context.subscriptions.push(editAuraDocBaseTemplate);
	context.subscriptions.push(editApexCommentTemplate);
	context.subscriptions.push(refreshMetadataIndex);
	context.subscriptions.push(refreshMetadataIndexForObject);
	context.subscriptions.push(compressXML);
	context.subscriptions.push(compressAllXML);
	context.subscriptions.push(permissionEditor);
	context.subscriptions.push(retrieveSpecialTypes);
	context.subscriptions.push(packageGenerator);
	context.subscriptions.push(orgCompare);
	context.subscriptions.push(openCustomLabelsEditor);
	context.subscriptions.push(createProjectDocumentation);
	context.subscriptions.push(implementInterfaces);
	context.subscriptions.push(implementExtendedClasses);
	context.subscriptions.push(repairProjectDependencies);
	context.subscriptions.push(clearProblemsOutput);
	context.subscriptions.push(ignoreMetadata);
	context.subscriptions.push(modifyPermissions);
	context.subscriptions.push(init);
	context.subscriptions.push(help);
	console.log('Aura Helper Extension activated')
	Output.OutputChannel.createChannel();
	Output.OutputChannel.outputLine('Aura Helper Extension is now active');
	setTimeout(() => {
		vscode.commands.executeCommand('aurahelper.init');
	}, 250);
}
// this method is called when your extension is deactivated
export function deactivate() { }
