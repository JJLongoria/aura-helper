const vscode = require('vscode');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const tokenizer = languages.Tokenizer;
const TokenType = languages.TokenType;
const langUtils = languages.Utils;
const Range = vscode.Range;
const Position = vscode.Position;


exports.provider = {
    provideDocumentFormattingEdits(document) {
        let editor = vscode.window.activeTextEditor;
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        let tokens = tokenizer.tokenize(FileReader.readDocument(document));
        let removedLines = 0;
        let index = 0;
        let indentOffset = 0;
        let bracketIndent = 0;
        let parentIndent = 0;
        let aBracketIndent = 0;
        let sqBracketIndent = 0;
        let isOnFlowStructure = false;
        let lines = [];
        let line = "";
        let isOnCommentLine = false;
        let isCommentBlock = false;
        let isOnText = false;
        let isOneLineStructure = false;
        let firstParenEndColumn = -1;
        let firstSQBracketEndColum = -1;
        let selectEndColumn = -1;
        let token;
        while (index < tokens.length) {
            let lastToken = langUtils.getLastToken(tokens, index);
            token = tokens[index];
            let nextToken = langUtils.getNextToken(tokens, index);
            if (!isOnFlowStructure)
                isOnFlowStructure = startFlowStructure(token, nextToken);
            let newLines = (lastToken) ? token.line - lastToken.line : 0;
            if (newLines > 0 && isOnCommentLine)
                isOnCommentLine = false;
            if (!isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '/' && token.tokenType === TokenType.OPERATOR && token.content === '*') {
                isCommentBlock = true;
            } else if (isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '*' && token.tokenType === TokenType.OPERATOR && token.content === '/') {
                isCommentBlock = false;
            }
            if (!isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '/' && token.tokenType === TokenType.OPERATOR && token.content === '/')
                isOnCommentLine = true;
            if (!isOnText && token.tokenType === TokenType.SQUOTTE && nextToken && nextToken.tokenType != TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH && lastToken.tokenType !== TokenType.SQUOTTE)
                isOnText = true;
            else if (isOnText && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH)
                isOnText = false;
            if (!isOnCommentLine && !isCommentBlock && !isOnText && token.tokenType !== TokenType.SQUOTTE) {
                if (token.tokenType === TokenType.LBRACKET) {
                    isOnFlowStructure = false;
                    isOneLineStructure = false;
                    if (newLines > 0) {
                        newLines = 0; // Remove line when line start with "{" and add token to previous line
                    }
                    bracketIndent++;

                }
                if (token.tokenType === TokenType.RBRACKET) {
                    bracketIndent--;
                    aBracketIndent = 0;
                    if (bracketIndent === 2)
                        indentOffset = 0;
                }
                if (token.tokenType === TokenType.LPAREN) {
                    parentIndent++;
                    if (parentIndent === 1)
                        firstParenEndColumn = token.endColumn;
                    if (newLines > 0)
                        newLines = 0;
                }
                if (token.tokenType === TokenType.RPAREN) {
                    parentIndent--;
                    if (newLines > 0)
                        newLines = 0; // Remove line when line start with ")" and add token to previous line
                    if (parentIndent === 0) {
                        aBracketIndent = 0;
                        firstParenEndColumn - 1;
                    }
                }
                if (token.tokenType === TokenType.LSQBRACKET) {
                    sqBracketIndent++;
                    if (sqBracketIndent === 1) {
                        firstSQBracketEndColum = token.endColumn;
                        if (nextToken && nextToken.content.toLowerCase() === 'select')
                            selectEndColumn = nextToken.endColumn;
                    }
                }
                if (token.tokenType === TokenType.RSQBRACKET) {
                    sqBracketIndent--;
                    if (sqBracketIndent === 0) {
                        firstSQBracketEndColum = -1;
                        selectEndColumn = -1;
                    }
                }
                if (token.tokenType === TokenType.LABRACKET) {
                    aBracketIndent++;
                }
                if (token.tokenType === TokenType.RABRACKET) {
                    aBracketIndent--;
                }
                if (lastToken && lastToken.tokenType === TokenType.SEMICOLON && parentIndent === 0 && isOneLineStructure) {
                    if (indentOffset > 0)
                        indentOffset--;
                    isOneLineStructure = false;
                }
                if (lastToken && lastToken.tokenType === TokenType.RPAREN && parentIndent === 0 && token.tokenType !== TokenType.RPAREN) {
                    if (isOnFlowStructure && parentIndent === 0 && token && token.tokenType === TokenType.LBRACKET) {
                        isOnFlowStructure = false;
                        isOneLineStructure = false;
                        if (indentOffset > 0)
                            indentOffset--;
                    } else if (isOnFlowStructure && parentIndent === 0 && token && token.tokenType !== TokenType.LBRACKET) {
                        indentOffset++;
                        isOnFlowStructure = false;
                        isOneLineStructure = true;
                        if (newLines === 0)
                            newLines = 1; // New line on next line for one line flow structure
                    }
                }
                if (lastToken && lastToken.tokenType === TokenType.LSQBRACKET && newLines > 0)
                    newLines = 0; // Remove line when line start with "[" and add token to previous line
                if (lastToken && lastToken.tokenType === TokenType.LPAREN && newLines > 0)
                    newLines = 0; // Remove line after "(" and add token to prevous line
                if (lastToken && lastToken.tokenType === TokenType.RPAREN && newLines > 0 && !isOnFlowStructure && !isOneLineStructure)
                    newLines = 0; // Remove line after ")" and add token to prevous line
                /*if (lastToken && lastToken.tokenType === TokenType.LBRACKET && newLines === 0)
                    newLines = 1; // Add new line after "{"*/
                /*if (lastToken && lastToken.tokenType === TokenType.SEMICOLON && newLines === 0)
                    newLines = 1; // Add new line after ";"*/
                /*if (lastToken && lastToken.tokenType === TokenType.RBRACKET && newLines === 0 && token.content.toLowerCase() !== 'else' && token.content.toLowerCase() !== 'catch' && token.content.toLowerCase() !== 'finnaly' && token.content.toLowerCase() !== 'while')
                    newLines = 1; // Add new line after "}" when next token not "else", "catch", "finally" or "while"*/
                /*if (lastToken && lastToken.tokenType === TokenType.RBRACKET && newLines > 0 && (token.content.toLowerCase() === 'else' || token.content.toLowerCase() === 'catch' || token.content.toLowerCase() === 'finnaly' || token.content.toLowerCase() === 'while'))
                    newLines = 0; // Remove line after "}" when next token are "else", "catch", "finally" or "while" and add token to previous line*/
            }
            if (newLines > 0) {
                lines.push(line + getNewLines(newLines - 1));
                let indent = bracketIndent;
                if (indentOffset > 0)
                    indent = bracketIndent + indentOffset;
                if (sqBracketIndent > 0) {
                    let tabs = Math.trunc((firstSQBracketEndColum / 4)) - 1;
                    let restWS = firstSQBracketEndColum - (tabs * 4);
                    line = getIndent(tabs) + getWhitespaces(restWS - 1) + token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                } else if (parentIndent > 0) {
                    let tabs = Math.trunc((firstParenEndColumn / 4)) - 1;
                    let restWS = firstParenEndColumn - (tabs * 4);
                    line = getIndent(tabs) + getWhitespaces(restWS - 1) + token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                } else if (isCommentBlock) {
                    line = getIndent(indent) + ' ' + token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                } else {
                    if (token.tokenType === TokenType.RBRACKET && nextToken && (nextToken.content.toLowerCase() === 'else' || nextToken.content.toLowerCase() === 'catch' || nextToken.content.toLowerCase() === 'finnaly' || nextToken.content.toLowerCase() === 'while')) {
                        line = getIndent(indent) + token.content + getWhitespaces(1);
                    } else if ((token.content.toLowerCase() === 'catch' || token.content.toLowerCase() === 'while' || token.content.toLowerCase() === 'if') && nextToken.tokenType === TokenType.LPAREN) {
                        line = getIndent(indent) + token.content + getWhitespaces(0);
                    } else {
                        line = getIndent(indent) + token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                    }

                }
            } else {
                if (!isOnCommentLine && !isCommentBlock && !isOnText) {
                    if (token.tokenType === TokenType.RPAREN && nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        line += token.content + getWhitespaces(1);
                    } else if (token.tokenType === TokenType.LPAREN) {
                        line += token.content + getWhitespaces(0);
                    } else if ((token.content.toLowerCase() === 'catch' || token.content.toLowerCase() === 'while' || token.content.toLowerCase() === 'if') && nextToken.tokenType === TokenType.LPAREN) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.COMMA) {
                        line += token.content + getWhitespaces(1);
                    } else {
                        line += token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                    }
                } else {
                    line += token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                }
            }
            index++;
        }
        lines.push(token.content);
        let range = new Range(firstLine.range.start, lastLine.range.end);
        editor.revealRange(new Range(new Position(editor.selection.start.line - removedLines, 0), new Position(editor.selection.start.line - removedLines, 1)));
        return [vscode.TextEdit.replace(range, lines.join('\n'))];
    }
}

function startFlowStructure(token, nextToken) {
    return (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'if' || token.content.toLowerCase() === 'for' || token.content.toLowerCase() === 'while') && nextToken && nextToken.tokenType === TokenType.LPAREN) || (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'else' && nextToken && nextToken.content.toLowerCase() !== 'if') || (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'else' && nextToken && nextToken.tokenType === TokenType.LBRACKET);
}

function getNewLines(number) {
    let nl = '';
    for (let index = 0; index < number; index++) {
        nl += '\n';
    }
    return nl;
}

function getIndent(number) {
    let indent = '';
    for (let index = 0; index < number; index++) {
        indent += '\t';
    }
    return indent;
}

function getWhitespaces(number) {
    let ws = '';
    for (let index = 0; index < number; index++) {
        ws += ' ';
    }
    return ws;
}