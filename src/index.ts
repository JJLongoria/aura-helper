// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as commands from './scripts/commands';
import { applicationContext } from './scripts/core/applicationContext';
import { DiagnosticsManager, OutputChannel } from './scripts/output';

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
	const init = vscode.commands.registerCommand('aurahelper.init', commands.Initialization.run);
	const addJSFunction = vscode.commands.registerCommand('aurahelper.completion.js.function', commands.AddJSFunction.run);
	const addMethodBlock = vscode.commands.registerCommand('aurahelper.completion.documentation.method', commands.AddMethodBlock.run);
	const editApexCommentTemplate = vscode.commands.registerCommand('aurahelper.template.apex.comment', commands.EditApexCommentTemplate.run);
	const editAuraDocBaseTemplate = vscode.commands.registerCommand('aurahelper.template.aura.documentation', commands.EditAuraDocumentationTemplate.run);
	const genAuraDoc = vscode.commands.registerCommand('aurahelper.completion.aura.documentation', commands.GenerateAuraDocumentation.run);
	const newAuraFile = vscode.commands.registerCommand('aurahelper.file.new.aura', commands.NewAuraFile.run);
	const refreshMetadataIndex = vscode.commands.registerCommand('aurahelper.metadata.refresh.index', commands.RefreshAllMetadataIndex.run);
	const refreshMetadataIndexForObject = vscode.commands.registerCommand('aurahelper.metadata.refresh.object', commands.RefreshObjectMetadataIndex.run);
	const compressXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml', commands.CompressXML.run);
	const compressAllXML = vscode.commands.registerCommand('aurahelper.metadata.compress.xml.all', commands.CompressAllXML.run);
	const permissionEditor = vscode.commands.registerCommand('aurahelper.metadata.permission.editor', commands.OpenPermissionEditor.run);
	const retrieveSpecialTypes = vscode.commands.registerCommand('aurahelper.metadata.retrieve.special', commands.RetrieveSpecialTypes.run);
	const packageGenerator = vscode.commands.registerCommand('aurahelper.metadata.package.generate', commands.OpenPackageGeneratorGUI.run);
	const orgCompare = vscode.commands.registerCommand('aurahelper.metadata.org.comparator', commands.OrgCompare.run);
	const openCustomLabelsEditor = vscode.commands.registerCommand('aurahelper.metadata.customlabels.editor', commands.OpenCustomLabelsEditor.run);
	const createProjectDocumentation = vscode.commands.registerCommand('aurahelper.documentation.project.create', commands.CreateProjectDocumentation.run);
	const implementInterfaces = vscode.commands.registerCommand('aurahelper.completion.apex.implement.interface', commands.ImplementInterfaces.run);
	const implementExtendedClasses = vscode.commands.registerCommand('aurahelper.completion.apex.implement.extend', commands.ImplementExtendedClasses.run);
	const repairProjectDependencies = vscode.commands.registerCommand('aurahelper.metadata.project.repair', commands.RepairProjectDependencies.run);
	const ignoreMetadata = vscode.commands.registerCommand('aurahelper.metadata.ignore', commands.IgnoreMetadata.run);
	const modifyPermissions = vscode.commands.registerCommand('aurahelper.metadata.permission.modify', commands.ModifyPermissions.run);
	const scan = vscode.commands.registerCommand('aurahelper.metadata.scan', commands.Scan.run);
	const help = vscode.commands.registerCommand('aurahelper.help', commands.Help.run);
	const clearProblemsOutput = vscode.commands.registerCommand('aurahelper.output.problems.clear', function () {
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
	context.subscriptions.push(scan);
	context.subscriptions.push(help);
	console.log('Aura Helper Extension activated');
	OutputChannel.createChannel();
	OutputChannel.outputLine('Aura Helper Extension is now active');
	setTimeout(() => {
		vscode.commands.executeCommand('aurahelper.init');
	}, 250);
}
// this method is called when your extension is deactivated
export function deactivate() { }
