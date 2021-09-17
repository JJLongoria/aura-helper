const logger = require('../utils/logger');
const ProviderUtils = require('./utils');
const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const { FileChecker, FileReader } = require('@ah/core').FileSystem;
const { ApexParser } = require('@ah/languages').Apex;
const { Utils } = require('@ah/core').CoreUtils;
const CompletionItemKind = vscode.CompletionItemKind;

exports.provider = {
    provideCompletionItems(document, position) {
        return new Promise(function (resolve) {
            let items;
            try {
                if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
                    items = provideApexCompletion(document, position);
                    Utils.sort(items, ['label']);
                }
            } catch (error) {
                logger.error(error);
            }
            resolve(items);
        });
    }
}

function provideApexCompletion(document, position) {
    let items = [];
    const line = document.lineAt(position.line).text;
    if (!line.trim().startsWith('/**')) {
        const activationInfo = ProviderUtils.getActivation(document, position);
        const activation = activationInfo.activation;
        const activationTokens = getActivationTokens(activation);
        const parser = new ApexParser().setContent(FileReader.readDocument(document)).setSystemData(applicationContext.parserData).setCursorPosition(ProviderUtils.fixPositionOffset(document, position));
        const node = parser.resolveReferences();
        if (node.positionData && node.positionData.query) {
            items = ProviderUtils.getQueryCompletionItems(position, activationInfo, activationTokens, node.positionData);
        } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
            items = getLabelsCompletionItems(activationTokens, position);
        } else if (activationTokens.length > 1) {
            items = ProviderUtils.getApexCompletionItems(position, activationTokens, activationInfo, node, node.positionData);
        } else {
            items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo, node);
        }
    }
    Utils.sort(items, ['label']);
    return items;
}

function getLabelsCompletionItems(activationTokens, position) {
    let items = [];
    if (activationTokens.length == 2) {
        let labels = ProviderUtils.getCustomLabels();
        for (const label of labels) {
            let doc = '  - **Name**: ' + label.fullName + '\n';
            doc += '  - **Value**: ' + label.value + '\n';
            doc += '  - **Category**: ' + label.categories + '\n';
            doc += '  - **Language**: ' + label.language + '\n';
            doc += '  - **Protected**: ' + label.protected;
            let options = ProviderUtils.getCompletionItemOptions(label.shortDescription, doc, label.fullName, true, CompletionItemKind.Field);
            let command = ProviderUtils.getCommand('CustomLabel', 'aurahelper.completion.apex', [position, 'CustomLabel', label.fullName]);
            items.push(ProviderUtils.createItemForCompletion(label.fullName, options, command));
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