import * as vscode from 'vscode';
import { Config } from '../core/config';
import { applicationContext } from '../core/applicationContext';
import { MarkDownStringBuilder } from '../output';
import { ProviderUtils } from './utils';
import { TemplateUtils } from '../utils/templateUtils';
import { Apex } from '@aurahelper/languages';
import { CoreUtils, FileChecker, FileReader, ApexNodeTypes } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
const StrUtils = CoreUtils.StrUtils;
const ApexParser = Apex.ApexParser;

export class ApexHoverProvider implements vscode.HoverProvider {

    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        return new Promise<vscode.Hover | undefined>((resolve, reject) => {
            if (Config.getConfig().intelliSense!.enableHoverInformation) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window
                }, () => {
                    return new Promise<void>((progressResolve) => {
                        try {
                            let hover: vscode.Hover | undefined;
                            if (Config.getConfig().intelliSense!.enableHoverInformation) {
                                if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
                                    hover = provideHoverInformation(document, position);
                                }
                            }
                            progressResolve();
                            resolve(hover);
                        } catch (error) {
                            progressResolve();
                            reject(error);
                        }
                    });
                });
            } else {
                resolve(undefined);
            }

        });
    }

    static register(): void {
        applicationContext.context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: "file", language: "apex" }, new ApexHoverProvider()));
    }

}

