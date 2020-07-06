const fileSystem = require('../fileSystem');
const logger = require('../utils/logger');
const Utils = require('./utils').Utils;
const languages = require('../languages');
const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
const CompletionItemKind = vscode.CompletionItemKind;
const config = require('../core/config');

exports.provider = {
    provideCompletionItems(document, position) {
        return new Promise(function (resolve) {
            let items;
            try {
                if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
                    items = provideApexCompletion(document, position);
                    items.sort();
                }
            } catch (error) {
                logger.error(error);
            }
            resolve(items);
        });
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
        let classes = applicationContext.userClasses;
        let allNamespaces = applicationContext.allNamespaces;
        let systemMetadata = allNamespaces['system'];
        let sObjects = applicationContext.sObjects;
        let fileStructure = ApexParser.getFileStructure(FileReader.readDocument(document), position, classes, systemMetadata, allNamespaces);
        if (queryData) {
            items = Utils.getQueryCompletionItems(activationTokens, activationInfo, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
            items = getLabelsCompletionItems(activationTokens, position);
        }   else if (activationTokens.length > 1) {
            items = Utils.getApexCompletionItems(position, activationTokens, activationInfo, fileStructure, classes, systemMetadata, allNamespaces, sObjects);
        } else {
            items = Utils.getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, allNamespaces, sObjects);
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