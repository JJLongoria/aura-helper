const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');

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

    static getLastToken(tokens, index) {
        if (index - 1 >= 0)
            return tokens[index - 1];
    }

    static getQueryData(document, position) {
        let line = position.line;
        let endLoop = false;
        let startQueryLine;
        let startQueryIndex;
        let from;
        let queryData;
        while (!endLoop) {
            let lineTokens = Tokenizer.tokenize(document.lineAt(line).text);
            let index = 0;
            while (!endLoop) {
                let token = lineTokens[index];
                let lastToken = Utils.getLastToken(lineTokens, index);
                let nextToken = Utils.getNextToken(lineTokens, index);
                if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'select' && lastToken && (lastToken.tokenType === TokenType.SQUOTTE || lastToken.tokenType === TokenType.QUOTTE || lastToken.tokenType === TokenType.LSQBRACKET)) {
                    if (token.startColumn - 1 <= position.character || token.line != position.line) {
                        startQueryIndex = index;
                        startQueryLine = line;
                        endLoop = true;
                    }
                }
                index++;
                if (index === lineTokens.length)
                    endLoop = true;
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
        while (!endLoop) {
            let lineTokens = Tokenizer.tokenize(document.lineAt(line).text);
            let index = 0;
            if (startQueryLine === line)
                index = startQueryIndex;
            while (!endLoop) {
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
                if (index === lineTokens.length)
                    endLoop = true;
            }
            line++;
            if (line == document.lineCount)
                endLoop = true;
        }
        if(from){
            queryData = {
                from: from,
                queryFields: queryFields
            };
        }
        return queryData;
    }
}
exports.Utils = Utils;