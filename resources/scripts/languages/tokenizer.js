const TokenType = require('./tokenTypes');

let symbols = [
    "€",
    "º",
    "~",
    "¬",
    "‘",
    "·",
    "╔",
];

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
        while (charIndex < str.length) {
            let char = str.charAt(charIndex);
            let token = {};
            if (char === ",") {
                token.tokenType = TokenType.COMMA;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (OPERATORS.test(char)) {
                token.tokenType = TokenType.OPERATOR;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === '\\') {
                token.tokenType = TokenType.BACKSLASH;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "(") {
                token.tokenType = TokenType.LPAREN;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === ")") {
                token.tokenType = TokenType.RPAREN;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "{") {
                token.tokenType = TokenType.LBRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "}") {
                token.tokenType = TokenType.RBRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "[") {
                token.tokenType = TokenType.LSQBRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "]") {
                token.tokenType = TokenType.RSQBRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === ".") {
                token.tokenType = TokenType.DOT;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === ":") {
                token.tokenType = TokenType.COLON;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === ";") {
                token.tokenType = TokenType.SEMICOLON;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "<") {
                token.tokenType = TokenType.LABRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === ">") {
                token.tokenType = TokenType.RABRACKET;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "&") {
                token.tokenType = TokenType.AND;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "|") {
                token.tokenType = TokenType.OR;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "'") {
                token.tokenType = TokenType.SQUOTTE;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "\"") {
                token.tokenType = TokenType.QUOTTE;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "!") {
                token.tokenType = TokenType.EXMARK;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "?") {
                token.tokenType = TokenType.QMARK;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "¡") {
                token.tokenType = TokenType.OPEN_EXMARK;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "¿") {
                token.tokenType = TokenType.OPEN_QMARK;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "@") {
                token.tokenType = TokenType.AT;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "#") {
                token.tokenType = TokenType.SHARP;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "=") {
                token.tokenType = TokenType.EQUAL;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "$") {
                token.tokenType = TokenType.DOLLAR;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "%") {
                token.tokenType = TokenType.PERCENT;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "`") {
                token.tokenType = TokenType.BSLQUOTTE;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (char === "´") {
                token.tokenType = TokenType.SLQUOTTE;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (symbols.includes(char) || SYMBOLS_FORMAT.test(char)) {
                token.tokenType = TokenType.SYMBOL;
                token.content = char;
                token.line = lineNumber;
                token.startColumn = column;
                token.endColumn = column + char.length;
            } else if (NUM_FORMAT.test(char)) {
                var content = '';
                token.startColumn = column;
                while (NUM_FORMAT.test(char)) {
                    content += char;
                    char = str.charAt(++charIndex);
                }
                column =  column + content.length;
                token.tokenType = TokenType.NUMBER;
                token.content = content;
                token.line = lineNumber;
                token.endColumn = token.startColumn + token.content.length;
                tokens.push(token);
                continue;
            } else if (ID_FORMAT.test(char)) {
                var content = '';
                token.startColumn = column;
                while (ID_FORMAT.test(char)) {
                    content += char;
                    char = str.charAt(++charIndex);
                }
                column =  column + content.length;
                token.tokenType = TokenType.IDENTIFIER;
                token.content = content;
                token.line = lineNumber;
                token.endColumn = token.startColumn + token.content.length;
                tokens.push(token);
                continue;
            } else if (char === "\n") {
                lineNumber++;
                column = 0;
            } else if (char !== "\t" && char !== "\r" && char !== " " && char.trim().length != 0) {
                throw new Error('Character not recognized: <<' + char + '>> at line: ' + lineNumber + '; Start Column: ' + column + '; End Column: ' + (column + char.length));
            } else if(char === "\t"){
                column = column + 3;
            }
            if (token.tokenType) {
                tokens.push(token);
            }
            charIndex++;
            column++;
        }
        return tokens;
    }
}
exports.Tokenizer = Tokenizer;