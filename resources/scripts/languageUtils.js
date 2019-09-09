const logger = require('./logger');
const fileUtils = require('./fileUtils');
const constants = require('./constants');

function parseApexClassOrMethod(str) {
    logger.log('Execute parseApexClassOrMethod method');
    var apexClassOrMethod = {
        methodName: '',
        className: '',
        hasReturn: false,
        returnType: '',
        parameters: []
    }
    const methodSplit = str.split(/[\s\t]/);
    let hasReturn = true;
    let methodName;
    let lastResult;
    let returnType;
    let className;
    // Find the name of the method. We are tokenizing by a space.
    for (let thisStr of methodSplit) {
        const paren = thisStr.indexOf('(');
        if (paren === 0) {
            // If the paren is at 0 of this token, then the method name is the previous token (the user typed "myFunc ()")
            methodName = lastResult;
            break;
        }
        else if (paren > 0) {
            // If the paren is greater than 0 of this token, then the method name is in this token (the user typed "myFunc()")
            methodName = thisStr.substr(0, paren);
            break;
        }
        else if (thisStr.toLowerCase() === 'void') {
            // If this token is the word void, there is no return parameter, so we don't need to show that part of the javadoc.
            hasReturn = false;
        } else if (thisStr.toLowerCase() !== 'void') {
            returnType = thisStr.toLowerCase();
        }
        // We store this token so we can access it on the next pass if needed.
        lastResult = thisStr;
    }
    if (methodName === undefined) {
        let isOnClass = false;
        for (let thisStr of methodSplit) {
            if (isOnClass) {
                className = thisStr;
                isOnClass = false;
            }
            if (thisStr === 'class') {
                isOnClass = true;
            }
        }
    }
    logger.log('methodName', methodName);
    logger.log('className', className);
    if (methodName === undefined && className === undefined) {
        return ``;
    }
    let variableList = new Array();
    if (methodName !== undefined) {
        let maxSize = 0;
        const variableRE = new RegExp(/\(([^)]+)\)/);
        // If there are variables, this extracts the list of them.
        if (variableRE.test(str)) {
            const varStr = variableRE.exec(str)[1];
            const varSplit = varStr.split(',');
            // We tokenize by the comma.
            for (let thisStr of varSplit) {
                // Trimming any whitespace in this token
                const thisVar = thisStr.trim().split(' ');
                // If this is a valid variable with two words in it, add it to the array.
                if (thisVar.length === 2) {
                    let variable = {
                        type: thisVar[0],
                        name: thisVar[1]
                    };
                    variableList.push(variable);
                    // We're keeping track of the maximum length of the variables so we can format nicely
                    if (variable.name.length + variable.type.length > maxSize) {
                        maxSize = variable.name.length + variable.type.length;
                    }
                }
            }
        }
    }
    apexClassOrMethod.methodName = methodName;
    apexClassOrMethod.className = className;
    apexClassOrMethod.hasReturn = hasReturn;
    apexClassOrMethod.returnType = returnType;
    apexClassOrMethod.parameters = variableList;
    return apexClassOrMethod;
}

function parseJSFile(fileContent) {
    let tokens = tokenize(fileContent);
    return parseTokensForJS(tokens);
}

function parseCMPFile(fileContent) {
    let tokens = tokenize(fileContent);
    return parseTokensForCMP(tokens);
}

function parseApexClassFile(fileContent) {
    let tokens = tokenize(fileContent);
    return parseTokensForApexClass(tokens);
}

