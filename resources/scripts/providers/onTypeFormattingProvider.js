const vscode = require('vscode');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const tokenizer = languages.Tokenizer;
const langUtils = languages.Utils;
const TokenType = languages.TokenType;

exports.provider = {
    provideOnTypeFormattingEdits(document, position, char, options, token) {
        let line = '';
        let range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
        let lineTokens = tokenizer.tokenize(document.lineAt(position.line).text);
        if (lineTokens.length > 0) {
            let index = 0;
            while (index < lineTokens.length) { 
                let lastToken = langUtils.getLastToken(lineTokens, index);
                let token = lineTokens[index];
                let nextToken = langUtils.getNextToken(lineTokens, index);
                index++;
            }
        }
        return [vscode.TextEdit.replace(range, line)];
    }
}