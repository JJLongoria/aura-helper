import * as vscode from 'vscode';
import { applicationContext } from '../core/applicationContext';
import { Paths } from "../core/paths";
import { Config } from "../core/config";
import { ApexCommentsObjectData, ApexCommentTemplate, ProviderActivationInfo } from '../core/types';
const { StrUtils, Utils } = require('@aurahelper/core').CoreUtils;
const { PathUtils } = require('@aurahelper/core').FileSystem;
const { ApexNodeTypes } = require('@aurahelper/core').Values;

export class SnippetUtils {
    static getApexComment(apexNode: any, template: ApexCommentTemplate, filePath: string, declarationLine: vscode.TextLine): string {
        const insertSpaces = Config.insertSpaces();
        const tabSize = Config.getTabSize();
        let firstChar = declarationLine.firstNonWhitespaceCharacterIndex;
        let startWS;
        if (insertSpaces) {
            const spacesToInsert = firstChar;
            startWS = StrUtils.getWhitespaces(spacesToInsert);
        } else {
            startWS = StrUtils.getTabs(firstChar);
        }
        const baseComment = startWS + '/**\n' + startWS + ' * ${0:comment}\n' + startWS + ' */';
        let comment = '';
        if (Utils.isNull(apexNode) || !template) {
            return baseComment;
        }
        const nodeTemplate = getApexCommentNodeTemplate(apexNode, template);
        if (!nodeTemplate) {
            return baseComment;
        }
        const templateLines = nodeTemplate.template;
        if (Utils.isNull(template.tags) || !Utils.hasKeys(template.tags)) {
            comment = startWS + templateLines.join('\n' + startWS);
            if (StrUtils.contains(comment, '{!description}')) {
                return StrUtils.replace(comment, '{!description}', `\${0:` + apexNode.name + ` Description}`);
            } else {
                return comment;
            }
        } else {
            comment = templateLines.join('\n');
        }
        const keywordOrderByTag: any = {};
        let tagsOrder = [];
        let orderedTagsToRemove = [];
        for (const tagName of Object.keys(template.tags)) {
            if (!nodeTemplate.tags || !nodeTemplate.tags.includes(tagName)) {
                continue;
            }
            let tag = template.tags[tagName];
            while (tag.equalsTo) {
                tag = template.tags[tag.equalsTo];
            }
            const tagKey = '{!tag.' + tagName + '}';
            const tagIndexOf = comment.indexOf(tagKey);
            if (tagIndexOf !== -1) {
                let source = (StrUtils.contains(tag.source, '.')) ? tag.source.split('.')[0] : tag.source;
                if (source === 'return' && (apexNode.nodeType !== ApexNodeTypes.METHOD || (apexNode.nodeType === ApexNodeTypes.METHOD && (!apexNode.datatype || apexNode.datatype.name.toLowerCase() === 'void')))) {
                    orderedTagsToRemove.push({
                        tag: tagKey,
                        order: tagIndexOf,
                    });
                    continue;
                }
                if (source === 'params' && ((apexNode.nodeType !== ApexNodeTypes.METHOD && apexNode.nodeType !== ApexNodeTypes.CONSTRUCTOR) || ((apexNode.nodeType === ApexNodeTypes.METHOD || apexNode.nodeType === ApexNodeTypes.CONSTRUCTOR) && !Utils.hasKeys(apexNode.params)))) {
                    orderedTagsToRemove.push({
                        tag: tagKey,
                        order: tagIndexOf,
                    });
                    continue;
                }
                if (source === 'exceptions' && ((apexNode.nodeType !== ApexNodeTypes.METHOD && apexNode.nodeType !== ApexNodeTypes.CONSTRUCTOR) || ((apexNode.nodeType === ApexNodeTypes.METHOD || apexNode.nodeType === ApexNodeTypes.CONSTRUCTOR) && !Utils.isNull(apexNode.exceptions) && apexNode.exceptions.length > 0))) {
                    orderedTagsToRemove.push({
                        tag: tagKey,
                        order: tagIndexOf,
                    });
                    continue;
                }
                if (source === 'parent' && !apexNode.parentName) {
                    orderedTagsToRemove.push({
                        tag: tagKey,
                        order: tagIndexOf,
                    });
                    continue;
                }
                tagsOrder.push({
                    tag: tagName,
                    order: tagIndexOf
                });
                for (const keyword of tag.keywords) {
                    const keywordIndexOf = tag.template.indexOf('{!' + keyword.name + '}');
                    if (keywordIndexOf !== -1) {
                        if (!keywordOrderByTag[tagName]) {
                            keywordOrderByTag[tagName] = [];
                        }
                        keywordOrderByTag[tagName].push({
                            keyword: keyword,
                            order: keywordIndexOf
                        });
                    }
                }
                keywordOrderByTag[tagName] = Utils.sort(keywordOrderByTag[tagName], ['order']);
            }
        }
        if (tagsOrder.length === 0 && orderedTagsToRemove.length === 0) {
            comment = startWS + StrUtils.replace(comment, '\n', '\n' + startWS);
            if (StrUtils.contains(comment, '{!description}')) {
                return StrUtils.replace(comment, '{!description}', `\${0:` + apexNode.name + ` Description}`);
            } else {
                return comment;
            }
        }
        tagsOrder = Utils.sort(tagsOrder, ['order']);
        orderedTagsToRemove = Utils.sort(orderedTagsToRemove, ['order']);
        let snippetNum = 0;
        const lines = [];
        for (const line of templateLines) {
            if (orderedTagsToRemove.length > 0) {
                let contains = false;
                for (const tagData of orderedTagsToRemove) {
                    if (StrUtils.contains(line, tagData.tag)) {
                        contains = true;
                    }
                }
                if (!contains) {
                    lines.push(line);
                }
            } else {
                lines.push(line);
            }
        }
        comment = startWS + lines.join('\n' + startWS);
        if (StrUtils.contains(comment, '{!description}')) {
            comment = StrUtils.replace(comment, '{!description}', `\${${snippetNum++}:` + apexNode.name + ` Description}`);
        }
        for (const orderedTag of tagsOrder) {
            const tagName = orderedTag.tag;
            let tag = template.tags[tagName];
            while (tag.equalsTo) {
                tag = template.tags[tag.equalsTo];
            }
            const orderedKeywords = keywordOrderByTag[tagName];
            const tagContent = [];
            const tagStr = (tag.symbol || template.tagSymbol) + tagName + ' ';
            const startStr = ' * ';
            if (orderedKeywords) {
                if ((apexNode.nodeType === ApexNodeTypes.METHOD || apexNode.nodeType === ApexNodeTypes.CONSTRUCTOR) && tag.source === 'params' && Utils.hasKeys(apexNode.params)) {
                    for (const param of apexNode.getOrderedParams()) {
                        let paramTemplate = tag.template;
                        for (const orderedKeyword of orderedKeywords) {
                            const keyword = orderedKeyword.keyword;
                            const keywordKey = '{!' + keyword.name + '}';
                            if (keyword.source === 'name') {
                                paramTemplate = StrUtils.replace(paramTemplate, keywordKey, `\${${snippetNum++}:` + param.name + `}`);
                            } else if (keyword.source === 'type') {
                                paramTemplate = StrUtils.replace(paramTemplate, keywordKey, `\${${snippetNum++}:` + StrUtils.replace(param.datatype.name, ',', ', ') + `}`);
                            } else {
                                paramTemplate = StrUtils.replace(paramTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                            }
                        }
                        if (tagContent.length === 0) {
                            tagContent.push(tagStr + paramTemplate);
                        } else {
                            tagContent.push(startStr + tagStr + paramTemplate);
                        }
                    }
                } /*else if ((apexNode.nodeType === ApexNodeTypes.METHOD || apexNode.nodeType === ApexNodeTypes.CONSTRUCTOR) && tag.source === 'exceptions' && !Utils.isNull(apexNode.exceptions) && apexNode.exceptions.length > 0) {
                    for (const exception of apexNode.exceptions) {
                        let paramTemplate = tag.template;
                        for (const orderedKeyword of orderedKeywords) {
                            const keyword = orderedKeyword.keyword;
                            const keywordKey = '{!' + keyword.name + '}'
                            if (keyword.source === 'name') {
                                paramTemplate = StrUtils.replace(paramTemplate, keywordKey, `\${${snippetNum++}:` + exception.name + `}`);
                            } else {
                                paramTemplate = StrUtils.replace(paramTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                            }
                        }
                        if (tagContent.length === 0)
                            tagContent.push(tagStr + paramTemplate);
                        else
                            tagContent.push(startStr + tagStr + paramTemplate);
                    }
                }*/ else if (apexNode.nodeType === ApexNodeTypes.METHOD && tag.source === 'return' && !Utils.isNull(apexNode.datatype)) {
                    let returnTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'type') {
                            returnTemplate = StrUtils.replace(returnTemplate, keywordKey, `\${${snippetNum++}:` + StrUtils.replace(apexNode.datatype.name, ',', ', ') + `}`);
                        } else {
                            returnTemplate = StrUtils.replace(returnTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + returnTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + returnTemplate);
                    }
                } else if ((apexNode.nodeType === ApexNodeTypes.VARIABLE || apexNode.nodeType === ApexNodeTypes.PROPERTY) && tag.source === 'variable') {
                    let fieldTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'name') {
                            fieldTemplate = StrUtils.replace(fieldTemplate, keywordKey, `\${${snippetNum++}:` + apexNode.name + `}`);
                        } else if (keyword.source === 'type') {
                            fieldTemplate = StrUtils.replace(fieldTemplate, keywordKey, `\${${snippetNum++}:` + StrUtils.replace(apexNode.datatype.name, ',', ', ') + `}`);
                        } else {
                            fieldTemplate = StrUtils.replace(fieldTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + fieldTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + fieldTemplate);
                    }
                } else if (tag.source === 'git') {
                    let gitTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'user.name') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.username + `}`);
                        } else if (keyword.source === 'user.email') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.email + `}`);
                        } else if (keyword.source === 'author.name') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.authorName + `}`);
                        } else if (keyword.source === 'author.email') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.authorEmail + `}`);
                        } else if (keyword.source === 'committer.name') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.committerName + `}`);
                        } else if (keyword.source === 'committer.email') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.committerEmail + `}`);
                        } else if (keyword.source === 'branch') {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.gitData.branch + `}`);
                        } else {
                            gitTemplate = StrUtils.replace(gitTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + gitTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + gitTemplate);
                    }
                } else if (tag.source === 'salesforce') {
                    let sfTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'username') {
                            sfTemplate = StrUtils.replace(sfTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.sfData.username + `}`);
                        } else if (keyword.source === 'alias') {
                            sfTemplate = StrUtils.replace(sfTemplate, keywordKey, `\${${snippetNum++}:` + Config.getOrgAlias() + `}`);
                        } else if (keyword.source === 'instance') {
                            sfTemplate = StrUtils.replace(sfTemplate, keywordKey, `\${${snippetNum++}:` + applicationContext.sfData.serverInstance + `}`);
                        } else {
                            sfTemplate = StrUtils.replace(sfTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + sfTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + sfTemplate);
                    }
                } else if (tag.source === 'path') {
                    let pathTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'file') {
                            pathTemplate = StrUtils.replace(pathTemplate, keywordKey, `\${${snippetNum++}:` + filePath + `}`);
                        } else if (keyword.source === 'folder') {
                            pathTemplate = StrUtils.replace(pathTemplate, keywordKey, `\${${snippetNum++}:` + PathUtils.getDirname(filePath) + `}`);
                        } else if (keyword.source === 'root') {
                            pathTemplate = StrUtils.replace(pathTemplate, keywordKey, `\${${snippetNum++}:` + Paths.getProjectFolder() + `}`);
                        } else {
                            pathTemplate = StrUtils.replace(pathTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + pathTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + pathTemplate);
                    }
                } else if (tag.source === 'parent' && apexNode.parentName) {
                    let parentTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        if (keyword.source === 'file') {
                            parentTemplate = StrUtils.replace(parentTemplate, keywordKey, `\${${snippetNum++}:` + PathUtils.getDirname(filePath) + '/' + apexNode.parentName + '.cls' + `}`);
                        } else if (keyword.source === 'folder') {
                            parentTemplate = StrUtils.replace(parentTemplate, keywordKey, `\${${snippetNum++}:` + PathUtils.getDirname(filePath) + `}`);
                        } else {
                            parentTemplate = StrUtils.replace(parentTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                        }
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + parentTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + parentTemplate);
                    }
                } else {
                    let tagTemplate = tag.template;
                    for (const orderedKeyword of orderedKeywords) {
                        const keyword = orderedKeyword.keyword;
                        const keywordKey = '{!' + keyword.name + '}';
                        tagTemplate = StrUtils.replace(tagTemplate, keywordKey, `\${${snippetNum++}:` + keyword.message + `}`);
                    }
                    if (tagContent.length === 0) {
                        tagContent.push(tagStr + tagTemplate);
                    }
                    else {
                        tagContent.push(startStr + tagStr + tagTemplate);
                    }
                }
            }
            comment = StrUtils.replace(comment, '{!tag.' + tagName + '}', tagContent.join('\n' + startWS));
        }
        return comment;
    }

    static getJSFunctionSnippet(numParams: number): string {
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

    static getAuraDocumentationSnippet(controllerMethods: any[], helperMethods: any[], templateContent: string): string {
        let documentationTextJson = JSON.parse(templateContent);
        let documentationText = "";
        let helperSectionIndent = '';
        let controllerSectionIndent = '';
        for (let i = 0; i < documentationTextJson.documentbody.length; i++) {
            var line = documentationTextJson.documentbody[i];
            if (StrUtils.containsIgnorecase(line, '{!helperMethods}')) {
                helperSectionIndent = StrUtils.getStringIndent(line);
                line = line.trimLeft();
            }
            else if (StrUtils.containsIgnorecase(line, '{!controllerMethods}')) {
                controllerSectionIndent = StrUtils.getStringIndent(line);
                line = line.trimLeft();
            }
            documentationText += line + '\n';
        }
        var helperMethodsContent = SnippetUtils.getMethodsContent(helperMethods, documentationTextJson.methodBody, documentationTextJson.paramBody, documentationTextJson.returnBody, helperSectionIndent);
        var controllerMethodsContent = SnippetUtils.getMethodsContent(controllerMethods, documentationTextJson.methodBody, documentationTextJson.paramBody, documentationTextJson.returnBody, controllerSectionIndent);
        documentationText = StrUtils.replace(documentationText, '{!helperMethods}', helperMethodsContent);
        documentationText = StrUtils.replace(documentationText, '{!controllerMethods}', controllerMethodsContent);
        return documentationText;
    }

    static getCSSFileSnippet(): string {
        return ".THIS {\n}";
    }

    static getDesignFileSnippet(): string {
        return "<design:component >\n\t\n</design:component>";
    }

    static getSVGFileSnippet(): string {
        let content = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n";
        content += "<svg width=\"120px\" height=\"120px\" viewBox=\"0 0 120 120\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
        content += "\t<g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n";
        content += "\t\t<path d=\"M120,108 C120,114.6 114.6,120 108,120 L12,120 C5.4,120 0,114.6 0,108 L0,12 C0,5.4 5.4,0 12,0 L108,0 C114.6,0 120,5.4 120,12 L120,108 L120,108 Z\" id=\"Shape\" fill=\"#2A739E\"/>\n";
        content += "\t\t<path d=\"M77.7383308,20 L61.1640113,20 L44.7300055,63.2000173 L56.0543288,63.2000173 L40,99.623291 L72.7458388,54.5871812 L60.907727,54.5871812 L77.7383308,20 Z\" id=\"Path-1\" fill=\"#FFFFFF\"/>\n";
        content += "\t</g>\n";
        content += "</svg>";
        return content;
    }

    static getControllerHelperFileSnippet(firstMethodName: string): string {
        let content = "({\n";
        if (firstMethodName === 'controllerMethod') {
            content += '\t' + firstMethodName + " : function (component, event, helper) {\n\t\t\n\t}\n";
        }
        else {
            content += '\t' + firstMethodName + " : function (component) {\n\t\t\n\t}\n";
        }
        content += "})";
        return content;
    }

    static getRendererFileSnippet(): string {
        let content = "({";
        content += "\n\n// Your renderer method overrides go here\n\n";
        content += "})";
        return content;
    }

    static getJSApexParamsSnippet(activationInfo: ProviderActivationInfo, method: any) {
        let content = "";
        if (activationInfo.lastToken && (activationInfo.lastToken.text === '=' || activationInfo.lastToken.text === ',')) {
            content += "{\n";
        } else {
            content += "const \${1:params} = {\n";
        }
        let cont = 0;
        let snippetNum = 2;
        for (const paramName of Object.keys(method.params)) {
            const param = method.params[paramName];
            if (Utils.countKeys(method.params) === 1) {
                content += "\t" + param.name + ": \${" + snippetNum + ":value}  // Datatype: " + StrUtils.replace(param.datatype.name, ',', ', ') + " \n";
            } else {
                if (cont === Utils.countKeys(method.params) - 1) {
                    content += "\t" + param.name + ": \${" + snippetNum + ":value}  // Datatype: " + StrUtils.replace(param.datatype.name, ',', ', ') + "\n";
                }
                else {
                    content += "\t" + param.name + ": \${" + snippetNum + ":value},  // Datatype: " + StrUtils.replace(param.datatype.name, ',', ', ') + "\n";
                }
            }
            snippetNum++;
            cont++;
        }
        content += "}";
        if (activationInfo.lastToken && activationInfo.lastToken.text === ',' && (!activationInfo.nextToken || (activationInfo.nextToken.text !== ',' && activationInfo.nextToken.text !== ')'))) {
            content += ', ';
        } else if (activationInfo.lastToken && activationInfo.lastToken.text === '(' && (!activationInfo.nextToken || (activationInfo.nextToken.text !== ',' && activationInfo.nextToken.text !== ')'))) {
            content += ', ';
        } else if (!activationInfo.nextToken || (activationInfo.nextToken.text !== ';' && activationInfo.nextToken.text !== ',' && activationInfo.nextToken.text !== ')')) {
            content += ';';
        }
        return content;
    }

    static getMethodsContent(methods: any[], methodTemplate: string[], paramTemplate: string[], returnTemplate: string[], indent: string): string {
        var content = "";
        if (methods) {
            for (let i = 0; i < methods.length; i++) {
                content += SnippetUtils.getMethodContent(methods[i], methodTemplate, paramTemplate, returnTemplate, indent);
            }
        }
        return content;
    }

    static getMethodContent(func: any, methodTemplate: string[], paramTemplate: string[], returnTemplate: string[], indent: string): string {
        let content = "";
        let paramsIndent = "";
        let returnIndent = "";
        for (let i = 0; i < methodTemplate.length; i++) {
            let line = methodTemplate[i];
            if (StrUtils.containsIgnorecase(line, '{!method.params}')) {
                paramsIndent = StrUtils.getStringIndent(line);
                line = line.trimLeft();
                content += line + '\n';
            } else if (StrUtils.containsIgnorecase(line, '{!method.return}')) {
                returnIndent = StrUtils.getStringIndent(line);
                line = line.trimLeft();
                content += line + '\n';
            } else {
                content += indent + line + '\n';
            }
        }
        let paramsContent = "";
        let methodDesc = "<!-- Method Description Here -->";
        if (func.comment && Utils.hasKeys(func.comment.params)) {
            methodDesc = func.comment.description;
            for (const varToken of func.params) {
                paramsContent += getParamContentFromComment(func.comment.params[varToken.text], paramTemplate, indent + paramsIndent);
            }
        }
        else {
            for (const varToken of func.params) {
                paramsContent += getParamContent(varToken, paramTemplate, indent + paramsIndent);
            }
        }
        let returnContent = '';
        if (func.comment && Utils.hasKeys(func.comment.return)) {
            returnContent = getReturnContent(func.comment.return, returnTemplate, indent + returnIndent);
        }
        content = StrUtils.replace(content, '{!method.name}', func.name);
        content = StrUtils.replace(content, '{!method.description}', methodDesc);
        content = StrUtils.replace(content, '{!method.signature}', func.signature);
        content = StrUtils.replace(content, '{!method.auraSignature}', func.auraSignature);
        content = StrUtils.replace(content, '{!method.params}', paramsContent);
        content = StrUtils.replace(content, '{!method.return}', returnContent);
        return content;
    }

}

