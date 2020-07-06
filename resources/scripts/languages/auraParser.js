const logger = require('../utils/logger');
const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const utils = require('./utils').Utils;

class AuraParser {

    static parse(content) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let bracketIndent = 0;
        let fileStructure = {
            attributes: [],
            events: [],
            handlers: [],
            extends: "",
            controller: "",
            implements: [],
            extensible: false,
            abstract: false,
            controllerFunctions: [],
            helperFunctions: [],
            apexFunctions: []
        }
        while (index < tokens.length) {
            let lastToken = utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            if (token.tokenType === TokenType.LABRACKET)
                bracketIndent++;
            if (token.tokenType === TokenType.RABRACKET)
                bracketIndent--;
            if (bracketIndent == 1) {
                if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'component') {
                    // Is on Component
                    let fileStruc = AuraParser.getTagData(tokens, index).tagData;
                    if (fileStruc.extensible)
                        fileStructure.extensible = fileStruc.extensible;
                    if (fileStruc.implements) {
                        let splits = fileStruc.implements.split(',');
                        for (const split of splits) {
                            fileStructure.implements.push(split.trim());
                        }
                    }
                    if (fileStruc.abstract)
                        fileStructure.abstract = fileStruc.abstract.trim();
                    if (fileStruc.extends)
                        fileStructure.extends = fileStruc.extends.trim();
                    if (fileStruc.controller)
                        fileStructure.controller = fileStruc.controller.trim();
                }
                else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'attribute') {
                    // Is on Attribute
                    let data = AuraParser.getTagData(tokens, index);
                    data.tagData.line = lastToken.line;
                    data.tagData.column = lastToken.startColumn;
                    fileStructure.attributes.push(data.tagData);
                } else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'registerEvent') {
                    // Is on Events
                    let data = AuraParser.getTagData(tokens, index);
                    data.tagData.line = lastToken.line;
                    data.tagData.column = lastToken.startColumn;
                    fileStructure.events.push(data.tagData);
                } else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'handler') {
                    // Is on Handlers
                    let data = AuraParser.getTagData(tokens, index);
                    data.tagData.line = lastToken.line;
                    data.tagData.column = lastToken.startColumn;
                    fileStructure.handlers.push(data.tagData);
                }
            }
            index++;
        }
        return fileStructure;
    }

    static getTagData(tokens, index, position) {
        let data = {}
        let tagData = {};
        let isOnValue = false;
        let paramName;
        let paramValue = '';
        let token = tokens[index];
        let startValueToken;
        let endValueToken;
        let isOnAttributeValue;
        let isParamEmpty = false;
        let attributeName;
        while (token.tokenType !== TokenType.RABRACKET) {
            token = tokens[index];
            let lastToken = utils.getLastToken(tokens, index);
            let nextToken = utils.getNextToken(tokens, index);
            if (token && token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content == "aura" && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'id') {
                paramName = "aura:id";
            }
            else if (token && token.tokenType === TokenType.EQUAL && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.QUOTTE && !paramName) {
                paramName = lastToken.content;
            }
            else if (token && token.tokenType === TokenType.QUOTTE && lastToken && lastToken.tokenType === TokenType.EQUAL) {
                isOnValue = true;
                startValueToken = token;
            } else if (token && token.tokenType === TokenType.QUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) {
                isOnValue = false;
                endValueToken = token;
                if (position && startValueToken && endValueToken) {
                    if (startValueToken.startColumn <= position.character && position.character <= endValueToken.endColumn) {
                        isOnAttributeValue = true;
                        attributeName = paramName;
                    }
                }
                if ((!paramValue || paramValue.length === 0) && paramName === attributeName)
                    isParamEmpty = true;
                if (paramName)
                    tagData[paramName.trim()] = paramValue.trim();
                paramName = undefined;
                paramValue = '';
                startValueToken = undefined;
                endValueToken = undefined;

            } else if (isOnValue) {
                paramValue += utils.getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;
            }
            index++;
        }
        data.tagData = tagData;
        data.index = index;
        data.isOnAttributeValue = isOnAttributeValue;
        data.attributeName = (attributeName) ? attributeName.trim() : attributeName;
        data.isParamEmpty = isParamEmpty;
        return data;
    }

    static parseForPutAttributes(content, position) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let openBracket = false;
        let isOnText = false;
        let startColumn = 0;
        while (index < tokens.length) {
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            let lastToken = utils.getLastToken(tokens, index);
            if ((token && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) && token.startColumn <= position.character) {
                isOnText = !isOnText;
            }
            if (!isOnText && (token && token.tokenType === TokenType.QUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) && token.startColumn <= position.character) {
                isOnText = !isOnText;
            }
            if (token.tokenType === TokenType.LBRACKET && token.startColumn <= position.character) {
                openBracket = true;
            }
            if (token.tokenType === TokenType.RBRACKET && token.startColumn <= position.character) {
                openBracket = false;
            }
            if (token.content.toLowerCase() === 'v' && nextToken && nextToken.tokenType === TokenType.DOT)
                startColumn = token.startColumn;
            index++;
        }
        return {
            openBracket: openBracket,
            startColumn: startColumn,
            isOnText: isOnText
        };
    }

    static parseForPutLabels(content, position) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let openBracket = false;
        let startColumn = 0;
        while (index < tokens.length) {
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            if (token.tokenType === TokenType.LBRACKET && token.startColumn <= position.character) {
                openBracket = true;
            }
            if (token.tokenType === TokenType.RBRACKET && token.startColumn <= position.character) {
                openBracket = false;
            }
            if (token.content.toLowerCase() === 'label' && nextToken && nextToken.tokenType === TokenType.DOT)
                startColumn = token.startColumn;
            index++;
        }
        return {
            openBracket: openBracket,
            startColumn: startColumn
        };
    }

    static parseForPutPickVals(content, position, firstWord) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let isSQuotteText = false;
        let isQuotteText = false;
        let startColumn = 0;
        while (index < tokens.length) {
            let token = tokens[index];
            let nextToken = utils.getNextToken(tokens, index);
            let lastToken = utils.getLastToken(tokens, index);
            if (!isQuotteText && (token && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) && token.startColumn <= position.character) {
                isSQuotteText = !isSQuotteText;
            }
            if (!isSQuotteText && (token && token.tokenType === TokenType.QUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) && token.startColumn <= position.character) {
                isQuotteText = !isQuotteText;
            }
            if (token.content.toLowerCase() === firstWord && nextToken && nextToken.tokenType === TokenType.DOT)
                startColumn = token.startColumn;
            index++;
        }
        return {
            isOnText: isSQuotteText || isQuotteText,
            startColumn: startColumn
        };
    }

    static analizeForPutSnippets(content, activation) {
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let startColumn;
        let endColumn;
        while (index < tokens.length) {
            let token = tokens[index];
            let lastToken = utils.getLastToken(tokens, index);
            if (token.tokenType === TokenType.DOT && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === activation) {
                startColumn = lastToken.startColumn;
                endColumn = token.endColumn;
            }
            if (startColumn && endColumn)
                index = tokens.length;
            index++;
        }
        return {
            startColumn: startColumn,
            endColumn: endColumn
        };
    }

    static componentTagData(content, position) {
        let componentTagData = {
            position: {
                line: -1,
                character: ""
            },
            namespace: "",
            name: "",
            isParamEmpty: false,
            isOnAttributeValue: false,
            attributeName: "",
            attributes: {}
        };
        let componentTokens = Tokenizer.tokenize(content);
        let index = 0;
        while (index < componentTokens.length) {
            let token = componentTokens[index];
            let lastToken = utils.getLastToken(componentTokens, index);
            let nextToken = utils.getNextToken(componentTokens, index);
            if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.IDENTIFIER) {
                componentTagData.namespace = lastToken.content;
                componentTagData.name = nextToken.content;
                let data = AuraParser.getTagData(componentTokens, index, position);
                componentTagData.isParamEmpty = data.isParamEmpty;
                componentTagData.isOnAttributeValue = data.isOnAttributeValue;
                componentTagData.attributeName = data.attributeName;
                Object.keys(data.tagData).forEach(function (key) {
                    componentTagData.attributes[key] = data.tagData[key];
                });
                break;
            }
            index++;
        }
        return componentTagData;
    }
}
exports.AuraParser = AuraParser;