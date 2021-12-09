import * as vscode from 'vscode';
import { Config } from "../core/config";
import { Paths } from '../core/paths';
import { MarkDownStringBuilder } from '../output';
import { TemplateUtils } from '../utils/templateUtils';
import { applicationContext } from '../core/applicationContext';
import { ActivationToken, ActivationType, NodeInfo, ProviderActivationInfo } from '../core/types';
import { LanguageUtils, System, Apex, XML } from '@aurahelper/languages';
import { CoreUtils, TokenTypes, FileChecker, FileReader, Token, ApexNodeTypes } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
const StrUtils = CoreUtils.StrUtils;
const Tokenizer = System.Tokenizer;
const ApexParser = Apex.ApexParser;
const XMLParser = XML.XMLParser;
const Range = vscode.Range;
const Position = vscode.Position;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const SnippetString = vscode.SnippetString;

export class ProviderUtils {

    static fixPositionOffset(document: vscode.TextDocument, position: vscode.Position): vscode.Position {
        const insertSpaces = Config.insertSpaces();
        const line = document.lineAt(position.line);
        const nTabs = countStartTabs(line.text);
        const nWS = StrUtils.countStartWhitespaces(line.text);
        const tabSize = Config.getTabSize();
        const lineLenght = (line.text.length - 1) + ((nTabs * Number(tabSize)) - nTabs);
        const difference = (lineLenght > line.range.end.character) ? lineLenght - line.range.end.character : 0;
        if (difference > 0) {
            return new Position(position.line, position.character + difference);
        }
        return position;
        /*if (!insertSpaces) {
            if (nTabs > 0)
                return new Position(position.line, position.character + ((nTabs * Number(tabSize)) - nTabs));
            else
                return position;
        } else {
            if (nTabs > 0)
                return new Position(position.line, position.character + ((nTabs * Number(tabSize)) - nTabs));
            else
                return position;
        }*/

    }

    static getFieldData(sObject: any, fieldName: string): any {
        if (sObject && sObject.fields) {
            return sObject.fields[fieldName.toLowerCase()];
        }
        return undefined;
    }

    static getSimilar(list: string[], source: string) {
        const similar: any = {
            similarToLower: [],
            similar: [],
            similarMap: {}
        };
        source = source.toLowerCase();
        for (const name of list) {
            if (name && name.toLowerCase().indexOf(source) !== -1) {
                similar.similarToLower.push(name.toLowerCase());
            }
            similar.similar.push(name);
            similar.similarMap[name.toLowerCase()] = name;
        }
        return similar;
    }