function getApexCommentNodeTemplate(apexNode: any, template: ApexCommentTemplate): ApexCommentsObjectData | undefined {
    let nodeTemplate: ApexCommentsObjectData | undefined;
    if (apexNode.nodeType === ApexNodeTypes.CLASS || apexNode.nodeType === ApexNodeTypes.INTERFACE || apexNode.nodeType === ApexNodeTypes.ENUM || apexNode.nodeType === ApexNodeTypes.TRIGGER) {
        if (template.comments[apexNode.nodeType]) {
            nodeTemplate = template.comments[apexNode.nodeType];
        } else {
            nodeTemplate = template.comments[ApexNodeTypes.CLASS];
        }
    } else if (apexNode.nodeType === ApexNodeTypes.METHOD || apexNode.nodeType === ApexNodeTypes.CONSTRUCTOR || apexNode.nodeType === ApexNodeTypes.STATIC_CONSTRUCTOR || apexNode.nodeType === ApexNodeTypes.INITIALIZER) {
        if (template.comments[apexNode.nodeType]) {
            nodeTemplate = template.comments[apexNode.nodeType];
        } else {
            nodeTemplate = template.comments[ApexNodeTypes.METHOD];
        }
    } else if (apexNode.nodeType === ApexNodeTypes.PROPERTY || apexNode.nodeType === ApexNodeTypes.VARIABLE || apexNode.nodeType === ApexNodeTypes.GETTER || apexNode.nodeType === ApexNodeTypes.SETTER) {
        if (template.comments[apexNode.nodeType]) {
            nodeTemplate = template.comments[apexNode.nodeType];
        } else {
            nodeTemplate = template.comments[ApexNodeTypes.VARIABLE];
        }
    }
    return nodeTemplate;
}

