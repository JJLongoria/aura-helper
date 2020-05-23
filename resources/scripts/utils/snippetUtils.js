const logger = require('./logger');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;

function getApexComment(data, commentTemplate) {
    logger.log("Run getApexComment Method");
    let comment = ``;
    let lines = [];
    let snippetNum = 1;
    if (data.methodData.name !== undefined) {
        let startParamsCharacters = "";
        for (let i = 0; i < commentTemplate.methodComment.commentBody.length; i++) {
            var line = commentTemplate.methodComment.commentBody[i];
            if (line.indexOf("{!method.params}") !== -1)
                startParamsCharacters = line.substring(0, line.indexOf("{!method.params}"));
            if (data.methodData.params.length == 0 && line.indexOf("{!method.params}") !== -1)
                continue;
            if ((!data.methodData.returnType || data.methodData.returnType === 'void') && line.indexOf("{!method.return}") !== -1)
                continue;
            lines.push(line);
        }
        comment = lines.join('\n');
        logger.log("comment", comment);
        comment = comment.replace(`{!method.description}`, `\${${snippetNum++}:${data.methodData.name} description}`);
        let varIndex = 0;
        let params = [];
        for (let variable of data.methodData.params) {
            let paramBody = commentTemplate.methodComment.paramBody.replace(`{!param.name}`, `\${${snippetNum}:{!param.name}}`).replace(`{!param.description}`, `\${${snippetNum}:!param.name description}`);
            paramBody = paramBody.replace('{!param.name}', variable.name).replace('{!param.type}', variable.type);
            if (varIndex != 0)
                paramBody = startParamsCharacters + paramBody;
            params.push(paramBody);
            snippetNum++;
            varIndex++;
        }
        comment = comment.replace(`{!method.params}`, params.join('\n'));
        if (data.methodData.returnType && data.methodData.returnType !== 'void') {
            let returnBody = commentTemplate.methodComment.returnBody.replace(`{!return.description}`, `\${${snippetNum}:Return description}`);
            returnBody = returnBody.replace("{!return.type}", data.methodData.returnType);
            comment = comment.replace('{!method.return}', returnBody);
        }
    } else if (data.classData.name !== undefined) {
        for (let i = 0; i < commentTemplate.classComment.commentBody.length; i++) {
            var line = commentTemplate.classComment.commentBody[i];
            lines.push(line);
        }
        comment = lines.join('\n');
        comment = comment.replace(`{!class.description}`, `\${${snippetNum}:` + data.classData.name + ` Description}`).replace('{!class.name}', data.classData.name);
    } else {
        comment = '/**\n';
        comment += ' * ' + `\${0:description}` + '\n';
        comment += ' */';
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

function getMethodsContent(fileStructure, methodTemplate, paramTemplate, indent) {
    var content = "";
    if (fileStructure && fileStructure.functions) {
        for (let i = 0; i < fileStructure.functions.length; i++) {
            content += getMethodContent(fileStructure.functions[i], methodTemplate, paramTemplate, indent);
        }
    }
    return content;
}

function getMethodContent(func, methodTemplate, paramTemplate, indent) {
    var content = "";
    var paramsIndent = "";
    for (let i = 0; i < methodTemplate.length; i++) {
        var line = methodTemplate[i];
        if (line.indexOf('{!method.params}') !== -1) {
            paramsIndent = getIndent(line);
            line = line.trimLeft();
            content += line + '\n';
        } else {
            content += indent + line + '\n';
        }
    }
    var paramsContent = "";
    var methodDesc = "<!-- Method Description Here -->";
    if (func.comment) {
        methodDesc = func.comment.description;
        for (let i = 0; i < func.comment.params.length; i++) {
            paramsContent += getParamContentFromComment(func.comment.params[i], paramTemplate, indent + paramsIndent);
        }
    }
    else {
        for (let i = 0; i < func.params.length; i++) {
            paramsContent += getParamContent(func.params[i], paramTemplate, indent + paramsIndent);
        }
    }
    content = content.replace("{!method.name}", func.name);
    content = content.replace("{!method.description}", methodDesc);
    content = content.replace("{!method.signature}", func.signature);
    content = content.replace("{!method.auraSignature}", func.auraSignature);
    content = content.replace("{!method.params}", paramsContent);
    return content;
}

function getParamContent(param, paramTemplate, indent) {
    var content = "";
    for (let i = 0; i < paramTemplate.length; i++) {
        var line = paramTemplate[i];
        content += indent + line + '\n';
    }
    content = content.replace("{!param.name}", param.name).replace("{!param.type}", "*").replace("{!param.description}", "<!-- Param Description Here -->");
    return content;
}

function getParamContentFromComment(commentParam, paramTemplate, indent) {
    var content = "";
    for (let i = 0; i < paramTemplate.length; i++) {
        var line = paramTemplate[i];
        content += indent + line + '\n';
    }
    content = content.replace("{!param.name}", commentParam.name).replace("{!param.type}", commentParam.type).replace("{!param.description}", commentParam.description);
    return content;
}

function getIndent(line) {
    let indent = "";
    for (let i = 0; i < line.length; i++) {
        let char = line[i];
        if (char === ' ' || char === '\t')
            indent += char;
        else
            break;
    }
    return indent;
}

function getWhitespaces(number) {
    let ws = "";
    for (let i = 0; i < number; i++) {
        ws += ' ';
    }
    return ws;
}

function getAuraDocumentationSnippet(controllerMethods, helperMethods, templateContent) {
    let documentationTextJson = JSON.parse(templateContent);
    let documentationText = "";
    let helperSectionIndent = '';
    let controllerSectionIndent = '';
    for (let i = 0; i < documentationTextJson.documentbody.length; i++) {
        var line = documentationTextJson.documentbody[i];
        if (line.indexOf('{!helperMethods}') !== -1) {
            helperSectionIndent = getIndent(line);
            line = line.trimLeft();
        }
        else if (line.indexOf('{!controllerMethods}') !== -1) {
            controllerSectionIndent = getIndent(line);
            line = line.trimLeft();
        }
        documentationText += line + '\n';
    }
    var helperMethodsContent = getMethodsContent(helperMethods, documentationTextJson.methodBody, documentationTextJson.paramBody, helperSectionIndent);
    var controllerMethodsContent = getMethodsContent(controllerMethods, documentationTextJson.methodBody, documentationTextJson.paramBody, controllerSectionIndent);
    documentationText = documentationText.replace("{!helperMethods}", helperMethodsContent).replace("{!controllerMethods}", controllerMethodsContent);
    return documentationText;
}

function getCSSFileSnippet() {
    return ".THIS {\n}"
}

function getDesignFileSnippet() {
    return "<design:component >\n\t\n</design:component>"
}

function getSVGFileSnippet() {
    let content = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n";
    content += "<svg width=\"120px\" height=\"120px\" viewBox=\"0 0 120 120\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
    content += "\t<g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n";
    content += "\t\t<path d=\"M120,108 C120,114.6 114.6,120 108,120 L12,120 C5.4,120 0,114.6 0,108 L0,12 C0,5.4 5.4,0 12,0 L108,0 C114.6,0 120,5.4 120,12 L120,108 L120,108 Z\" id=\"Shape\" fill=\"#2A739E\"/>\n";
    content += "\t\t<path d=\"M77.7383308,20 L61.1640113,20 L44.7300055,63.2000173 L56.0543288,63.2000173 L40,99.623291 L72.7458388,54.5871812 L60.907727,54.5871812 L77.7383308,20 Z\" id=\"Path-1\" fill=\"#FFFFFF\"/>\n";
    content += "\t</g>\n"
    content += "</svg>";
    return content;
}

function getControllerHelperFileSnippet(firstMethodName) {
    let content = "({\n";
    if (firstMethodName === 'controllerMethod')
        content += '\t' + firstMethodName + " : function (component, event, helper) {\n\t\t\n\t}\n";
    else
        content += '\t' + firstMethodName + " : function (component) {\n\t\t\n\t}\n";
    content += "})";
    return content;
}

function getRendererFileSnippet() {
    let content = "({";
    content += "\n\n// Your renderer method overrides go here\n\n"
    content += "})";
    return content;
}

function getAuraDocumentationBaseTemplate() {
    let auraDocTemplate = {
        "paramBody": "<li><i>{!param.name} ({!param.type}): </li> {!param.description}",
        "methodBody": [
            "<li>",
            "\t<b>{!method.signature}: </b> {!method.description}",
            "\t<ul>",
            "\t\t{!method.params}",
            "\t</ul>",
            "</li>"
        ],
        "documentbody": [
            "<aura:documentation>",
            "\t<aura:description>",
            "\t\t<h6><b>Short description</b> of the component</h6>",
            "\t\t<p>",
            "\t\t\tHelper methods:",
            "\t\t\t<ul>",
            "\t\t\t\t{!helperMethods}",
            "\t\t\t</ul>",
            "\t\t</p>\n",
            "\t</aura:description>",
            "\t<aura:example name=\"ExampleName\" ref=\"ExampleComponent\" label=\"ExampleLabel\">",
            "\t\t",
            "\t</aura:example>",
            "</aura:documentation>"
        ]
    };
    return JSON.stringify(auraDocTemplate, null, 4);
}

function getApexCommentBaseTemplate() {
    let commentTemplate = {
        "methodComment": {
            "paramBody": "## {!param.name} ({!param.type}): {!param.description}",
            "returnBody": "@@ Return {!returnType}",
            "commentBody": [
                "/**",
                " * {!method.description}",
                " *",
                " * {!method.params}",
                " * {!method.return}",
                " */"
            ]
        },
        "classComment": {
            "commentBody": [

            ]
        }
    }
    return JSON.stringify(commentTemplate, null, 4);
}

function getJSApexParamsSnippet(data, lineData) {
    let content = "";
    if (lineData.complete)
        content += "let \${1:params} = {\n";
    else
        content += "{\n";
    let cont = 0;
    let snippetNum = 2;
    for (const param of data.params) {
        if (data.params.length === 1)
            content += "\t" + param.name + ": \${" + snippetNum + ":value} \n";
        else {
            if (cont === data.params.length - 1)
                content += "\t" + param.name + ": \${" + snippetNum + ":value} \n";
            else
                content += "\t" + param.name + ": \${" + snippetNum + ":value}, \n";
        }
        snippetNum++;
        cont++;
    }
    content += "}";
    if (lineData.close)
        content += ';';
    return content;
}

module.exports = {
    getJSFunctionSnippet,
    getApexComment,
    getAuraDocumentationSnippet,
    getControllerHelperFileSnippet,
    getCSSFileSnippet,
    getDesignFileSnippet,
    getSVGFileSnippet,
    getRendererFileSnippet,
    getAuraDocumentationBaseTemplate,
    getApexCommentBaseTemplate,
    getMethodContent,
    getIndent,
    getWhitespaces,
    getJSApexParamsSnippet
}