const vscode = require('vscode');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const Utils = require('./utils').Utils;
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
        let classes = Utils.getClassesFromClassFolder(document);
        let systemMetadata = Utils.getNamespaceMetadataFile('System');
        let namespacesMetadata = Utils.getNamespacesMetadataFile();
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
        let isLastLineComment = false;
        let isOnText = false;
        let isOneLineStructure = false;
        let firstParenEndColumn = -1;
        let firstSQBracketEndColum = -1;
        let selectEndColumn = -1;
        let isOnDataType = false;
        let token;
        while (index < tokens.length) {
            let twoLastToken = langUtils.getTwoLastToken(tokens, index);
            let lastToken = langUtils.getLastToken(tokens, index);
            token = tokens[index];
            let nextToken = langUtils.getNextToken(tokens, index);
            if (!isOnFlowStructure)
                isOnFlowStructure = startFlowStructure(token, nextToken);
            let newLines = (lastToken) ? token.line - lastToken.line : 0;
            if (newLines > 0 && isOnCommentLine) {
                isOnCommentLine = false;
                isLastLineComment = true;
            } else if (!isOnCommentLine && isLastLineComment) {
                isLastLineComment = false;
            }
            if (!isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '/' && token.tokenType === TokenType.OPERATOR && token.content === '*') {
                isCommentBlock = true;
            } else if (isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '*' && token.tokenType === TokenType.OPERATOR && token.content === '/') {
                isCommentBlock = false;
                isLastLineComment = true;
            }
            if (!isCommentBlock && lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '/' && token.tokenType === TokenType.OPERATOR && token.content === '/')
                isOnCommentLine = true;
            if (!isOnText && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH && lastToken.tokenType !== TokenType.SQUOTTE)
                isOnText = true;
            else if (isOnText && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH)
                isOnText = false;
            if (!isOnCommentLine && !isCommentBlock && !isOnText && token.tokenType !== TokenType.SQUOTTE) {
                if (lastToken && (lastToken.tokenType === TokenType.LBRACKET || lastToken.content.toLowerCase() === 'else')) {
                    if (lastToken.line != token.line)
                        newLines = 1;
                }
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
                        firstParenEndColumn = -1;
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
                    if (lastToken && lastToken.tokenType === TokenType.IDENTIFIER && (lastToken.content.toLowerCase() === 'list' || lastToken.content.toLowerCase() === 'map' || lastToken.content.toLowerCase() === 'set' || systemMetadata[lastToken.content.toLowerCase()] || namespacesMetadata[lastToken.content.toLowerCase()] || classes.classesToLower.includes(lastToken.content.toLowerCase()))) {
                        isOnDataType = true;
                    }
                }
                if (token.tokenType === TokenType.RABRACKET) {
                    aBracketIndent--;
                    if (aBracketIndent === 0) {
                        isOnDataType = false;
                    }
                }
                if (lastToken && lastToken.tokenType === TokenType.SEMICOLON && parentIndent === 0 && isOneLineStructure) {
                    if (indentOffset > 0)
                        indentOffset--;
                    isOneLineStructure = false;
                }
                if (!isOnDataType && lastToken && lastToken.content.toLowerCase() != 'class' && lastToken.content.toLowerCase() != 'interface' && lastToken.content.toLowerCase() != 'enum' && (systemMetadata[token.content.toLowerCase()] || namespacesMetadata[token.content.toLowerCase()] || classes.classesToLower.includes(token.content.toLowerCase()))) {
                    if (nextToken && nextToken.tokenType === TokenType.DOT)
                        isOnDataType = true;
                } else if (isOnDataType) {
                    if (token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType !== TokenType.DOT && aBracketIndent === 0 && nextToken.tokenType !== TokenType.LABRACKET)
                        isOnDataType = false;
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
                } else if (isOnFlowStructure && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'else' && nextToken && nextToken.content.toLowerCase() !== 'if') {
                    isOnFlowStructure = false;
                    if (nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        isOneLineStructure = false;
                        if (indentOffset > 0)
                            indentOffset--;
                    } else {
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
                if (twoLastToken && twoLastToken.tokenType != TokenType.RABRACKET && lastToken && lastToken.tokenType === TokenType.LBRACKET && newLines === 0 && twoLastToken.content.toLowerCase() !== 'get' && twoLastToken.content.toLowerCase() !== 'set') {
                    if (token.content.toLowerCase() !== 'get' && token.content.toLowerCase() !== 'set')
                        newLines = 1; // Add new line after "{"
                }
                if (lastToken && lastToken.tokenType === TokenType.RBRACKET && newLines > 0 && token.content.toLowerCase() === 'else' && nextToken && nextToken.content !== 'if')
                    newLines = 0;
                if (lastToken && lastToken.tokenType === TokenType.SEMICOLON && newLines === 0 && token.content.toLowerCase() !== 'get' && token.content.toLowerCase() !== 'set' && token.tokenType !== TokenType.RBRACKET && parentIndent == 0)
                    if (!(token.tokenType === TokenType.OPERATOR && token.content === '/' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/'))
                        newLines = 1; // Add new line after ";"*/
            }
            if (isLastLineComment && newLines === 0) {
                newLines = (lastToken) ? token.line - lastToken.line : 1;
            }
            if (newLines > 0) {
                lines.push(line + getNewLines(newLines - 1));
                let indent = bracketIndent;
                if (isLastLineComment) {
                    if (indentOffset > 0)
                        indentOffset--;
                    isLastLineComment = false;
                }
                if (indentOffset > 0)
                    indent = bracketIndent + indentOffset;
                if (lastToken.content.toLowerCase() === 'else')
                    indent = indent + 1;
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
                    } else if ((systemMetadata[token.content.toLowerCase()] || classes.classesToLower.includes(token.content.toLowerCase())) && nextToken && nextToken.tokenType === TokenType.LABRACKET) {
                        line = getIndent(indent) + token.content + getWhitespaces(0);
                    } else if (token.content.toLowerCase() === 'else') {
                        line = getIndent(indent) + token.content + getWhitespaces(1);
                    } else if ((token.content.toLowerCase() === 'get' || token.content.toLowerCase() === 'set') && nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        line = getIndent(indent) + token.content + getWhitespaces(1);
                    } else {
                        line = getIndent(indent) + token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                    }
                }
            } else {
                if (!isOnCommentLine && !isCommentBlock && !isOnText) {
                    if (token.tokenType === TokenType.RABRACKET && nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.OPERATOR && nextToken && nextToken.tokenType === TokenType.NUMBER && lastToken && lastToken.tokenType !== TokenType.IDENTIFIER) {
                        line += token.content + getWhitespaces(0);
                    } else if ((token.tokenType === TokenType.AND || token.tokenType === TokenType.OR) && nextToken && (nextToken.tokenType === TokenType.AND || nextToken.tokenType === TokenType.OR)) {
                        line += token.content + getWhitespaces(0);
                    } else if ((token.tokenType === TokenType.EQUAL || token.tokenType === TokenType.OPERATOR || token.tokenType === TokenType.AND || token.tokenType === TokenType.OR) && nextToken && nextToken.tokenType === TokenType.LPAREN) {
                        line += token.content + getWhitespaces(1);
                    } else if ((token.content.toLowerCase() === 'get' || token.content.toLowerCase() === 'set') && nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        line += token.content + getWhitespaces(1);
                    } else if (token.content.toLowerCase() === 'else' || token.content.toLowerCase() === 'try') {
                        line += token.content + getWhitespaces(1);
                    } else if (token.tokenType === TokenType.RPAREN && nextToken && nextToken.tokenType === TokenType.LBRACKET) {
                        line += token.content + getWhitespaces(1);
                    } else if (token.tokenType === TokenType.LPAREN) {
                        line += token.content + getWhitespaces(0);
                    } else if ((token.content.toLowerCase() === 'catch' || token.content.toLowerCase() === 'while' || token.content.toLowerCase() === 'if') && nextToken.tokenType === TokenType.LPAREN) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.COMMA) {
                        line += token.content + getWhitespaces(1);
                    } else if (nextToken && (nextToken.tokenType === TokenType.RSQBRACKET || nextToken.tokenType === TokenType.DOT || nextToken.tokenType === TokenType.SEMICOLON || nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.LPAREN || nextToken.tokenType === TokenType.RPAREN)) {
                        line += token.content + getWhitespaces(0);
                    } else if (isOnDataType) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.DOT) {
                        line += token.content + getWhitespaces(0);
                    } else if ((systemMetadata[token.content.toLowerCase()] || classes.classesToLower.includes(token.content.toLowerCase())) && nextToken && nextToken.tokenType === TokenType.LABRACKET) {
                        line += token.content + getWhitespaces(0);
                    } else if (nextToken && nextToken.line > token.line) {
                        line += token.content + getWhitespaces(0);
                    } else if ((token.tokenType === TokenType.EQUAL || token.tokenType === TokenType.OPERATOR || token.tokenType === TokenType.LABRACKET || token.tokenType === TokenType.RABRACKET) && nextToken && (nextToken.tokenType === TokenType.EQUAL || nextToken.tokenType === TokenType.OPERATOR || nextToken.tokenType === TokenType.LABRACKET || nextToken.tokenType === TokenType.RABRACKET)) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.EXMARK) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.LSQBRACKET) {
                        line += token.content + getWhitespaces(0);
                    } else if (token.tokenType === TokenType.COLON) {
                        line += token.content + getWhitespaces(0);
                    } else {
                        line += token.content + getWhitespaces(1);
                    }
                } else {
                    line += token.content + getWhitespaces((nextToken) ? nextToken.startColumn - token.endColumn : 0);
                }
            }
            index++;
        }
        lines.push(line);
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