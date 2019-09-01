const logger = require('./logger');

function getApexComment(apexClassOrMethod, addOpenAndClose) {
    let comment = ``;
    let whitespace = '';
    let firstChar = '/**';
    if (apexClassOrMethod.methodName !== undefined) {
        // Generating the Snippet as a string.
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${apexClassOrMethod.methodName} description}\n${whitespace} *\n`;
        // The padding is a string that is a bunch of spaces equal to the maximum size of the variable.
        let snippetNum = 2;
        for (let variable of apexClassOrMethod.parameters) {
            var varName = variable.name;
            var varType = variable.type;
            // No need to import any right-pad node libraries here!
            comment += `${whitespace} * ## \${${snippetNum}:${varName}} (${varType}): \${${snippetNum}:${varName} description}\n`;
            snippetNum++;
        }
        // If we DIDN'T find the word "void" in the method signature, show the return line
        if (apexClassOrMethod.hasReturn) {
            comment += `${whitespace} *\n${whitespace} * @@ Return ${apexClassOrMethod.returnType}: \${${snippetNum}:return description}\n`;
        }
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    } else if(apexClassOrMethod.className !== undefined){
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${apexClassOrMethod.className} description}\n`;
        comment += `${whitespace} *\n`;
        comment += `${whitespace} * @@ TestClass => \${2:${apexClassOrMethod.className} test class}\n`;
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    }
    logger.log('comment', comment);
    return comment;
}

function getJSFunctionSnippet(numParams) {
    var funcBody = `\${1:funcName} : function(`;
    if (numParams > 0) {
        var params = [];
        for (let i = 0; i < numParams; i++) {
            var nParam = i + 1;
            var snippetNum = i + 2;
            params.push(`\${${snippetNum}:param_${nParam}}`);
        }
        funcBody += params.join(`, `);
    }
    funcBody += `){\n\t$0\n},`;
    return funcBody;
}

module.exports = {
    getJSFunctionSnippet,
    getApexComment
}