const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const logger = require('../utils/logger');
const vscode = require('vscode');
const Position = vscode.Position;
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;

class Utils {

    static transformTokensToText(tokens) {
        let text = '';
        let index = 0;
        let newLine = false;
        while (index < tokens.length) {
            let lastToken = Utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            newLine = (lastToken && token && lastToken.line < token.line) || !lastToken;
            if (newLine)
                text += Utils.getWhitespaces(token.startColumn);

            text += token.content;
            if (nextToken && token &&  token.line === nextToken.line)
                text += Utils.getWhitespaces(nextToken.startColumn - token.endColumn);
            if (nextToken && token && token.line < nextToken.line)
                text += Utils.getNewLines(nextToken.line - token.line);
            index++;
        }
        return text;
    }

    static getNewLines(number) {
        let newLines = '';
        for (let index = 0; index < number; index++) {
            newLines += '\n';
        }
        return newLines;
    }

    static getWhitespaces(number) {
        let whitespace = '';
        for (let index = 0; index < number; index++) {
            whitespace += ' ';
        }
        return whitespace;
    }

    static getNextToken(tokens, index) {
        if (index + 1 < tokens.length)
            return tokens[index + 1];
    }

    static getTwoNextToken(tokens, index) {
        if (index + 2 < tokens.length)
            return tokens[index + 2];
    }

    static getLastToken(tokens, index) {
        if (index - 1 >= 0)
            return tokens[index - 1];
    }

    static getTwoLastToken(tokens, index) {
        if (index - 2 >= 0)
            return tokens[index - 2];
    }

    static getQueryData(document, position) {
        logger.log("Run getQueryData");
        let line = position.line;
        let positionData;
        let initLine = line;
        let endLoop = false;
        let endInnerLoop = false;
        let startQueryLine;
        let startQueryIndex;
        let startQueryColumn;
        let endQueryLine;
        let endQueryIndex;
        let endQueryColumn;
        let from;
        let queryData;
        if (document.lineAt(line).isEmptyOrWhitespace)
            return queryData;
        let isSelect = false;
        let selectLine = 0;
        while (!endLoop) {
            let lineTokens = Tokenizer.tokenize(document.lineAt(line).text);
            let index;
            index = lineTokens.length - 1;
            endInnerLoop = false;
            while (!endInnerLoop) {
                let token = lineTokens[index];
                let lastToken = Utils.getLastToken(lineTokens, index);
                let nextToken = Utils.getNextToken(lineTokens, index);
                if (token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'select') {
                    isSelect = true;
                    selectLine = line;
                } else if (token && (token.tokenType === TokenType.RBRACKET || token.tokenType === TokenType.SEMICOLON || token.tokenType === TokenType.LBRACKET) && (line != initLine || (line === initLine && index !== lineTokens.length - 1))) {
                    endLoop = true;
                    endInnerLoop = true;
                }
                if (isSelect && (line === selectLine || line === selectLine - 1) && token && (token.tokenType === TokenType.LSQBRACKET || token.tokenType === TokenType.SQUOTTE || token.tokenType === TokenType.QUOTTE)) {
                    startQueryLine = line;
                    startQueryIndex = index;
                    startQueryColumn = token.relativeStartColumn;
                }
                if (startQueryLine && startQueryIndex) {
                    endLoop = true;
                    endInnerLoop = true;
                }
                index--;
                if (index < 0)
                    endInnerLoop = true;
            }
            line--;
            if (line < 0)
                endLoop = true;
        }
        line = startQueryLine;
        endLoop = false;
        let queryFields = [];
        let field = "";
        let startFields = false;
        let outsideQuery = false;
        logger.log('startQueryIndex', startQueryIndex);
        logger.log('startQueryLine', startQueryLine);
        if (startQueryIndex && startQueryLine) {
            while (!endLoop) {
                let lineTokens = Tokenizer.tokenize(document.lineAt(line).text);
                let index = 0;
                if (startQueryLine === line)
                    index = startQueryIndex + 1;
                while (index < lineTokens.length) {
                    let token = lineTokens[index];
                    let lastToken = Utils.getLastToken(lineTokens, index);
                    let nextToken = Utils.getNextToken(lineTokens, index);
                    if (token && (token.tokenType === TokenType.RSQBRACKET || ((token.tokenType === TokenType.SQUOTTE || token.tokenType === TokenType.QUOTTE) && lastToken && lastToken.tokenType !== TokenType.BACKSLASH))) {
                        endLoop = true;
                        endQueryLine = line;
                        endQueryIndex = token.index;
                        endQueryColumn = token.relativeStartColumn;
                    }
                    if (!endLoop) {
                        if (token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "from") {
                            from = nextToken.content;
                            if (field && field.length > 0)
                                queryFields.push(field);
                            field = "";
                            startFields = false;
                        }
                        if (startFields) {
                            if (token.tokenType === TokenType.COMMA) {
                                if (field && field.length > 0)
                                    queryFields.push(field);
                                field = "";
                            } else {
                                field += token.content;
                            }
                        }
                        if (token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "select") {
                            startFields = true;
                        }
                    }
                    index++;
                }
                line++;
                if (line == document.lineCount)
                    endLoop = true;
            }
        }
        if (startQueryLine <= position.line && position.line <= endQueryLine) {
            if (startQueryLine === position.line && endQueryLine === position.line) {
                if (startQueryColumn + 1 > position.character || position.character > endQueryColumn)
                    outsideQuery = true;

            } else if (startQueryLine === position.line) {
                if (startQueryColumn + 1 > position.character)
                    outsideQuery = true;
            } else if (endQueryLine === position.line) {
                if (position.character > endQueryColumn)
                    outsideQuery = true;
            }
        } else {
            outsideQuery = true;
        }
        if (from && !outsideQuery) {
            queryData = {
                from: from,
                queryFields: queryFields
            };
        }
        logger.logJSON('queryData', queryData);
        return queryData;
    }

    static isOnPosition(position, lastToken, token, nextToken) {
        if (position && token && token.line == position.line) {
            if (token.relativeStartColumn <= position.character && nextToken && position.character <= nextToken.relativeStartColumn)
                return true;
        } else if (position && lastToken && lastToken.line < position.line && nextToken && position.line < nextToken.line) {
            return true;
        }
        return false;
    }

    static getPositionData(position, token, nextToken) {
        let positionData;
        if (token.relativeStartColumn <= position.character && position.character <= token.relativeEndColumn) {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
            let startIndex = position.character - token.relativeStartColumn;
            positionData.startPart = token.content.substring(0, startIndex + 1);
            positionData.endPart = token.content.substring(startIndex + 1, token.content.length - 1);
        } else if (token.endColumn <= position.character && position.character <= nextToken.relativeStartColumn) {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
            positionData.startPart = token.content;
        } else {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
        }
        return positionData;
    }
}
exports.Utils = Utils;