function tokenize(str) {
    const NUM_FORMAT = /[0-9]/;
    const ID_FORMAT = /([a-zA-Z0-9À-ú]|_)/;
    let tokens = [];
    let charIndex = 0;
    let lineNumber = 1;
    let column = 0;
    while (charIndex < str.length) {
        let char = str.charAt(charIndex);
        let token = {};
        if (char === ",") {
            token.tokenType = 'comma';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (/\+|-|\*|\/|\^/.test(char)) {
            token.tokenType = 'operator';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === '\\') {
            token.tokenType = 'backslash';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "(") {
            token.tokenType = 'lParen';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === ")") {
            token.tokenType = 'rParen';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "{") {
            token.tokenType = 'lBracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "}") {
            token.tokenType = 'rBracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "[") {
            token.tokenType = 'lSQBracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "]") {
            token.tokenType = 'rSQBracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === ".") {
            token.tokenType = 'dot';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === ":") {
            token.tokenType = 'colon';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === ";") {
            token.tokenType = 'semicolon';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "<") {
            token.tokenType = 'lABracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === ">") {
            token.tokenType = 'rABracket';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "&") {
            token.tokenType = 'and';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "|") {
            token.tokenType = 'or';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "'") {
            token.tokenType = 'sQuotte';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "\"") {
            token.tokenType = 'quotte';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "!") {
            token.tokenType = 'exMark';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "?") {
            token.tokenType = 'qMark';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "@") {
            token.tokenType = 'at';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "#") {
            token.tokenType = 'sharp';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "=") {
            token.tokenType = 'equal';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "$") {
            token.tokenType = 'dollar';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "%") {
            token.tokenType = 'percent';
            token.content = char;
            token.line = lineNumber;
            token.startColumn = column;
            token.endColumn = column + char.length;
        } else if (char === "€") {
            token.tokenType = 'symbol';
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
                column++;
            }
            token.tokenType = 'number';
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
                column++;
            }
            token.tokenType = 'identifier';
            token.content = content;
            token.line = lineNumber;
            token.endColumn = token.startColumn + token.content.length;
            tokens.push(token);
            continue;
        } else if (char === "\n") {
            lineNumber++;
            column = 0;
        } else if (char !== "\t" && char !== "\r" && char !== " ") {
            throw new Error('Character not recognized: ' + char + ' at line: ' + lineNumber + '; Start Column: ' + column + '; End Column: ' + (column + char.length));
        }
        if (token.tokenType) {
            tokens.push(token);
        }
        charIndex++;
        column++;
    }
    return tokens;
}

