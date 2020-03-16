const TokenType = require('./tokenTypes');

class Tokenizer {
    static tokenize(str) {
        const NUM_FORMAT = /[0-9]/;
        const ID_FORMAT = /([a-zA-Z0-9À-ÿ]|_|–)/;
        const OPERATORS = /\+|-|\*|\/|\^/;
        const SYMBOLS_FORMAT = /[^\x00-\x7F]/;
        let tokens = [];
        let charIndex = 0;
        let lineNumber = 0;
        let column = 0;
        let relativeStartColumn = 0;
        while (charIndex < str.length) {
            let char = str.charAt(charIndex);
            let token = {};
            if (char === ",") {
                token.tokenType = TokenType.COMMA;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (OPERATORS.test(char)) {
                token.tokenType = TokenType.OPERATOR;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === '\\') {
                token.tokenType = TokenType.BACKSLASH;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "(") {
                token.tokenType = TokenType.LPAREN;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === ")") {
                token.tokenType = TokenType.RPAREN;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "{") {
                token.tokenType = TokenType.LBRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "}") {
                token.tokenType = TokenType.RBRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "[") {
                token.tokenType = TokenType.LSQBRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "]") {
                token.tokenType = TokenType.RSQBRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === ".") {
                token.tokenType = TokenType.DOT;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === ":") {
                token.tokenType = TokenType.COLON;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === ";") {
                token.tokenType = TokenType.SEMICOLON;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "<") {
                token.tokenType = TokenType.LABRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === ">") {
                token.tokenType = TokenType.RABRACKET;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "&") {
                token.tokenType = TokenType.AND;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "|") {
                token.tokenType = TokenType.OR;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "'") {
                token.tokenType = TokenType.SQUOTTE;
                token.content = char;
                token.contentToLower = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "\"") {
                token.tokenType = TokenType.QUOTTE;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "!") {
                token.tokenType = TokenType.EXMARK;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "?") {
                token.tokenType = TokenType.QMARK;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "¡") {
                token.tokenType = TokenType.OPEN_EXMARK;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "¿") {
                token.tokenType = TokenType.OPEN_QMARK;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "@") {
                token.tokenType = TokenType.AT;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "#") {
                token.tokenType = TokenType.SHARP;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "=") {
                token.tokenType = TokenType.EQUAL;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "$") {
                token.tokenType = TokenType.DOLLAR;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "%") {
                token.tokenType = TokenType.PERCENT;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "`") {
                token.tokenType = TokenType.BSLQUOTTE;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "´") {
                token.tokenType = TokenType.SLQUOTTE;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (NUM_FORMAT.test(char)) {
                var content = '';
                token.startColumn = column;
                while (NUM_FORMAT.test(char) || char === '.' || char === ':' || char === '+' || char === '-' || char.toLowerCase() === 't' || char.toLowerCase() === 'z') {
                    content += char;
                    char = str.charAt(++charIndex);
                }
                column = column + content.length;
                relativeStartColumn = relativeStartColumn + content.length;
                if (content.indexOf(':') !== -1 && content.indexOf('-') !== -1)
                    token.tokenType = TokenType.DATETIME;
                else if (content.indexOf('-') !== -1)
                    token.tokenType = TokenType.DATE;
                else if (content.indexOf(':') !== -1)
                    token.tokenType = TokenType.TIME;
                else if (content.indexOf('.') !== -1)
                    token.tokenType = TokenType.DECIMAL;
                else
                    token.tokenType = TokenType.NUMBER;
                token.content = content;
                token.contentToLower = content.toLowerCase();
                token.line = lineNumber;
                token.endColumn = token.startColumn + token.content.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
                tokens.push(token);
                continue;
            } else if (ID_FORMAT.test(char)) {
                var content = '';
                token.startColumn = column;
                while (ID_FORMAT.test(char)) {
                    content += char;
                    char = str.charAt(++charIndex);
                }
                column = column + content.length;
                relativeStartColumn = relativeStartColumn + content.length;
                token.tokenType = TokenType.IDENTIFIER;
                token.content = content;
                token.contentToLower = content.toLowerCase();
                token.line = lineNumber;
                token.endColumn = token.startColumn + token.content.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + token.content.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
                tokens.push(token);
                continue;
            } else if (char === "\n") {
                lineNumber++;
                column = 0;
                relativeStartColumn = 0;
            } else if (char !== "\t" && char !== "\r" && char !== " " && char.trim().length != 0) {
                token.tokenType = TokenType.SYMBOL;
                token.content = char;
                token.contentToLower = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
                token.relativeStartColumn = relativeStartColumn;
                token.relativeEndColumn = relativeStartColumn + char.length;
                token.id = '' + token.content + token.line + token.startColumn + token.endColumn;
            } else if (char === "\t") {
                column = column + 3;
            }
            if (token.tokenType) {
                tokens.push(token);
            }
            charIndex++;
            column++;
            relativeStartColumn++;
        }
        return tokens;
    }
}
exports.Tokenizer = Tokenizer;