function provideHoverInformation(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const content = new MarkDownStringBuilder();
    const editor = vscode.window.activeTextEditor;
    const activationInfo = ProviderUtils.getApexActivation(document, position, false);
    if (activationInfo.activation) {
        const parser = new ApexParser().setContent(FileReader.readDocument(editor?.document)).setSystemData(applicationContext.parserData).setCursorPosition(ProviderUtils.fixPositionOffset(document, position));
        const node = parser.parse();
        const nodeInfo = ProviderUtils.getNodeInformation(node, activationInfo);
        const method = nodeInfo?.method;
        const methodVar = nodeInfo?.methodVar;
        const classVar = nodeInfo?.classVar;
        const sObject = nodeInfo?.sObject;
        const label = nodeInfo?.label;
        const labels = nodeInfo?.labels;
        const sObjectField = nodeInfo?.sObjectField;
        const sObjectFieldName = nodeInfo?.sObjectFieldName;
        const namespace = nodeInfo?.namespace;
        const lastNode = nodeInfo?.lastNode;
        if (labels) {
            content.appendApexCodeBlock('Label');
            content.appendMarkdown('Project Custom Labels\n\n');
            content.appendMarkdown('Labels size: ' + labels.length + '\n\n');
        } else if (label) {
            content.appendApexCodeBlock('Label.' + label.fullName);
            content.appendMarkdown(label.shortDescription + '\n\n');
            content.appendMarkdown('\n\n  - **Name**: `' + label.fullName + '`\n');
            content.appendMarkdown('  - **Value**: `' + label.value + '`\n');
            if (label.categories) {
                content.appendMarkdown('  - **Category**: `' + label.categories + '`\n');
            }
            content.appendMarkdown('  - **Language**: `' + label.language + '`\n');
            content.appendMarkdown('  - **Protected**: `' + label.protected + '`\n\n');
        } else if (methodVar) {
            if (method && method.params[methodVar.name.toLowerCase()]) {
                const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                const paramsTagData = tagsData['params'];
                const datatype = StrUtils.replace(methodVar.datatype.name, ',', ', ');
                let code = '';
                if (methodVar.final) {
                    code += methodVar.final.text + ' ';
                }
                code += datatype + ' ' + methodVar.name;
                content.appendApexCodeBlock(code);
                let description = '*' + methodVar.name + '* `' + datatype + '`';
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
                content.appendMarkdown(description + '\n\n');
            } else {
                const datatype = StrUtils.replace(methodVar.datatype.name, ',', ', ');
                content.appendApexCodeBlock(datatype + ' ' + methodVar.name);
                let description = '*' + methodVar.name + '* `' + datatype + '`';
                if (methodVar.description && methodVar.description.length > 0) {
                    description += ' &mdash; ' + StrUtils.replace(methodVar.description, '\n', '\n\n');
                } else if (methodVar.comment && methodVar.comment.description && methodVar.comment.description.length > 0) {
                    description += ' &mdash; ' + StrUtils.replace(methodVar.comment.description, '\n', '\n\n');
                }
                content.appendMarkdown(description + '\n\n');
            }
        } else if (classVar) {
            const datatype = StrUtils.replace(classVar.datatype.name, ',', ', ');
            content.appendApexCodeBlock(datatype + ' ' + classVar.name);
            let description = '*' + classVar.name + '* `' + datatype + '`';
            if (classVar.description && classVar.description.length > 0) {
                description += ' &mdash; ' + StrUtils.replace(classVar.description, '\n', '\n\n');
            } else if (classVar.comment && classVar.comment.description && classVar.comment.description.length > 0) {
                description += ' &mdash; ' + StrUtils.replace(classVar.comment.description, '\n', '\n\n');
            }
            content.appendMarkdown(description + '\n\n');
        } else if (sObjectField) {
            let fieldName = sObjectField.name;
            let parentName = lastNode ? lastNode.name : '';
            let detail = sObject.name + ' Field';
            let label = StrUtils.replace(sObjectField.label, '.field-meta.xml', '');
            label = label.endsWith('Id') ? label.substring(0, label.length - 2) : label;
            let doc = (sObjectField.description) ? sObjectField.description + '\n\n' : '';
            if (!sObjectField.description && sObjectField.inlineHelpText && sObjectField.inlineHelpText !== 'null') {
                doc = (sObjectField.inlineHelpText) ? sObjectField.inlineHelpText + '\n\n' : '';
            }
            doc += "  - **Label**: `" + label + '`  \n';
            if (sObjectField.length) {
                doc += "  - **Length**: `" + sObjectField.length + '`  \n';
            }
            if (sObjectField.type) {
                doc += "  - **Type**: `" + sObjectField.type + '`  \n';
            }
            if (sObjectField.custom !== undefined) {
                doc += "  - **Is Custom**: `" + sObjectField.custom + '`  \n';
            }
            if (sObjectField.inlineHelpText && sObjectField.inlineHelpText !== 'null') {
                doc += "  - **Inline Help**: `" + sObjectField.inlineHelpText + '`  \n';
            }
            if (sObjectField.referenceTo.length > 0) {
                doc += "  - **Reference To**: `" + sObjectField.referenceTo.join(", ") + '`\n';
                if (fieldName.endsWith('Id') && sObjectFieldName && !sObjectFieldName.endsWith('id')) {
                    fieldName = fieldName.substring(0, fieldName.length - 2);
                }
                if (sObjectField.referenceTo.length > 1) {
                    parentName = sObjectField.referenceTo.join(" | ");
                }
            }
            if (applicationContext.sfData.serverInstance) {
                doc += '\n\n[Lightning Setup](' + applicationContext.sfData.serverInstance + '/lightning/setup/ObjectManager/' + sObject.name + '/FieldsAndRelationships/view)';
            }
            content.appendApexCodeBlock(parentName + ' ' + sObject.name + '.' + fieldName).appendMarkdown(detail + '\n\n').appendMarkdown(doc + '\n\n');
            if (sObjectField.picklistValues.length > 0) {
                content.appendMarkdownH4('Picklist Values');
                for (const pickVal of sObjectField.picklistValues) {
                    content.appendMarkdown('  - `' + pickVal.value + "` (" + pickVal.label + ")  \n");
                }
            }
        } else if (method) {
            const datatype = method.datatype ? StrUtils.replace(method.datatype.name, ',', ', ') : '';
            let signature = '';
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
            signature += (datatype ? datatype + ' ' : '') + method.name + "(";
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
                let index = 0;
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
                    if (index === 0) {
                        if (method.final) {
                            signature += method.final.text + ' ';
                        }
                        signature += datatype + ' ' + param.name;
                    }
                    else {
                        signature += ', ';
                        if (method.final) {
                            signature += method.final.text + ' ';
                        }
                        signature += datatype + ' ' + param.name;
                    }
                    index++;
                }
                description += '\n';
            }
            if (datatype && datatype.toLowerCase() !== 'void') {
                description += '**Return** `' + datatype + '`';
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
            signature += ')';
            content.appendApexCodeBlock(signature);
            content.appendMarkdown(description);
        } else if (namespace) {
            content.appendApexCodeBlock(namespace);
            content.appendMarkdown('Salesforce Namespace' + '\n\n');
        } else if (lastNode) {
            if (!Utils.isNull(lastNode.nodeType)) {
                let nodeName = '';
                if (lastNode.namespace && lastNode.namespace.toLowerCase() !== 'system') {
                    nodeName += lastNode.namespace + '.';
                }
                if (lastNode.parentName) {
                    nodeName += lastNode.parentName + '.';
                }
                nodeName += lastNode.name;
                content.appendApexCodeBlock(nodeName);
                if (lastNode.nodeType === ApexNodeTypes.ENUM) {
                    const enumValues = [];
                    for (const value of lastNode.values) {
                        if (Utils.isString(value)) {
                            enumValues.push('  - `' + value + '`');
                        } else {
                            enumValues.push('  - `' + value.text + '`');
                        }
                    }
                    if (lastNode.description) {
                        content.appendMarkdown('Enum from ' + lastNode.namespace + ' Namespace\n\n');
                        content.appendMarkdown(lastNode.description + ((lastNode.documentation) ? '\n\n[Documentation Link](' + lastNode.documentation + ')' : '') + '\n\n');
                        content.appendMarkdown(enumValues.join('\n') + '\n\n');
                    } else if (lastNode.comment && lastNode.comment.description && lastNode.comment.description.length > 0) {
                        content.appendMarkdown(lastNode.comment.description + '\n\n');
                    } else {
                        content.appendMarkdown(nodeName + ' Enum\n\n');
                    }
                } else if (lastNode.nodeType === ApexNodeTypes.INTERFACE) {
                    if (lastNode.description) {
                        content.appendMarkdown('Interface from ' + lastNode.namespace + ' Namespace\n\n');
                        content.appendMarkdown(lastNode.description + ((lastNode.documentation) ? '\n\n[Documentation Link](' + lastNode.documentation + ')' : '') + '\n\n');
                    } else if (lastNode.comment && lastNode.comment.description && lastNode.comment.description.length > 0) {
                        content.appendMarkdown(lastNode.comment.description + '\n\n');
                    } else {
                        content.appendMarkdown(nodeName + ' Interface\n\n');
                    }
                } else {
                    if (lastNode.description) {
                        content.appendMarkdown('Class from ' + lastNode.namespace + ' Namespace\n\n');
                        content.appendMarkdown(lastNode.description + ((lastNode.documentation) ? '\n\n[Documentation Link](' + lastNode.documentation + ')' : '') + '\n\n');
                    } else if (lastNode.comment && lastNode.comment.description && lastNode.comment.description.length > 0) {
                        content.appendMarkdown(lastNode.comment.description + '\n\n');
                    } else {
                        content.appendMarkdown(nodeName + ' Class\n\n');
                    }
                }
            } else if (Object.keys(lastNode).includes('keyPrefix')) {
                let doc = (lastNode.description) ? lastNode.description + '\n\n' : '';
                let nameTmp = lastNode.name.substring(0, lastNode.name.length - 3);
                if (lastNode.custom){
                    doc += 'Custom SObject';
                }else{
                    doc += 'Standard SObject';
                }
                if (lastNode.namespace && lastNode.namespace !== nameTmp) {
                    doc += '\n\nNamespace: ' + lastNode.namespace;
                }
                if (applicationContext.sfData.serverInstance) {
                    doc += '\n\n[Lightning Setup](' + applicationContext.sfData.serverInstance + '/lightning/setup/ObjectManager/' + lastNode.name + '/Details/view)';
                }
                content.appendApexCodeBlock(lastNode.name);
                content.appendMarkdown(doc + '\n\n');
            }
        }
        if (!content.hasContent()){
            return undefined;
        }
        return new vscode.Hover(content.build(true));
    }
    return undefined;
}