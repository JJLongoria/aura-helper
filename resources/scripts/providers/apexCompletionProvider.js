const logger = require('../utils/logger');
const ProviderUtils = require('./utils');
const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { Utils } = require('@aurahelper/core').CoreUtils;
const CompletionItemKind = vscode.CompletionItemKind;
const MarkDownStringBuilder = require('../output/markdownStringBuilder');


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
            items = getLabelsCompletionItems(position, activationInfo, activationTokens);
        } else if (activationTokens.length > 1) {
            items = ProviderUtils.getApexCompletionItems(position, activationTokens, activationInfo, node, node.positionData);
        } else {
            items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo, node);
        }
    }
    Utils.sort(items, ['label']);
    return items;
}

function getLabelsCompletionItems(position, activationInfo, activationTokens) {
    const items = [];
    if (activationTokens.length == 2) {
        const labels = ProviderUtils.getCustomLabels();
        for (const label of labels) {
            const documentation = new MarkDownStringBuilder();
            documentation.appendMarkdown(label.shortDescription + '\n\n');
            documentation.appendMarkdown('\n\n  - **Name**: `' + label.fullName + '`\n');
            documentation.appendMarkdown('  - **Value**: `' + label.value + '`\n');
            documentation.appendMarkdown('  - **Category**: `' + label.categories + '`\n');
            documentation.appendMarkdown('  - **Language**: `' + label.language + '`\n');
            documentation.appendMarkdown('  - **Protected**: `' + label.protected + '`\n\n');
            documentation.appendMarkdownSeparator();
            documentation.appendMarkdownH4('Snippet');
            documentation.appendApexCodeBlock('Label.' + label.fullName);
            const options = ProviderUtils.getCompletionItemOptions(label.fullName, documentation.build(), label.fullName, true, CompletionItemKind.Field);
            const item = ProviderUtils.createItemForCompletion(label.fullName, options);
            items.push(item);
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