function parseTokensForJS(tokens) {
    logger.log('Run parseTokensForJS method');
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
        let lastToken;
        let token = tokens[index];
        let nextToken;
        let func = {};
        if (index - 1 >= 0)
            lastToken = tokens[index - 1];
        if (index + 1 < tokens.length)
            nextToken = tokens[index + 1];
        if (token.tokenType === 'lBracket') {
            bracketIndent++;
        }
        if (token.tokenType === 'rBracket') {
            bracketIndent--;
        }
        if (token.tokenType === 'lParen') {
            parenIndent++;
        }
        if (token.tokenType === 'rParen') {
            parenIndent--;
        }
        if (parenIndent == 1 && bracketIndent == 1) {
            if (token.tokenType === 'colon') {
                if (lastToken && lastToken.tokenType === 'identifier' && nextToken && nextToken.tokenType == 'identifier' && nextToken.content === 'function') {
                    logger.log('On Function');
                    // On function
                    let startParams;
                    func.name = lastToken.content;
                    func.token = lastToken;
                    func.params = [];
                    let paramNames = [];
                    if (comment.description)
                        func.comment = comment;
                    comment = {
                        description: null,
                        params: []
                    };
                    while (token.tokenType !== 'rParen') {
                        token = tokens[++index];
                        if (token.tokenType === 'lParen') {
                            startParams = true;
                        } else if (startParams) {
                            if (token.tokenType === 'identifier') {
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
                    fileStructure.functions.push(func);
                }
            }
            else if (token.tokenType === 'operator' && token.content === '*') {
                if (lastToken && lastToken.tokenType === 'operator' && lastToken.content === '/' && nextToken && nextToken.tokenType == 'operator' && nextToken.content === '*') {
                    // On Comment
                    logger.log('On Comment');
                    let description = '';
                    let endComment = false;
                    while (token.tokenType !== 'at' && !endComment) {
                        token = tokens[++index];
                        lastToken = tokens[index - 1];
                        nextToken = tokens[index + 1];
                        endComment = token.tokenType === 'operator' && token.content === '*' && nextToken.tokenType === 'operator' && nextToken.content === '/';
                        if (!endComment) {
                            if (token.lineNumber > lastToken.lineNumber)
                                description += '\n';
                            else if ((token.tokenType !== 'operator' && token.content !== '*') && (token.tokenType !== 'at' && nextToken.content !== 'param')) {
                                description += getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;;
                            }
                        }
                    }
                    comment.description = description;
                    comment.params = [];
                    while (!endComment) {
                        token = tokens[++index];
                        lastToken = tokens[index - 1];
                        nextToken = tokens[index + 1];
                        if (token.tokenType === 'identifier' && token.content === 'param') {
                            let commentParam = {};
                            while (token.tokenType !== 'at' && nextToken.content !== 'param' && !endComment) {
                                token = tokens[++index];
                                lastToken = tokens[index - 1];
                                nextToken = tokens[index + 1];
                                endComment = token.tokenType === 'operator' && token.content === '*' && nextToken.tokenType === 'operator' && nextToken.content === '/';
                                if (!endComment) {
                                    if (lastToken.tokenType === 'lBracket') {
                                        commentParam.type = token.content;;
                                    } else if (lastToken.tokenType === 'rBracket') {
                                        commentParam.name = token.content;
                                    } else if (commentParam.name) {
                                        if (!commentParam.description) {
                                            commentParam.description = '';
                                        }
                                        if (token.lineNumber > lastToken.lineNumber) {
                                            description += '\n';
                                        }
                                        if ((token.tokenType !== 'operator' && token.content !== '*') && (token.tokenType !== 'at' && nextToken.content !== 'param')) {
                                            commentParam.description += getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;
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

function parseTokensForCMP(tokens) {
    logger.log('Run parseTokensForCMP method');
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
        let lastToken = getLastToken(tokens, index);
        let token = tokens[index];
        let nextToken = getNextToken(tokens, index);
        if (token.tokenType === 'lABracket')
            bracketIndent++;
        if (token.tokenType === 'rABracket')
            bracketIndent--;
        if (bracketIndent == 1) {
            if (token.tokenType === 'colon' && lastToken && lastToken.tokenType === 'identifier' && lastToken.content === 'aura' && nextToken && nextToken.tokenType === 'identifier' && nextToken.content === 'component') {
                // Is on Component
                let fileStruc = getTagData(tokens, index);
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
            else if (token.tokenType === 'colon' && lastToken && lastToken.tokenType === 'identifier' && lastToken.content === 'aura' && nextToken && nextToken.tokenType === 'identifier' && nextToken.content === 'attribute') {
                // Is on Attribute
                fileStructure.attributes.push(getTagData(tokens, index));
            } else if (token.tokenType === 'colon' && lastToken && lastToken.tokenType === 'identifier' && lastToken.content === 'aura' && nextToken && nextToken.tokenType === 'identifier' && nextToken.content === 'registerEvent') {
                // Is on Events
                fileStructure.events.push(getTagData(tokens, index));
            } else if (token.tokenType === 'colon' && lastToken && lastToken.tokenType === 'identifier' && lastToken.content === 'aura' && nextToken && nextToken.tokenType === 'identifier' && nextToken.content === 'handler') {
                // Is on Handlers
                fileStructure.handlers.push(getTagData(tokens, index));
            }
        }
        index++;
    }
    return fileStructure;
}

function parseTokensForApexClass(tokens) {
    logger.log('Run parseTokensForApexClass method');
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
    while (index < tokens.length) {
        let lastToken = getLastToken(tokens, index);
        let token = tokens[index];
        let nextToken = getNextToken(tokens, index);
        if (token.tokenType === 'lBracket') {
            bracketIndent++;
        }
        else if (token.tokenType === 'rBracket') {
            bracketIndent--;
        }
        if (bracketIndent === 0) {
            if (token.tokenType === 'identifier' && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private'))
                fileStructure.modifier = token.content;
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'without' && nextToken && nextToken.tokenType === 'identifier' && nextToken.content.toLowerCase() === 'sharing')
                fileStructure.withSharing = false;
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'class' && nextToken && nextToken.tokenType === 'identifier')
                fileStructure.className = nextToken.content;
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'abstract')
                fileStructure.abstract = true;
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'virtual')
                fileStructure.virtual = true;
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'implements') {
                var interfaceName = "";
                while (token.content !== 'extends' || token.tokenType !== 'lBracket') {
                    token = tokens[index];
                    if (token.tokenType === 'lABracket') {
                        aBracketIndent++;
                    }
                    else if (token.tokenType === 'rABracket') {
                        aBracketIndent--;
                    }
                    if (token.tokenType === 'comma' && aBracketIndent == 0) {
                        fileStructure.implements.push(interfaceName);
                        interfaceName = "";
                    } else {
                        interfaceName += token.content;
                    }
                    index++;
                }
                if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'extends') {
                    var extendsName = "";
                    while (token.tokenType !== 'lBracket') {
                        token = tokens[index];
                        if (token.tokenType !== 'lBracket')
                            extendsName += token.content;
                        index++;
                    }
                    fileStructure.extends = extendsName;
                }
                if (token.tokenType === 'lBracket')
                    bracketIndent++;
            } else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'extends') {
                var extendsName = "";
                while (token.tokenType !== 'lBracket') {
                    token = tokens[index];
                    if (token.tokenType !== 'lBracket')
                        extendsName += token.content;
                    index++;
                }
                fileStructure.extends = extendsName;
                if (token.tokenType === 'lBracket')
                    bracketIndent++;
            }
        } else if (bracketIndent === 1) {
            if (token.tokenType === 'operator' && token.content === '/' && nextToken && nextToken.tokenType === 'operator' && nextToken.content === '*') {
                let endComment = false;
                while (!endComment) {
                    token = tokens[index];
                    nextToken = getNextToken(tokens, index);
                    endComment = token.tokenType === 'operator' && token.content === '*' && nextToken && nextToken.tokenType === 'operator' && nextToken.content === '/';
                    index++;
                }
            } else if (token.tokenType === 'identifier' && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private' || token.content.toLowerCase() === 'webservice' || token.content.toLowerCase() === 'protected')) {
                modifier = token.content;
                returnIndexStart = index + 1;
            }
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'abstract') {
                isAbstrac = true;
                returnIndexStart = index + 1;
            }
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'virtual') {
                isVirtual = true;
                returnIndexStart = index + 1;
            }
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'static') {
                isStatic = true;
                returnIndexStart = index + 1;
            }
            else if (token.tokenType === 'identifier' && token.content.toLowerCase() === 'final') {
                isFinal = true;
                returnIndexStart = index + 1;
            }
            else if (token.tokenType === 'at' && nextToken && nextToken.tokenType === 'identifier') {
                annotation = "@";
                while (token.line == nextToken.line) {
                    index++;
                    token = tokens[index];
                    nextToken = getNextToken(tokens, index);
                    annotation += token.content;
                }
            }
            else if (token.tokenType === 'identifier' && nextToken && nextToken.tokenType === 'lParen') {
                returnIndexEnd = index;
                name = token.content;
                let param = {
                    name: "",
                    type: ""
                };
                while (token.tokenType !== 'rParen') {
                    token = tokens[index];
                    lastToken = getLastToken(tokens, index);
                    nextToken = getNextToken(tokens, index);
                    if (token.tokenType === 'lParen') {
                        parenIndent++;
                    }
                    else if (token.tokenType === 'rParen') {
                        parenIndent--;
                    }
                    else if (token.tokenType === 'lABracket') {
                        aBracketIndent++;
                    }
                    else if (token.tokenType === 'rABracket') {
                        aBracketIndent--;
                    }
                    if ((nextToken.tokenType === 'comma' || nextToken.tokenType === 'rParen') && token.tokenType !== 'lParen' && aBracketIndent == 0) {
                        param.name = token.content;
                        methodParams.push(param);
                        param = {
                            name: "",
                            type: ""
                        };
                    } else if (parenIndent > 0 && token.tokenType !== 'lParen' && token.tokenType !== 'comma') {
                        param.type += token.content;
                    }
                    index++;
                }
                index--;
                if (!modifier)
                    modifier = 'public';
                returnType = getMethodReturnType(returnIndexStart, returnIndexEnd, tokens);
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
                let method = {
                    name: name,
                    annotation: annotation,
                    modifier: modifier,
                    isStatic: isStatic,
                    abstract: isAbstrac,
                    virtual: isVirtual,
                    params: methodParams,
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
        index++;
    }
    return fileStructure;
}

function getMethodReturnType(indexStart, indexEnd, tokens) {
    let returnType = '';
    for (let index = indexStart; index < indexEnd; index++) {
        returnType += tokens[index].content;
    }
    return returnType;
}

function analizeComponentTag(componentTag, position) {
    logger.log('componentTag', componentTag);
    let componentTagData = {
        namespace: "",
        name: "",
        attributes: {}
    };
    let componentTokens = tokenize(componentTag);
    let index = 0;
    while (index < componentTokens.length) {
        let token = componentTokens[index];
        let lastToken = getLastToken(componentTokens, index);
        let nextToken = getNextToken(componentTokens, index);
        if (token.tokenType === 'colon' && lastToken && lastToken.tokenType === 'identifier' && nextToken && nextToken.tokenType === 'identifier') {
            componentTagData.namespace = lastToken.content;
            componentTagData.name = nextToken.content;
            let tagData = getTagData(componentTokens, index);
            Object.keys(tagData).forEach(function (key) {
                componentTagData.attributes[key] = tagData[key];
            });
            break;
        }
        index++;
    }
    logger.logJSON('componentTagData', componentTagData);
    return componentTagData;
}

function getComponentStructure(componentPath) {
    let baseComponentsDetail = JSON.parse(fileUtils.getFileContent(fileUtils.getBaseComponentsDetailPath(constants.applicationContext)));
    let componentName = fileUtils.basename(componentPath).replace('.cmp', '');
    let componentFileText = fileUtils.getFileContent(componentPath);
    let componentStructure = parseCMPFile(componentFileText);
    if (!componentStructure.attributes) {
        componentStructure.attributes = [];
    }
    for (const rootDetail of baseComponentsDetail['root']['component']) {
        componentStructure.attributes.push(rootDetail);
    }
    componentStructure.controllerFunctions = getControllerFunctions(componentPath);
    componentStructure.helperFunctions = getHelperFunctions(componentPath);
    if (componentStructure.controller) {
        let classPath = componentPath.replace('aura\\' + componentName + '\\' + componentName + '.cmp', 'classes\\' + componentStructure.controller + '.cls');
        let classStructure = parseApexClassFile(fileUtils.getFileContent(classPath));
        componentStructure.apexFunctions = classStructure.methods;
    }
    let parentComponentStructure = componentStructure;
    while (parentComponentStructure.extends) {
        let parentComponentName = parentComponentStructure.extends.replace('c:', '');
        let parentFileName = componentPath.replace(new RegExp(componentName, 'g'), parentComponentName);
        parentComponentStructure = parseCMPFile(fileUtils.getFileContent(parentFileName));
        parentComponentStructure.controllerFunctions = getControllerFunctions(parentFileName);
        parentComponentStructure.helperFunctions = getHelperFunctions(parentFileName);
        if (parentComponentStructure.controller) {
            let classPath = componentPath.replace('aura\\' + componentName + '\\' + componentName + '.cmp', 'classes\\' + parentComponentStructure.controller + '.cls');
            let classStructure = parseApexClassFile(fileUtils.getFileContent(classPath));
            for (const method of classStructure.methods) {
                let existing = false;
                for (const existingMethod of classStructure.methods) {
                    if (method.name === existingMethod.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.apexFunctions.push(method);
            }
        }
        for (const attribute of parentComponentStructure.attributes) {
            let existing = false;
            for (const existingAttr of componentStructure.attributes) {
                if (attribute.name === existingAttr.name) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.attributes.push(attribute);
        }
        for (const implement of parentComponentStructure.implements) {
            let existing = false;
            for (const existingImp of componentStructure.implements) {
                if (existingImp === implement) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.implements.push(implement);
        }
        for (const event of parentComponentStructure.events) {
            let existing = false;
            for (const existingEvent of componentStructure.events) {
                if (event.name === existingEvent.name) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.events.push(event);
        }
        for (const handler of parentComponentStructure.handlers) {
            let existing = false;
            for (const existingHandler of componentStructure.handlers) {
                if (handler.name === existingHandler.name) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.handlers.push(handler);
        }
        for (const func of parentComponentStructure.controllerFunctions) {
            let existing = false;
            for (const existingFunc of componentStructure.controllerFunctions) {
                if (func.name === existingFunc.name) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.controllerFunctions.push(func);
        }
        for (const func of parentComponentStructure.helperFunctions) {
            let existing = false;
            for (const existingFunc of componentStructure.helperFunctions) {
                if (func.name === existingFunc.name) {
                    existing = true;
                    break;
                }
            }
            if (!existing)
                componentStructure.helperFunctions.push(func);
        }
    }
    if (componentStructure.implements && componentStructure.implements.length > 0) {
        for (const implement of componentStructure.implements) {
            let interfaceToCheck = implement;
            if (interfaceToCheck.indexOf('lightning:isUrlAddressable') !== -1)
                interfaceToCheck = 'lightning:hasPageReference';
            let splits = interfaceToCheck.split(':');
            let ns = splits[0];
            let componentName = splits[1];
            let interfaceNS = baseComponentsDetail[ns];
            if (interfaceNS) {
                let attributes = interfaceNS[componentName];
                if (attributes && attributes.length > 0) {
                    for (const attribute of attributes) {
                        let existing = false;
                        for (const existingAttr of componentStructure.attributes) {
                            if (attribute.name === existingAttr.name) {
                                existing = true;
                                break;
                            }
                        }
                        if (!existing)
                            componentStructure.attributes.push(attribute);
                    }
                }
            }
        }
    }
    return componentStructure;
}

function getControllerFunctions(componentPath) {
    let controllerPath = componentPath.replace('.cmp', 'Controller.js');
    return getJSFunctions(controllerPath);
}

function getHelperFunctions(componentPath) {
    let helperPath = componentPath.replace('.cmp', 'Helper.js');
    return getJSFunctions(helperPath);
}

function getJSFunctions(jsPath) {
    let functions = [];
    if (fileUtils.isFileExists(jsPath)) {
        let controllerContent = fileUtils.getFileContent(jsPath);
        let fileStructure = parseJSFile(controllerContent);
        functions = fileStructure.functions;
    }
    return functions;
}

function getTagData(tokens, index) {
    let tagData = {};
    let isOnValue = false;
    let paramName;
    let paramValue = '';
    let token = tokens[index];
    while (token.tokenType !== 'rABracket') {
        token = tokens[index];
        let lastToken = getLastToken(tokens, index);
        let nextToken = getNextToken(tokens, index);
        if (token && token.tokenType === 'equal' && lastToken && lastToken.tokenType === 'identifier' && nextToken && nextToken.tokenType === 'quotte') {
            paramName = lastToken.content;
        }
        else if (token && token.tokenType === 'quotte' && lastToken && lastToken.tokenType === 'equal') {
            isOnValue = true;

        } else if (token && token.tokenType === 'quotte' && lastToken && lastToken.tokenType !== 'backslash') {
            isOnValue = false;
            if (paramName)
                tagData[paramName] = paramValue;
            paramName = undefined;
            paramValue = '';

        } else if (isOnValue) {
            paramValue += getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;
        }
        index++;
    }
    return tagData;
}

function getNextToken(tokens, index) {
    if (index + 1 < tokens.length)
        return tokens[index + 1];
}

function getLastToken(tokens, index) {
    if (index - 1 >= 0)
        return tokens[index - 1];
}

function getWhitespaces(number) {
    let whitespace = '';
    for (let index = 0; index < number; index++) {
        whitespace += ' ';
    }
    return whitespace;
}

module.exports = {
    parseApexClassOrMethod,
    parseJSFile,
    parseCMPFile,
    getComponentStructure,
    tokenize,
    analizeComponentTag
}
