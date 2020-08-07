const fileSystem = require('../../fileSystem');
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const StrUtils = require('../../utils/strUtils');
const Token = require('./token');
const TokenType = require('./tokenTypes');
const ApplicationContext = require('../../core/applicationContext');

const symbolTokens = {
    ">>>=": TokenType.OPERATOR.BITWISE.UNSIGNED_RIGHT_ASSIGN,
    ">>=": TokenType.OPERATOR.BITWISE.SIGNED_RIGTH_ASSIGN,
    "<<=": TokenType.OPERATOR.BITWISE.LEFT_ASSIGN,
    ">>>": TokenType.OPERATOR.BITWISE.UNSIGNED_RIGHT,
    "!==": TokenType.OPERATOR.LOGICAL.INEQUALITY_EXACT,
    "===": TokenType.OPERATOR.LOGICAL.EQUALITY_EXACT,
    ">>": TokenType.OPERATOR.BITWISE.SIGNED_RIGHT,
    "<<": TokenType.OPERATOR.BITWISE.SIGNED_LEFT,
    "^=": TokenType.OPERATOR.BITWISE.EXCLUSIVE_OR_ASSIGN,
    "--": TokenType.OPERATOR.ARITHMETIC.DECREMENT,
    "++": TokenType.OPERATOR.ARITHMETIC.INCREMENT,
    "!=": TokenType.OPERATOR.LOGICAL.INEQUALITY,
    "==": TokenType.OPERATOR.LOGICAL.EQUALITY,
    "||": TokenType.OPERATOR.LOGICAL.OR,
    "|=": TokenType.OPERATOR.LOGICAL.OR_ASSIGN,
    "&&": TokenType.OPERATOR.LOGICAL.AND,
    "&=": TokenType.OPERATOR.LOGICAL.AND_ASSIGN,
    ">=": TokenType.OPERATOR.LOGICAL.GREATER_THAN_EQUALS,
    "<=": TokenType.OPERATOR.LOGICAL.LESS_THAN_EQUALS,
    "=>": TokenType.OPERATOR.ASSIGN.MAP_KEY_VALUE,
    "+=": TokenType.OPERATOR.ARITHMETIC.ADD_ASSIGN,
    "-=": TokenType.OPERATOR.ARITHMETIC.SUBSTRACT_ASSIGN,
    "*=": TokenType.OPERATOR.ARITHMETIC.MULTIPLY_ASSIGN,
    "/=": TokenType.OPERATOR.ARITHMETIC.DIVIDE_ASSIGN,
    "^": TokenType.OPERATOR.BITWISE.EXCLUSIVE_OR,
    "|": TokenType.OPERATOR.BITWISE.OR,
    "&": TokenType.OPERATOR.BITWISE.AND,
    "+": TokenType.OPERATOR.ARITHMETIC.ADD,
    "-": TokenType.OPERATOR.ARITHMETIC.SUBSTRACT,
    "*": TokenType.OPERATOR.ARITHMETIC.MULTIPLY,
    "/": TokenType.OPERATOR.ARITHMETIC.DIVIDE,
    "!": TokenType.OPERATOR.LOGICAL.NOT,
    "<": TokenType.OPERATOR.LOGICAL.LESS_THAN,
    ">": TokenType.OPERATOR.LOGICAL.GREATER_THAN,
    "=": TokenType.OPERATOR.ASSIGN.ASSIGN,
    "/**": TokenType.COMMENT.BLOCK_START,
    "/*": TokenType.COMMENT.BLOCK_START,
    "*/": TokenType.COMMENT.BLOCK_END,
    "//": TokenType.COMMENT.LINE,
    "///": TokenType.COMMENT.LINE_DOC,
    "(": TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN,
    ")": TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE,
    "{": TokenType.BRACKET.CURLY_OPEN,
    "}": TokenType.BRACKET.CURLY_CLOSE,
    "[": TokenType.BRACKET.SQUARE_OPEN,
    "]": TokenType.BRACKET.SQUARE_CLOSE,
    ",": TokenType.PUNCTUATION.COMMA,
    ";": TokenType.PUNCTUATION.SEMICOLON,
    ":": TokenType.PUNCTUATION.COLON,
    ".": TokenType.PUNCTUATION.OBJECT_ACCESSOR,
    "\\": TokenType.PUNCTUATION.BACKSLASH,
    "'": TokenType.PUNCTUATION.QUOTTES,
    "@": TokenType.PUNCTUATION.AT,
    "?": TokenType.PUNCTUATION.EXMARK,
}

const primitiveDatatypes = {
    "blob": TokenType.DATATYPE.PRIMITIVE,
    "boolean": TokenType.DATATYPE.PRIMITIVE,
    "byte": TokenType.DATATYPE.PRIMITIVE,
    "date": TokenType.DATATYPE.PRIMITIVE,
    "datetime": TokenType.DATATYPE.PRIMITIVE,
    "decimal": TokenType.DATATYPE.PRIMITIVE,
    "double": TokenType.DATATYPE.PRIMITIVE,
    "id": TokenType.DATATYPE.PRIMITIVE,
    "integer": TokenType.DATATYPE.PRIMITIVE,
    "long": TokenType.DATATYPE.PRIMITIVE,
    "object": TokenType.DATATYPE.PRIMITIVE,
    "string": TokenType.DATATYPE.PRIMITIVE,
    "time": TokenType.DATATYPE.PRIMITIVE,
    "void": TokenType.DATATYPE.PRIMITIVE,
};

const collectionsDatatypes = {
    "list": TokenType.DATATYPE.COLLECTION,
    "set": TokenType.DATATYPE.COLLECTION,
    "map": TokenType.DATATYPE.COLLECTION,
    "array": TokenType.DATATYPE.COLLECTION,
};

