const logger = require('../main/logger');
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
                    let fileStruc = AuraParser.getTagData(tokens, index);
                    if (fileStruc.extensible)
                        fileStructure.extensible = fileStruc.extensible;
                    if (fileStruc.implements) {
                        let splits = fileStruc.implements.split(',');
                        for (const split of splits) {
                            fileStructure.implements.push(split.trim());
                        }
                    }
                    if (fileStruc.abstract)
                        fileStructure.abstract = fileStruc.abstract;
                    if (fileStruc.extends)
                        fileStructure.extends = fileStruc.extends;
                    if (fileStruc.controller)
                        fileStructure.controller = fileStruc.controller;
                }
                else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'attribute') {
                    // Is on Attribute
                    let data = AuraParser.getTagData(tokens, index);
                    fileStructure.attributes.push(data.tagData);
                } else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'registerEvent') {
                    // Is on Events
                    let data = AuraParser.getTagData(tokens, index);
                    fileStructure.events.push(data.tagData);
                } else if (token.tokenType === TokenType.COLON && lastToken && lastToken.tokenType === TokenType.IDENTIFIER && lastToken.content === 'aura' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content === 'handler') {
                    // Is on Handlers
                    let data = AuraParser.getTagData(tokens, index);
                    fileStructure.handlers.push(data.tagData);
                }
            }
            index++;
        }
        return fileStructure;
    }

    static getTagData(tokens, index) {
        let data = {}
        let tagData = {};
        let isOnValue = false;
        let paramName;
        let paramValue = '';
        let token = tokens[index];
        while (token.tokenType !== 'rABracket') {
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

            } else if (token && token.tokenType === TokenType.QUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) {
                isOnValue = false;
                if (paramName)
                    tagData[paramName] = paramValue;
                paramName = undefined;
                paramValue = '';

            } else if (isOnValue) {
                paramValue += utils.getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;
            }
            index++;
        }
        data.tagData = tagData;
        data.index = index;
        return data;
    }

    static parseForPutAttributes(content, position){
        logger.log("content", content);
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
            if (token.content === 'v' && nextToken && nextToken.tokenType === TokenType.DOT)
                startColumn = token.startColumn;
            index++;
        }
        return {
            openBracket: openBracket,
            startColumn: startColumn
        };
    }

    static componentTagData(content){
        let componentTagData = {
            position: {
                line: -1,
                character: ""
            },
            namespace: "",
            name: "",
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
                let data = AuraParser.getTagData(componentTokens, index);
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