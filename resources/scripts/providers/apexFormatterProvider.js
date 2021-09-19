const vscode = require('vscode');
const Range = vscode.Range;
const Config = require('../core/config');
const applicationContext = require('../core/applicationContext');
const { FileReader } = require('@aurahelper/core').FileSystem;
const { ApexFormatter } = require('@aurahelper/languages').Apex;



exports.provider = {
    provideDocumentFormattingEdits(document) {
        return new Promise((resolve, reject) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window
            }, (progress, cancelToken) => {
                return new Promise((progressResolve) => {
                    try {
                        cancelToken.onCancellationRequested(() => {
                            progressResolve();
                            resolve([]);
                        });
                        const firstLine = document.lineAt(0);
                        const lastLine = document.lineAt(document.lineCount - 1);
                        let range = new Range(firstLine.range.start, lastLine.range.end);
                        progressResolve();
                        resolve([vscode.TextEdit.replace(range, ApexFormatter.format(FileReader.readDocument(document), Config.getConfig(), applicationContext.parserData))]);
                    } catch (error) {
                        progressResolve();
                        reject(error);
                    }
                });
            });
        });
    }
}