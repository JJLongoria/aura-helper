const vscode = require('vscode');

function getApexCommentProvider(){
	return {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line).text;
            if (line.indexOf('/**') === -1) {
                return Promise.resolve(undefined);
            }
            let item = new vscode.CompletionItem('/** */', vscode.CompletionItemKind.Snippet);
            item.detail = 'Apex Comment';
            item.insertText = '';
            item.command = {
                title: 'Apex Comment',
                command: 'aurahelper.apexComentCompletion',
                arguments: [position]
            };
            return Promise.resolve([item]);
        }
	};
}

module.exports = {
    getApexCommentProvider
}