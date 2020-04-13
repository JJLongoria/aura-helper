const vscode = require('vscode');
const Range = vscode.Range;
const Languages = require('../languages');
const ApexFormatter = Languages.Apex.Formatter;



exports.provider = {
    provideDocumentFormattingEdits(document) {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        let range = new Range(firstLine.range.start, lastLine.range.end);
        return [vscode.TextEdit.replace(range, ApexFormatter.formatDocument(document))];
    }
}