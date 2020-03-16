const tokenizer = require('./lexer');
const TokenType = require('./tokenTypes');
const fileSystem = require('../../fileSystem');
const langUtils = require('../utils').Utils;
const Config = require('../../main/config');
const applicationContext = require('../../main/applicationContext');
const StrUtils = require('../../utils/strUtils');
const FileReader = fileSystem.FileReader;

class Formatter { 

    static formatFile(path) { 
        let tokens = tokenizer.tokenize(FileReader.readFileSync(path));
        return formatApex(tokens);
    }

    static formatDocument(document) {
        let tokens = tokenizer.tokenize(FileReader.readDocument(document));
        return formatApex(tokens);
    }
}
module.exports = Formatter;

function formatApex(tokens) { 
    let index = 0;
    let indent = 0;
    let indentOffset = 0;
    let lines = [];
    let line = [];
    let beforeWhitespaces = 0;
    let afterWhitespaces = 0;
    let guardOpen = false;
    let mainBodyIndent = 0;
    let queryOpenIndex = 0;
    let querySelectIndex = 0;
    while (index < tokens.length) {
        let token = tokens[index];
        let lastToken = langUtils.getLastToken(tokens, index);
        let twoLastToken = langUtils.getTwoLastToken(tokens, index);
        let nextToken = langUtils.getNextToken(tokens, index);
        let newLines = 0;
        let originalNewLines = (lastToken) ? lastToken.line - token.line : 0;
        if (token.type === TokenType.BRACKET.CURLY_OPEN) {
            indent++;
        } else if (token.type === TokenType.BRACKET.CURLY_CLOSE) {
            if (mainBodyIndent === indent)
                mainBodyIndent--;
            indent--;
        } else if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_OPEN) {
            guardOpen = true;
        } else if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE) {
            guardOpen = false;
        }
        if (lastToken && lastToken.type === TokenType.BRACKET.QUERY_START) {
            queryOpenIndex = StrUtils.replace(line.join(''), '\t', '    ').length - (indent * 4);
        }
        if (lastToken && lastToken.type === TokenType.QUERY.CLAUSE.SELECT) {
            querySelectIndex = StrUtils.replace(line.join(''), '\t', '    ').length - (indent * 4);
        }

        if (token.type === TokenType.KEYWORD.DECLARATION.CLASS || token.type === TokenType.KEYWORD.DECLARATION.ENUM || token.type === TokenType.KEYWORD.DECLARATION.INTERFACE)
            mainBodyIndent = indent + 1;

        if (lastToken && isAnnotationToken(lastToken) && !isAnnotationToken(token))
            newLines = 1;
        if (isCommentToken(token) && nextToken && isCommentToken(nextToken) && isOnSameLine(token, nextToken))
            afterWhitespaces = nextToken.startIndex - token.endIndex;
        if (isCommentToken(token) && lastToken && isCommentToken(lastToken) && !isOnSameLine(token, lastToken))
            newLines = (lastToken) ? token.line - lastToken.line : 0;
        if (lastToken && isCommentToken(lastToken) && !isCommentToken(token) && !isOnSameLine(token, lastToken))
            newLines = 1;
        if (lastToken && !isCommentToken(lastToken) && isCommentToken(token) && isOnSameLine(token, lastToken) && Config.getConfig().apexFormat.comment.holdBeforeWhitespacesOnLineComment)
            beforeWhitespaces = token.startIndex - lastToken.endIndex;
        if (lastToken && isCommentToken(lastToken) && !isCommentToken(token) && isOnSameLine(token, lastToken) && Config.getConfig().apexFormat.comment.holdAfterWhitespacesOnLineComment)
            afterWhitespaces = token.startIndex - lastToken.endIndex;
        if (isStringToken(token) && nextToken && isStringToken(nextToken) && isOnSameLine(token, nextToken))
            afterWhitespaces = nextToken.startIndex - token.endIndex;
        if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_OPEN)
            newLines = 1;
        if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_CLOSE)
            newLines = 1;
        if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_CLOSE && lastToken.isAux() && token.type === TokenType.BRACKET.CURLY_CLOSE && token.isAux())
            newLines = 0;
        else if (token.type === TokenType.BRACKET.CURLY_CLOSE && !token.isAux())
            newLines = 1;
        if (!token.isAux() && token.type === TokenType.BRACKET.CURLY_OPEN && Config.getConfig().apexFormat.punctuation.addWhitespaceBeforeOpenCurlyBracket && !Config.getConfig().apexFormat.punctuation.openCurlyBracketOnNewLine)
            beforeWhitespaces = 1;
        if (!token.isAux() && token.type === TokenType.BRACKET.CURLY_OPEN && Config.getConfig().apexFormat.punctuation.openCurlyBracketOnNewLine) {
            newLines = 1;
            indentOffset = -1;
        }
        if (lastToken && lastToken.type === TokenType.PUNCTUATION.SEMICOLON && !guardOpen && token.type !== TokenType.BRACKET.CURLY_CLOSE)
            newLines = 1;
        if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_CLOSE && lastToken.getParentToken() && Config.getConfig().apexFormat.punctuation.addNewLineAfterCloseCurlyBracket)
            newLines = 1;
        else if (lastToken && lastToken.type === TokenType.BRACKET.CURLY_CLOSE && lastToken.getParentToken() && !Config.getConfig().apexFormat.punctuation.addNewLineAfterCloseCurlyBracket && isDependentFlowStructure(token)) {
            newLines = 0;
            if (Config.getConfig().apexFormat.punctuation.addWhitespaceAfterCloseCurlyBracket)
                beforeWhitespaces = 1;
        }
        if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_OPEN && Config.getConfig().apexFormat.punctuation.addWhitespaceBeforeOpenGuardParenthesis)
            beforeWhitespaces = 1;
        if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE && Config.getConfig().apexFormat.punctuation.addWhitespaceBeforeCloseGuardParenthesis)
            beforeWhitespaces = 1;
        if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_OPEN && Config.getConfig().apexFormat.punctuation.addWhitespaceAfterOpenGuardParenthesis)
            afterWhitespaces = 1;
        if (token.type === TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE && Config.getConfig().apexFormat.punctuation.addWhitespaceBeforeCloseGuardParenthesis)
            beforeWhitespaces = 1;
        if (token.type === TokenType.BRACKET.TRIGGER_GUARD_OPEN && Config.getConfig().apexFormat.punctuation.addWhitespaceBeforeOpenTriggerEvents)
            beforeWhitespaces = 1;
        if ((isOperator(token) || (token.type === TokenType.ANNOTATION.CONTENT && token.text === '=')) && Config.getConfig().apexFormat.operator.addWhitespaceBeforeOperator)
            beforeWhitespaces = 1;
        if ((isOperator(token) || (token.type === TokenType.ANNOTATION.CONTENT && token.text === '=')) && Config.getConfig().apexFormat.operator.addWhitespaceAfterOperator)
            afterWhitespaces = 1;
        if (token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_OPEN && Config.getConfig().apexFormat.operator.addWhitespaceAfterOpenParenthesisOperator)
            afterWhitespaces = 1;
        if (token.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE && Config.getConfig().apexFormat.operator.addWhitespaceBeforeCloseParenthesisOperator)
            beforeWhitespaces = 1;
        if (token.type === TokenType.PUNCTUATION.COMMA && Config.getConfig().apexFormat.punctuation.addWhiteSpaceAfterComma)
            afterWhitespaces = 1;
        if (mainBodyIndent === indent && lastToken && ((lastToken.type === TokenType.BRACKET.CURLY_CLOSE && !lastToken.isAux() && (!lastToken.getParentToken() || !lastToken.getParentToken().getParentToken())) || (lastToken.type === TokenType.PUNCTUATION.SEMICOLON && twoLastToken && twoLastToken.type === TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE)) && Config.getConfig().apexFormat.classMembers.newLinesBetweenCodeBlockMembers > 0 && token.type !== TokenType.BRACKET.CURLY_CLOSE && token.type !== TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER && token.type !== TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER)
            newLines = Config.getConfig().apexFormat.classMembers.newLinesBetweenCodeBlockMembers + 1;
        if (lastToken && (lastToken.type === TokenType.BRACKET.CURLY_CLOSE || lastToken.type === TokenType.PUNCTUATION.SEMICOLON) && !lastToken.isAux() && (token.type === TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER || token.type === TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER) && Config.getConfig().apexFormat.classMembers.newLinesBetweenGetterAndSetterAccessor > 0)
            newLines = Config.getConfig().apexFormat.classMembers.newLinesBetweenGetterAndSetterAccessor + 1;
        if (isKeyword(token) && nextToken && nextToken.type !== TokenType.BRACKET.CURLY_OPEN && nextToken.type !== TokenType.PUNCTUATION.COMMA && nextToken.type !== TokenType.BRACKET.TRIGGER_GUARD_CLOSE && nextToken.type !== TokenType.PUNCTUATION.SEMICOLON) {
            afterWhitespaces = 1;
            if (lastToken && lastToken.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE)
                beforeWhitespaces = 1;
        }
        if (isMemberDeclaration(token) && lastToken && lastToken.type !== TokenType.PUNCTUATION.COMMA)
            beforeWhitespaces = 1;
        if (twoLastToken && isFieldDeclaration(twoLastToken) && lastToken && lastToken.type === TokenType.PUNCTUATION.SEMICOLON && isNextInstructionFieldDeclaration(tokens, index) && Config.getConfig().apexFormat.classMembers.newLinesBetweenClassFields > 0 && mainBodyIndent === indent)
            newLines = Config.getConfig().apexFormat.classMembers.newLinesBetweenClassFields + 1;
        else if (twoLastToken && isFieldDeclaration(twoLastToken) && lastToken && lastToken.type === TokenType.PUNCTUATION.SEMICOLON && !isNextInstructionFieldDeclaration(tokens, index) && mainBodyIndent === indent)
            newLines = Config.getConfig().apexFormat.classMembers.newLinesBetweenCodeBlockMembers + 1;
        if (lastToken && lastToken.type === TokenType.PUNCTUATION.COMMA && twoLastToken && twoLastToken.type === TokenType.ENTITY.ENUM_VALUE && token.type !== TokenType.COMMENT.LINE && token.type !== TokenType.COMMENT.LINE_DOC)
            newLines = 1;
        if (isKeyword(token) && lastToken && lastToken.type === TokenType.DECLARATION.ENTITY.VARIABLE)
            beforeWhitespaces = 1;
        if (isQueryClause(token) && Config.getConfig().apexFormat.query.oneClausePerLine && lastToken && lastToken.type !== TokenType.BRACKET.QUERY_START) {
            newLines = 1;
            beforeWhitespaces = queryOpenIndex;
        }
        if (isQueryClause(token))
            afterWhitespaces = 1;
        if (token.type === TokenType.QUERY.OPERATOR && lastToken && lastToken.type !== TokenType.QUERY.OPERATOR) {
            beforeWhitespaces = 1;
        }
        if (token.type === TokenType.QUERY.OPERATOR && nextToken && nextToken.type !== TokenType.QUERY.VALUE_BIND) {
            afterWhitespaces = 1;
        }
        if (lastToken && isQueryClause(lastToken) && token.type === TokenType.DATATYPE.SOBJECT)
            afterWhitespaces = 1;
        if (lastToken && isQueryFunction(lastToken) && token.type === TokenType.DATATYPE.SOBJECT)
            beforeWhitespaces = 1;
        if (lastToken && (isLiteral(lastToken) || lastToken.type === TokenType.ENTITY.SOBJECT_FIELD || lastToken.type === TokenType.ENTITY.SOBJECT_PROJECTION_FIELD || lastToken.type === TokenType.PUNCTUATION.QUOTTES_END || lastToken.type === TokenType.OPERATOR.PRIORITY.PARENTHESIS_CLOSE || lastToken.type === TokenType.ENTITY.VARIABLE) && isQueryClause(token) && newLines === 0)
            beforeWhitespaces = 1;
        if (lastToken && lastToken.type === TokenType.QUERY.CLAUSE.SELECT && Config.getConfig().apexFormat.query.oneProjectionFieldPerLine) {
            newLines = 1;
            beforeWhitespaces = querySelectIndex - 1;
        }
        if (twoLastToken && twoLastToken.type === TokenType.ENTITY.SOBJECT_PROJECTION_FIELD && lastToken && (lastToken.type === TokenType.PUNCTUATION.COMMA) && Config.getConfig().apexFormat.query.oneProjectionFieldPerLine) {
            newLines = 1;
            beforeWhitespaces = querySelectIndex - 1;
        }
        if (token.type === TokenType.PUNCTUATION.OBJECT_ACCESSOR) {
            afterWhitespaces = 0;
            beforeWhitespaces = 0;
        }
        if (token.type === TokenType.QUERY.VALUE_BIND && lastToken && lastToken !== TokenType.QUERY.OPERATOR && !isOperator(lastToken) && !isKeyword(lastToken) && !isQueryClause(lastToken)) {
            beforeWhitespaces = 1;
        }



        if (isInitializer(token, lastToken)) {
            indentOffset = -1;
            beforeWhitespaces = 0;
            newLines = 1;
        }
        if (newLines > 0) {
            if (newLines > 1)
                line.push(getNewLines(newLines - 1));
            lines.push(line.join(''));
            line = [];
            line.push(getIndent(indent + indentOffset));

            if (token.type === TokenType.COMMENT.CONTENT || token.type === TokenType.COMMENT.BLOCK_END)
                beforeWhitespaces = 1;
            if (!token.isAux()) {
                if (beforeWhitespaces > 0)
                    line.push(getWhitespaces(beforeWhitespaces));
                line.push(token.text);
                if (afterWhitespaces > 0)
                    line.push(getWhitespaces(afterWhitespaces));
            }
            beforeWhitespaces = 0;
            afterWhitespaces = 0;
            newLines = 0;
            indentOffset = 0;
        } else {
            if (!token.isAux()) {
                if (beforeWhitespaces > 0)
                    line.push(getWhitespaces(beforeWhitespaces));
                line.push(token.text);
                if (afterWhitespaces > 0)
                    line.push(getWhitespaces(afterWhitespaces));
            }
            beforeWhitespaces = 0;
            afterWhitespaces = 0;
            indentOffset = 0;
        }
        index++;
    }
    lines.push(line.join(''));
    return lines.join('\n');
}

