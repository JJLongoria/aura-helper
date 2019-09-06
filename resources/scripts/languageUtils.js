const logger = require('./logger');

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
    let index = 0;
    let bracketIndent = 0;
    let parenIndent = 0;
    let fileStructure = [];
    let comment = {
        description: '',
        params: []
    };
    while (index < tokens.length) {
        let lastToken;
        let token = tokens[index];
        let nextToken;
        let structure = {};
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
                    // On function
                    let startParams;
                    structure.token = lastToken;
                    structure.type = "func";
                    structure.params = [];
                    if (comment.description)
                        structure.comment = comment;
                    comment = {
                        description: null,
                        params: []
                    };
                    while (token.tokenType !== 'rParen') {
                        token = tokens[++index];
                        if (token.tokenType === 'lParen') {
                            startParams = true;
                        } else if (startParams) {
                            if (token.tokenType === 'identifier')
                                structure.params.push({
                                    token: token,
                                    type: "param",
                                });
                        }
                    }
                    fileStructure.push(structure);
                }
            }
        }
        if (token.tokenType === 'operator' && token.content === '*') {
            if (lastToken && lastToken.tokenType === 'operator' && lastToken.content === '/' && nextToken && nextToken.tokenType == 'operator' && nextToken.content === '*') {
                // On Comment
                let description = '';
                while (token.tokenType !== 'at') {
                    token = tokens[++index];
                    lastToken = tokens[index - 1];
                    if (token.lineNumber > lastToken.lineNumber)
                        description += '\n';
                    else if ((token.tokenType !== 'operator' && token.content !== '*') && (token.tokenType !== 'at' && nextToken.content !== 'param')) {
                        description += getWhitespaces(token.startColumn - lastToken.endColumn) + token.content;;
                    }
                }
                comment.description = description;
                comment.params = [];
                let endComment = false;
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
        implements: [],
        extensible: false,
        abstract: false
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
                if (fileStruc.implements){
                    let splits = fileStruc.implements.split(',');
                    for (const split of splits) {
                        fileStructure.implements.push(split.trim());
                    }
                }
                if (fileStruc.abstract)
                    fileStructure.abstract = fileStruc.abstract;
                if (fileStruc.extends)
                    fileStructure.extends = fileStruc.extends;
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
    parseCMPFile
}
