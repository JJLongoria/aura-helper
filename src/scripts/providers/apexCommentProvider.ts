import * as vscode from 'vscode';
import { Config } from '../core/config';
import { ProviderUtils } from './utils';
import { MarkDownStringBuilder } from '../output';
import { applicationContext } from '../core/applicationContext';
import { FileChecker} from '@aurahelper/core';
const CompletionItemKind = vscode.CompletionItemKind;

export class ApexCommentCompletionProvider implements vscode.CompletionItemProvider<vscode.CompletionItem> {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }

    static register(): void {
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "apex" }, new ApexCommentCompletionProvider(), '*'));
    }
};

function provideApexCompletion(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
    let items: vscode.CompletionItem[] | undefined;
    const line = document.lineAt(position.line).text;
    if (line.indexOf('/**') !== -1) {
        if (!Config.getConfig().autoCompletion!.activeApexCommentSuggestion) {
            return undefined;
        }
        items = getCommentCompletionItem(position);
    }
    return items;
}

function getCommentCompletionItem(position: vscode.Position) {
    const items = [];
    if (!Config.getConfig().autoCompletion!.activeApexCommentSuggestion) {
        return undefined;
    }
    const documentation = new MarkDownStringBuilder().appendMarkdown('Add an Apex Comment with the user defined template\n\n');
    const options = ProviderUtils.getCompletionItemOptions('Apex Comment', documentation.build(), '', true, CompletionItemKind.Snippet);
    const command = ProviderUtils.getCommand('Apex Comment', 'aurahelper.completion.apex', [position, "comment"]);
    const item = ProviderUtils.createItemForCompletion('/** */', options, command);
    items.push(item);
    return items;
}