function getNewLines(number) {
    let nl = '';
    for (let index = 0; index < number; index++) {
        nl += '\n';
    }
    return nl;
}

function isLiteral(token) {
    return token.type === TokenType.LITERAL.BOOLEAN || token.type === TokenType.LITERAL.DATE || token.type === TokenType.LITERAL.DATETIME || token.type === TokenType.LITERAL.DATE_PARAMETRIZED || token.type === TokenType.LITERAL.DATE_PARAMETRIZED_START_PARAM || token.type === TokenType.LITERAL.DOUBLE || token.type === TokenType.LITERAL.DOUBLE_INDICATOR || token.type === TokenType.LITERAL.INTEGER || token.type === TokenType.LITERAL.LONG || token.type === TokenType.LITERAL.LONG_INDICATOR || token.type === TokenType.LITERAL.NULL || token.type === TokenType.LITERAL.TIME;
}

function isStringToken(token) {
    return token.type === TokenType.LITERAL.STRING || token.type === TokenType.PUNCTUATION.QUOTTES_START || token.type === TokenType.PUNCTUATION.QUOTTES_END;
}

function isCommentToken(token) {
    return token.type === TokenType.COMMENT.CONTENT || token.type === TokenType.COMMENT.BLOCK_START || token.type === TokenType.COMMENT.BLOCK_END || token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC;
}

