const vscode = require('vscode');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const tokenizer = languages.Tokenizer;
const TokenType = languages.TokenType;
const langUtils = languages.Utils;
const Range = vscode.Range;


exports.provider = {
    provideDocumentFormattingEdits(document){
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        let tokens = tokenizer.tokenize(FileReader.readDocument(document));
        let content = '';
        let index = 0;
        let bracketIndent = 0;
        while(index < tokens.length){
            let lastToken = langUtils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = langUtils.getNextToken(tokens, index);
            if(token.tokenType === TokenType.LBRACKET)
                bracketIndent++;
            if(token.tokenType === TokenType.RBRACKET)
                bracketIndent--
            if(nextToken){
                if(lastToken && lastToken.line !== token.line && bracketIndent > 0)
                    content += getIndent(bracketIndent);
                else if(lastToken && lastToken.line !== token.line && bracketIndent === 0)
                    content += getWhitespaces(token.startColumn - 1);
                if(token.line === nextToken.line)
                    content += token.content + getWhitespaces(nextToken.startColumn - token.endColumn);
                else
                    content += token.content + getNewLines(nextToken.line - token.line);
            } else{
                content += getIndent(bracketIndent) + token.content;
            }
            index++;
        }
        let range = new Range(firstLine.range.start, lastLine.range.end);
        return [vscode.TextEdit.replace(range, content)];
    }
}

function getNewLines(number){
    let nl = '';
    for (let index = 0; index < number; index++) {
        nl += '\n';
    }
    return nl;
}

function getIndent(number){
    let indent = '';
    for (let index = 0; index < number; index++) {
        indent += '\t';
    }
    return indent;
}

function getWhitespaces(number){
    let ws = '';
    for (let index = 0; index < number; index++) {
        ws += ' ';
    }
    return ws;
}