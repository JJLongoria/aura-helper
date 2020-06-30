const logger = require('../utils/logger');
const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const utils = require('./utils').Utils;

class JavaScriptParser {
    static parse(content) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let bracketIndent = 0;
        let parenIndent = 0;
        let fileStructure = {
            functions: [],
            variables: []
        };
        let comment = {
            description: '',
            params: []
        };
        while (index < tokens.length) {
            let lastToken = utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            let func = {};
            if (token.tokenType === TokenType.LBRACKET) {
                bracketIndent++;
            }
            if (token.tokenType === TokenType.RBRACKET) {
                bracketIndent--;
            }
            if (token.tokenType === TokenType.LPAREN) {
                parenIndent++;
            }
            if (token.tokenType === TokenType.RPAREN) {
                parenIndent--;
            }
            if (parenIndent == 1 && bracketIndent == 1) {
                if (token.tokenType === TokenType.COLON) {
                    if (lastToken && lastToken.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType == TokenType.IDENTIFIER && nextToken.content === 'function') {
                        // On function
                        let startParams;
                        func.name = lastToken.content;
                        func.token = lastToken;
                        func.params = [];
                        func.line = token.line;
                        func.column = token.startColumn;
                        let paramNames = [];
                        if (comment.description)
                            func.comment = comment;
                        comment = {
                            description: null,
                            params: []
                        };
                        while (token.tokenType !== TokenType.RPAREN) {
                            token = tokens[++index];
                            if (token.tokenType === TokenType.LPAREN) {
                                startParams = true;
                            } else if (startParams) {
                                if (token.tokenType === TokenType.IDENTIFIER) {
                                    paramNames.push(token.content);
                                    func.params.push({
                                        name: token.content,
                                        token: token,
                                    });
                                }
                            }
                        }
                        func.auraSignature = func.name + ' : function(' + paramNames.join(', ') + ')';
                        func.signature = func.name + '(' + paramNames.join(', ') + ')';
                        func.snippet = getFunctionSnippet(func.name, paramNames);
                        fileStructure.functions.push(func);
                    }
                }
                else if (token.tokenType === TokenType.OPERATOR && token.content === '*') {
                    if (lastToken && lastToken.tokenType === TokenType.OPERATOR && lastToken.content === '/' && nextToken && nextToken.tokenType == TokenType.OPERATOR && nextToken.content === '*') {
                        // On Comment
                        let description = '';
                        let endComment = false;
                        while (token.tokenType !== TokenType.AT && !endComment) {
                            token = tokens[++index];
                            lastToken = utils.getLastToken(tokens, index);
                            nextToken = utils.getNextToken(tokens, index);
                            endComment = token.tokenType === TokenType.OPERATOR && token.content === '*' && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/';
                            if (!endComment) {
                                if (token.lineNumber > lastToken.lineNumber)
                                    description += '\n';
                                else if ((token.tokenType !== TokenType.OPERATOR && token.content !== '*') && (token.tokenType !== TokenType.AT && nextToken.content !== 'param')) {
                                    description += utils.getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;;
                                }
                            }
                        }
                        comment.description = description;
                        comment.params = [];
                        while (!endComment) {
                            token = tokens[++index];
                            lastToken = utils.getLastToken(tokens, index);
                            nextToken = utils.getNextToken(tokens, index);
                            if (token.tokenType === TokenType.IDENTIFIER && token.content === 'param') {
                                let commentParam = {};
                                while (token.tokenType !== 'at' && nextToken.content !== 'param' && !endComment) {
                                    token = tokens[++index];
                                    lastToken = utils.getLastToken(tokens, index);
                                    nextToken = utils.getNextToken(tokens, index);
                                    endComment = token.tokenType === TokenType.OPERATOR && token.content === '*' && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/';
                                    if (!endComment) {
                                        if (lastToken.tokenType === TokenType.LBRACKET) {
                                            commentParam.type = token.content;;
                                        } else if (lastToken.tokenType === TokenType.RBRACKET) {
                                            commentParam.name = token.content;
                                        } else if (commentParam.name) {
                                            if (!commentParam.description) {
                                                commentParam.description = '';
                                            }
                                            if (token.lineNumber > lastToken.lineNumber) {
                                                description += '\n';
                                            }
                                            if ((token.tokenType !== TokenType.OPERATOR && token.content !== '*') && (token.tokenType !== TokenType.AT && nextToken.content !== 'param')) {
                                                commentParam.description += utils.getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;
                                            }
                                        }
                                    }
                                }
                                comment.params.push(commentParam);
                            }
                        }
                    }
                }
            }
            index++;
        }
        return fileStructure;
    }

    static getFunctions(content) {
        let fileStructure = JavaScriptParser.parse(content);
        return fileStructure.functions;
    }

    static analizeForPutSnippets(content, activation) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let startColumn = 0
        let endColum = 0;
        while (index < tokens.length) {
            let token = tokens[index];
            let lastToken = utils.getLastToken(tokens, index);
            if (token.tokenType === TokenType.DOT && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === activation) {
                startColumn = lastToken.startColumn;
                endColum = token.endColum;
            }
            index++;
        }
        return {
            startColumn: startColumn,
            endColum: endColum
        };
    }

    static analizeForPutApexParams(content) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let startColumn = 0;
        let close = true;
        let complete = true;
        while (index < tokens.length) {
            let token = tokens[index];
            let lastToken = utils.getLastToken(tokens, index);
            let nextToken = utils.getNextToken(tokens, index);
            if (token.content === 'c' && nextToken && nextToken.tokenType === TokenType.DOT) {
                startColumn = token.startColumn;
                if (lastToken && (lastToken.tokenType === TokenType.COMMA || lastToken.tokenType === TokenType.EQUAL)) {
                    complete = false;
                    if (lastToken && lastToken.tokenType !== TokenType.EQUAL)
                        close = false
                }
            }
            index++;
        }
        return {
            startColumn: startColumn,
            close: close,
            complete: complete
        };
    }
}
exports.JavaScriptParser = JavaScriptParser;

function getFunctionSnippet(funcName, params) {
    let snippet = funcName + "(";
    let counter = 0;
    for (let param of params) {
        if (counter === 0)
            snippet = "${" + (counter + 1) + ":" + param + "}";
        else
            snippet = ", ${" + (counter + 1) + ":" + param + "}";
    }
    snippet += ")$0";
    return snippet;
}