function isDependentFlowStructure(token) {
    return token.type === TokenType.KEYWORD.FLOW_CONTROL.WHILE_DO || token.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE || token.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE_IF || token.type === TokenType.KEYWORD.FLOW_CONTROL.CATCH || token.type === TokenType.KEYWORD.FLOW_CONTROL.FINALLY
}

function isOperator(token) {
    switch (token.type) {
        case TokenType.OPERATOR.ARITHMETIC.ADD:
        case TokenType.OPERATOR.ARITHMETIC.ADD_ASSIGN:
        case TokenType.OPERATOR.ARITHMETIC.DECREMENT:
        case TokenType.OPERATOR.ARITHMETIC.DIVIDE:
        case TokenType.OPERATOR.ARITHMETIC.DIVIDE_ASSIGN:
        case TokenType.OPERATOR.ARITHMETIC.INCREMENT:
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
            return true;
        default:
            return false;
    }
}

function isQueryFunction(token) {
    switch (token.type) {
        case TokenType.QUERY.FUNCTION:
            return true;
        default:
            return false;
    }
}

function isQueryClause(token) {
    switch (token.type) {
        case TokenType.QUERY.CLAUSE.SELECT:
        case TokenType.QUERY.CLAUSE.FROM:
        case TokenType.QUERY.CLAUSE.WHERE:
        case TokenType.QUERY.CLAUSE.TYPE_OF:
        case TokenType.QUERY.CLAUSE.WHEN:
        case TokenType.QUERY.CLAUSE.ELSE:
        case TokenType.QUERY.CLAUSE.THEN:
        case TokenType.QUERY.CLAUSE.FOR:
        case TokenType.QUERY.CLAUSE.GROUP_BY:
        case TokenType.QUERY.CLAUSE.HAVING:
        case TokenType.QUERY.CLAUSE.END:
        case TokenType.QUERY.CLAUSE.FIND:
        case TokenType.QUERY.CLAUSE.LIMIT:
        case TokenType.QUERY.CLAUSE.NULLS:
        case TokenType.QUERY.CLAUSE.OFFSET:
        case TokenType.QUERY.CLAUSE.ORDER_BY:
        case TokenType.QUERY.CLAUSE.USING_SCOPE:
        case TokenType.QUERY.CLAUSE.WITH:
        case TokenType.QUERY:
            return true;
        default:
            return false;
    }
}