function getReturnContent(returnData: any, returnTemplate: string[], indent: string): string {
    var content = "";
    for (let i = 0; i < returnTemplate.length; i++) {
        var line = returnTemplate[i];
        content += indent + line + '\n';
    }
    content = StrUtils.replace(content, '{!return.type}', (returnData.datatype) ? returnData.datatype : '<!-- Return Datatype Here -->');
    content = StrUtils.replace(content, '{!return.description}', (returnData.description) ? returnData.description : '<!-- Return Description Here -->');
    return content;
}

function getParamContent(param: any, paramTemplate: string[], indent: string): string {
    var content = "";
    for (let i = 0; i < paramTemplate.length; i++) {
        var line = paramTemplate[i];
        content += indent + line + '\n';
    }
    content = StrUtils.replace(content, '{!param.name}', param.text);
    content = StrUtils.replace(content, '{!param.type}', "any");
    content = StrUtils.replace(content, '{!param.description}', '<!-- Param Description Here -->');
    return content;
}

function getParamContentFromComment(commentParam: any, paramTemplate: string[], indent: string): string {
    var content = "";
    for (let i = 0; i < paramTemplate.length; i++) {
        var line = paramTemplate[i];
        content += indent + line + '\n';
    }
    content = StrUtils.replace(content, '{!param.name}', commentParam.name);
    content = StrUtils.replace(content, '{!param.type}', commentParam.datatype);
    content = StrUtils.replace(content, '{!param.description}', commentParam.description);
    return content;
}

function countStartTabs(str: string): number {
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

function countStartWS(str: string): number {
    let number = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
            number++;
        } else if (str[i] !== '\t') {
            break;
        }
    }
    return number;
}