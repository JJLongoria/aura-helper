// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as commands from './scripts/commands';
import applicationContext from './scripts/core/applicationContext';
import { DiagnosticsManager } from './scripts/output';

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
	let init = vscode.commands.registerCommand('aurahelper.init', commands.Initialization.run);
	let addJSFunction = vscode.commands.registerCommand('aurahelper.completion.js.function', commands.AddJSFunction.run);
	let addMethodBlock = vscode.commands.registerCommand('aurahelper.completion.documentation.method', commands.AddMethodBlock.run);
	let editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.template.apex.comment', commands.EditApexCommentTemplate.run);
	let editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.template.aura.documentation', commands.EditAuraDocumentationTemplate.run);
	let genAuraDoc = vscode.commands.registerCommand('aurahelper.completion.aura.documentation', commands.GenerateAuraDocumentation.run);
	let newAuraFile = vscode.commands.registerCommand('aurahelper.file.new.aura', commands.NewAuraFile.run);
	let refreshMetadataIndex = vscode.commands.registerCommand('aurahelper.metadata.refresh.index', commands.RefreshAllMetadataIndex.run);
	let refreshMetadataIndexForObject = vscode.commands.registerCommand('aurahelper.metadata.refresh.object', commands.RefreshObjectMetadataIndex.run);
	let compressXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml', commands.CompressXML.run);
	let compressAllXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml.all', commands.CompressAllXML.run);
	let permissionEditor = vscode.commands.registerCommand('aurahelper.metadata.permission.editor', commands.OpenPermissionEditor.run);
	let retrieveSpecialTypes = vscode.commands.registerCommand('aurahelper.metadata.retrieve.special', commands.RetrieveSpecialTypes.run);
	let packageGenerator = vscode.commands.registerCommand('aurahelper.metadata.package.generate', commands.OpenPackageGeneratorGUI.run);
	let orgCompare = vscode.commands.registerCommand('aurahelper.metadata.org.comparator', commands.OrgCompare.run);
	let openCustomLabelsEditor = vscode.commands.registerCommand('aurahelper.metadata.customlabels.editor', commands.OpenCustomLabelsEditor.run);
	let createProjectDocumentation = vscode.commands.registerCommand('aurahelper.documentation.project.create', commands.CreateProjectDocumentation.run);
	let implementInterfaces = vscode.commands.registerCommand('aurahelper.completion.apex.implement.interface', commands.ImplementInterfaces.run);
	let implementExtendedClasses = vscode.commands.registerCommand('aurahelper.completion.apex.implement.extend', commands.ImplementExtendedClasses.run);
	let repairProjectDependencies = vscode.commands.registerCommand('aurahelper.metadata.project.repair', commands.RepairProjectDependencies.run);
	let ignoreMetadata = vscode.commands.registerCommand('aurahelper.metadata.ignore', commands.IgnoreMetadata.run);
	let modifyPermissions = vscode.commands.registerCommand('aurahelper.metadata.permission.modify', commands.ModifyPermissions.run);
	let help = vscode.commands.registerCommand('aurahelper.help', commands.Help.run);
	let clearProblemsOutput = vscode.commands.registerCommand('aurahelper.output.problems.clear', function () {
		DiagnosticsManager.clearDiagnostics();
	});

	vscode.commands.registerCommand('aurahelper.completion.apex', commands.ApexCodeCompletion.run);
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
	console.log('Aura Helper Extension activated');
	Output.OutputChannel.createChannel();
	Output.OutputChannel.outputLine('Aura Helper Extension is now active');
	setTimeout(() => {
		vscode.commands.executeCommand('aurahelper.init');
	}, 250);
}
// this method is called when your extension is deactivated
export function deactivate() { }