function isInitializer(token, lastToken) {
    if (token.type === TokenType.BRACKET.CURLY_OPEN) {
        return lastToken && (lastToken.type === TokenType.BRACKET.CURLY_OPEN || lastToken.type === TokenType.BRACKET.CURLY_CLOSE || lastToken.type === TokenType.PUNCTUATION.SEMICOLON || lastToken.type === TokenType.COMMENT.CONTENT || lastToken.type === TokenType.COMMENT.LINE || lastToken.type === TokenType.COMMENT.LINE_DOC || lastToken.type === TokenType.COMMENT.BLOCK_END);
    }
    return false;
}

function isOnSameLine(tokenA, tokenB) {
    return tokenA && tokenB && tokenA.line === tokenB.line;
}

function isNextInstructionFieldDeclaration(tokens, index) {
    let token = tokens[index];
    while (token.type !== TokenType.PUNCTUATION.SEMICOLON) {
        token = tokens[index];
        if (isFieldDeclaration(token))
            return true;
        index++;
    }
    return false;
}

function isAnnotationToken(token) {
    switch (token.type) {
        case TokenType.BRACKET.ANNOTATION_PARAM_OPEN:
        case TokenType.BRACKET.ANNOTATION_PARAM_CLOSE:
        case TokenType.ANNOTATION.CONTENT:
        case TokenType.ANNOTATION.ENTITY:
        case TokenType.ANNOTATION.NAME:
            return true;
        default:
            return false;
    }
}

