const logger = require('./logger');

function parseApexClassOrMethod(str, needWhitespace, addOpenAndClose) {
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

module.exports = {
    parseApexClassOrMethod
}