const dateLiterals = {
    "yesterday": TokenType.LITERAL.DATE,
    "today": TokenType.LITERAL.DATE,
    "tomorrow": TokenType.LITERAL.DATE,
    "last_week": TokenType.LITERAL.DATE,
    "this_week": TokenType.LITERAL.DATE,
    "next_week": TokenType.LITERAL.DATE,
    "last_month": TokenType.LITERAL.DATE,
    "this_month": TokenType.LITERAL.DATE,
    "next_month": TokenType.LITERAL.DATE,
    "last_90_days": TokenType.LITERAL.DATE,
    "next_90_days": TokenType.LITERAL.DATE,
    "last_n_days": TokenType.LITERAL.DATE_PARAMETRIZED,
    "next_n_days": TokenType.LITERAL.DATE_PARAMETRIZED,
    "next_n_weeks": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_weeks": TokenType.LITERAL.DATE_PARAMETRIZED,
    "next_n_months": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_months": TokenType.LITERAL.DATE_PARAMETRIZED,
    "this_quarter": TokenType.LITERAL.DATE,
    "last_quarter": TokenType.LITERAL.DATE,
    "next_quarter": TokenType.LITERAL.DATE,
    "next_n_quarters": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_quarters": TokenType.LITERAL.DATE_PARAMETRIZED,
    "this_year": TokenType.LITERAL.DATE,
    "last_year": TokenType.LITERAL.DATE,
    "next_n_years": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_years": TokenType.LITERAL.DATE_PARAMETRIZED,
    "this_fiscal_quarter": TokenType.LITERAL.DATE,
    "last_fiscal_quarter": TokenType.LITERAL.DATE,
    "next_fiscal_quarter": TokenType.LITERAL.DATE,
    "next_n_fiscal_quarters": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_fiscal_quarters": TokenType.LITERAL.DATE_PARAMETRIZED,
    "this_fiscal_year": TokenType.LITERAL.DATE,
    "last_fiscal_year": TokenType.LITERAL.DATE,
    "next_fiscal_year": TokenType.LITERAL.DATE,
    "next_n_fiscal_years": TokenType.LITERAL.DATE_PARAMETRIZED,
    "last_n_fiscal_years": TokenType.LITERAL.DATE_PARAMETRIZED,
};

const reservedKeywords = {
    "abstract": TokenType.KEYWORD.MODIFIER.DEFINITION,
    "after": TokenType.DATABASE.TRIGGER_EXEC,
    "any": TokenType.KEYWORD.FOR_FUTURE,
    "activate": TokenType.KEYWORD.FOR_FUTURE,
    "as": TokenType.KEYWORD.OTHER,
    "asc": TokenType.QUERY.ORDER,
    "autonomous": TokenType.KEYWORD.FOR_FUTURE,
    "begin": TokenType.KEYWORD.FOR_FUTURE,
    "before": TokenType.DATABASE.TRIGGER_EXEC,
    "bigdecimal": TokenType.KEYWORD.FOR_FUTURE,
    "break": TokenType.KEYWORD.FLOW_CONTROL.BREAK,
    "bulk": TokenType.KEYWORD.OTHER,
    "case": TokenType.KEYWORD.FOR_FUTURE,
    "cast": TokenType.KEYWORD.FOR_FUTURE,
    "catch": TokenType.KEYWORD.FLOW_CONTROL.CATCH,
    "char": TokenType.KEYWORD.FOR_FUTURE,
    "class": TokenType.KEYWORD.DECLARATION.CLASS,
    "collect": TokenType.KEYWORD.FOR_FUTURE,
    "commit": TokenType.KEYWORD.OTHER,
    "const": TokenType.KEYWORD.FOR_FUTURE,
    "continue": TokenType.KEYWORD.FLOW_CONTROL.CONTINUE,
    "default": TokenType.KEYWORD.FOR_FUTURE,
    "delete": TokenType.DATABASE.DML,
    "desc": TokenType.QUERY.ORDER,
    "do": TokenType.KEYWORD.FLOW_CONTROL.DO,
    "else": TokenType.KEYWORD.FLOW_CONTROL.ELSE,
    "enum": TokenType.KEYWORD.DECLARATION.ENUM,
    "exit": TokenType.KEYWORD.FOR_FUTURE,
    "export": TokenType.KEYWORD.FOR_FUTURE,
    "extends": TokenType.KEYWORD.DECLARATION.EXTENDS,
    "false": TokenType.LITERAL.BOOLEAN,
    "final": TokenType.KEYWORD.MODIFIER.FINAL,
    "finally": TokenType.KEYWORD.FLOW_CONTROL.FINALLY,
    "float": TokenType.KEYWORD.FOR_FUTURE,
    "for": TokenType.KEYWORD.FLOW_CONTROL.FOR,
    "global": TokenType.KEYWORD.MODIFIER.ACCESS,
    "goto": TokenType.KEYWORD.FOR_FUTURE,
    "group": TokenType.KEYWORD.FOR_FUTURE,
    "hint": TokenType.KEYWORD.FOR_FUTURE,
    "if": TokenType.KEYWORD.FLOW_CONTROL.IF,
    "implements": TokenType.KEYWORD.DECLARATION.IMPLEMENTS,
    "import": TokenType.KEYWORD.FOR_FUTURE,
    "inner": TokenType.KEYWORD.FOR_FUTURE,
    "insert": TokenType.DATABASE.DML,
    "instanceof": TokenType.OPERATOR.LOGICAL.INSTANCE_OF,
    "interface": TokenType.KEYWORD.DECLARATION.INTERFACE,
    "into": TokenType.KEYWORD.FOR_FUTURE,
    "join": TokenType.KEYWORD.FOR_FUTURE,
    "loop": TokenType.KEYWORD.FOR_FUTURE,
    "merge": TokenType.DATABASE.DML,
    "new": TokenType.KEYWORD.OBJECT.NEW,
    "null": TokenType.LITERAL.NULL,
    "number": TokenType.KEYWORD.OTHER,
    "of": TokenType.KEYWORD.FOR_FUTURE,
    "on": TokenType.KEYWORD.OTHER,
    "outer": TokenType.KEYWORD.FOR_FUTURE,
    "override": TokenType.KEYWORD.MODIFIER.OVERRIDE,
    "package": TokenType.KEYWORD.OTHER,
    "parallel": TokenType.KEYWORD.FOR_FUTURE,
    "pragma": TokenType.KEYWORD.FOR_FUTURE,
    "private": TokenType.KEYWORD.MODIFIER.ACCESS,
    "protected": TokenType.KEYWORD.MODIFIER.ACCESS,
    "public": TokenType.KEYWORD.MODIFIER.ACCESS,
    "retrieve": TokenType.KEYWORD.FOR_FUTURE,
    "return": TokenType.KEYWORD.FLOW_CONTROL.RETURN,
    "returning": TokenType.KEYWORD.FOR_FUTURE,
    "search": TokenType.KEYWORD.FOR_FUTURE,
    "select": TokenType.QUERY.CLAUSE.SELECT,
    "short": TokenType.KEYWORD.FOR_FUTURE,
    "sort": TokenType.KEYWORD.OTHER,
    "stat": TokenType.KEYWORD.FOR_FUTURE,
    "static": TokenType.KEYWORD.MODIFIER.STATIC,
    "super": TokenType.KEYWORD.OBJECT.SUPER,
    "switch": TokenType.KEYWORD.FLOW_CONTROL.SWITCH,
    "synchronized": TokenType.KEYWORD.FOR_FUTURE,
    "testmethod": TokenType.KEYWORD.MODIFIER.TEST_METHOD,
    "this": TokenType.KEYWORD.OBJECT.THIS,
    "throw": TokenType.KEYWORD.FLOW_CONTROL.THROW,
    "transaction": TokenType.KEYWORD.FOR_FUTURE,
    "trigger": TokenType.KEYWORD.DECLARATION.TRIGGER,
    "true": TokenType.LITERAL.BOOLEAN,
    "try": TokenType.KEYWORD.FLOW_CONTROL.TRY,
    "type": TokenType.KEYWORD.FOR_FUTURE,
    "transient": TokenType.KEYWORD.MODIFIER.TRANSIENT,
    "undelete": TokenType.DATABASE.DML,
    "update": TokenType.DATABASE.DML,
    "upsert": TokenType.DATABASE.DML,
    "virtual": TokenType.KEYWORD.MODIFIER.DEFINITION,
    "webservice": TokenType.KEYWORD.MODIFIER.WEB_SERVICE,
    "while": TokenType.KEYWORD.FLOW_CONTROL.WHILE,
    "when": TokenType.KEYWORD.FLOW_CONTROL.SWITCH_CASE,
};