function isFieldDeclaration(token) {
    return token.type === TokenType.DECLARATION.ENTITY.VARIABLE;
}

function isMemberDeclaration(token) {
    switch (token.type) {
        case TokenType.DECLARATION.ENTITY.FUNCTION:
        case TokenType.DECLARATION.ENTITY.PROPERTY:
        case TokenType.DECLARATION.ENTITY.VARIABLE:
            return true;
        default:
            return false;
    }
}

function isKeyword(token) {
    switch (token.type) {
        case TokenType.KEYWORD.OTHER:
        case TokenType.KEYWORD.DECLARATION.CLASS:
        case TokenType.KEYWORD.DECLARATION.ENUM:
        case TokenType.KEYWORD.DECLARATION.EXTENDS:
        case TokenType.KEYWORD.DECLARATION.IMPLEMENTS:
        case TokenType.KEYWORD.DECLARATION.INTERFACE:
        case TokenType.DECLARATION.ENTITY.CLASS:
        case TokenType.DECLARATION.ENTITY.ENUM:
        case TokenType.DECLARATION.ENTITY.INTERFACE:
        case TokenType.KEYWORD.DECLARATION.INTERFACE:
        case TokenType.KEYWORD.DECLARATION.TRIGGER:
        case TokenType.KEYWORD.MODIFIER.ACCESS:
        case TokenType.KEYWORD.MODIFIER.DEFINITION:
        case TokenType.KEYWORD.MODIFIER.FINAL:
        case TokenType.KEYWORD.MODIFIER.OVERRIDE:
        case TokenType.KEYWORD.MODIFIER.SHARING:
        case TokenType.KEYWORD.MODIFIER.STATIC:
        case TokenType.KEYWORD.MODIFIER.TEST_METHOD:
        case TokenType.KEYWORD.MODIFIER.TRANSIENT:
        case TokenType.KEYWORD.MODIFIER.WEB_SERVICE:
        case TokenType.KEYWORD.OBJECT.NEW:
        case TokenType.DATABASE.TRIGGER_EXEC:
        case TokenType.DATABASE.DML:
        case TokenType.KEYWORD.FLOW_CONTROL.BREAK:
        case TokenType.KEYWORD.FLOW_CONTROL.CONTINUE:
        case TokenType.KEYWORD.FLOW_CONTROL.RETURN:
        case TokenType.KEYWORD.FLOW_CONTROL.THROW:
            return true;
        default:
            return false;
    }
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