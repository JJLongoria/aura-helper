import * as vscode from 'vscode';
import { Config } from '../core/config';
import { applicationContext } from '../core/applicationContext';
const Range = vscode.Range;
import { FileReader } from '@aurahelper/core';
import { Apex } from '@aurahelper/languages';
const ApexFormatter = Apex.ApexFormatter;



export class ApexFormatterProvider implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.ProviderResult<vscode.TextEdit[]> {
        return new Promise<vscode.TextEdit[]>((resolve, reject) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window
            }, (_progress: vscode.Progress<any>, cancelToken: vscode.CancellationToken) => {
                return new Promise<void>((progressResolve) => {
                    try {
                        cancelToken.onCancellationRequested(() => {
                            progressResolve();
                            resolve([]);
                        });
                        const firstLine = document.lineAt(0);
                        const lastLine = document.lineAt(document.lineCount - 1);
                        let range = new Range(firstLine.range.start, lastLine.range.end);
                        progressResolve();
                        resolve([vscode.TextEdit.replace(range, ApexFormatter.format(FileReader.readDocument(document), Config.getConfig(), applicationContext.parserData, Config.getTabSize(), Config.insertSpaces()))]);
                    } catch (error) {
                        progressResolve();
                        reject(error);
                    }
                });
            });
        });
    }

    static register(): void {
        applicationContext.context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider({ scheme: "file", language: "apex" }, new ApexFormatterProvider()));
        applicationContext.context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider({ scheme: "file", language: "apex-anon" }, new ApexFormatterProvider()));
    }
}