    static getApexActivation(document: vscode.TextDocument, position: vscode.Position, toIntelliSense: boolean): ProviderActivationInfo {
        const correctedPos = ProviderUtils.fixPositionOffset(document, position);
        const difference = correctedPos.character - position.character;
        const result: ProviderActivationInfo = {
            activation: "",
            activationTokens: [],
            startColumn: 0,
            lastToken: undefined,
            twoLastToken: undefined,
            nextToken: undefined,
            twoNextToken: undefined,
            tokens: [],
        };
        let activationWordTokens = [];
        let activationLastTokens = [];
        let lineNumber = correctedPos.line;
        let line = document.lineAt(lineNumber);
        let lineText = line.text;
        if (line.isEmptyOrWhitespace) {
            result.startColumn = correctedPos.character;
            return result;
        }
        let lineTokens = Tokenizer.tokenize(lineText, lineNumber);
        let index = 0;
        let tokenPos = -1;
        let token;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (token.range.end.character <= correctedPos.character && !toIntelliSense) {
                tokenPos = index;
            }
            if (correctedPos.character >= token.range.start.character && correctedPos.character <= token.range.end.character) {
                tokenPos = index;
                break;
            }
            index++;
        }
        let endLoop = false;
        if (tokenPos === -1) {
            result.startColumn = correctedPos.character;
            return result;
        }
        let parenIndent = 0;
        let aBracketIndent = 0;
        let sqBracketIndent = 0;
        let onParams = false;
        if (index >= lineTokens.length) {
            index = lineTokens.length - 1;
        }
        while (index >= 0) {
            token = lineTokens[index];
            const lastToken = LanguageUtils.getLastToken(lineTokens, index);
            const nextToken = LanguageUtils.getNextToken(lineTokens, index);
            const twoLastToken = LanguageUtils.getTwoLastToken(lineTokens, index);
            tokenPos = index;
            if (token.type === TokenTypes.IDENTIFIER) {
                if (lastToken && (lastToken.type === TokenTypes.IDENTIFIER || lastToken.type === TokenTypes.OPERATOR.LOGICAL.GREATER_THAN || token.type === TokenTypes.BRACKET.SQUARE_CLOSE || token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) && (!onParams && sqBracketIndent === 0)) {
                    break;
                }
            } else if (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR) {
            } else if (token.type === TokenTypes.BRACKET.SQUARE_OPEN) {
                sqBracketIndent--;
                if (sqBracketIndent < 0 && !onParams) {
                    index++;
                    tokenPos = index;
                    break;
                } /*else if (!token.pairToken) {
                    index++;
                    tokenPos = index;
                    break;
                }*/
            } else if (token.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                sqBracketIndent++;
            } else if (token.type === TokenTypes.OPERATOR.LOGICAL.LESS_THAN) {
                aBracketIndent--;
                if (aBracketIndent < 0 && !onParams) {
                    index++;
                    tokenPos = index;
                    break;
                }/* else if (!token.pairToken) {
                    index++;
                    tokenPos = index;
                    break;
                }*/
            } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                parenIndent--;
                if (parenIndent === 0) {
                    onParams = false;
                } else if (parenIndent < 0) {
                    index++;
                    tokenPos = index;
                    break;
                }
            } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                parenIndent++;
                if (parenIndent === 1) {
                    onParams = true;
                }
            } else if (token.type === TokenTypes.PUNCTUATION.COMMA && !onParams && aBracketIndent <= 0 && sqBracketIndent <= 0) {
                index++;
                tokenPos = index;
                break;
            } else if (onParams) {
            } else {
                if (!onParams && aBracketIndent === 0 && sqBracketIndent === 0) {
                    if (nextToken && (nextToken.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || nextToken.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR)) {
                        index += 2;
                        tokenPos = index;
                    } else {
                        index++;
                    }
                    tokenPos = index;
                    break;
                }
            }
            if (index === 0) {
                lineNumber--;
                let lineTmp = document.lineAt(lineNumber);
                while (lineTmp.isEmptyOrWhitespace) {
                    lineNumber--;
                    lineTmp = document.lineAt(lineNumber);
                }
                let lineTokensTmp = Tokenizer.tokenize(lineTmp.text, lineNumber);
                const finalTokenAux = lineTokensTmp[lineTokensTmp.length - 1];
                if (onParams || sqBracketIndent > 0 || aBracketIndent > 0) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokensTmp.concat(lineTokens);
                } else if ((finalTokenAux.type === TokenTypes.IDENTIFIER && (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR)) || (token.type === TokenTypes.IDENTIFIER && (finalTokenAux.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || finalTokenAux.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR))) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokensTmp.concat(lineTokens);
                } else if ((finalTokenAux.type === TokenTypes.BRACKET.SQUARE_CLOSE && token.type === TokenTypes.BRACKET.SQUARE_OPEN) || (token.type === TokenTypes.BRACKET.SQUARE_CLOSE && finalTokenAux.type === TokenTypes.BRACKET.SQUARE_OPEN)) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokensTmp.concat(lineTokens);
                } else {
                    index = -1;
                }
            } else {
                index--;
            }
        }
        token = lineTokens[tokenPos];
        result.lastToken = LanguageUtils.getLastToken(lineTokens, tokenPos);
        result.twoLastToken = LanguageUtils.getTwoLastToken(lineTokens, tokenPos);
        result.tokens = lineTokens;
        result.startColumn = (token) ? token.range.start.character : result.lastToken.range.end.character;
        endLoop = !token;
        parenIndent = 0;
        aBracketIndent = 0;
        sqBracketIndent = 0;
        onParams = false;
        let activeTokenFound = false;
        let activeTokenAdded = false;
        let activationTokens = [];
        let hasFrom = false;
        let hasSelect = false;
        if (!endLoop) {
            lineNumber = token.range.start.line;
        }
        while (!endLoop) {
            token = lineTokens[tokenPos];
            const nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
            const twoNextToken = LanguageUtils.getTwoNextToken(lineTokens, tokenPos);
            const lastToken = LanguageUtils.getLastToken(lineTokens, tokenPos);
            const twoLastToken = LanguageUtils.getTwoLastToken(lineTokens, tokenPos);
            if (!activeTokenFound && correctedPos.line === token.range.start.line) {
                if (correctedPos.character >= token.range.start.character && correctedPos.character <= token.range.end.character && (!nextToken || nextToken.range.start.line !== correctedPos.line)) {
                    activeTokenFound = true;
                } else if (correctedPos.character >= token.range.start.character && correctedPos.character < token.range.end.character && nextToken && nextToken.range.start.line === correctedPos.line) {
                    activeTokenFound = true;
                }

            }
            if (token.type === TokenTypes.IDENTIFIER) {
                if (lastToken && lastToken.type === TokenTypes.IDENTIFIER && (!onParams && sqBracketIndent === 0) && activationTokens.length > 0) {
                    endLoop = true;
                } else if (nextToken && twoNextToken && nextToken.text === '[' && twoNextToken.textToLower === 'select') {

                } else if (nextToken && twoNextToken && nextToken.text === '(' && (twoNextToken.textToLower === 'before' || twoNextToken.textToLower === 'after')) {
                    activationWordTokens.push(token);
                    if (activationLastTokens.length === 0) {
                        activationLastTokens.push(lastToken);
                        activationLastTokens.push(twoLastToken);
                    }
                    activationTokens.push(token);
                    endLoop = true;
                } else {
                    activationWordTokens.push(token);
                    if (activationLastTokens.length === 0) {
                        activationLastTokens.push(lastToken);
                        activationLastTokens.push(twoLastToken);
                    }
                    activationTokens.push(token);
                }
            } else if ((!onParams && sqBracketIndent === 0) && lastToken && lastToken.type === TokenTypes.IDENTIFIER && (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR)) {
                activationTokens.push(token);
                if (!onParams && activationWordTokens.length > 0) {
                    result.activationTokens.push({
                        activation: Token.toString(activationWordTokens).trim(),
                        active: !activeTokenAdded ? activeTokenFound : false,
                        startToken: activationWordTokens[0],
                        endToken: activationWordTokens[activationWordTokens.length - 1],
                        lastToken: activationLastTokens[0],
                        twoLastToken: activationLastTokens[1],
                        nextToken: token,
                        twoNextToken: nextToken,
                        isQuery: hasSelect,
                    });
                    if (activeTokenFound) {
                        activeTokenAdded = true;
                    }
                    activationWordTokens = [];
                    activationLastTokens = [];
                    hasSelect = false;
                    hasFrom = false;
                }
            } else if ((!onParams && sqBracketIndent === 0) && nextToken && nextToken.type === TokenTypes.IDENTIFIER && (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR)) {
                activationTokens.push(token);
                if (!onParams && activationWordTokens.length > 0) {
                    result.activationTokens.push({
                        activation: Token.toString(activationWordTokens).trim(),
                        active: !activeTokenAdded ? activeTokenFound : false,
                        startToken: activationWordTokens[0],
                        endToken: activationWordTokens[activationWordTokens.length - 1],
                        lastToken: activationLastTokens[0],
                        twoLastToken: activationLastTokens[1],
                        nextToken: token,
                        twoNextToken: nextToken,
                        isQuery: hasSelect,
                    });
                    if (activeTokenFound) {
                        activeTokenAdded = true;
                    }
                    activationWordTokens = [];
                    activationLastTokens = [];
                    hasSelect = false;
                    hasFrom = false;
                }
            } else if (token.type === TokenTypes.BRACKET.SQUARE_OPEN) {
                sqBracketIndent++;
                activationTokens.push(token);
                activationWordTokens.push(token);
                if (activationLastTokens.length === 0) {
                    activationLastTokens.push(lastToken);
                    activationLastTokens.push(twoLastToken);
                }
            } else if (token.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                sqBracketIndent--;
                if (sqBracketIndent >= 0) {
                    activationTokens.push(token);
                    activationWordTokens.push(token);
                    if (activationLastTokens.length === 0) {
                        activationLastTokens.push(lastToken);
                        activationLastTokens.push(twoLastToken);
                    }
                }
                if (sqBracketIndent < 0 && !onParams) {
                    endLoop = true;
                }
            } else if (token.type === TokenTypes.OPERATOR.LOGICAL.LESS_THAN) {
                aBracketIndent++;
                activationTokens.push(token);
                activationWordTokens.push(token);
                if (activationLastTokens.length === 0) {
                    activationLastTokens.push(lastToken);
                    activationLastTokens.push(twoLastToken);
                }
            } else if (token.type === TokenTypes.OPERATOR.LOGICAL.GREATER_THAN) {
                aBracketIndent--;
                if (aBracketIndent >= 0) {
                    activationTokens.push(token);
                    activationWordTokens.push(token);
                    if (activationLastTokens.length === 0) {
                        activationLastTokens.push(lastToken);
                        activationLastTokens.push(twoLastToken);
                    }
                }
                if (aBracketIndent === 0 && !onParams && (!nextToken || nextToken.type !== TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_OPEN)) {
                    endLoop = true;
                } else if (aBracketIndent < 0) {
                    endLoop = true;
                }
            } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                parenIndent++;
                if (parenIndent === 1) {
                    onParams = true;
                }
                activationTokens.push(token);
                activationWordTokens.push(token);
                if (activationLastTokens.length === 0) {
                    activationLastTokens.push(lastToken);
                    activationLastTokens.push(twoLastToken);
                }
            } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                parenIndent--;
                if (parenIndent === 0) {
                    onParams = false;
                    if ((!nextToken || (nextToken.type !== TokenTypes.PUNCTUATION.OBJECT_ACCESSOR && nextToken.type !== TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR))) {
                        result.nextToken = nextToken;
                        result.twoNextToken = twoNextToken;
                        endLoop = true;
                    }
                }
                if (parenIndent >= 0) {
                    activationTokens.push(token);
                    activationWordTokens.push(token);
                    if (activationLastTokens.length === 0) {
                        activationLastTokens.push(lastToken);
                        activationLastTokens.push(twoLastToken);
                    }
                }
            } else if (onParams) {
                activationTokens.push(token);
                activationWordTokens.push(token);
                if (activationLastTokens.length === 0) {
                    activationLastTokens.push(lastToken);
                    activationLastTokens.push(twoLastToken);
                }
            } else if (!onParams && aBracketIndent === 0 && sqBracketIndent === 0) {
                result.nextToken = nextToken;
                result.twoNextToken = twoNextToken;
                endLoop = true;
            } else {
                activationTokens.push(token);
                activationWordTokens.push(token);
                if (activationLastTokens.length === 0) {
                    activationLastTokens.push(lastToken);
                    activationLastTokens.push(twoLastToken);
                }
            }
            if (sqBracketIndent > 0) {
                if (token.type === TokenTypes.IDENTIFIER && token.textToLower === 'select') {
                    hasSelect = true;
                }
                if (hasSelect && token.type === TokenTypes.IDENTIFIER && token.textToLower === 'from') {
                    hasFrom = true;
                }
            }
            if (toIntelliSense && activeTokenFound) {
                endLoop = true;
            } else if (!endLoop && tokenPos === lineTokens.length - 1) {
                lineNumber++;
                let lineTmp = document.lineAt(lineNumber);
                while (lineTmp.isEmptyOrWhitespace) {
                    lineNumber++;
                    lineTmp = document.lineAt(lineNumber);
                }
                tokenPos = lineTokens.length;
                let lineTokensTmp = Tokenizer.tokenize(lineTmp.text, lineNumber);
                const firstTokenAux = lineTokensTmp[0];
                if (onParams || sqBracketIndent > 0 || aBracketIndent > 0) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokens.concat(lineTokensTmp);
                } else if ((firstTokenAux.type === TokenTypes.IDENTIFIER && (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR)) || (token.type === TokenTypes.IDENTIFIER && (firstTokenAux.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || firstTokenAux.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR))) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokens.concat(lineTokensTmp);
                } else if ((firstTokenAux.type === TokenTypes.BRACKET.SQUARE_CLOSE && token.type === TokenTypes.BRACKET.SQUARE_OPEN) || (token.type === TokenTypes.BRACKET.SQUARE_CLOSE && firstTokenAux.type === TokenTypes.BRACKET.SQUARE_OPEN)) {
                    index = lineTokensTmp.length - 1;
                    lineTokens = lineTokens.concat(lineTokensTmp);
                } else {
                    endLoop = true;
                }
            } else if (!endLoop) {
                tokenPos++;
            }
        }
        const nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
        const twoNextToken = LanguageUtils.getTwoNextToken(lineTokens, tokenPos);
        if (activationWordTokens.length > 0) {
            result.activationTokens.push({
                activation: Token.toString(activationWordTokens).trim(),
                active: !activeTokenAdded ? activeTokenFound : false,
                startToken: activationWordTokens[0],
                endToken: activationWordTokens[activationWordTokens.length - 1],
                lastToken: activationLastTokens[0],
                twoLastToken: activationLastTokens[1],
                nextToken: nextToken,
                twoNextToken: twoNextToken,
                isQuery: hasSelect,
            });
            if (activeTokenFound) {
                activeTokenAdded = true;
            }
        }
        result.activation = Token.toString(activationTokens, true);
        if (difference > 0 && result.startColumn >= difference) {
            result.startColumn = result.startColumn - difference;
        }
        return result;
    }

    static getActivation(document: vscode.TextDocument, position: vscode.Position): ProviderActivationInfo {
        const correctedPos = ProviderUtils.fixPositionOffset(document, position);
        const difference = correctedPos.character - position.character;
        const result: ProviderActivationInfo = {
            activation: "",
            activationTokens: [],
            startColumn: 0,
            lastToken: undefined,
            twoLastToken: undefined,
            nextToken: undefined,
            twoNextToken: undefined,
        };
        let activationTokens = [];
        const line = document.lineAt(correctedPos.line);
        const lineText = line.text;
        if (line.isEmptyOrWhitespace) {
            result.startColumn = correctedPos.character;
            return result;
        }
        const lineTokens = Tokenizer.tokenize(lineText);
        let index = 0;
        let tokenPos = -1;
        let token;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (token.range.end.character <= correctedPos.character) {
                tokenPos = index;
            }
            if (correctedPos.character >= token.range.start.character && correctedPos.character <= token.range.end.character) {
                tokenPos = index;
                break;
            }
            index++;
        }
        if (token && token.type === TokenTypes.BRACKET.CURLY_CLOSE) {
            tokenPos--;
        }
        let endLoop = false;
        let isOnParams = false;
        let parenIndent = 0;
        if (tokenPos === -1) {
            result.startColumn = correctedPos.character;
            return result;
        }
        result.nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
        result.twoNextToken = LanguageUtils.getTwoNextToken(lineTokens, tokenPos);
        while (!endLoop) {
            token = lineTokens[tokenPos];
            const nextToken = LanguageUtils.getNextToken(lineTokens, tokenPos);
            const lastToken = LanguageUtils.getLastToken(lineTokens, tokenPos);
            const twoLastToken = LanguageUtils.getTwoLastToken(lineTokens, tokenPos);
            if (token && token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                parenIndent++;
                if (parenIndent === 1) {
                    isOnParams = true;
                }
                result.activation = token.text + result.activation;
                result.startColumn = token.range.start.character;
                result.lastToken = lastToken;
                result.twoLastToken = twoLastToken;
                activationTokens.push(token);
            } else if (token && token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                parenIndent--;
                if (parenIndent === 0) {
                    isOnParams = false;
                } else if (parenIndent < 0) {
                    isOnParams = false;
                    endLoop = true;
                }
                if (!endLoop) {
                    result.activation = token.text + result.activation;
                    result.startColumn = token.range.start.character;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    activationTokens.push(token);
                }
            } else if (token && (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR || token.type === TokenTypes.IDENTIFIER || token.type === TokenTypes.PUNCTUATION.COLON || isOnParams)) {
                if (!isOnParams) {
                    if (lastToken && lastToken.range.end.character !== token.range.start.character) {
                        endLoop = true;
                        result.activation = token.text + result.activation;
                        result.startColumn = token.range.start.character;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                    } else {
                        result.activation = token.text + result.activation;
                        result.startColumn = token.range.start.character;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                    }
                    if (token.type === TokenTypes.PUNCTUATION.OBJECT_ACCESSOR || token.type === TokenTypes.PUNCTUATION.SAFE_OBJECT_ACCESSOR) {
                        if (activationTokens.length > 0) {
                            activationTokens.reverse();
                            result.activationTokens.push({
                                activation: Token.toString(activationTokens).trim(),
                                startToken: activationTokens[0],
                                endToken: activationTokens[activationTokens.length - 1]
                            });
                        }
                        activationTokens = [];
                    } else {
                        activationTokens.push(token);
                    }
                } else {
                    result.activation = token.text + result.activation;
                    result.startColumn = token.range.start.character;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    activationTokens.push(token);
                }
            } else if (!isOnParams && token && (token.type === TokenTypes.PUNCTUATION.COMMA || token.type === TokenTypes.PUNCTUATION.QUOTTES || token.type === TokenTypes.PUNCTUATION.QUOTTES_END || token.type === TokenTypes.PUNCTUATION.QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                endLoop = true;
                result.lastToken = lastToken;
                result.twoLastToken = twoLastToken;
                result.startColumn = correctedPos.character;
                if (token.type === TokenTypes.PUNCTUATION.QUOTTES || token.type === TokenTypes.PUNCTUATION.QUOTTES_END || token.type === TokenTypes.PUNCTUATION.QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_END) {
                    if (nextToken && (nextToken.type === TokenTypes.PUNCTUATION.QUOTTES || nextToken.type === TokenTypes.PUNCTUATION.QUOTTES_END || nextToken.type === TokenTypes.PUNCTUATION.QUOTTES_START || nextToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES || nextToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_START || nextToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                        endLoop = true;
                        result.lastToken = lastToken;
                        result.twoLastToken = twoLastToken;
                        result.startColumn = nextToken.range.start.character;
                    }
                }
            } else if (token.type === TokenTypes.BRACKET.CURLY_OPEN) {
                endLoop = true;
            } else if (token.type === TokenTypes.PUNCTUATION.QUOTTES || token.type === TokenTypes.PUNCTUATION.QUOTTES_END || token.type === TokenTypes.PUNCTUATION.QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_START || token.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_END) {
                if (lastToken && (lastToken.type === TokenTypes.PUNCTUATION.QUOTTES || lastToken.type === TokenTypes.PUNCTUATION.QUOTTES_END || lastToken.type === TokenTypes.PUNCTUATION.QUOTTES_START || lastToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES || lastToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_START || lastToken.type === TokenTypes.PUNCTUATION.DOUBLE_QUOTTES_END)) {
                    endLoop = true;
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                }
            } else if (token.type === TokenTypes.LITERAL.STRING) {
                if (lastToken && lastToken.range.end.character === token.range.start.character) {
                    result.activation = token.text + result.activation;
                    activationTokens.push(token);
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                } else {
                    result.lastToken = lastToken;
                    result.twoLastToken = twoLastToken;
                    result.startColumn = token.range.start.character;
                    result.activation = token.text + result.activation;
                    activationTokens.push(token);
                    endLoop = true;
                }
            }
            tokenPos--;
            if (tokenPos < 0) {
                endLoop = true;
            }
        }
        if (activationTokens.length > 0) {
            activationTokens.reverse();
            result.activationTokens.push({
                activation: Token.toString(activationTokens).trim(),
                startToken: activationTokens[0],
                endToken: activationTokens[activationTokens.length - 1]
            });
        }
        result.activationTokens.reverse();
        if (result.activationTokens.length > 0) {
            result.startColumn = result.activationTokens[0].startToken.range.start.character;
        }
        if (difference > 0 && result.startColumn >= difference) {
            result.startColumn = result.startColumn - difference;
        }
        return result;
    }

    static getSObjectFieldCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], sObject: any, field: any, positionData: any): vscode.CompletionItem[] {
        if (!sObject || !field) {
            return [];
        }
        let items: vscode.CompletionItem[] = [];
        let pickItems: vscode.CompletionItem[] = [];
        let itemRel: vscode.CompletionItem | undefined;
        let detail = sObject.name + ' Field';
        const documentation = new MarkDownStringBuilder();
        const relDocumentation = new MarkDownStringBuilder();
        let label = StrUtils.replace(field.label, '.field-meta.xml', '');
        label = label.endsWith('Id') ? label.substring(0, label.length - 2) : label;
        let doc = (field.description) ? field.description + '\n\n' : '';
        if (!field.description && field.inlineHelpText && field.inlineHelpText !== 'null') {
            doc = (field.inlineHelpText) ? field.inlineHelpText + '\n\n' : '';
        }
        doc += "  - **Label**: `" + label + '`  \n';
        if (field.length) {
            doc += "  - **Length**: `" + field.length + '`  \n';
        }
        if (field.type) {
            doc += "  - **Type**: `" + field.type + '`  \n';
        }
        if (field.custom !== undefined) {
            doc += "  - **Is Custom**: `" + field.custom + '`  \n';
        }
        if (field.inlineHelpText && field.inlineHelpText !== 'null') {
            doc += "  - **Inline Help**: `" + field.inlineHelpText + '`  \n';
        }
        if (field.referenceTo.length > 0) {
            doc += "  - **Reference To**: `" + field.referenceTo.join(", ") + '`\n';
            let name = field.name;
            if (name.endsWith('__c')) {
                name = name.substring(0, name.length - 3) + '__r';
                relDocumentation.appendApexCodeBlock(sObject.name + '.' + name);
                relDocumentation.appendMarkdown('Relationship with ' + field.referenceTo.join(", ") + ' SObject(s) \n\n');
                relDocumentation.appendMarkdown(doc + '\n\n');
                const options = ProviderUtils.getCompletionItemOptions(sObject.name + " Lookup Field", relDocumentation.build(), name, true, CompletionItemKind.Field);
                itemRel = ProviderUtils.createItemForCompletion(name, options);
            } else if (name.endsWith('Id')) {
                name = name.substring(0, name.length - 2);
                relDocumentation.appendApexCodeBlock(sObject.name + '.' + name);
                relDocumentation.appendMarkdown('Relationship with ' + field.referenceTo.join(", ") + ' SObject(s) \n\n');
                relDocumentation.appendMarkdown(doc + '\n\n');
                const options = ProviderUtils.getCompletionItemOptions(sObject.name + " Lookup Field", relDocumentation.build(), name, true, CompletionItemKind.Field);
                itemRel = ProviderUtils.createItemForCompletion(name, options);
            }
        }
        if (applicationContext.sfData.serverInstance) {
            doc += '\n\n[Lightning Setup](' + applicationContext.sfData.serverInstance + '/lightning/setup/ObjectManager/' + sObject.name + '/FieldsAndRelationships/view)';
        }
        documentation.appendApexCodeBlock(sObject.name + '.' + field.name).appendMarkdown(detail + '\n\n').appendMarkdown(doc + '\n\n');
        if (field.picklistValues.length > 0) {
            pickItems = [];
            documentation.appendMarkdownH4('Picklist Values');
            for (const pickVal of field.picklistValues) {
                if (activationTokens.length <= 3 && activationTokens.length > 0 && activationTokens[0].activation.toLowerCase() === sObject.name.toLowerCase()) {
                    const pickDocumentation = new MarkDownStringBuilder();
                    pickDocumentation.appendApexCodeBlock(sObject.name + '.' + field.name);
                    let pickDoc = "  - **Value**: `" + pickVal.value + '`  \n';
                    pickDoc += "  - **Label**: `" + pickVal.label + '`  \n';
                    pickDoc += "  - **Active**: `" + pickVal.active + '`  \n';
                    pickDoc += "  - **Is Default**: `" + pickVal.defaultValue + '`';
                    let pickValue;
                    if (positionData && positionData.onText) {
                        pickValue = pickVal.value;
                    } else if (positionData && (positionData.source === 'Apex') && (!positionData.lastToken || positionData.lastToken.text !== "'") && (!positionData.nextToken || positionData.nextToken.text !== "'")) {
                        pickValue = "'" + pickVal.value + "'";
                    } else if (positionData && (positionData.source === 'Aura') && (!positionData.lastToken || positionData.lastToken.text !== '"') && (!positionData.nextToken || positionData.nextToken.text !== '"')) {
                        pickValue = '"' + pickVal.value + '"';
                    } else if (positionData && (positionData.source === 'JS') && (!positionData.lastToken || (positionData.lastToken.text !== "'" && positionData.lastToken.text !== '"')) && (!positionData.nextToken || (positionData.nextToken.text !== "'" && positionData.nextToken.text !== '"'))) {
                        pickValue = "'" + pickVal.value + "'";
                    } else {
                        pickValue = pickVal.value;
                    }
                    pickDocumentation.appendMarkdown('`' + field.name + '` Picklist Value. Select this option to replace with the picklist value. Replace `' + ProviderUtils.joinActivationTokens(activationTokens, '.') + '` with `' + pickValue + '`\n\n');
                    pickDocumentation.appendMarkdown(pickDoc + '\n\n');
                    pickDocumentation.appendMarkdownSeparator();
                    pickDocumentation.appendMarkdownH4('Snippet');
                    pickDocumentation.appendApexCodeBlock(pickValue);
                    const options = ProviderUtils.getCompletionItemOptions('Picklist Value', pickDocumentation.build(), pickValue.toString(), false, CompletionItemKind.Value);
                    const pickItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + field.name + '.' + pickVal.value.toString(), options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                        pickItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    }
                    pickItems.push(pickItem);
                }
                documentation.appendMarkdown('  - `' + pickVal.value + "` (" + pickVal.label + ")  \n");
            }
        }
        const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), field.name, true, CompletionItemKind.Field);
        const item = ProviderUtils.createItemForCompletion(field.name, options);
        items.push(item);
        if (itemRel) {
            items.push(itemRel);
        }
        if (pickItems.length > 0) {
            items = items.concat(pickItems);
            pickItems = [];
        }
        return items;
    }

    static getSobjectCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], sObject: any, positionData: any): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];
        if (sObject && sObject.fields) {
            const existingFields = [];
            if (positionData && positionData.query) {
                for (const projectionField of positionData.query.projection) {
                    existingFields.push(projectionField.name.toLowerCase());
                }
            }
            for (const fieldKey of Object.keys(sObject.fields)) {
                const field = sObject.fields[fieldKey];
                if (existingFields.includes(fieldKey)) {
                    if (!StrUtils.contains(fieldKey, '.') && fieldKey.endsWith('__c')) {
                        continue;
                    }
                    if (!field.referenceTo || field.referenceTo.length === 0) {
                        continue;
                    }
                }
                items = items.concat(ProviderUtils.getSObjectFieldCompletionItems(position, activationInfo, activationTokens, sObject, field, positionData));
            }
            if (Utils.hasKeys(sObject.recordTypes) && activationTokens.length <= 2 && activationTokens.length > 0 && activationTokens[0].activation.toLowerCase() === sObject.name.toLowerCase()) {
                for (const rtKey of Object.keys(sObject.recordTypes)) {
                    const rtNameDocumentation = new MarkDownStringBuilder();
                    const rtDevNameDocumentation = new MarkDownStringBuilder();
                    const rt = sObject.recordTypes[rtKey];
                    rtNameDocumentation.appendApexCodeBlock(sObject.name + '.' + rt.name);
                    rtDevNameDocumentation.appendApexCodeBlock(sObject.name + '.' + rt.developerName);
                    let rtDoc = "  - **Name**: `" + rt.name + '`\n';
                    rtDoc += "  - **Developer Name**: `" + rt.developerName + '`\n';
                    if (rt.default !== undefined) {
                        rtDoc += "  - **Default**: `" + rt.default + '`\n';
                    }
                    if (rt.master !== undefined) {
                        rtDoc += "  - **Master**: `" + rt.master + '`';
                    }
                    let nameValue;
                    let devNameValue;
                    if (positionData && positionData.onText) {
                        nameValue = rt.name;
                        devNameValue = rt.developerName;
                    } else if (positionData && (positionData.source === 'Apex') && (!positionData.lastToken || positionData.lastToken.text !== "'") && (!positionData.nextToken || positionData.nextToken.text !== "'")) {
                        nameValue = "'" + rt.name + "'";
                        devNameValue = "'" + rt.developerName + "'";
                    } else if (positionData && (positionData.source === 'Aura') && (!positionData.lastToken || positionData.lastToken.text !== '"') && (!positionData.nextToken || positionData.nextToken.text !== '"')) {
                        nameValue = '"' + rt.name + '"';
                        devNameValue = '"' + rt.developerName + '"';
                    } else if (positionData && (positionData.source === 'JS') && (!positionData.lastToken || (positionData.lastToken.text !== "'" && positionData.lastToken.text !== '"')) && (!positionData.nextToken || (positionData.nextToken.text !== "'" && positionData.nextToken.text !== '"'))) {
                        nameValue = "'" + rt.name + "'";
                        devNameValue = "'" + rt.developerName + "'";
                    } else {
                        nameValue = rt.name;
                        devNameValue = rt.developerName;
                    }
                    rtNameDocumentation.appendMarkdown('`' + rt.name + '` Record Type Name. Select this option to replace with the record type name value. Replace `' + ProviderUtils.joinActivationTokens(activationTokens, '.') + '` with `' + nameValue + '`\n\n');
                    rtDevNameDocumentation.appendMarkdown('`' + rt.developerName + '` Record Type Developer Name. Select this option to replace with the record type developer name value. Replace `' + ProviderUtils.joinActivationTokens(activationTokens, '.') + '` with `' + devNameValue + '`\n\n');
                    rtNameDocumentation.appendMarkdown(rtDoc);
                    rtDevNameDocumentation.appendMarkdown(rtDoc);
                    rtNameDocumentation.appendMarkdownSeparator();
                    rtNameDocumentation.appendMarkdownH4('Snippet');
                    rtNameDocumentation.appendApexCodeBlock(nameValue);
                    rtDevNameDocumentation.appendMarkdownSeparator();
                    rtDevNameDocumentation.appendMarkdownH4('Snippet');
                    rtDevNameDocumentation.appendApexCodeBlock(devNameValue);
                    const nameOptions = ProviderUtils.getCompletionItemOptions('Record Type Name', rtNameDocumentation.build(), nameValue, false, CompletionItemKind.Value);
                    const nameRtItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + rt.name, nameOptions);
                    const devNameoptions = ProviderUtils.getCompletionItemOptions('Record Type Developer Name', rtNameDocumentation.build(), devNameValue, false, CompletionItemKind.Value);
                    const devNameRtItem = ProviderUtils.createItemForCompletion(sObject.name + '.' + rt.developerName, devNameoptions);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                        nameRtItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    }
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                        devNameRtItem.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    }
                    items.push(nameRtItem);
                    items.push(devNameRtItem);
                }
            }
            if (!positionData || !positionData.query) {
                const systemMetadata = (applicationContext.parserData.namespacesData) ? applicationContext.parserData.namespacesData['system'] : undefined;
                if (systemMetadata && systemMetadata['sobject']) {
                    items = items.concat(ProviderUtils.getApexClassCompletionItems(position, systemMetadata['sobject']));
                }
            }
        }
        return items;
    }

    static getQueryCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], positionData: any): vscode.CompletionItem[] {
        if (!Config.getConfig().autoCompletion!.activeQuerySuggestion) {
            return [];
        }
        let sObjects = applicationContext.parserData.sObjectsData;
        let items: vscode.CompletionItem[] = [];
        let sObject = positionData.query.from ? sObjects[positionData.query.from.textToLower] : undefined;
        if (sObject) {
            const existingFields = [];
            for (const projectionField of positionData.query.projection) {
                existingFields.push(projectionField.name.toLowerCase());
            }
            if (activationTokens.length > 0) {
                for (const activationToken of activationTokens) {
                    if (!activationToken) {
                        continue;
                    }
                    let actToken = activationToken.activation;
                    let fielData;
                    let idField = actToken + 'Id';
                    if (actToken.endsWith('__r')) {
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    }
                    fielData = ProviderUtils.getFieldData(sObject, idField.toLowerCase()) || ProviderUtils.getFieldData(sObject, actToken);
                    if (fielData) {
                        if (fielData.referenceTo.length === 1) {
                            sObject = sObjects[fielData.referenceTo[0].toLowerCase()];
                        } else {
                            sObject = undefined;
                        }
                    }
                }
            }
            if (sObject) {
                for (const fieldKey of Object.keys(sObject.fields)) {
                    const field = sObject.fields[fieldKey];
                    if (existingFields.includes(fieldKey)) {
                        if (!StrUtils.contains(fieldKey, '.') && fieldKey.endsWith('__c')) {
                            continue;
                        }
                        if (!field.referenceTo || field.referenceTo.length === 0) {
                            continue;
                        }
                    }
                    items = items.concat(ProviderUtils.getSObjectFieldCompletionItems(position, activationInfo, activationTokens, sObject, field, positionData));
                }
            }
        } else {
            Object.keys(applicationContext.parserData.sObjectsData).forEach(function (key) {
                const sObject = applicationContext.parserData.sObjectsData[key];
                const documentation = new MarkDownStringBuilder();
                let description = 'Standard SObject';
                if (sObject.custom) {
                    description = 'Custom SObject';
                }
                if (sObject.namespace) {
                    description += '\n\nNamespace: ' + sObject.namespace;
                }
                documentation.appendApexCodeBlock(sObject.name);
                documentation.appendMarkdown(description);
                const options = ProviderUtils.getCompletionItemOptions('SObject', documentation.build(), sObject.name, true, CompletionItemKind.Class);
                const item = ProviderUtils.createItemForCompletion(sObject.name, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            });
        }
        return items;
    }

    static getActivationType(actToken: string): ActivationType {
        let memberData: ActivationType | undefined;
        if (actToken.indexOf('(') !== -1 && actToken.indexOf(')') !== -1) {
            const name = actToken.split("(")[0].toLowerCase();
            const params = actToken.substring(actToken.indexOf("(") + 1, actToken.indexOf(")"));
            const paramTokens = Tokenizer.tokenize(params);
            let methodParams = [];
            let parenIndent = 0;
            let aBracketIndent = 0;
            let sqBracketIndent = 0;
            let methodParamTokens = [];
            for (let i = 0; i < paramTokens.length; i++) {
                const token = paramTokens[i];
                if (token.type === TokenTypes.BRACKET.SQUARE_OPEN) {
                    sqBracketIndent++;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                    sqBracketIndent--;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.OPERATOR.LOGICAL.LESS_THAN) {
                    aBracketIndent--;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.OPERATOR.LOGICAL.GREATER_THAN) {
                    aBracketIndent++;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_OPEN) {
                    parenIndent++;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.OPERATOR.PRIORITY.PARENTHESIS_CLOSE) {
                    parenIndent--;
                    methodParamTokens.push(token);
                } else if (token.type === TokenTypes.PUNCTUATION.COMMA) {
                    if (parenIndent === 0 && aBracketIndent === 0 && sqBracketIndent === 0) {
                        methodParams.push(Token.toString(methodParamTokens));
                        methodParamTokens = [];
                    } else {
                        methodParamTokens.push(token);
                    }
                } else {
                    methodParamTokens.push(token);
                }

            }
            if (methodParamTokens.length > 0) {
                methodParams.push(Token.toString(methodParamTokens));
                methodParamTokens = [];
            }
            memberData = {
                type: "method",
                name: name,
                params: methodParams
            };

        } else {
            memberData = {
                type: "field",
                name: actToken
            };
        }
        return memberData;
    }

    static getAttribute(component: any, attributeName: string): any {
        if (component) {
            for (const attribute of component.attributes) {
                if (Utils.isString(attribute.name) && attribute.name === attributeName) {
                    return attribute;
                } else if (Utils.isObject(attribute.name) && attribute.name.value.text === attributeName) {
                    return attribute;
                }
            }
        }
        return undefined;
    }

    static getVariable(method: any, varName: string): any {
        if (method) {
            if (StrUtils.contains(varName, '[')) {
                varName = varName.split('[')[0];
            }
            if (method.params[varName]) {
                return method.params[varName];
            }
            if (method.variables[varName]) {
                return method.variables[varName];
            }
        }
        return undefined;
    }

    static getClassField(node: any, varName: string): any {
        if (node) {
            if (StrUtils.contains(varName, '[')) {
                varName = varName.split('[')[0];
            }
            return node.variables[varName.toLowerCase()];
        }
        return undefined;
    }

    static getQueryFromFirstToken(node: any, queryFirstToken: any): any {
        if (node && node.queries && node.queries.length > 0) {
            for (const query of node.queries) {
                if (query.startToken.range.start.line === queryFirstToken.range.start.line && query.startToken.range.start.character === queryFirstToken.range.start.character) {
                    return query;
                }
            }
        }
        return undefined;
    }

    static getMethod(node: any, methodSignature: any): undefined {
        if (node) {
            if (node.methods[methodSignature.toLowerCase()]) {
                return node.methods[methodSignature.toLowerCase()];
            } else if (node.constructors[methodSignature.toLowerCase()]) {
                return node.constructors[methodSignature.toLowerCase()];
            }
        }
        return undefined;
    }

    static isStaticMember(member: any): any {
        if (member.isStatic) {
            return true;
        }
        if (member.signature && member.signature.toLowerCase().indexOf(' static ') !== -1) {
            return true;
        }
        return false;
    }

    static isSObject(objectName: string): boolean {
        const sObjects = applicationContext.parserData.sObjects;
        const SObj = applicationContext.parserData.sObjectsData[objectName.toLowerCase()];
        return SObj || (sObjects && sObjects.includes(objectName.toLowerCase()));
    }

    static isUserClass(className: string): boolean {
        const classes = applicationContext.parserData.userClassesData;
        return classes && classes[className.toLowerCase()];
    }

    static isSystemClass(className: string): boolean {
        const classes = (applicationContext.parserData.namespacesData) ? applicationContext.parserData.namespacesData['system'] : undefined;
        return classes && classes[className.toLowerCase()];
    }

    static getSystemClass(ns: string, className: string): any {
        if (applicationContext.parserData.namespacesData && applicationContext.parserData.namespacesData[ns.toLowerCase()]) {
            return applicationContext.parserData.namespacesData[ns.toLowerCase()][className];
        }
        return undefined;
    }

    static isOnPosition(position: vscode.Position, lastToken: any, token: any, nextToken: any): boolean {
        if (position && token.line === position.line) {
            if (token.startColumn <= position.character && position.character <= nextToken.startColumn) {
                return true;
            }
        } else if (position && lastToken && lastToken.line < position.line && nextToken && position.line < nextToken.line) {
            return true;
        }
        return false;
    }

    static getActiveActivationToken(activationInfo: ProviderActivationInfo): ActivationToken | undefined {
        let active = undefined;
        if (activationInfo.activationTokens.length > 0) {
            for (const activation of activationInfo.activationTokens) {
                active = activation;
                if (activation.active) {
                    break;
                }
            }
        }
        return active;
    }

    static getNodeInformation(node: any, activationInfo: ProviderActivationInfo, toIntelliSense?: boolean): NodeInfo | undefined {
        const parser = new ApexParser().setSystemData(applicationContext.parserData);
        const systemMetadata = (applicationContext.parserData.namespacesData) ? applicationContext.parserData.namespacesData['system'] : undefined;
        let method;
        let methodVar;
        let classVar;
        let sObject;
        let label;
        let labels;
        let sObjectField;
        let sObjectFieldName;
        let namespace;
        let lastNode = node;
        let datatype;
        if (activationInfo.activationTokens.length > 0) {
            if (applicationContext.parserData.userClassesData) {
                lastNode = applicationContext.parserData.userClassesData[activationInfo.activationTokens[0].activation.toLowerCase()];
            }
            if (!lastNode && systemMetadata) {
                lastNode = systemMetadata[activationInfo.activationTokens[0].activation.toLowerCase()];
            }
            if (!lastNode && applicationContext.parserData.namespacesData) {
                lastNode = applicationContext.parserData.namespacesData[activationInfo.activationTokens[0].activation.toLowerCase()];
            }
            if (!lastNode && applicationContext.parserData.sObjectsData) {
                lastNode = applicationContext.parserData.sObjectsData[activationInfo.activationTokens[0].activation.toLowerCase()];
            }
            if (!lastNode) {
                lastNode = node;
            }
            if (node && lastNode && activationInfo.activationTokens[0].activation.toLowerCase() === node.name.toLowerCase()) {
                lastNode = node;
            }
        } else {
            if (lastNode.positionData && lastNode.positionData.query) {
                lastNode = parser.resolveDatatype(lastNode.positionData.query.from.textToLower);
            }
        }
        if (node && node.positionData && (node.positionData.nodeType === ApexNodeTypes.COMMENT || node.positionData.nodeType === ApexNodeTypes.BLOCK_COMMENT)) {
            return undefined;
        }
        for (let i = 0; i < activationInfo.activationTokens.length; i++) {
            if (!toIntelliSense) {
                method = undefined;
                sObjectField = undefined;
                namespace = undefined;
            }
            const activationToken = activationInfo.activationTokens[i];
            const actType = ProviderUtils.getActivationType(activationToken.activation);
            const activationToLower = activationToken.activation.toLowerCase();
            let datatypeName;
            if (activationInfo.activationTokens[0].activation.toLowerCase() === 'label' && i <= 1) {
                labels = ProviderUtils.getCustomLabels();
                if (i === 1) {
                    if (activationToken.active) {
                        for (const labelTmp of labels) {
                            if (labelTmp.fullName.toLowerCase() === activationToLower) {
                                label = labelTmp;
                                break;
                            }
                        }
                    }
                    if (label || (activationToken.nextToken && activationToken.nextToken.text === '.')) {
                        labels = undefined;
                    }
                    datatypeName = 'String';
                    lastNode = parser.resolveDatatype(datatypeName);
                }
            } else {
                if (activationToken.isQuery) {
                    if (node && node.positionData.signature) {
                        method = ProviderUtils.getMethod(node, node.positionData.signature) || ProviderUtils.getMethod(node.classes[node.positionData.parentName.toLowerCase()], node.positionData.signature) || ProviderUtils.getMethod(node.interfaces[node.positionData.parentName.toLowerCase()], node.positionData.signature);
                        let query = ProviderUtils.getQueryFromFirstToken(method, activationToken.startToken);
                        if (query) {
                            datatypeName = query.from.textToLower;
                        }
                    } else if (node) {
                        let query = ProviderUtils.getQueryFromFirstToken(node, activationToken.startToken);
                        if (query) {
                            datatypeName = query.from.textToLower;
                        }
                    }
                } else if (lastNode) {
                    if (!Utils.isNull(lastNode.nodeType)) {
                        if (actType.type === 'field') {
                            if (lastNode.nodeType !== ApexNodeTypes.ENUM) {
                                if (lastNode.positionData && (lastNode.positionData.nodeType === ApexNodeTypes.METHOD || lastNode.positionData.nodeType === ApexNodeTypes.CONSTRUCTOR)) {
                                    method = ProviderUtils.getMethod(lastNode, lastNode.positionData.signature) || ProviderUtils.getMethod(lastNode.classes[lastNode.positionData.parentName.toLowerCase()], lastNode.positionData.signature) || ProviderUtils.getMethod(lastNode.interfaces[lastNode.positionData.parentName.toLowerCase()], lastNode.positionData.signature);
                                    methodVar = ProviderUtils.getVariable(method, activationToLower);
                                    classVar = ProviderUtils.getClassField(lastNode, activationToLower);
                                    if ((!activationToken.active || activationInfo.activationTokens.length === 1) && methodVar && activationToken.endToken.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                                        if (lastNode.classes[methodVar.datatype.value.type.toLowerCase()] || lastNode.interfaces[methodVar.datatype.value.type.toLowerCase()] || lastNode.enums[methodVar.datatype.value.type.toLowerCase()]) {
                                            datatypeName = methodVar.datatype.value.type;
                                        } else {
                                            datatypeName = methodVar.datatype.value.name;
                                        }
                                    } else if (methodVar) {
                                        datatypeName = methodVar.datatype.name;
                                    } else if (classVar) {
                                        datatypeName = classVar.datatype.name;
                                    } else {
                                        datatypeName = activationToLower;
                                        method = undefined;
                                    }
                                } else if (lastNode.positionData && lastNode.positionData.nodeType === ApexNodeTypes.SOQL && lastNode.positionData.query) {
                                    if (activationInfo.lastToken && activationInfo.lastToken.text === ':') {
                                        method = ProviderUtils.getMethod(lastNode, lastNode.positionData.signature) || ProviderUtils.getMethod(lastNode.classes[lastNode.positionData.parentName.toLowerCase()], lastNode.positionData.signature) || ProviderUtils.getMethod(lastNode.interfaces[lastNode.positionData.parentName.toLowerCase()], lastNode.positionData.signature);
                                        methodVar = ProviderUtils.getVariable(method, activationToLower);
                                        classVar = ProviderUtils.getClassField(lastNode, activationToLower);
                                    } else {
                                        methodVar = undefined;
                                        classVar = undefined;
                                    }
                                    if (methodVar) {
                                        datatypeName = methodVar.datatype.name;
                                    } else if (classVar) {
                                        datatypeName = classVar.datatype.name;
                                    } else {
                                        if (!toIntelliSense) {
                                            method = undefined;
                                        }
                                        lastNode = parser.resolveDatatype(lastNode.positionData.query.from.textToLower);
                                        let idField = (!activationToLower.endsWith('id')) ? activationToLower + 'Id' : activationToLower;
                                        let relatedField = (activationToLower.endsWith('__r')) ? activationToLower.substring(0, activationToLower.length - 3) + '__c' : activationToLower;
                                        sObjectFieldName = activationToLower;
                                        sObjectField = ProviderUtils.getFieldData(lastNode, idField.toLowerCase()) || ProviderUtils.getFieldData(lastNode, relatedField);
                                        if (sObjectField) {
                                            sObject = lastNode;
                                            if (sObjectField.referenceTo.length === 1) {
                                                datatypeName = sObjectField.referenceTo[0];
                                            } else {
                                                if (sObjectField.name.endsWith('Id') && !sObjectField.custom) {
                                                    datatypeName = sObjectField.name.substring(0, sObjectField.name.length - 2);
                                                } else {
                                                    datatypeName = sObjectField.type;
                                                }
                                                if (toIntelliSense && (!activationToken.nextToken || activationToken.nextToken.text !== '.')) {
                                                    datatypeName = sObject.name;
                                                }
                                            }
                                        } else {
                                            sObjectFieldName = undefined;
                                            datatypeName = lastNode.name;
                                        }
                                    }
                                } else {
                                    if (node && node.positionData && node.positionData.nodeType === ApexNodeTypes.SOQL && node.positionData.query && i === 0) {
                                        if (activationInfo.lastToken && activationInfo.lastToken.text === ':') {
                                            method = ProviderUtils.getMethod(node, node.positionData.signature) || ProviderUtils.getMethod(node.classes[node.positionData.parentName.toLowerCase()], node.positionData.signature) || ProviderUtils.getMethod(node.interfaces[node.positionData.parentName.toLowerCase()], node.positionData.signature);
                                            methodVar = ProviderUtils.getVariable(method, activationToLower);
                                            classVar = ProviderUtils.getClassField(node, activationToLower);
                                            if (methodVar && activationToken.endToken.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                                                datatypeName = methodVar.datatype.value;
                                            } else if (methodVar) {
                                                datatypeName = methodVar.datatype.name;
                                            } else if (classVar) {
                                                datatypeName = classVar.datatype.name;
                                            }
                                        } else {
                                            methodVar = undefined;
                                            classVar = undefined;
                                        }
                                        if (methodVar) {
                                            datatypeName = methodVar.datatype.name;
                                        } else if (classVar) {
                                            datatypeName = classVar.datatype.name;
                                        } else {
                                            if (!toIntelliSense) {
                                                method = undefined;
                                            }
                                            lastNode = parser.resolveDatatype(node.positionData.query.from.textToLower);
                                            let idField = (!activationToLower.endsWith('id')) ? activationToLower + 'Id' : activationToLower;
                                            let relatedField = (activationToLower.endsWith('__r')) ? activationToLower.substring(0, activationToLower.length - 3) + '__c' : activationToLower;
                                            sObjectFieldName = activationToLower;
                                            sObjectField = ProviderUtils.getFieldData(lastNode, idField.toLowerCase()) || ProviderUtils.getFieldData(lastNode, relatedField);
                                            if (sObjectField) {
                                                sObject = lastNode;
                                                if (sObjectField.referenceTo.length === 1) {
                                                    datatypeName = sObjectField.referenceTo[0];
                                                } else {
                                                    if (sObjectField.name.endsWith('Id') && !sObjectField.custom) {
                                                        datatypeName = sObjectField.name.substring(0, sObjectField.name.length - 2);
                                                    } else {
                                                        datatypeName = sObjectField.type;
                                                    }
                                                }
                                            } else {
                                                sObjectFieldName = undefined;
                                                datatypeName = lastNode.name;
                                            }
                                        }
                                    } else {
                                        methodVar = undefined;
                                        if (lastNode.positionData && lastNode.positionData.parentName) {
                                            classVar = ProviderUtils.getClassField(lastNode, activationToLower) || ProviderUtils.getClassField(lastNode.classes[lastNode.positionData.parentName.toLowerCase()], activationToLower) || ProviderUtils.getClassField(lastNode.interfaces[lastNode.positionData.parentName.toLowerCase()], activationToLower);
                                        } else {
                                            classVar = ProviderUtils.getClassField(lastNode, activationToLower);
                                        }
                                        if (classVar) {
                                            datatypeName = classVar.datatype.name;
                                        } else {
                                            datatypeName = activationToLower;
                                        }
                                    }
                                }
                            } else {
                                datatypeName = lastNode.name;
                            }
                        } else {
                            if (lastNode.positionData && lastNode.positionData.parentName) {
                                method = ProviderUtils.getMethodFromCall(lastNode, actType.name, actType.params) || ProviderUtils.getMethodFromCall(lastNode.classes[lastNode.positionData.parentName.toLowerCase()], actType.name, actType.params) || ProviderUtils.getMethodFromCall(lastNode.interfaces[lastNode.positionData.parentName.toLowerCase()], actType.name, actType.params);
                            } else {
                                method = ProviderUtils.getMethodFromCall(lastNode, actType.name, actType.params);
                            }
                            if (method) {
                                datatypeName = (method.datatype) ? method.datatype.name : lastNode.name;
                                if (!datatype) {
                                    if (method.name === 'get' && (lastNode.name.toLowerCase() === 'list' || lastNode.name.toLowerCase() === 'map')) {
                                        if (methodVar) {
                                            datatype = methodVar.datatype.value;
                                            datatypeName = datatype.type;
                                        }
                                        else if (classVar) {
                                            datatype = classVar.datatype.value;
                                            datatypeName = datatype.type;
                                        }
                                    } else {
                                        methodVar = undefined;
                                        classVar = undefined;
                                    }
                                } else {
                                    methodVar = undefined;
                                    classVar = undefined;
                                    if (method.name === 'get' && (datatype.type.toLowerCase() === 'list' || datatype.type.toLowerCase() === 'map')) {
                                        datatype = datatype.value;
                                        datatypeName = datatype.type;
                                    }
                                }
                            }
                            if (activationToken.lastToken && activationToken.lastToken.textToLower === 'new' && !method) {
                                const tmpNode = parser.resolveDatatype(actType.name);
                                method = ProviderUtils.getMethodFromCall(tmpNode, actType.name, actType.params);
                                datatypeName = actType.name;
                            }
                        }
                    } else if (Object.keys(lastNode).includes('keyPrefix')) {
                        if (actType.type === 'field') {
                            if (node && node.positionData && node.positionData.nodeType === ApexNodeTypes.SOQL && node.positionData.query && i === 0) {
                                if (activationInfo.lastToken && activationInfo.lastToken.text === ':') {
                                    method = ProviderUtils.getMethod(node, node.positionData.signature) || ProviderUtils.getMethod(node.classes[node.positionData.parentName.toLowerCase()], node.positionData.signature) || ProviderUtils.getMethod(node.interfaces[node.positionData.parentName.toLowerCase()], node.positionData.signature);
                                    methodVar = ProviderUtils.getVariable(method, activationToLower);
                                    classVar = ProviderUtils.getClassField(node, activationToLower);
                                    if (methodVar && activationToken.endToken.type === TokenTypes.BRACKET.SQUARE_CLOSE) {
                                        datatypeName = methodVar.datatype.value;
                                    } else if (methodVar) {
                                        datatypeName = methodVar.datatype.name;
                                    } else if (classVar) {
                                        datatypeName = classVar.datatype.name;
                                    }
                                } else {
                                    methodVar = undefined;
                                    classVar = undefined;
                                }
                                if (methodVar) {
                                    datatypeName = methodVar.datatype.name;
                                } else if (classVar) {
                                    datatypeName = classVar.datatype.name;
                                } else {
                                    if (!toIntelliSense) {
                                        method = undefined;
                                    }
                                    lastNode = parser.resolveDatatype(node.positionData.query.from.textToLower);
                                    let idField = (!activationToLower.endsWith('id')) ? activationToLower + 'Id' : activationToLower;
                                    let relatedField = (activationToLower.endsWith('__r')) ? activationToLower.substring(0, activationToLower.length - 3) + '__c' : activationToLower;
                                    sObjectFieldName = activationToLower;
                                    sObjectField = ProviderUtils.getFieldData(lastNode, idField.toLowerCase()) || ProviderUtils.getFieldData(lastNode, relatedField);
                                    if (sObjectField) {
                                        sObject = lastNode;
                                        if (sObjectField.referenceTo.length === 1) {
                                            datatypeName = sObjectField.referenceTo[0];
                                        } else {
                                            if (sObjectField.name.endsWith('Id') && !sObjectField.custom) {
                                                datatypeName = sObjectField.name.substring(0, sObjectField.name.length - 2);
                                            } else {
                                                datatypeName = sObjectField.type;
                                            }
                                        }
                                    } else {
                                        sObjectFieldName = undefined;
                                        datatypeName = lastNode.name;
                                    }
                                }
                            } else {
                                methodVar = undefined;
                                classVar = undefined;
                                let idField = (!activationToLower.endsWith('id')) ? activationToLower + 'Id' : activationToLower;
                                let relatedField = (activationToLower.endsWith('__r')) ? activationToLower.substring(0, activationToLower.length - 3) + '__c' : activationToLower;
                                sObjectFieldName = activationToLower;
                                sObjectField = ProviderUtils.getFieldData(lastNode, idField.toLowerCase()) || ProviderUtils.getFieldData(lastNode, relatedField);
                                if (sObjectField) {
                                    sObject = lastNode;
                                    if (sObjectField.referenceTo.length === 1) {
                                        datatypeName = sObjectField.referenceTo[0];
                                    } else {
                                        if (sObjectField.name.endsWith('Id') && !sObjectField.custom) {
                                            datatypeName = sObjectField.name.substring(0, sObjectField.name.length - 2);
                                        } else {
                                            datatypeName = sObjectField.type;
                                        }
                                    }
                                } else {
                                    datatypeName = lastNode.name;
                                    sObjectFieldName = undefined;
                                }
                            }
                        } else {
                            const tmpNode = parser.resolveDatatype('sobject');
                            method = ProviderUtils.getMethodFromCall(tmpNode, actType.name, actType.params);
                            if (method) {
                                datatypeName = method.datatype.name;
                            }
                        }
                    } else {
                        if (actType.type === 'field') {
                            datatypeName = activationToLower;
                            namespace = datatypeName;
                        }
                    }
                }
                if (!datatypeName) {
                    if (lastNode && lastNode.parentName) {
                        lastNode = parser.resolveDatatype(lastNode.parentName);
                    } else {
                        if (!toIntelliSense) {
                            method = undefined;
                        }
                        lastNode = parser.resolveDatatype(activationToLower);
                    }
                } else {
                    if (lastNode && lastNode.classes && lastNode.classes[activationToLower]) {
                        lastNode = lastNode.classes[activationToLower];
                    } else if (lastNode && lastNode.classes && lastNode.classes[datatypeName.toLowerCase()]) {
                        lastNode = lastNode.classes[datatypeName.toLowerCase()];
                    } else if (lastNode && lastNode.interfaces && lastNode.interfaces[activationToLower]) {
                        lastNode = lastNode.interfaces[activationToLower];
                    } else if (lastNode && lastNode.interfaces && lastNode.interfaces[datatypeName.toLowerCase()]) {
                        lastNode = lastNode.interfaces[datatypeName.toLowerCase()];
                    } else if (lastNode && lastNode.enums && lastNode.enums[activationToLower]) {
                        lastNode = lastNode.enums[activationToLower];
                    } else if (lastNode && lastNode.enums && lastNode.enums[datatypeName.toLowerCase()]) {
                        lastNode = lastNode.enums[datatypeName.toLowerCase()];
                    } else {
                        lastNode = parser.resolveDatatype(datatypeName);
                    }
                }
            }
            if (activationToken.active) {
                break;
            }
        }
        return {
            node: node,
            lastNode: lastNode,
            method: method,
            methodVar: methodVar,
            classVar: classVar,
            sObject: sObject,
            label: label,
            labels: labels,
            sObjectField: sObjectField,
            sObjectFieldName: sObjectFieldName,
            namespace: namespace
        };
    }

    static getApexCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, node: any, positionData: any): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];
        const nodeInfo = ProviderUtils.getNodeInformation(node, activationInfo);
        if (nodeInfo && nodeInfo.lastNode && Object.keys(nodeInfo.lastNode).includes('keyPrefix') && Config.getConfig().autoCompletion!.activeSobjectFieldsSuggestion) {
            items = items.concat(ProviderUtils.getSobjectCompletionItems(position, activationInfo, activationInfo.activationTokens, nodeInfo.lastNode, positionData));
        } else if (nodeInfo && nodeInfo.lastNode && !Utils.isNull(nodeInfo.lastNode.nodeType) && Config.getConfig().autoCompletion!.activeApexSuggestion) {
            items = ProviderUtils.getApexClassCompletionItems(position, nodeInfo.lastNode);
        }
        Utils.sort(items, ['label']);
        return items;
    }

    static getMethodFromCall(apexClass: any, name: string, params?: string[]): any {
        if (apexClass && (apexClass.methods || apexClass.constructors) && params) {
            for (const methodName of Object.keys(apexClass.methods)) {
                const method = apexClass.methods[methodName];
                if (method.name.toLowerCase() === name.toLowerCase() && Utils.countKeys(method.params) === params.length) {
                    return method;
                }
            }
            for (const constructName of Object.keys(apexClass.constructors)) {
                const construct = apexClass.constructors[constructName];
                if (construct.name.toLowerCase() === name.toLowerCase() && Utils.countKeys(construct.params) === params.length) {
                    return construct;
                }
            }
        }
        return undefined;
    }

    static getApexClassCompletionItems(position: vscode.Position, node: any): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];
        if (node) {
            if (node.nodeType === ApexNodeTypes.ENUM) {
                for (const value of node.values) {
                    const documentation = new MarkDownStringBuilder();
                    documentation.appendApexCodeBlock(node.name + '.' + value.text);
                    documentation.appendMarkdown(node.name + ' enum value\n\n');
                    const options = ProviderUtils.getCompletionItemOptions(node.name + ' Value', documentation.build(), value.text, true, CompletionItemKind.EnumMember);
                    items.push(ProviderUtils.createItemForCompletion(value.text, options));
                }
            } else {
                if (node.positionData && (node.positionData.nodeType === ApexNodeTypes.METHOD || node.positionData.nodeType === ApexNodeTypes.CONSTRUCTOR || node.positionData.nodeType === ApexNodeTypes.INITIALIZER || node.positionData.nodeType === ApexNodeTypes.STATIC_CONSTRUCTOR)) {
                    let method;
                    if (node.positionData.nodeType === ApexNodeTypes.METHOD) {
                        method = node.methods[node.positionData.signature.toLowerCase()];
                    }
                    if (node.positionData.nodeType === ApexNodeTypes.CONSTRUCTOR) {
                        method = node.constructors[node.positionData.signature.toLowerCase()];
                    }
                    if (node.positionData.nodeType === ApexNodeTypes.INITIALIZER) {
                        method = node.initializer;
                    }
                    if (node.positionData.nodeType === ApexNodeTypes.STATIC_CONSTRUCTOR) {
                        method = node.staticConstructor;
                    }
                    if (Utils.hasKeys(method.params)) {
                        const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                        const paramsTagData = tagsData['params'];
                        for (const param of method.getOrderedParams()) {
                            const documentation = new MarkDownStringBuilder();
                            const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
                            let code = '';
                            if (param.final) {
                                code += param.final.text + ' ';
                            }
                            code += datatype + ' ' + param.name;
                            documentation.appendApexCodeBlock(code);
                            let description = '*' + param.name + '* `' + datatype + '`';
                            if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                                for (const data of paramsTagData.tagData) {
                                    if (data.keywords) {
                                        for (const keyword of paramsTagData.tag.keywords) {
                                            if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n');
                                            }
                                        }
                                    }
                                }
                            }
                            documentation.appendMarkdown(description + '\n\n');
                            const options = ProviderUtils.getCompletionItemOptions(datatype, documentation.build(), param.name, true, CompletionItemKind.Variable);
                            items.push(ProviderUtils.createItemForCompletion(param.name, options));
                        }
                    }
                    for (const variable of method.getOrderedVariables()) {
                        const documentation = new MarkDownStringBuilder();
                        const datatype = StrUtils.replace(variable.datatype.name, ',', ', ');
                        documentation.appendApexCodeBlock(datatype + ' ' + variable.name);
                        let description = '*' + variable.name + '* `' + datatype + '`';
                        if (variable.description && variable.description.length > 0) {
                            description += ' &mdash; ' + StrUtils.replace(variable.description, '\n', '\n\n');
                        } else if (variable.comment && variable.comment.description && variable.comment.description.length > 0) {
                            description += ' &mdash; ' + StrUtils.replace(variable.comment.description, '\n', '\n\n');
                        }
                        documentation.appendMarkdown(description + '\n\n');
                        const options = ProviderUtils.getCompletionItemOptions(datatype, documentation.build(), variable.name, true, CompletionItemKind.Variable);
                        items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                    }
                }
                if (Utils.hasKeys(node.variables)) {
                    for (const varName of Object.keys(node.variables)) {
                        const documentation = new MarkDownStringBuilder();
                        const variable = node.variables[varName];
                        const datatype = StrUtils.replace(variable.datatype.name, ',', ', ');
                        let code = '';
                        if (variable.accessModifier) {
                            code += variable.accessModifier.text + ' ';
                        }
                        if (variable.definitionModifier) {
                            code += variable.definitionModifier.text + ' ';
                        }
                        if (variable.static) {
                            code += variable.static.text + ' ';
                        }
                        if (variable.final) {
                            code += variable.final.text + ' ';
                        }
                        if (variable.transient) {
                            code += variable.transient.text + ' ';
                        }
                        code += datatype + ' ' + variable.name;
                        documentation.appendApexCodeBlock(code);
                        let description = '*' + variable.name + '* `' + datatype + '`';
                        if (variable.description && variable.description.length > 0) {
                            description += ' &mdash; ' + StrUtils.replace(variable.description, '\n', '\n\n');
                        } else if (variable.comment && variable.comment.description && variable.comment.description.length > 0) {
                            description += ' &mdash; ' + StrUtils.replace(variable.comment.description, '\n', '\n\n');
                        }
                        documentation.appendMarkdown(description + '\n\n');
                        if (variable.nodeType === ApexNodeTypes.PROPERTY) {
                            const options = ProviderUtils.getCompletionItemOptions(datatype, documentation.build(), variable.name, true, CompletionItemKind.Property);
                            items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                        } else if (variable.final) {
                            const options = ProviderUtils.getCompletionItemOptions(datatype, documentation.build(), variable.name, true, CompletionItemKind.Constant);
                            items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                        } else {
                            const options = ProviderUtils.getCompletionItemOptions(datatype, documentation.build(), variable.name, true, CompletionItemKind.Field);
                            items.push(ProviderUtils.createItemForCompletion(variable.name, options));
                        }
                    }
                }
                if (Utils.hasKeys(node.constructors)) {
                    for (const constructorName of Object.keys(node.constructors)) {
                        const documentation = new MarkDownStringBuilder();
                        const construct = node.constructors[constructorName];
                        let insertText = construct.name + "(";
                        let snippetNum = 1;
                        let name = construct.name + "(";
                        let signature = '';
                        if (construct.accessModifier) {
                            signature += construct.accessModifier.text + ' ';
                        }
                        if (construct.definitionModifier) {
                            signature += construct.definitionModifier.text + ' ';
                        }
                        if (construct.static) {
                            signature += construct.static.text + ' ';
                        }
                        if (construct.final) {
                            signature += construct.final.text + ' ';
                        }
                        if (construct.transient) {
                            signature += construct.transient.text + ' ';
                        }
                        signature += construct.name + "(";
                        let description = '';
                        if (construct.description && construct.description.length > 0) {
                            description += StrUtils.replace(construct.description, '\n', '\n\n') + '\n\n';
                            construct.params = construct.variables;
                        } else if (construct.comment && construct.comment.description && construct.comment.description.length > 0) {
                            description += StrUtils.replace(construct.comment.description, '\n', '\n\n') + '\n\n';
                        }
                        if (Utils.hasKeys(construct.params)) {
                            const tagsData = TemplateUtils.getTagsDataBySource(['params'], construct.comment);
                            const paramsTagData = tagsData['params'];
                            documentation.appendMarkdownH4('Params');
                            for (const param of construct.getOrderedParams()) {
                                const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
                                description += '  - *' + param.name + '* `' + datatype + '`';
                                if (param.description) {
                                    description += ' &mdash; ' + StrUtils.replace(param.description, '\n', '\n\n');
                                } else if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                                    for (const data of paramsTagData.tagData) {
                                        if (data.keywords) {
                                            for (const keyword of paramsTagData.tag.keywords) {
                                                if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                    description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n');
                                                }
                                            }
                                        }
                                    }
                                }
                                description += '\n';
                                if (snippetNum === 1) {
                                    if (construct.final) {
                                        signature += construct.final.text + ' ';
                                    }
                                    signature += datatype + ' ' + param.name;
                                    name += param.name;
                                    insertText += "${" + snippetNum + ":" + param.name + "}";
                                }
                                else {
                                    name += ", " + param.name;
                                    signature += ', ';
                                    if (construct.final) {
                                        signature += construct.final.text + ' ';
                                    }
                                    signature += datatype + ' ' + param.name;
                                    insertText += ", ${" + snippetNum + ":" + param.name + "}";
                                }
                                snippetNum++;
                            }
                            description += '\n';
                        }
                        signature += ')';
                        name += ")";
                        insertText += ")";
                        documentation.appendApexCodeBlock(signature);
                        documentation.appendMarkdown(description);
                        documentation.appendMarkdownSeparator();
                        documentation.appendMarkdownH4('Snippet');
                        documentation.appendApexCodeBlock(insertText);
                        let options = ProviderUtils.getCompletionItemOptions(construct.signature, documentation.build(), new SnippetString(insertText), true, CompletionItemKind.Constructor);
                        items.push(ProviderUtils.createItemForCompletion(name, options));
                    }
                }
                if (Utils.hasKeys(node.methods)) {
                    for (const methodName of Object.keys(node.methods)) {
                        const documentation = new MarkDownStringBuilder();
                        const method = node.methods[methodName];
                        const datatype = StrUtils.replace(method.datatype.name, ',', ', ');
                        let signature = '';
                        let insertText = method.name + "(";
                        let snippetNum = 1;
                        let name = method.name + "(";
                        if (method.accessModifier) {
                            signature += method.accessModifier.text + ' ';
                        }
                        if (method.definitionModifier) {
                            signature += method.definitionModifier.text + ' ';
                        }
                        if (method.static) {
                            signature += method.static.text + ' ';
                        }
                        if (method.final) {
                            signature += method.final.text + ' ';
                        }
                        if (method.transient) {
                            signature += method.transient.text + ' ';
                        }
                        signature += datatype + ' ' + method.name + "(";
                        let description = '';
                        if (method.description && method.description.length > 0) {
                            description += method.description + '\n\n';
                        } else if (method.comment && method.comment.description && method.comment.description.length > 0) {
                            description += method.comment.description + '\n\n';
                        }
                        const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                        if (Utils.hasKeys(method.params)) {
                            const paramsTagData = tagsData['params'];
                            description += '#### Params\n\n';
                            for (const param of method.getOrderedParams()) {
                                const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
                                description += '  - *' + param.name + '* `' + datatype + '`';
                                if (param.description) {
                                    description += ' &mdash; ' + StrUtils.replace(param.description, '\n', '\n\n');
                                } else if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                                    for (const data of paramsTagData.tagData) {
                                        if (data.keywords) {
                                            for (const keyword of paramsTagData.tag.keywords) {
                                                if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                    description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n');
                                                }
                                            }
                                        }
                                    }
                                }
                                description += '\n';
                                if (snippetNum === 1) {
                                    if (method.final) {
                                        signature += method.final.text + ' ';
                                    }
                                    signature += datatype + ' ' + param.name;
                                    name += param.name;
                                    insertText += "${" + snippetNum + ":" + param.name + "}";
                                }
                                else {
                                    name += ", " + param.name;
                                    signature += ', ';
                                    if (method.final) {
                                        signature += method.final.text + ' ';
                                    }
                                    signature += datatype + ' ' + param.name;
                                    insertText += ", ${" + snippetNum + ":" + param.name + "}";
                                }
                                snippetNum++;
                            }
                            description += '\n';
                        }
                        if (method.datatype && method.datatype.name !== 'void') {
                            description += '**Return** `' + method.datatype.name + '`';
                            const returnTagData = tagsData['return'];
                            if (returnTagData && returnTagData.tag && returnTagData.tagData && returnTagData.tagName) {
                                for (const data of returnTagData.tagData) {
                                    if (data.keywords) {
                                        for (const keyword of returnTagData.tag.keywords) {
                                            if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                                description += ' &mdash; ' + StrUtils.replace(data.keywords[keyword.name], '\n', '\n\n') + '\n';
                                            }
                                        }
                                    }
                                }
                                description += '\n';
                            } else {
                                description += '\n\n';
                            }
                        }
                        name += ")";
                        insertText += ")";
                        signature += ')';
                        if (datatype === 'void') {
                            insertText += ';';
                        }
                        documentation.appendApexCodeBlock(signature);
                        documentation.appendMarkdown(description);
                        documentation.appendMarkdownSeparator();
                        documentation.appendMarkdownH4('Snippet');
                        documentation.appendApexCodeBlock(insertText);
                        const options = ProviderUtils.getCompletionItemOptions(method.signature, documentation.build(), new SnippetString(insertText), true, CompletionItemKind.Method);
                        items.push(ProviderUtils.createItemForCompletion(name, options));
                    }
                }
                if (Utils.hasKeys(node.classes)) {
                    for (const className of Object.keys(node.classes)) {
                        const documentation = new MarkDownStringBuilder();
                        const innerClass = node.classes[className];
                        documentation.appendApexCodeBlock(node.name + '.' + innerClass.name);
                        let description = '';
                        if (innerClass.description && innerClass.description.length > 0) {
                            description += innerClass.description + '\n\n';
                        } else if (innerClass.comment && innerClass.comment.description && innerClass.comment.description.length > 0) {
                            description += innerClass.comment.description + '\n\n';
                        }
                        documentation.appendMarkdown(description);
                        const options = ProviderUtils.getCompletionItemOptions('Inner Class', documentation.build(), innerClass.name, true, CompletionItemKind.Class);
                        items.push(ProviderUtils.createItemForCompletion(innerClass.name, options));
                    }
                }
                if (Utils.hasKeys(node.interfaces)) {
                    for (const interfaceName of Object.keys(node.interfaces)) {
                        const documentation = new MarkDownStringBuilder();
                        const innerInterface = node.interfaces[interfaceName];
                        documentation.appendApexCodeBlock(node.name + '.' + innerInterface.name);
                        let description = '';
                        if (innerInterface.description && innerInterface.description.length > 0) {
                            description += innerInterface.description + '\n\n';
                        } else if (innerInterface.comment && innerInterface.comment.description && innerInterface.comment.description.length > 0) {
                            description += innerInterface.comment.description + '\n\n';
                        }
                        documentation.appendMarkdown(description);
                        const options = ProviderUtils.getCompletionItemOptions('Inner Interface', documentation.build(), innerInterface.name, true, CompletionItemKind.Interface);
                        items.push(ProviderUtils.createItemForCompletion(innerInterface.name, options));
                    }
                }
                if (Utils.hasKeys(node.enums)) {
                    for (const enumName of Object.keys(node.enums)) {
                        const documentation = new MarkDownStringBuilder();
                        const innerEnum = node.enums[enumName];
                        documentation.appendApexCodeBlock(node.name + '.' + innerEnum.name);
                        let description = '';
                        if (innerEnum.description && innerEnum.description.length > 0) {
                            description += innerEnum.description + '\n\n';
                        } else if (innerEnum.comment && innerEnum.comment.description && innerEnum.comment.description.length > 0) {
                            description += innerEnum.comment.description + '\n\n';
                        }
                        documentation.appendMarkdown(description);
                        documentation.appendMarkdownH4('Values');
                        const enumValues = [];
                        for (const value of innerEnum.values) {
                            if (Utils.isString(value)) {
                                enumValues.push('  - `' + value + '`');
                            } else {
                                enumValues.push('  - `' + value.text + '`');
                            }
                        }
                        documentation.appendMarkdown(enumValues.join('\n'));
                        const options = ProviderUtils.getCompletionItemOptions('Inner Enum', documentation.build(), innerEnum.name, true, CompletionItemKind.Enum);
                        items.push(ProviderUtils.createItemForCompletion(innerEnum.name, options));
                    }
                }
                if (node.extends) {
                    let parentClasss = node;
                    while (!parentClasss.extends) {
                        items = items.concat(ProviderUtils.getApexClassCompletionItems(position, parentClasss));
                        parentClasss = parentClasss.extends;
                    }
                }
                if (Utils.hasKeys(node.implements)) {
                    for (const imp of Object.keys(node.implements)) {
                        items = items.concat(ProviderUtils.getApexClassCompletionItems(position, node.implements[imp]));
                    }
                }
            }
        }
        return items;
    }

    static getCommand(title: string, command: string, args?: any): vscode.Command {
        return {
            title: title,
            command: command,
            arguments: args
        };
    }

    static getCompletionItemOptions(detail: string | undefined, documentation: string | vscode.MarkdownString | undefined, insertText: string | vscode.SnippetString | undefined, preselect: boolean, type: vscode.CompletionItemKind): any {
        return {
            detail: detail,
            documentation: documentation,
            insertText: insertText,
            preselect: preselect,
            type: type
        };
    }

    static createItemForCompletion(name: string, options: any, command?: any): vscode.CompletionItem {
        let type = CompletionItemKind.Value;
        if (!options.documentation) {
            options.documentation = new MarkDownStringBuilder().build();
        } else if (Utils.isString(options.documentation)) {
            options.documentation = new MarkDownStringBuilder().appendMarkdown(options.documentation).build();
        }
        if (options && options.type) {
            type = options.type;
        }
        const item = new CompletionItem(name, type);
        if (options && options.detail) {
            item.detail = options.detail;
        }
        if (options && options.documentation) {
            item.documentation = options.documentation;
        }
        if (options && options.preselect) {
            item.preselect = options.preselect;
        }
        if (options && options.insertText) {
            item.insertText = options.insertText;
        }
        if (command) {
            item.command = command;
        }
        return item;
    }

    static getAllAvailableCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, node?: any): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];
        if (Config.getConfig().autoCompletion!.activeApexSuggestion) {
            const systemMetadata = (applicationContext.parserData.namespacesData) ? applicationContext.parserData.namespacesData['system'] : undefined;
            items = ProviderUtils.getApexClassCompletionItems(position, node);
            if (applicationContext.parserData.userClassesData) {
                Object.keys(applicationContext.parserData.userClassesData).forEach((key) => {
                    const documentation = new MarkDownStringBuilder();
                    const userClass = (applicationContext.parserData.userClassesData) ? applicationContext.parserData.userClassesData[key] : undefined;
                    const className = (userClass.name) ? userClass.name : userClass;
                    documentation.appendApexCodeBlock(className);
                    let description = '';
                    if (userClass.comment && userClass.comment.description && userClass.comment.description.length > 0) {
                        description += userClass.comment.description + '\n\n';
                    } else {
                        if (userClass.nodeType === ApexNodeTypes.ENUM) {
                            description = className + ' Enum\n\n';
                        } else if (userClass.nodeType === ApexNodeTypes.INTERFACE) {
                            description = className + ' Interface\n\n';
                        } else {
                            description = className + ' Class\n\n';
                        }
                    }
                    documentation.appendMarkdown(description);
                    if (userClass.nodeType === ApexNodeTypes.ENUM) {
                        documentation.appendMarkdownH4('Values');
                        const enumValues = [];
                        for (const value of userClass.values) {
                            if (Utils.isString(value)) {
                                enumValues.push('  - `' + value + '`');
                            } else {
                                enumValues.push('  - `' + value.text + '`');
                            }
                        }
                        documentation.appendMarkdown(enumValues.join('\n') + '\n\n');
                        const options = ProviderUtils.getCompletionItemOptions(className, documentation.build(), className, true, CompletionItemKind.Enum);
                        const item = ProviderUtils.createItemForCompletion(className, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    } else if (userClass.nodeType === ApexNodeTypes.INTERFACE) {
                        const options = ProviderUtils.getCompletionItemOptions(className, documentation.build(), className, true, CompletionItemKind.Interface);
                        const item = ProviderUtils.createItemForCompletion(className, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    } else {
                        const options = ProviderUtils.getCompletionItemOptions(className, documentation.build(), className, true, CompletionItemKind.Class);
                        const item = ProviderUtils.createItemForCompletion(className, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    }
                });
            }
            if (systemMetadata) {
                Object.keys(systemMetadata).forEach(function (key) {
                    const documentation = new MarkDownStringBuilder();
                    const systemClass = systemMetadata[key];
                    documentation.appendApexCodeBlock(systemClass.name);
                    if (systemClass.nodeType === ApexNodeTypes.ENUM) {
                        documentation.appendMarkdownH4('Values');
                        const enumValues = [];
                        for (const value of systemClass.values) {
                            if (Utils.isString(value)) {
                                enumValues.push('  - `' + value + '`');
                            } else {
                                enumValues.push('  - `' + value.text + '`');
                            }
                        }
                        documentation.appendMarkdown(systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '') + '\n\n');
                        documentation.appendMarkdown(enumValues.join('\n') + '\n\n');
                        const options = ProviderUtils.getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', documentation.build(), systemClass.name, true, CompletionItemKind.Enum);
                        const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    } else if (systemClass.nodeType === ApexNodeTypes.INTERFACE) {
                        const description = systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '') + '\n\n';
                        documentation.appendMarkdown(description);
                        const options = ProviderUtils.getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', documentation.build(), systemClass.name, true, CompletionItemKind.Interface);
                        const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    } else {
                        const description = systemClass.description + ((systemClass.documentation) ? '\n\n[Documentation Link](' + systemClass.documentation + ')' : '') + '\n\n';
                        documentation.appendMarkdown(description);
                        const options = ProviderUtils.getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', documentation.build(), systemClass.name, true, CompletionItemKind.Class);
                        const item = ProviderUtils.createItemForCompletion(systemClass.name, options);
                        if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                            item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                        }
                        items.push(item);
                    }
                });
            }
            if (applicationContext.parserData.namespaces) {
                for (const ns of applicationContext.parserData.namespaces) {
                    const options = ProviderUtils.getCompletionItemOptions('Salesforce Namespace', undefined, ns, true, CompletionItemKind.Module);
                    const item = ProviderUtils.createItemForCompletion(ns, options);
                    if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                        item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                    }
                    items.push(item);
                }
            }
        }
        if (Config.getConfig().autoCompletion!.activeSObjectSuggestion && applicationContext.parserData.sObjectsData) {
            Object.keys(applicationContext.parserData.sObjectsData).forEach(function (key) {
                const sObject = applicationContext.parserData.sObjectsData[key];
                const documentation = new MarkDownStringBuilder();
                let nameTmp = sObject.name.substring(0, sObject.name.length - 3);
                let doc = (sObject.description) ? sObject.description + '\n\n' : '';
                if (sObject.custom) {
                    doc += 'Custom SObject';
                } else {
                    doc += 'Standard SObject';
                }
                if (sObject.namespace && sObject.namespace !== nameTmp) {
                    doc += '\nNamespace: ' + sObject.namespace;
                }
                if (applicationContext.sfData.serverInstance) {
                    doc += '\n\n[Lightning Setup](' + applicationContext.sfData.serverInstance + '/lightning/setup/ObjectManager/' + sObject.name + '/Details/view)';
                }
                documentation.appendApexCodeBlock(sObject.name);
                documentation.appendMarkdown(doc + '\n\n');
                const options = ProviderUtils.getCompletionItemOptions('SObject', documentation.build(), sObject.name, true, CompletionItemKind.Class);
                const item = ProviderUtils.createItemForCompletion(sObject.name, options);
                if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
                    item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
                }
                items.push(item);
            });
        }
        Utils.sort(items, ['label']);
        return items;
    }

    static getCustomLabels(): any[] {
        let labels = [];
        let labelsFile = Paths.getProjectMetadataFolder() + '/labels/CustomLabels.labels-meta.xml';
        if (FileChecker.isExists(labelsFile)) {
            let root = XMLParser.parseXML(FileReader.readFileSync(labelsFile));
            if (root.CustomLabels) {
                if (Array.isArray(root.CustomLabels.labels)) {
                    labels = root.CustomLabels.labels;
                } else {
                    labels.push(root.CustomLabels.labels);
                }
            }
        }
        return labels;
    }

    static joinActivationTokens(tokens: ActivationToken[], symbol: string) {
        const result: string[] = [];
        for (const token of tokens) {
            result.push(token.activation);
        }
        return result.join(symbol);
    }
}

function countStartTabs(str: string) {
    let number = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\t') {
            number++;
        } else if (str[i] !== ' ') {
            break;
        }
    }
    return number;
}