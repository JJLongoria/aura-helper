const logger = require('../utils/logger');
const ProviderUtils = require('./utils');
const Config = require('../core/config');
const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { Tokenizer, TokenType } = require('@aurahelper/languages').System;
const LanguageUtils = require('@aurahelper/languages').LanguageUtils;
const { Utils, StrUtils } = require('@aurahelper/core').CoreUtils;
const { Token } = require('@aurahelper/core').Types;
const CompletionItemKind = vscode.CompletionItemKind;
const MarkDownStringBuilder = require('../output/markdownStringBuilder');
const Range = vscode.Range;
const Position = vscode.Position;


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
        const activationInfo = ProviderUtils.getApexActivation(document, position, true);
        if (activationInfo.activationTokens.length > 0) {
            if (activationInfo.activationTokens[0].activation === 'this')
                activationInfo.activationTokens.splice(0, 1);
        }
        const parser = new ApexParser().setContent(FileReader.readDocument(document)).setSystemData(applicationContext.parserData).setCursorPosition(ProviderUtils.fixPositionOffset(document, position));
        const node = parser.resolveReferences();
        const nodeInfo = ProviderUtils.getNodeInformation(node, activationInfo, true);
        if (nodeInfo.lastNode && Object.keys(nodeInfo.lastNode).includes('keyPrefix') && Config.getConfig().autoCompletion.activeSobjectFieldsSuggestion) {
            if (activationInfo.activationTokens.length === 1 && !activationInfo.activationTokens[0].isQuery && activationInfo.activationTokens[0].nextToken && activationInfo.activationTokens[0].nextToken.text !== '.')
                items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo, node)
            else
                items = items.concat(ProviderUtils.getSobjectCompletionItems(position, activationInfo, activationInfo.activationTokens, nodeInfo.lastNode, node.positionData));
        } else if (nodeInfo.lastNode && !Utils.isNull(nodeInfo.lastNode.nodeType) && Config.getConfig().autoCompletion.activeApexSuggestion) {
            if (nodeInfo.lastNode.name === node.name) {
                items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo, node);
            } else {
                items = ProviderUtils.getApexClassCompletionItems(position, nodeInfo.lastNode);
            }
        } else if (nodeInfo.labels) {
            items = getLabelsCompletionItems(position, activationInfo, nodeInfo.labels);
        } else if (!nodeInfo.lastNode) {
            items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo, node);
        }
    }
    return items;
}

function getLabelsCompletionItems(position, activationInfo, labels) {
    const items = [];
    for (const label of labels) {
        const documentation = new MarkDownStringBuilder();
        documentation.appendMarkdown(label.shortDescription + '\n\n');
        documentation.appendMarkdown('\n\n  - **Name**: `' + label.fullName + '`\n');
        documentation.appendMarkdown('  - **Value**: `' + label.value + '`\n');
        if (label.categories)
            documentation.appendMarkdown('  - **Category**: `' + label.categories + '`\n');
        documentation.appendMarkdown('  - **Language**: `' + label.language + '`\n');
        documentation.appendMarkdown('  - **Protected**: `' + label.protected + '`\n\n');
        documentation.appendMarkdownSeparator();
        documentation.appendMarkdownH4('Snippet');
        documentation.appendApexCodeBlock('Label.' + label.fullName);
        const options = ProviderUtils.getCompletionItemOptions(label.fullName, documentation.build(), 'Label.' + label.fullName, true, CompletionItemKind.Field);
        const item = ProviderUtils.createItemForCompletion('Label.' + label.fullName, options);
        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn)
            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
        items.push(item);
    }
    return items;
}