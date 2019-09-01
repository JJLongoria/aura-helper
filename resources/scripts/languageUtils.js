const logger = require('./logger');

function getCommentForApex(str, needWhitespace, addOpenAndClose) {
    logger.log('Execute getCommentForApex method');
    logger.log('str', str);
    logger.log('needWhitespace', needWhitespace);
    logger.log('addOpenAndClose', addOpenAndClose);
    let whitespace;
    let firstChar = '';
    // If we need whitespace, find out how much. We also need to add the first slash as a character since it won't already be typed.
    if (needWhitespace) {
        const whitespaceRE = new RegExp(/^[\s\t]+/);
        whitespace = whitespaceRE.test(str) ? whitespaceRE.exec(str) : '';
        firstChar = '/**';
    }
    else {
        whitespace = '';
        firstChar = '/**';
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
    let comment = ``;
    if (methodName !== undefined) {
        let variableList = new Array();
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
        logger.log('methodName', methodName);
        logger.log('className', className);
        logger.log('hasReturn', hasReturn);
        logger.logJSON('variableList', variableList);
        logger.log('maxSize', maxSize);

        // Generating the Snippet as a string.
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${methodName} description}\n${whitespace} *\n`;
        // The padding is a string that is a bunch of spaces equal to the maximum size of the variable.
        let snippetNum = 2;
        for (let variable of variableList) {
            var varName = variable.name;
            var varType = variable.type;
            // No need to import any right-pad node libraries here!
            comment += `${whitespace} * ## \${${snippetNum}:${varName}} (${varType}): \${${snippetNum}:${varName} description}\n`;
            snippetNum++;
        }
        // If we DIDN'T find the word "void" in the method signature, show the return line
        if (hasReturn) {
            comment += `${whitespace} *\n${whitespace} * @@ Return ${returnType}: \${${snippetNum}:return description}\n`;
        }
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    } else {
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${className} description}\n`;
        comment += `${whitespace} *\n`;
        comment += `${whitespace} * @@ TestClass => \${2:${className} test class}\n`;
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    }
    logger.log('comment', comment);
    return comment;
}

module.exports = {
    getCommentForApex
}