const soqlFunctions = {
    "avg": TokenType.QUERY.FUNCTION,
    "calendar_month": TokenType.QUERY.FUNCTION,
    "calendar_quarter": TokenType.QUERY.FUNCTION,
    "calendar_year": TokenType.QUERY.FUNCTION,
    "convertcurrency": TokenType.QUERY.FUNCTION,
    "converttimezone": TokenType.QUERY.FUNCTION,
    "count": TokenType.QUERY.FUNCTION,
    "day_in_month": TokenType.QUERY.FUNCTION,
    "day_in_week": TokenType.QUERY.FUNCTION,
    "day_in_year": TokenType.QUERY.FUNCTION,
    "day_only": TokenType.QUERY.FUNCTION,
    "data category": TokenType.QUERY.FUNCTION,
    "tolabel": TokenType.QUERY.FUNCTION,
    "includes": TokenType.QUERY.FUNCTION,
    "excludes": TokenType.QUERY.FUNCTION,
    "fiscal_month": TokenType.QUERY.FUNCTION,
    "fiscal_quarter": TokenType.QUERY.FUNCTION,
    "fiscal_year": TokenType.QUERY.FUNCTION,
    "format": TokenType.QUERY.FUNCTION,
    "grouping": TokenType.QUERY.FUNCTION,
    "group by cube": TokenType.QUERY.FUNCTION,
    "group by rollup": TokenType.QUERY.FUNCTION,
    "hour_in_day": TokenType.QUERY.FUNCTION,
    "max": TokenType.QUERY.FUNCTION,
    "min": TokenType.QUERY.FUNCTION,
    "sum": TokenType.QUERY.FUNCTION,
    "week_in_month": TokenType.QUERY.FUNCTION,
    "week_in_year": TokenType.QUERY.FUNCTION,
};

const queryClauses = {
    "using scope": TokenType.QUERY.CLAUSE.USING_SCOPE,
    "order by": TokenType.QUERY.CLAUSE.ORDER_BY,
    "where": TokenType.QUERY.CLAUSE.WHERE,
    "when": TokenType.QUERY.CLAUSE.WHEN,
    "typeof": TokenType.QUERY.CLAUSE.TYPE_OF,
    "then": TokenType.QUERY.CLAUSE.THEN,
    "nulls": TokenType.QUERY.CLAUSE.NULLS,
    "from": TokenType.QUERY.CLAUSE.FROM,
    "end": TokenType.QUERY.CLAUSE.END,
    "else": TokenType.QUERY.CLAUSE.ELSE,
    "group by": TokenType.QUERY.CLAUSE.GROUP_BY,
    "having": TokenType.QUERY.CLAUSE.HAVING,
    "with": TokenType.QUERY.CLAUSE.WITH,
    "limit": TokenType.QUERY.CLAUSE.LIMIT,
    "offset": TokenType.QUERY.CLAUSE.OFFSET,
    "for": TokenType.QUERY.CLAUSE.FOR,
};

const soqlOperators = {
    "above": TokenType.QUERY.OPERATOR,
    "above_or_below": TokenType.QUERY.OPERATOR,
    "and": TokenType.QUERY.OPERATOR,
    "at": TokenType.QUERY.OPERATOR,
    "reference": TokenType.QUERY.OPERATOR,
    "update": TokenType.QUERY.OPERATOR,
    "view": TokenType.QUERY.OPERATOR,
    "in": TokenType.QUERY.OPERATOR,
    "like": TokenType.QUERY.OPERATOR,
    "not in": TokenType.QUERY.OPERATOR,
    "not": TokenType.QUERY.OPERATOR,
    "or": TokenType.QUERY.OPERATOR,
    "update tracking": TokenType.QUERY.OPERATOR,
    "update viewstat": TokenType.QUERY.OPERATOR,
    "data category": TokenType.QUERY.OPERATOR,
    "snippet": TokenType.QUERY.OPERATOR,
    "network": TokenType.QUERY.OPERATOR,
    "metadata": TokenType.QUERY.OPERATOR,
    "using listview": TokenType.QUERY.OPERATOR,
    "division": TokenType.QUERY.OPERATOR,
    "highlight": TokenType.QUERY.OPERATOR,
    "spell_correction": TokenType.QUERY.OPERATOR,
    "returning": TokenType.QUERY.OPERATOR
};

const annotations = {
    "auraenabled": TokenType.ANNOTATION.NAME,
    "deprecated": TokenType.ANNOTATION.NAME,
    "future": TokenType.ANNOTATION.NAME,
    "invocablemethod": TokenType.ANNOTATION.NAME,
    "invocablevariable": TokenType.ANNOTATION.NAME,
    "istest": TokenType.ANNOTATION.NAME,
    "namespaceaccesible": TokenType.ANNOTATION.NAME,
    "readonly": TokenType.ANNOTATION.NAME,
    "remoteaction": TokenType.ANNOTATION.NAME,
    "supresswarnings": TokenType.ANNOTATION.NAME,
    "testsetup": TokenType.ANNOTATION.NAME,
    "testvisible": TokenType.ANNOTATION.NAME,
    "restresource": TokenType.ANNOTATION.NAME,
    "httpdelete": TokenType.ANNOTATION.NAME,
    "httpget": TokenType.ANNOTATION.NAME,
    "httppatch": TokenType.ANNOTATION.NAME,
    "httppost": TokenType.ANNOTATION.NAME,
    "httpPut": TokenType.ANNOTATION.NAME,
}

