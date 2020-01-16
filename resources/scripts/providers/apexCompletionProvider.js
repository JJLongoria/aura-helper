const fileSystem = require('../fileSystem');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const languages = require('../languages');
const vscode = require('vscode');
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
const CompletionItemKind = vscode.CompletionItemKind;
const config = require('../main/config');

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}

function provideApexCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    if (!line.trim().startsWith('/**')) {
        let activationInfo = Utils.getActivation(document, position);
        let activation = activationInfo.activation;
        let activationTokens = getActivationTokens(activation);
        let queryData = langUtils.getQueryData(document, position);
        let fileStructure = ApexParser.parse(FileReader.readDocument(document), position);
        let classes = Utils.getClassesFromClassFolder(document);
        let systemMetadata = Utils.getNamespaceMetadataFile('System');
        let namespacesMetadata = Utils.getNamespacesMetadataFile();
        let sObjects = Utils.getObjectsFromMetadataIndex();
        if (queryData) {
            items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
            items = getLabelsCompletionItems(activationTokens, position);
        } else if (activationTokens.length > 1) {
            items = Utils.getApexCompletionItems(document, position, activationTokens, activationInfo, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        } else {
            items = Utils.getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        }
    }
    return items;
}

function getLabelsCompletionItems(activationTokens, position) {
    let items = [];
    if (activationTokens.length == 2) {
        let labels = Utils.getCustomLabels();
        for (const label of labels) {
            let doc = 'Name: ' + label.fullName + '\n';
            doc += 'Value: ' + label.value + '\n';
            doc += 'Category: ' + label.categories + '\n';
            doc += 'Language: ' + label.language + '\n';
            doc += 'Protected: ' + label.protected;
            let options = Utils.getCompletionItemOptions(label.shortDescription, doc, label.fullName, true, CompletionItemKind.Field);
            let command = Utils.getCommand('CustomLabel', 'aurahelper.completion.apex', [position, 'CustomLabel', label.fullName]);
            items.push(Utils.createItemForCompletion(label.fullName, options, command));
        }
    }
    return items;
}

function getActivationTokens(activation) {
    let activationTokens = [];
    if (activation.startsWith('this.'))
        activation = activation.replace('this.', '');
    if (activation.indexOf('.') !== -1)
        activationTokens = activation.split('.');
    else if (activation.length > 0)
        activationTokens.push(activation);
    return activationTokens;
}