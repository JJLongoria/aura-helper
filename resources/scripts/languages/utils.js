const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const logger = require('../main/logger');

class Utils {
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

    static getQueryData(document, position) {
        logger.log("Run getQueryData");
        let line = position.line;
        let endLoop = false;
        let endInnerLoop = false;
        let startQueryLine;
        let startQueryIndex;
        let from;
        let queryData;
        if (document.lineAt(line).isEmptyOrWhitespace)
            return queryData;
        let isSelect = true;
        let selectIndex = 0;
        let selectLine = 0;
        while (!endLoop) {
            let lineTokens = Tokenizer.tokenize(document.lineAt(line).text);
            let index = lineTokens.length - 1;
            while (!endInnerLoop) {
                let token = lineTokens[index];
                let lastToken = Utils.getLastToken(lineTokens, index);
                let nextToken = Utils.getNextToken(lineTokens, index);
                if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'select') {
                    isSelect = true;
                    selectIndex = index;
                    selectLine = line;
                } else if(token.tokenType === TokenType.RBRACKET || token.tokenType === TokenType.SEMICOLON){
                    endLoop = true;
                    endInnerLoop = true;
                }
                if (isSelect && (line === selectLine || line === selectLine - 1) && (token.tokenType === TokenType.LSQBRACKET || token.tokenType === TokenType.SQUOTTE || token.tokenType === TokenType.QUOTTE)) {
                    startQueryLine = line;
                    startQueryIndex = index;
                }
                if (startQueryLine && startQueryIndex){
                    endLoop = true;
                    endInnerLoop = true;
                }
                index--;
                if(index < 0)
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
                    if (token.tokenType === TokenType.RSQBRACKET || ((token.tokenType === TokenType.SQUOTTE || token.tokenType === TokenType.QUOTTE) && lastToken && lastToken.tokenType !== TokenType.BACKSLASH))
                        endLoop = true;
                    if (!endLoop) {
                        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "from") {
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
                        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "select") {
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
        if (from) {
            queryData = {
                from: from,
                queryFields: queryFields
            };
        }
        return queryData;
    }
}
exports.Utils = Utils;