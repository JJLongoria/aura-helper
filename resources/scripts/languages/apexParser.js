const logger = require('../main/logger');
const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const utils = require('./utils').Utils;

class ApexParser {
    static parse(content) {
        let tokens = Tokenizer.tokenize(content);
        let fileStructure = {
            modifier: "",
            withSharing: true,
            abstract: false,
            virtual: false,
            className: "",
            implements: [],
            extends: "",
            fields: [],
            methods: []
        };
        let index = 0;
        let bracketIndent = 0;
        let parenIndent = 0;
        let aBracketIndent = 0;
        let modifier;
        let isStatic = false;
        let name;
        let isFinal = false;
        let isAbstrac = false;
        let isVirtual = false;
        let methodParams = [];
        let annotation;
        let comment;
        let signature;
        let returnType;
        let returnIndexStart;
        let returnIndexEnd;
        let dataTypeIndexStart;
        let dataTypeIndexEnd;
        let isCommentLine = false;
        while (index < tokens.length) {
            let lastToken = utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            if (token.tokenType === TokenType.LBRACKET) {
                bracketIndent++;
            }
            else if (token.tokenType === TokenType.RBRACKET) {
                bracketIndent--;
            }
            if (token.tokenType === 'operator' && token.content === "/" && nextToken && nextToken.tokenType === 'operator' && nextToken.content === "/")
                isCommentLine = true;
            if (isCommentLine && nextToken && token.line != nextToken.line)
                isCommentLine = false;
            if (!nextToken)
                isCommentLine = false;
            if (!isCommentLine) {
                if (bracketIndent === 0) {
                    if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private'))
                        fileStructure.modifier = token.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'without' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'sharing')
                        fileStructure.withSharing = false;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'class' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER)
                        fileStructure.className = nextToken.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract')
                        fileStructure.abstract = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual')
                        fileStructure.virtual = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'implements') {
                        var interfaceName = "";
                        while (token.content !== 'extends' || token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if (token.tokenType === TokenType.COMMA && aBracketIndent == 0) {
                                fileStructure.implements.push(interfaceName);
                                interfaceName = "";
                            } else {
                                interfaceName += token.content;
                            }
                            index++;
                        }
                        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                            var extendsName = "";
                            while (token.tokenType !== TokenType.LBRACKET) {
                                token = tokens[index];
                                if (token.tokenType !== TokenType.LBRACKET)
                                    extendsName += token.content;
                                index++;
                            }
                            fileStructure.extends = extendsName;
                        }
                        if (token.tokenType === TokenType.LBRACKET)
                            bracketIndent++;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                        var extendsName = "";
                        while (token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType !== TokenType.LBRACKET)
                                extendsName += token.content;
                            index++;
                        }
                        fileStructure.extends = extendsName;
                        if (token.tokenType === TokenType.LBRACKET)
                            bracketIndent++;
                    }
                } else if (bracketIndent === 1) {
                    if (token.tokenType === TokenType.OPERATOR && token.content === '/' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '*') {
                        let endComment = false;
                        while (!endComment) {
                            token = tokens[index];
                            nextToken = utils.getNextToken(tokens, index);
                            endComment = token.tokenType === TokenType.OPERATOR && token.content === '*' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/';
                            index++;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private' || token.content.toLowerCase() === 'webservice' || token.content.toLowerCase() === 'protected')) {
                        modifier = token.content;
                        returnIndexStart = index + 1;
                        dataTypeIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract') {
                        isAbstrac = true;
                        returnIndexStart = index + 1;
                        dataTypeIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual') {
                        isVirtual = true;
                        returnIndexStart = index + 1;
                        dataTypeIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'static') {
                        isStatic = true;
                        returnIndexStart = index + 1;
                        dataTypeIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'final') {
                        isFinal = true;
                        returnIndexStart = index + 1;
                        dataTypeIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.AT && nextToken && nextToken.tokenType === TokenType.IDENTIFIER) {
                        annotation = "@";
                        while (token.line == nextToken.line) {
                            index++;
                            token = tokens[index];
                            nextToken = utils.getNextToken(tokens, index);
                            annotation += token.content;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && nextToken && (nextToken.tokenType === TokenType.EQUAL || nextToken.tokenType === TokenType.SEMICOLON)) {
                        dataTypeIndexEnd = index;
                        name = token.content;
                        let assignTokens = [];
                        let isOnAssignment = false;
                        while (token.tokenType !== TokenType.SEMICOLON) {
                            token = tokens[index];
                            if (isOnAssignment) {
                                assignTokens.push(token);
                            }
                            if (token.tokenType === TokenType.EQUAL) {
                                isOnAssignment = true;
                            }
                        }
                        index--;
                        let dataType = this.getDataType(dataTypeIndexStart, dataTypeIndexEnd, tokens);
                        let variable = {
                            name: name,
                            annotation: annotation,
                            modifier: modifier,
                            isStatic: isStatic,
                            isFinal: isFinal,
                            dataType: dataType,
                            assignTokens: assignTokens
                        };
                        modifier = undefined;
                        isStatic = false;
                        name = undefined;
                        isFinal = false;
                        isAbstrac = false;
                        isVirtual = false;
                        methodParams = [];
                        annotation = undefined;
                        comment = undefined;
                        fileStructure.fields.push(variable);
                    } else if (token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.LPAREN) {
                        returnIndexEnd = index;
                        name = token.content;
                        let bodyTokens = [];
                        let param = {
                            name: "",
                            type: ""
                        };
                        let methodBracketIndent = 0;
                        let endLoop = false;
                        while (!endLoop) {
                            token = tokens[index];
                            lastToken = utils.getLastToken(tokens, index);
                            nextToken = utils.getNextToken(tokens, index);
                            if (token.tokenType === TokenType.LPAREN) {
                                parenIndent++;
                            }
                            else if (token.tokenType === TokenType.RPAREN) {
                                parenIndent--;
                            }
                            else if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            } else if (token.tokenType === TokenType.LBRACKET) {
                                methodBracketIndent++;
                            } else if (token.tokenType === TokenType.RBRACKET) {
                                methodBracketIndent--;
                                if (methodBracketIndent === 0)
                                    endLoop = true;
                            }
                            if (!endLoop) {
                                if (methodBracketIndent > 0) {
                                    bodyTokens.push(token);
                                } else {
                                    if ((nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.RPAREN) && token.tokenType !== TokenType.LPAREN && aBracketIndent == 0) {
                                        param.name = token.content;
                                        methodParams.push(param);
                                        param = {
                                            name: "",
                                            type: ""
                                        };
                                    } else if (parenIndent > 0 && token.tokenType !== TokenType.LPAREN && token.tokenType !== TokenType.COMMA) {
                                        param.type += token.content;
                                    }
                                }
                            }
                            index++;
                        }
                        if (!modifier)
                            modifier = 'public';
                        returnType = ApexParser.getDataType(returnIndexStart, returnIndexEnd, tokens);
                        signature = modifier;
                        if (isStatic)
                            signature += ' static';
                        if (isAbstrac)
                            signature += ' abstract';
                        if (isVirtual)
                            signature += ' virtual'
                        if (isVirtual)
                            signature += ' virtual'
                        if (returnType)
                            signature += ' ' + returnType;
                        else
                            signature += ' void';
                        signature += ' ' + name + '(';
                        let params = [];
                        for (const param of methodParams) {
                            params.push(param.type + ' ' + param.name);
                        }
                        signature += params.join(', ');
                        signature += ')';
                        bodyTokens.shift();
                        let method = {
                            name: name,
                            annotation: annotation,
                            modifier: modifier,
                            isStatic: isStatic,
                            abstract: isAbstrac,
                            virtual: isVirtual,
                            params: methodParams,
                            bodyTokens: bodyTokens,
                            comment: undefined,
                            returnType: returnType,
                            signature: signature
                        };
                        modifier = undefined;
                        isStatic = false;
                        name = undefined;
                        isFinal = false;
                        isAbstrac = false;
                        isVirtual = false;
                        methodParams = [];
                        annotation = undefined;
                        comment = undefined;
                        fileStructure.methods.push(method);
                    }
                }
            }
            index++;
        }
        return fileStructure;
    }

    static parseForComment(content) {
        var data = {
            classData: {
                modifier: undefined,
                isAbstract: false,
                isVirtual: false,
                interfaces: [],
                extendsFrom: undefined,
                name: undefined,
                withSharing: true,

            },
            methodData: {
                annotation: undefined,
                name: undefined,
                isStatic: false,
                isFinal: false,
                isAbstract: false,
                isVirtual: false,
                params: [],
                returnType: undefined,
                signature: undefined
            }
        }
        let parenIndent = 0;
        let aBracketIndent = 0;
        let returnIndexStart = 0;
        let returnIndexEnd = 0;
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let isClass = content.toLowerCase().indexOf(' class ') !== -1;
        let endLoop = false;
        while (!endLoop) {
            let token = tokens[index];
            let lastToken = utils.getLastToken(tokens, index);
            let nextToken = utils.getNextToken(tokens, index);
            if (token.tokenType !== TokenType.SEMICOLON && token.tokenType !== TokenType.LBRACKET) {
                if (isClass) {
                    if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private'))
                        data.classData.modifier = token.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'without' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'sharing')
                        data.classData.withSharing = false;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'class' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER)
                        data.classData.name = nextToken.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract')
                        data.classData.isAbstrac = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual')
                        data.classData.isVirtual = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'implements') {
                        var interfaceName = "";
                        while (token.content !== 'extends' || token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if (token.tokenType === TokenType.COMMA && aBracketIndent == 0) {
                                data.classData.interfaces.push(interfaceName);
                                interfaceName = "";
                            } else {
                                interfaceName += token.content;
                            }
                            index++;
                        }
                        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                            var extendsName = "";
                            while (token.tokenType !== TokenType.LBRACKET) {
                                token = tokens[index];
                                if (token.tokenType !== TokenType.LBRACKET)
                                    extendsName += token.content;
                                index++;
                            }
                            data.classData.extendsFrom = extendsName;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                        var extendsName = "";
                        while (token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType !== TokenType.LBRACKET)
                                extendsName += token.content;
                            index++;
                        }
                        data.classData.extendsFrom = extendsName;
                    }
                } else {
                    if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private' || token.content.toLowerCase() === 'webservice' || token.content.toLowerCase() === 'protected')) {
                        data.methodData.modifier = token.content;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract') {
                        data.methodData.isAbstrac = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual') {
                        data.methodData.isVirtual = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'static') {
                        data.methodData.isStatic = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'final') {
                        data.methodData.isFinal = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.AT && nextToken && nextToken.tokenType === TokenType.IDENTIFIER) {
                        data.methodData.annotation = "@";
                        while (token.line == nextToken.line) {
                            index++;
                            token = tokens[index];
                            nextToken = utils.getNextToken(tokens, index);
                            data.methodData.annotation += token.content;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.LPAREN) {
                        returnIndexEnd = index;
                        data.methodData.name = token.content;
                        let param = {
                            name: "",
                            type: ""
                        };
                        while (token.tokenType !== TokenType.RPAREN) {
                            token = tokens[index];
                            lastToken = utils.getLastToken(tokens, index);
                            nextToken = utils.getNextToken(tokens, index);
                            if (token.tokenType === TokenType.LPAREN) {
                                parenIndent++;
                            }
                            else if (token.tokenType === TokenType.RPAREN) {
                                parenIndent--;
                            }
                            else if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if ((nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.RPAREN) && token.tokenType !== TokenType.LPAREN && aBracketIndent == 0) {
                                param.name = token.content;
                                data.methodData.params.push(param);
                                param = {
                                    name: "",
                                    type: ""
                                };
                            } else if (parenIndent > 0 && token.tokenType !== TokenType.LPAREN && token.tokenType !== TokenType.COMMA) {
                                param.type += token.content;
                            }
                            index++;
                        }
                        index--;
                        if (!data.methodData.modifier)
                            data.methodData.modifier = 'public';
                        data.methodData.returnType = ApexParser.getDataType(returnIndexStart, returnIndexEnd, tokens);
                        data.methodData.signature = data.methodData.modifier;
                        if (data.methodData.isStatic)
                            data.methodData.signature += ' static';
                        if (data.methodData.isAbstrac)
                            data.methodData.signature += ' abstract';
                        if (data.methodData.isVirtual)
                            data.methodData.signature += ' virtual'
                        if (data.methodData.isVirtual)
                            data.methodData.signature += ' virtual'
                        if (data.methodData.returnType)
                            data.methodData.signature += ' ' + data.methodData.returnType;
                        else
                            data.methodData.signature += ' void';
                        data.methodData.signature += ' ' + data.methodData.name + '(';
                        let params = [];
                        for (const param of data.methodData.params) {
                            params.push(param.type + ' ' + param.name);
                        }
                        data.methodData.signature += params.join(', ');
                        data.methodData.signature += ')';
                    }
                }
            }
            else {
                endLoop = true;
            }
            index++;
        }
        return data;
    }

    static getDataType(indexStart, indexEnd, tokens) {
        let returnType = '';
        for (let index = indexStart; index < indexEnd; index++) {
            returnType += tokens[index].content;
        }
        return returnType;
    }
}
exports.ApexParser = ApexParser;