let namespacesMetadata;
let systemNamespace;
let sObjects;
let userClasses;

class Lexer {

    static tokenize(content) {
        namespacesMetadata = ApplicationContext.namespacesMetadata;
        sObjects = ApplicationContext.sObjects;
        systemNamespace = namespacesMetadata['system'];
        userClasses = ApplicationContext.userClasses;
        const NUM_FORMAT = /[0-9]/;
        const ID_FORMAT = /([a-zA-Z0-9À-ÿ]|_|–)/;
        content = StrUtils.replace(content, '\r\n', '\n');
        let tokens = [];
        let lineNumber = 0;
        let column = 0;
        let onCommentBlock = false;
        let onCommentLine = false;
        let onText = false;
        let onQuery = false;
        let onAnnotation = false;
        let sqBracketIndent = 0;
        let aBracketsIndex = [];
        let sqBracketIndex = [];
        let parentIndex = [];
        let bracketIndex = [];
        let auxBracketIndex = [];
        for (let charIndex = 0, len = content.length; charIndex < len; charIndex++) {
            let fourChars = content.substring(charIndex, charIndex + 4);
            let threeChars = content.substring(charIndex, charIndex + 3);
            let twoChars = content.substring(charIndex, charIndex + 2);
            let char = content.charAt(charIndex);
            let token;
            let lastToken = (tokens.length > 0) ? tokens[tokens.length - 1] : undefined;
            let twoLastToken = (tokens.length > 1) ? tokens[tokens.length - 2] : undefined;
            if (fourChars.length === 4 && symbolTokens[fourChars] && aBracketsIndex.length === 0) {
                token = new Token(symbolTokens[fourChars], fourChars, lineNumber, column);
                charIndex += 3;
                column += 3;
            } else if (threeChars.length === 3 && symbolTokens[threeChars] && aBracketsIndex.length === 0) {
                if (aBracketsIndex.length === 0) {
                    token = new Token(symbolTokens[threeChars], threeChars, lineNumber, column);
                    charIndex += 2;
                    column += 2;
                }
            } else if (twoChars.length === 2 && symbolTokens[twoChars]) {
                if (isLogicalOperator(symbolTokens[twoChars])) {
                    aBracketsIndex = [];
                }
                if (aBracketsIndex.length === 0) {
                    token = new Token(symbolTokens[twoChars], twoChars, lineNumber, column);
                    charIndex += 1;
                    column += 1;
                } else if (symbolTokens[char]) {
                    token = new Token(symbolTokens[char], char, lineNumber, column);
                }
            } else if (symbolTokens[char]) {
                token = new Token(symbolTokens[char], char, lineNumber, column);
            } else if (NUM_FORMAT.test(char)) {
                var numContent = '';
                while (NUM_FORMAT.test(char) || char === '.' || char === ':' || char === '+' || char === '-' || char.toLowerCase() === 't' || char.toLowerCase() === 'z') {
                    numContent += char;
                    char = content.charAt(++charIndex);
                }
                if (numContent.indexOf(':') !== -1 && numContent.indexOf('-') !== -1)
                    token = new Token(TokenType.LITERAL.DATETIME, numContent, lineNumber, column);
                else if (numContent.indexOf('-') !== -1)
                    token = new Token(TokenType.LITERAL.DATE, numContent, lineNumber, column);
                else if (numContent.indexOf(':') !== -1)
                    token = new Token(TokenType.LITERAL.TIME, numContent, lineNumber, column);
                else if (numContent.indexOf('.') !== -1) {
                    token = new Token(TokenType.LITERAL.DOUBLE, numContent, lineNumber, column);
                }
                else {
                    token = new Token(TokenType.LITERAL.INTEGER, numContent, lineNumber, column);
                }
                charIndex--;
                column += numContent.length - 1;
            } else if (ID_FORMAT.test(char)) {
                var idContent = '';
                while (ID_FORMAT.test(char)) {
                    idContent += char;
                    char = content.charAt(++charIndex);
                }
                charIndex--;
                token = new Token(TokenType.IDENTIFIER, idContent, lineNumber, column);
                column += idContent.length - 1;
            } else if (char === "\n") {
                if (onCommentLine)
                    onCommentLine = false;
                lineNumber++;
                column = 0;
            } else if (char !== "\t" && char !== " " && char.trim().length != 0) {
                token = new Token(TokenType.UNKNOWN, char, lineNumber, column);
            } else if (char === "\t") {
                column += 3;
            }
            if (token !== undefined) {
                if (!onText && !onCommentBlock && !onCommentLine && token.type === TokenType.PUNCTUATION.QUOTTES && (!lastToken || lastToken.text !== '\\')) {
                    token.type = TokenType.PUNCTUATION.QUOTTES_START;
                    onText = true;
                } else if (onText && token.type === TokenType.PUNCTUATION.QUOTTES && (!lastToken || lastToken.text !== '\\')) {
                    token.type = TokenType.PUNCTUATION.QUOTTES_END;
                    onText = false;
                } else if (!onText && !onCommentBlock && !onCommentLine && token.type === TokenType.COMMENT.BLOCK_START) {
                    onCommentBlock = true;
                } else if (onCommentBlock && token.type === TokenType.COMMENT.BLOCK_END) {
                    onCommentBlock = false;
                } else if (!onCommentLine && (token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC)) {
                    onCommentLine = true;
                } else if (onText) {
                    token.type = TokenType.LITERAL.STRING;
                } else if (onCommentBlock || onCommentLine) {
                    token.type = TokenType.COMMENT.CONTENT;
                } else if (lastToken && (isOperator(lastToken) || isBracket(lastToken)) && token.type === TokenType.OPERATOR.ARITHMETIC.ADD) {
                    token.type = TokenType.OPERATOR.ARITHMETIC.ADD_UNARY;
                } else if (lastToken && (isOperator(lastToken) || isBracket(lastToken)) && token.type === TokenType.OPERATOR.ARITHMETIC.SUBSTRACT) {
                    token.type = TokenType.OPERATOR.ARITHMETIC.SUBSTRACT_UNARY;
                } else if (onAnnotation && token.type !== TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                    token.type = TokenType.ANNOTATION.CONTENT;
                } else if (token.type === TokenType.OPERATOR.LOGICAL.LESS_THAN) {
                    aBracketsIndex.push(tokens.length);
                } else if (token.type === TokenType.OPERATOR.LOGICAL.GREATER_THAN) {
                    if (aBracketsIndex.length > 0) {
                        let index = aBracketsIndex.pop();
                        if (tokens[index] && tokens[index].type === TokenType.OPERATOR.LOGICAL.LESS_THAN) {
                            tokens[index].type = TokenType.BRACKET.PARAMETRIZED_TYPE_OPEN;
                            token.type = TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE;
                        }
                    }
                } else if (token.type === TokenType.BRACKET.CURLY_OPEN) {
                    if (lastToken && (lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && bracketIndex.length > 0) {
                        token.type = TokenType.BRACKET.INIT_VALUES_OPEN;
                    } else if (lastToken && lastToken.type === TokenType.KEYWORD.MODIFIER.STATIC) {
                        tokens[tokens.length - 1].type = TokenType.KEYWORD.DECLARATION.STATIC_CONSTRUCTOR;
                    } else if (lastToken && lastToken.textToLower === 'get') {
                        tokens[tokens.length - 1].type = TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER;
                    } else if (lastToken && lastToken.textToLower === 'set') {
                        tokens[tokens.length - 1].type = TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER;
                    } else if (lastToken && lastToken.type === TokenType.DECLARATION.ENTITY.VARIABLE) {
                        tokens[tokens.length - 1].type = TokenType.DECLARATION.ENTITY.PROPERTY;
                    }
                    if (lastToken && (lastToken.type === TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.TRY || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.FINALLY || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.DO)) {
                        token.setParentToken(lastToken);
                    }
                    bracketIndex.push(tokens.length);
                } else if (token.type === TokenType.BRACKET.CURLY_CLOSE) {
                    if (bracketIndex.length > 0) {
                        let index = bracketIndex.pop();
                        if (tokens[index] && tokens[index].type === TokenType.BRACKET.INIT_VALUES_OPEN) {
                            token.type = TokenType.BRACKET.INIT_VALUES_CLOSE;
                        }
                        if (tokens[index].getParentToken())
                            token.setParentToken(tokens[index]);
                    }

                } else if (token.type === TokenType.OPERATOR.ASSIGN.ASSIGN && onQuery) {
                    token.type = TokenType.OPERATOR.LOGICAL.EQUALITY;
                } else if (token.type === TokenType.BRACKET.SQUARE_OPEN) {
                    sqBracketIndent++;
                } else if (token.type === TokenType.BRACKET.SQUARE_CLOSE) {
                    sqBracketIndent--;
                    if (sqBracketIndent === 0 && onQuery) {
                        onQuery = false;
                        token.type = TokenType.BRACKET.QUERY_END;
                    }
                } else if (token.type === TokenType.PUNCTUATION.SEMICOLON) {
                    if (lastToken && lastToken.textToLower === 'get') {
                        tokens[tokens.length - 1].type = TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER;
                    } else if (lastToken && lastToken.textToLower === 'set') {
                        tokens[tokens.length - 1].type = TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER;
                    }
                } else if (token.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR) {
                    if (lastToken && lastToken.type === TokenType.KEYWORD.DECLARATION.TRIGGER)
                        tokens[tokens.length - 1].type = TokenType.DATATYPE.SUPPORT_CLASS;
                } else if (token.type === TokenType.IDENTIFIER) {
                    if (reservedKeywords[token.textToLower] && reservedKeywords[token.textToLower] !== TokenType.KEYWORD.FOR_FUTURE && (!lastToken || (lastToken && lastToken.type !== TokenType.PUNCTUATION.OBJECT_ACCESSOR))) {
                        if (!onQuery || (onQuery && lastToken.type !== TokenType.QUERY.VALUE_BIND)){
                            if(lastToken && isDatatypeToken(lastToken)){
                                token.type = TokenType.DECLARATION.ENTITY.VARIABLE
                            } else {
                                token.type = reservedKeywords[token.textToLower];
                            }
                        }
                        if (token.type === TokenType.KEYWORD.FLOW_CONTROL.IF && lastToken && lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE) {
                            token = new Token(TokenType.KEYWORD.FLOW_CONTROL.ELSE_IF, lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                            tokens.pop();
                            lastToken = tokens[tokens.length - 1];
                        }
                    }
                    if (!onQuery && !onAnnotation && lastToken && lastToken.type === TokenType.PUNCTUATION.AT && annotations[token.textToLower]) {
                        token = new Token(TokenType.ANNOTATION.ENTITY, lastToken.text + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (!onQuery && (token.type === TokenType.QUERY.CLAUSE.SELECT || token.type === TokenType.QUERY.CLAUSE.FIND) && lastToken.type === TokenType.BRACKET.SQUARE_OPEN && sqBracketIndent === 1) {
                        onQuery = true;
                        tokens[tokens.length - 1].type = TokenType.BRACKET.QUERY_START;
                    } else if (onQuery && soqlFunctions[token.textToLower] && lastToken && lastToken.type !== TokenType.QUERY.VALUE_BIND && lastToken.type !== TokenType.PUNCTUATION.OBJECT_ACCESSOR) {
                        token.type = soqlFunctions[token.textToLower];
                    } else if (onQuery && soqlOperators[token.textToLower] && lastToken && lastToken.type !== TokenType.QUERY.VALUE_BIND && lastToken.type !== TokenType.PUNCTUATION.OBJECT_ACCESSOR) {
                        token.type = soqlOperators[token.textToLower];
                    } else if (onQuery && queryClauses[token.textToLower] && lastToken && lastToken.type !== TokenType.QUERY.VALUE_BIND && lastToken.type !== TokenType.PUNCTUATION.OBJECT_ACCESSOR) {
                        token.type = queryClauses[token.textToLower];
                    } else if (onQuery && token.textToLower === 'scope' && lastToken && lastToken.textToLower === 'using') {
                        token = new Token(queryClauses['using scope'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'by' && lastToken && lastToken.textToLower === 'order') {
                        token = new Token(queryClauses['order by'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'by' && lastToken && lastToken.textToLower === 'group') {
                        token = new Token(queryClauses['group by'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'cube' && lastToken && lastToken.type === TokenType.QUERY.CLAUSE.GROUP_BY) {
                        token = new Token(soqlFunctions['group by cube'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'rollup' && lastToken && lastToken.type === TokenType.QUERY.CLAUSE.GROUP_BY) {
                        token = new Token(soqlFunctions['group by rollup'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'category' && lastToken && lastToken.textToLower === 'data') {
                        token = new Token(soqlFunctions['data category'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'update' && lastToken && lastToken.textToLower === 'tracking') {
                        token = new Token(soqlFunctions['update tracking'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'update' && lastToken && lastToken.textToLower === 'tracking') {
                        token = new Token(soqlFunctions['update viewstat'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (onQuery && token.textToLower === 'listview' && lastToken && lastToken.textToLower === 'using') {
                        token = new Token(soqlFunctions['using listview'], lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (token.textToLower === 'sharing' && lastToken && (lastToken.textToLower === 'with' || lastToken.textToLower === 'without' || lastToken.textToLower === 'inherited')) {
                        token = new Token(TokenType.KEYWORD.MODIFIER.SHARING, lastToken.text + ' ' + token.text, lastToken.line, lastToken.startIndex);
                        tokens.pop();
                        lastToken = tokens[tokens.length - 1];
                    } else if (lastToken && lastToken.type === TokenType.LITERAL.DATE_PARAMETRIZED_START_PARAM) {
                        token.type = TokenType.LITERAL.DATE_PARAMETRIZED_PARAM_VARIABLE;
                    } else if (primitiveDatatypes[token.textToLower]) {
                        if (!onQuery) {
                            token.type = primitiveDatatypes[token.textToLower];
                            if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE || lastToken.type === TokenType.ENTITY.ENUM_VALUE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                                token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                        }
                        else
                            token.type = TokenType.ENTITY.SOBJECT_PROJECTION_FIELD;
                    } else if (collectionsDatatypes[token.textToLower]) {
                        token.type = collectionsDatatypes[token.textToLower];
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (dateLiterals[token.textToLower]) {
                        token.type = dateLiterals[token.textToLower];
                    } else if (sObjects && sObjects[token.textToLower] && (token.textToLower !== 'name')) {
                        token.type = TokenType.DATATYPE.SOBJECT;
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.ENTITY.VARIABLE || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (lastToken && lastToken.type === TokenType.KEYWORD.DECLARATION.CLASS) {
                        token.type = TokenType.DECLARATION.ENTITY.CLASS;
                    } else if (lastToken && lastToken.type === TokenType.KEYWORD.DECLARATION.ENUM) {
                        token.type = TokenType.DECLARATION.ENTITY.ENUM;
                    } else if (lastToken && lastToken.type === TokenType.KEYWORD.DECLARATION.INTERFACE) {
                        token.type = TokenType.DECLARATION.ENTITY.INTERFACE;
                    } else if (userClasses && userClasses[token.textToLower]) {
                        token.type = TokenType.DATATYPE.CUSTOM_CLASS;
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (token.textToLower === 'system') {
                        token.type = TokenType.DATATYPE.SUPPORT_CLASS;
                        if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.DATATYPE.SUPPORT_CLASS) {
                            tokens[tokens.length - 2].type = TokenType.DATATYPE.SUPPORT_NAMESPACE;
                        }
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (systemNamespace && systemNamespace[token.textToLower]) {
                        token.type = TokenType.DATATYPE.SUPPORT_CLASS;
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (namespacesMetadata[token.textToLower] && token.textToLower !== 'system') {
                        token.type = TokenType.DATATYPE.SUPPORT_NAMESPACE;
                        if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE))
                            token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && namespacesMetadata[twoLastToken.textToLower] && namespacesMetadata[twoLastToken.textToLower][token.textToLower] && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.DATATYPE.SUPPORT_CLASS;
                        tokens[tokens.length - 2].type = TokenType.DATATYPE.SUPPORT_NAMESPACE;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.DATATYPE.SUPPORT_CLASS && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.SUPPORT_CLASS_MEMBER;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.DATATYPE.SOBJECT && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.SOBJECT_FIELD;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.ENTITY.SOBJECT_FIELD && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.SOBJECT_FIELD;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.ENTITY.SOBJECT_PROJECTION_FIELD && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.SOBJECT_PROJECTION_FIELD;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.DATATYPE.CUSTOM_CLASS && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.CLASS_MEMBER;
                    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type === TokenType.ENTITY.CLASS_MEMBER && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.ENTITY.CLASS_MEMBER;
                    } else if (lastToken && (isDatatypeToken(lastToken) || lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE || lastToken.type === TokenType.BRACKET.SQUARE_CLOSE) && (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE)) {
                        token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                    } else if (onQuery && isQueryField(token, lastToken, twoLastToken) && !reservedKeywords[token.textToLower]) {
                        if (lastToken.type === TokenType.ENTITY.SOBJECT_PROJECTION_FIELD)
                            token.type = TokenType.ENTITY.ALIAS_FIELD;
                        else
                            token.type = TokenType.ENTITY.SOBJECT_PROJECTION_FIELD
                    } else if (token.type === TokenType.DATABASE.TRIGGER_EXEC && lastToken && lastToken.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                        tokens[tokens.length - 1].type = TokenType.BRACKET.TRIGGER_GUARD_OPEN;
                    } else if (!reservedKeywords[token.textToLower] || reservedKeywords[token.textToLower] === TokenType.KEYWORD.FOR_FUTURE) {
                        if (lastToken && lastToken.type === TokenType.QUERY.CLAUSE.USING_SCOPE)
                            token.type = TokenType.QUERY.SCOPE_VALUE;
                        else if (lastToken && lastToken.type === TokenType.QUERY.CLAUSE.NULLS)
                            token.type = TokenType.QUERY.NULLS_VALUE;
                        else {
                            if (lastToken && lastToken.type === TokenType.ENTITY.CLASS_MEMBER)
                                tokens[tokens.length - 1].type = TokenType.DATATYPE.CUSTOM_CLASS;
                            if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && isDatatypeToken(twoLastToken)) {
                                token.type = TokenType.ENTITY.CLASS_MEMBER;
                            } else if (token.type !== TokenType.KEYWORD.FLOW_CONTROL.ELSE_IF) {
                                token.type = TokenType.ENTITY.VARIABLE;
                                if (lastToken && (lastToken.type === TokenType.ENTITY.VARIABLE || lastToken.type === TokenType.ENTITY.ENUM_VALUE)) {
                                    token.type = TokenType.DECLARATION.ENTITY.VARIABLE;
                                    tokens[tokens.length - 1].type = TokenType.DATATYPE.CUSTOM_CLASS;
                                } else if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_OPEN) {
                                    token.type = TokenType.ENTITY.ENUM_VALUE;
                                } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.COMMA && twoLastToken && twoLastToken.type === TokenType.ENTITY.ENUM_VALUE) {
                                    token.type = TokenType.ENTITY.ENUM_VALUE;
                                } else if (lastToken && isCommentToken(lastToken)) {
                                    let previousToken = getPreviousTokenFromComment(tokens, tokens.length - 1);
                                    if (previousToken.type === TokenType.ENTITY.ENUM_VALUE)
                                        token.type = TokenType.ENTITY.ENUM_VALUE;
                                }
                            }
                        }
                    }
                } else if (lastToken && lastToken.type === TokenType.LITERAL.INTEGER && token.textToLower === 'l') {
                    tokens[tokens.length - 1].type = TokenType.LITERAL.LONG;
                    token.type = TokenType.LITERAL.LONG_INDICATOR;
                } else if (lastToken && lastToken.type === TokenType.LITERAL.DOUBLE && token.textToLower === 'd') {
                    tokens[tokens.length - 1].type = TokenType.LITERAL.DOUBLE;
                    token.type = TokenType.LITERAL.DOUBLE_INDICATOR;
                } else {
                    if (token.type !== TokenType.PUNCTUATION.COMMA && !isDatatypeToken(token)) {
                        if (aBracketsIndex.length > 0)
                            aBracketsIndex = [];
                    }
                    if (lastToken && lastToken.type === TokenType.LITERAL.DATE_PARAMETRIZED && token.type === TokenType.PUNCTUATION.COLON) {
                        token.type = TokenType.LITERAL.DATE_PARAMETRIZED_START_PARAM;
                    } else if (onQuery && token.type === TokenType.PUNCTUATION.COLON) {
                        token.type = TokenType.QUERY.VALUE_BIND;
                    } else if (token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                        if (lastToken && lastToken.type === TokenType.ANNOTATION.ENTITY) {
                            token.type = TokenType.BRACKET.ANNOTATION_PARAM_OPEN;
                            onAnnotation = true;
                        } else if (lastToken && lastToken.type === TokenType.ENTITY.SUPPORT_CLASS_MEMBER) {
                            tokens[tokens.length - 1].type = TokenType.ENTITY.SUPPORT_CLASS_FUNCTION;
                            token.type = TokenType.BRACKET.PARENTHESIS_PARAM_OPEN;
                        } else if (lastToken && lastToken.type === TokenType.DECLARATION.ENTITY.VARIABLE) {
                            tokens[tokens.length - 1].type = TokenType.DECLARATION.ENTITY.FUNCTION;
                            token.type = TokenType.BRACKET.PARENTHESIS_PARAM_OPEN;
                        } else if (lastToken && lastToken.type === TokenType.ENTITY.CLASS_MEMBER) {
                            tokens[tokens.length - 1].type = TokenType.ENTITY.CLASS_FUNCTION;
                            token.type = TokenType.BRACKET.PARENTHESIS_PARAM_OPEN;
                        } else if (lastToken && lastToken.type === TokenType.ENTITY.VARIABLE) {
                            tokens[tokens.length - 1].type = TokenType.ENTITY.FUNCTION;
                            token.type = TokenType.BRACKET.PARENTHESIS_PARAM_OPEN;
                        } else if (lastToken && lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE) {
                            tokens[tokens.length - 1].type = TokenType.ENTITY.FUNCTION;
                            token.type = TokenType.BRACKET.PARENTHESIS_PARAM_OPEN;
                        } else if (lastToken && (lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.IF || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE_IF || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.CATCH || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.WHILE || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.FOR)) {
                            token.type = TokenType.BRACKET.PARENTHESIS_GUARD_OPEN;
                            token.setParentToken(lastToken);
                        }
                        parentIndex.push(tokens.length);
                    } else if (token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                        if (parentIndex.length > 0) {
                            let index = parentIndex.pop();
                            if (tokens[index] && tokens[index].type === TokenType.BRACKET.PARENTHESIS_PARAM_OPEN) {
                                token.type = TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE;
                            } else if (tokens[index] && tokens[index].type === TokenType.BRACKET.ANNOTATION_PARAM_OPEN) {
                                onAnnotation = false;
                                token.type = TokenType.BRACKET.ANNOTATION_PARAM_CLOSE;
                            } else if (tokens[index] && tokens[index].type === TokenType.BRACKET.PARENTHESIS_GUARD_OPEN) {
                                token.type = TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE;
                                token.setParentToken(tokens[index]);
                            } else if (tokens[index] && tokens[index].type === TokenType.BRACKET.TRIGGER_GUARD_OPEN) {
                                token.type = TokenType.BRACKET.TRIGGER_GUARD_CLOSE;
                            }
                        }
                    }
                }
                if (lastToken && (lastToken.type === TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE || lastToken.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE)) {
                    if (token.type !== TokenType.BRACKET.CURLY_OPEN && token.type !== TokenType.PUNCTUATION.SEMICOLON) {
                        let newToken = new Token(TokenType.BRACKET.CURLY_OPEN, '{', 0, 0);
                        newToken.setAux(true);
                        auxBracketIndex.push(tokens.length);
                        tokens.push(newToken);
                    }
                } else if (token.type === TokenType.BRACKET.CURLY_CLOSE && !token.isAux() && auxBracketIndex.length > 0) {
                    for (const index of auxBracketIndex) {
                        let newToken = new Token(TokenType.BRACKET.CURLY_CLOSE, '}', 0, 0);
                        newToken.setAux(true);
                        tokens.push(newToken);
                    }
                    auxBracketIndex = [];
                }
                tokens.push(token);
                if ((token.type === TokenType.PUNCTUATION.SEMICOLON) && auxBracketIndex.length > 0) {
                    let newToken = new Token(TokenType.BRACKET.CURLY_CLOSE, '}', 0, 0);
                    newToken.setAux(true);
                    tokens.push(newToken);
                    let bracketIndex = auxBracketIndex.pop();
                    let tokentmp = tokens[bracketIndex - 1];
                    if (tokentmp.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE && auxBracketIndex.length > 0) {
                        newToken = new Token(TokenType.BRACKET.CURLY_CLOSE, '}', 0, 0);
                        newToken.setAux(true);
                        tokens.push(newToken);
                        auxBracketIndex.pop();
                    }
                }
            }
            column++;
        }
        return tokens;
    }
}
module.exports = Lexer;

function isOperator(token) {
    switch (token.type) {
        case TokenType.OPERATOR.ARITHMETIC.ADD:
        case TokenType.OPERATOR.ARITHMETIC.ADD_ASSIGN:
        case TokenType.OPERATOR.ARITHMETIC.DIVIDE:
        case TokenType.OPERATOR.ARITHMETIC.DIVIDE_ASSIGN:
        case TokenType.OPERATOR.ARITHMETIC.MULTIPLY:
        case TokenType.OPERATOR.ARITHMETIC.MULTIPLY_ASSIGN:
        case TokenType.OPERATOR.ARITHMETIC.SUBSTRACT:
        case TokenType.OPERATOR.ARITHMETIC.SUBSTRACT_ASSIGN:
        case TokenType.OPERATOR.ASSIGN.ASSIGN:
        case TokenType.OPERATOR.ASSIGN.MAP_KEY_VALUE:
        case TokenType.OPERATOR.BITWISE.AND:
        case TokenType.OPERATOR.BITWISE.EXCLUSIVE_OR:
        case TokenType.OPERATOR.BITWISE.EXCLUSIVE_OR_ASSIGN:
        case TokenType.OPERATOR.BITWISE.LEFT_ASSIGN:
        case TokenType.OPERATOR.BITWISE.OR:
        case TokenType.OPERATOR.BITWISE.SIGNED_LEFT:
        case TokenType.OPERATOR.BITWISE.SIGNED_RIGHT:
        case TokenType.OPERATOR.BITWISE.SIGNED_RIGTH_ASSIGN:
        case TokenType.OPERATOR.BITWISE.UNSIGNED_RIGHT:
        case TokenType.OPERATOR.BITWISE.UNSIGNED_RIGHT_ASSIGN:
        case TokenType.OPERATOR.LOGICAL.AND:
        case TokenType.OPERATOR.LOGICAL.AND_ASSIGN:
        case TokenType.OPERATOR.LOGICAL.EQUALITY:
        case TokenType.OPERATOR.LOGICAL.EQUALITY_EXACT:
        case TokenType.OPERATOR.LOGICAL.GREATER_THAN:
        case TokenType.OPERATOR.LOGICAL.GREATER_THAN_EQUALS:
        case TokenType.OPERATOR.LOGICAL.INEQUALITY:
        case TokenType.OPERATOR.LOGICAL.INEQUALITY_EXACT:
        case TokenType.OPERATOR.LOGICAL.LESS_THAN:
        case TokenType.OPERATOR.LOGICAL.LESS_THAN_EQUALS:
        case TokenType.OPERATOR.LOGICAL.OR:
        case TokenType.OPERATOR.LOGICAL.OR_ASSIGN:
        case TokenType.PUNCTUATION.EXMARK:
        case TokenType.PUNCTUATION.COLON:
        case TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE:
        case TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN:
            return true;
        default:
            return false;
    }
}

function isBracket(token) {
    switch (token.type) {
        case TokenType.BRACKET.ANNOTATION_PARAM_CLOSE:
        case TokenType.BRACKET.ANNOTATION_PARAM_OPEN:
        case TokenType.BRACKET.CURLY_CLOSE:
        case TokenType.BRACKET.CURLY_OPEN:
        case TokenType.BRACKET.INIT_VALUES_CLOSE:
        case TokenType.BRACKET.INIT_VALUES_OPEN:
        case TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE:
        case TokenType.BRACKET.PARAMETRIZED_TYPE_OPEN:
        case TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE:
        case TokenType.BRACKET.PARENTHESIS_GUARD_OPEN:
        case TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE:
        case TokenType.BRACKET.PARENTHESIS_PARAM_OPEN:
        case TokenType.BRACKET.QUERY_END:
        case TokenType.BRACKET.QUERY_START:
        case TokenType.BRACKET.SQUARE_CLOSE:
        case TokenType.BRACKET.SQUARE_OPEN:
        case TokenType.BRACKET.TRIGGER_GUARD_CLOSE:
        case TokenType.BRACKET.TRIGGER_GUARD_OPEN:
            return true;
        default:
            return false;
    }
}

function isLogicalOperator(symbol) {
    return symbol === TokenType.OPERATOR.LOGICAL.INEQUALITY || symbol === TokenType.OPERATOR.LOGICAL.EQUALITY || symbol === TokenType.OPERATOR.LOGICAL.OR || symbol === TokenType.OPERATOR.LOGICAL.OR_ASSIGN || symbol === TokenType.OPERATOR.LOGICAL.AND || symbol === TokenType.OPERATOR.LOGICAL.AND_ASSIGN;
}

function isDatatypeToken(token) {
    return token.type === TokenType.DATATYPE.SUPPORT_CLASS || token.type === TokenType.DATATYPE.SUPPORT_NAMESPACE || token.type === TokenType.DATATYPE.CUSTOM_CLASS || token.type === TokenType.DATATYPE.PRIMITIVE || token.type === TokenType.DATATYPE.COLLECTION || token.type === TokenType.DATATYPE.SOBJECT || token.type === TokenType.ENTITY.CLASS_MEMBER || token.type === TokenType.ENTITY.SUPPORT_CLASS_MEMBER;
}

function isCommentToken(token) {
    return token.type === TokenType.COMMENT.CONTENT || token.type === TokenType.COMMENT.BLOCK_START || token.type === TokenType.COMMENT.BLOCK_END || token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC;
}

function getPreviousTokenFromComment(tokens, index) {
    let token = tokens[index];
    while (isCommentToken(token) || token.type === TokenType.PUNCTUATION.COMMA) {
        token = tokens[index];
        index--;
    }
    return token;
}

function isQueryField(token, lastToken, twoLastToken) {
    let isQueryField = true;
    if (lastToken && lastToken.type === TokenType.QUERY.VALUE_BIND) {
        isQueryField = false;
    } else if (lastToken && lastToken.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR && twoLastToken && twoLastToken.type !== TokenType.ENTITY.SOBJECT_FIELD) {
        isQueryField = false;
    } else if (lastToken && lastToken.type === TokenType.QUERY.CLAUSE.USING_SCOPE) {
        isQueryField = false;
    }
    return isQueryField;
}