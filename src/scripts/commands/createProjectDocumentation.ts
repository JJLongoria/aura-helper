import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { InputFactory } from '../inputs/factory';
import { TemplateUtils } from '../utils/templateUtils';
import { applicationContext } from '../core/applicationContext';
import { ApexClass, ApexEnum, ApexInterface, ApexNodeTypes, CoreUtils, FileChecker, FileReader, FileWriter, SObject, Token, TokenTypes } from '@aurahelper/core';
import { JavaScript, Aura, XML, Apex, LanguageUtils, System } from '@aurahelper/languages';
const StrUtils = CoreUtils.StrUtils;
const Utils = CoreUtils.Utils;
const Tokenizer = System.Tokenizer;
const XMLParser = XML.XMLParser;
const XMLUtils = XML.XMLUtils;
const ApexParser = Apex.ApexParser;
const AuraParser = Aura.AuraParser;
const JSParser = JavaScript.JSParser;
const Window = vscode.window;


// TODO. Review code

const testClasses: any = {};
const interfaces: any = {};
const apexClasses: any = {};
const batches: any = {};
const scheduled: any = {};
const queueables: any = {};
const restClasses: any = {};
const enumClasses: any = {};
let classes: any;
let namespacesData: any;
let classPageTemplate: any;
let sObjects: any;
let alias: string;

export function run(): void {
    InputFactory.createFolderDialog('Select Folder', false).then(function (uri) {
        if (uri && uri.length > 0) {
            let errorShown = false;
            classes = applicationContext.parserData.userClassesData;
            namespacesData = applicationContext.parserData.namespacesData;
            sObjects = applicationContext.parserData.sObjectsData;
            applicationContext.parserData.template = TemplateUtils.getApexCommentTemplate(!Config.getConfig().documentation.useStandardJavaComments);
            createDocumentation(uri[0].fsPath).then(function () {
                NotificationManager.hideStatusBar();
                Window.showInformationMessage('Documentation Created Succesfully on ' + uri[0].fsPath);
            }).catch(function (error) {
                NotificationManager.hideStatusBar();
                if (!errorShown) {
                    Window.showErrorMessage('An Error Ocurred while running Command: ' + error);
                }
                errorShown = true;
            });
        }
    });
}

function createDocumentation(folderPath: string): Promise<void> {
    return new Promise<void>(async function (resolve, reject) {
        try {
            alias = Config.getOrgAlias();
            NotificationManager.showStatusBar('$(sync~spin) Generating Project Doc');
            classPageTemplate = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/apexClassPageTemplate.html');
            createDocumentationForApexClasses(folderPath);
            resolve();
        } catch (error) {
            /*if (error.indexOf('JSON') !== -1) {
                error = 'Create Documentation Error. Aura Helper are running job for Getting Apex Classes Information. Please, run this command when job finish. (See status bar)';
            }*/
            reject(error);
        }
    });
}

function createDocumentationForApexClasses(folderPath: string): void {
    for (const classNameToLower of Object.keys(classes)) {
        let apexNode = classes[classNameToLower];
        if (apexNode.annotation && apexNode.annotation.name.toLowerCase() === '@istest') {
            testClasses[apexNode.name] = apexNode;
        } else if (apexNode.nodeType === ApexNodeTypes.INTERFACE) {
            interfaces[apexNode.name] = apexNode;
        } else if (apexNode.nodeType === ApexNodeTypes.ENUM) {
            enumClasses[apexNode.name] = apexNode;
        } else {
            apexClasses[apexNode.name] = apexNode;
        }

        if (apexNode.annotation && apexNode.annotation.name.toLowerCase() === '@restresource') {
            restClasses[apexNode.name] = apexNode;
        }
        if (isBatchClass(apexNode)) {
            batches[apexNode.name] = apexNode;
        }
        if (isScheduledClass(apexNode)) {
            scheduled[apexNode.name] = apexNode;
        }
        if (isQueueableClass(apexNode)) {
            queueables[apexNode.name] = apexNode;
        }
    }
    if (!FileChecker.isExists(folderPath)) {
        FileWriter.createFolderSync(folderPath);
    }
    if (!FileChecker.isExists(folderPath + '/classes')) {
        FileWriter.createFolderSync(folderPath + '/classes');
    }
    let index = createIndex();
    FileWriter.createFileSync(folderPath + '/index.html', index);
    let home = createHome();
    FileWriter.createFileSync(folderPath + '/home.html', home);
    if (!FileChecker.isExists(folderPath + '/resources')) {
        FileWriter.createFolderSync(folderPath + '/resources');
    }
    FileWriter.copyFile(Paths.getImagesPath() + '/blue_icon.png', folderPath + '/resources/aurahelper.png', function () {

    });
    Object.keys(classes).forEach(function (className) {
        let classToProcess = classes[className];
        let classContent = createDocumentationForClass(classToProcess);
        FileWriter.createFileSync(folderPath + '/classes/' + classToProcess.name + '.html', classContent);
    });
}

function isBatchClass(apexNode: any): boolean {
    if (apexNode.implementTypes && apexNode.implementTypes.length > 0) {
        for (const impType of apexNode.implementTypes) {
            if (impType.toLowerCase().indexOf('database.batchable') !== -1) {
                return true;
            }
        }
    }
    return false;
}

function isScheduledClass(apexNode: any): boolean {
    if (apexNode.implementTypes && apexNode.implementTypes.length > 0) {
        for (const impType of apexNode.implementTypes) {
            if (impType.toLowerCase().indexOf('schedulable') !== -1) {
                return true;
            }
        }
    }
    return false;
}

function isQueueableClass(apexNode: any): boolean {
    if (apexNode.implementTypes && apexNode.implementTypes.length > 0) {
        for (const impType of apexNode.implementTypes) {
            if (impType.toLowerCase().indexOf('queueable') !== -1) {
                return true;
            }
        }
    }
    return false;
}


function styleDatatype(datatype: string): string {
    const styledDatatype = [];
    const parser = new ApexParser();
    parser.setSystemData(applicationContext.parserData);
    const dataTypeTokens = Tokenizer.tokenize(datatype);
    let index = 0;
    while (index < dataTypeTokens.length) {
        const lastToken = LanguageUtils.getLastToken(dataTypeTokens, index);
        const token = dataTypeTokens[index];
        if (token.type === TokenTypes.IDENTIFIER) {
            if (lastToken && lastToken.text === '&' && (token.text === 'lt' || token.text === 'gt')) {
                styledDatatype.push(token.text);
                index++;
                continue;
            }
            const node = parser.resolveDatatype(token.textToLower);
            if (node) {
                if (node && node instanceof SObject && node.keyPrefix) {
                    const nameToLower = node.name.toLowerCase();
                    if (nameToLower.endsWith('__c')) {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="' + applicationContext.sfData.serverInstance + '/' + node.keyPrefix + '">' + node.name + '</a></b>');
                    } else if (nameToLower.endsWith('__mdt')) {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://help.salesforce.com/articleView?id=custommetadatatypes_overview.htm&type=5">' + node.name + '</a></b>');
                    } else if (nameToLower.endsWith('__kav')) {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://help.salesforce.com/articleView?id=knowledge_article_types_manage.htm&type=5">' + node.name + '</a></b>');
                    } else if (nameToLower === 'sobject') {
                        styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_methods_system_sobject.htm">SObject</a></b>');
                    } else {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_' + nameToLower + '.htm">' + node.name + '</a></b>');
                    }
                } else if (node && (node instanceof ApexEnum || node instanceof ApexClass || node instanceof ApexInterface) && node.documentation) {
                    styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="' + node.documentation + '">' + node.name + '</a></b>');
                } else if (node && (node instanceof ApexEnum || node instanceof ApexClass || node instanceof ApexInterface)){
                    styledDatatype.push('<b class="code datatype"><a style="text-decoration:none;" href="' + (node.parentName) ? node.parentName : node.name + '.html">' + node.name + '</a></b>');
                }
            } else {
                styledDatatype.push(token.text);
            }
        } else if (token.type === TokenTypes.PUNCTUATION.COMMA) {
            styledDatatype.push(token.text + ' ');
        } else {
            styledDatatype.push(token.text);
        }
        index++;
    }
    return styledDatatype.join('');
}

function createIndex(): string {
    let pageContent = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/indexTemplate.html');
    return StrUtils.replace(pageContent, '{!navbar}', getNavigationMenu());
}

function getNavigationMenu(): string {
    let content = [];
    content.push('<a onclick="goToHome()" class="w3-bar-item menu"><b>Home</b></a>');
    if (applicationContext.sfData.serverInstance) {
        content.push('<a target="_blank" href="' + applicationContext.sfData.serverInstance + '/auradocs/reference.app" class="w3-bar-item menu"><b>Aura Documentation</b></a>');
    }
    if (Object.keys(apexClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item menu" onclick="openCloseAccordion(\'apexClassesSection\')"><b>Classes</b><span class="w3-right">' + Object.keys(apexClasses).length + '</span></a>');
        content.push('<div id="apexClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(apexClasses).forEach(function (className) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + className + '\')">' + className + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(interfaces).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'interfacesSection\')"><b>Interfaces</b><span class="w3-right">' + Object.keys(interfaces).length + '</span></a>');
        content.push('<div id="interfacesSection" class="w3-hide w3-margin-left">');
        Object.keys(interfaces).forEach(function (interfaceName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + interfaceName + '\')">' + interfaceName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(enumClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'interfacesSection\')"><b>Interfaces</b><span class="w3-right">' + Object.keys(enumClasses).length + '</span></a>');
        content.push('<div id="interfacesSection" class="w3-hide w3-margin-left">');
        Object.keys(enumClasses).forEach(function (enumName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + enumName + '\')">' + enumName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(batches).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'batchesSection\')"><b>Batchable Classes</b><span class="w3-right">' + Object.keys(batches).length + '</span></a>');
        content.push('<div id="batchesSection" class="w3-hide w3-margin-left">');
        Object.keys(batches).forEach(function (batchName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + batchName + '\')">' + batchName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(scheduled).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'scheduledSection\')"><b>Schedulable Classes</b><span class="w3-right">' + Object.keys(scheduled).length + '</span></a>');
        content.push('<div id="scheduledSection" class="w3-hide w3-margin-left">');
        Object.keys(scheduled).forEach(function (scheduledName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + scheduledName + '\')">' + scheduledName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(queueables).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'queueableSection\')"><b>Queueable Classes</b><span class="w3-right">' + Object.keys(queueables).length + '</span></a>');
        content.push('<div id="queueableSection" class="w3-hide w3-margin-left">');
        Object.keys(queueables).forEach(function (queueableName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + queueableName + '\')">' + queueableName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(restClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'restClassesSection\')"><b>REST Classes</b><span class="w3-right">' + Object.keys(restClasses).length + '</span></a>');
        content.push('<div id="restClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(restClasses).forEach(function (restName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + restName + '\')">' + restName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(testClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'testClassesSection\')"><b>Test Classes</b><span class="w3-right">' + Object.keys(testClasses).length + '</span></a>');
        content.push('<div id="testClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(testClasses).forEach(function (testClassName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + testClassName + '\')">' + testClassName + '</a>');
        });
        content.push('</div>');
    }
    return content.join('\n');
}

function createHome(): string {
    let homeContent = getHome();
    let pageContent = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/homeTemplate.html');
    pageContent = StrUtils.replace(pageContent, '{!homeTitle}', 'Organization: ' + alias + '<h5 class="sectionTitle">Server Instance: <a target="_blank" href="' + applicationContext.sfData.serverInstance + '">' + applicationContext.sfData.serverInstance + '</a></h5>');
    pageContent = StrUtils.replace(pageContent, '{!goToEnvironment}', applicationContext.sfData.serverInstance || '');
    pageContent = StrUtils.replace(pageContent, '{!docStructure}', homeContent.join('\n'));
    return pageContent;
}

function getHome(): string[] {
    let content = [];
    content.push('<p>');
    content.push('<ul>');
    content.push('<li style="margin-bottom: 10px">');
    content.push('<b class="sectionTitle">Home</b>: Show this page');
    content.push('</li>');
    content.push('<li style="margin-bottom: 10px">');
    content.push('<b class="sectionTitle">Aura Documentation</b>: Open your Aura Components Documentation (Autogenerated by Salesforce)');
    content.push('</li>');
    if (Object.keys(apexClasses).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Classes</b>: It contains all the classes of the project. Standard classes, batches, scheduled, etc. All classes except test classes');
        content.push('</li>');
    }
    if (Object.keys(interfaces).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Interfaces</b>: As in the class section, all the Apex interfaces of the project are shown here');
        content.push('</li>');
    }
    if (Object.keys(enumClasses).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Enums</b>: If the project contains Apex files that are the definition of an enumeration, they will appear in this section');
        content.push('</li>');
    }
    if (Object.keys(batches).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Batchable</b>: This section will only show the project\'s Batchable classes');
        content.push('</li>');
    }
    if (Object.keys(scheduled).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Schedulable</b>: In the same way as in the Batchable section, only Schedulable classes will be shown');
        content.push('</li>');
    }
    if (Object.keys(queueables).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Queueables</b>: As in previous sections, only Queueable classes will be listed in this section');
        content.push('</li>');
    }
    if (Object.keys(restClasses).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">REST Classes</b>: If some of your Apex classes is the definition of a REST interface, this is the section where you can see');
        content.push('</li>');
    }
    if (Object.keys(testClasses).length > 0) {
        content.push('<li style="margin-bottom: 10px">');
        content.push('<b class="sectionTitle">Test Classes</b>: Finally, this section will show all the test classes that the project contains.');
        content.push('</li>');
    }
    content.push('</ul>');
    content.push('</p>');
    return content;
}

function createDocumentationForClass(apexClass: any): string {
    let classBody = getNodeBody(apexClass);
    let content = StrUtils.replace(classPageTemplate, '{!classContent}', classBody.join('\n'));
    return content;
}

function getNodeBody(apexNode: any): string[] {
    let content: string[] = [];
    content.push('<div id="classNameSection">');
    content.push('<h2 class="sectionTitle">' + apexNode.name + '</h2>');
    if (apexNode.comment && apexNode.comment.description && apexNode.comment.description.length > 0) {
        content.push('<br/>' + StrUtils.replace(apexNode.comment.description, '\n', '<br/>'));
    }
    content.push('</div>');
    content.push('<br/>');
    if (apexNode.nodeType !== ApexNodeTypes.ENUM) {
        if (apexNode.extends) {
            content.push('<div id="extendsSection">');
            content.push('<h3 class="sectionTitle">Extends</h3>');
            if (apexNode.extends.documentation) {
                content.push('<p style="padding-left:20px" class="code datatype"><a target="_blank" href="' + apexNode.extends.documentation + '">' + apexNode.extends.name + '</a></p>');
            } else {
                content.push('<p style="padding-left:20px" class="code datatype"><a href="' + ((apexNode.extends.parentName) ? apexNode.extends.parentName : apexNode.extends.name) + '.html">' + apexNode.extends.name + '</a></p>');
            }
            content.push('</div>');
            content.push('<br/>');

        }
        let imps = getImplements(apexNode);
        if (imps) {
            content.push('<div id="implementsSection">');
            content.push('<h3 class="sectionTitle">Implements</h3>');
            content.push('<p style="padding-left:20px" class="code datatype">' + imps + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        let modifiers = getModifiers(apexNode);
        if (modifiers) {
            content.push('<div id="modifiersSection">');
            content.push('<h3 class="sectionTitle">Modifiers</h3>');
            content.push('<p style="padding-left:20px">' + modifiers.join(', ') + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.annotation) {
            content.push('<div id="annotationSection">');
            content.push('<h3 class="sectionTitle">Annotations</h3>');
            content.push('<p style="padding-left:20px">' + Token.toString(apexNode.annotation.tokens) + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.variables && Utils.hasKeys(apexNode.variables)) {
            content.push('<div id="fieldsSection">');
            content.push('<h3 class="sectionTitle">Fields</h3>');
            content.push('<ul>');
            for (const fieldNameToLower of Object.keys(apexNode.variables)) {
                const field = apexNode.variables[fieldNameToLower];
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexNode.name + '.' + field.name + '\')"><b>' + field.name + '</b></a>');
                if (field.comment && field.comment.description && field.comment.description.length > 0) {
                    content.push('<br/>' + StrUtils.replace(field.comment.description, '\n', '<br/>'));
                }
                content.push('<div id="' + apexNode.name + '.' + field.name + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px"><b class="code">' + getSignature(field) + '</b></p>');
                content.push('<p style="padding-left:20px">Type: <b class="code">' + styleDatatype(escape(field.datatype.name)) + '</b></p>');
                content.push('<br/>');
                content.push('</div>');
                content.push('</li>');
            }
            content.push('</ul>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.constructors && Utils.hasKeys(apexNode.constructors)) {
            content.push('<div id="constructorsSection">');
            content.push('<h3 class="sectionTitle">Constructors</h3>');
            content.push('<ul>');
            let index = 0;
            for (const constructorKey of Object.keys(apexNode.constructors)) {
                const constructor = apexNode.constructors[constructorKey];
                const paramNames = [];
                if (constructor.params && Utils.hasKeys(constructor.params)) {
                    for (const paramKey of Object.keys(constructor.params)) {
                        const param = constructor.params[paramKey];
                        paramNames.push(param.name);
                    }
                }
                const name = constructor.name + '(' + paramNames.join(', ') + ')';
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexNode.name + '.' + constructor.name + '_' + index + '\')"><b>' + name + '</b></a>');
                if (constructor.comment && constructor.comment.description && constructor.comment.description.length > 0) {
                    content.push('<br/>' + constructor.description);
                }
                content.push('<div id="' + apexNode.name + '.' + constructor.name + '_' + index + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px">' + getSignature(constructor, true) + '</p>');
                const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], constructor.comment);
                if (constructor.params && Utils.hasKeys(constructor.params)) {
                    const paramsTagData = tagsData['params'];
                    content.push('<h4 class="sectionTitle"><b>Parameters</b></h4>');
                    for (const param of constructor.getOrderedParams()) {
                        if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                            for (const data of paramsTagData.tagData) {
                                if (data.keywords) {
                                    for (const keyword of paramsTagData.tag.keywords) {
                                        if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                            content.push('<p style="padding-left:20px">' + data.keywords[keyword.name] + '</p>');
                                        }
                                    }
                                }
                            }
                        }
                        content.push('<p style="padding-left:20px"><b class="code identifier">' + param.name + '</b></p>');
                        content.push('<p style="padding-left:30px">Type: <b class="code">' + styleDatatype(escape(param.datatype.name)) + '</b></p>');
                    }
                }
                content.push('<br/>');
                content.push('</div>');
                content.push('</li>');
                index++;
            }

            content.push('</ul>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.methods && Utils.hasKeys(apexNode.methods)) {
            content.push('<div id="methodsSection">');
            content.push('<h3 class="sectionTitle">Methods</h3>');
            content.push('<ul>');
            let index = 0;
            for (const methodKey of Object.keys(apexNode.methods)) {
                const method = apexNode.methods[methodKey];
                const paramNames = [];
                const methodComment = method.comment;
                if (method.params && Utils.hasKeys(method.params)) {
                    for (const paramKey of Object.keys(method.params)) {
                        const param = method.params[paramKey];
                        paramNames.push(param.name);
                    }
                }
                const name = method.name + '(' + paramNames.join(', ') + ')';
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexNode.name + '.' + method.name + '_' + index + '\')"><b>' + name + '</b></a>');
                if (method.description && method.description.length > 0) {
                    content.push('<br/>' + method.description);
                } else if (methodComment && methodComment.description && methodComment.description.length > 0) {
                    content.push('<br/>' + method.comment.description);
                }
                content.push('<div id="' + apexNode.name + '.' + method.name + '_' + index + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px">' + getSignature(method, true) + '</p>');
                const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
                if (method.params && Utils.hasKeys(method.params)) {
                    const paramsTagData = tagsData['params'];
                    content.push('<h4 class="sectionTitle"><b>Parameters</b></h4>');
                    for (const param of method.getOrderedParams()) {
                        if (paramsTagData && paramsTagData.tag && paramsTagData.tagData && paramsTagData.tagName) {
                            for (const data of paramsTagData.tagData) {
                                if (data.keywords) {
                                    for (const keyword of paramsTagData.tag.keywords) {
                                        if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                            content.push('<p style="padding-left:20px">' + data.keywords[keyword.name] + '</p>');
                                        }
                                    }
                                }
                            }
                        }
                        content.push('<p style="padding-left:20px"><b class="code identifier">' + param.name + '</b></p>');
                        content.push('<p style="padding-left:30px">Type: <b class="code">' + styleDatatype(escape(param.datatype.name)) + '</b></p>');
                    }
                }
                if (method.datatype && method.datatype.name !== 'void') {
                    content.push('<h4 class="sectionTitle"><b>Return</b></h4>');
                    content.push('<p style="padding-left:20px">Type: <b class="code">' + styleDatatype(escape(method.datatype.name)) + '</b></p>');
                    const returnTagData = tagsData['return'];
                    if (returnTagData && returnTagData.tag && returnTagData.tagData && returnTagData.tagName) {
                        for (const data of returnTagData.tagData) {
                            if (data.keywords) {
                                for (const keyword of returnTagData.tag.keywords) {
                                    if (keyword.source === 'input' && data.keywords[keyword.name] && data.keywords[keyword.name].length > 0) {
                                        content.push('<p style="padding-left:20px">' + data.keywords[keyword.name] + '</p>');
                                    }
                                }
                            }
                        }
                    }
                }
                content.push('<br/>');
                content.push('</div>');
                content.push('</li>');
                index++;
            }
            content.push('</ul>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.enums && Utils.hasKeys(apexNode.enums)) {
            content.push('<h3 class="sectionTitle">Enums</h3>');
            content.push('<div style="padding: 20px; margin-left: 30px; margin-right: 15px;" class="w3-card-4" id="enumsSection">');
            Object.keys(apexNode.enums).forEach(function (key) {
                content = content.concat(getNodeBody(apexNode.enums[key]));
            });
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.interfaces && Utils.hasKeys(apexNode.interfaces)) {
            content.push('<h3 class="sectionTitle">Classes</h3>');
            content.push('<div style="padding: 20px; margin-left: 30px; margin-right: 15px;" class="w3-card-4" id="classesSection">');
            Object.keys(apexNode.interfaces).forEach(function (key) {
                content = content.concat(getNodeBody(apexNode.interfaces[key]));
            });
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexNode.classes && Utils.hasKeys(apexNode.classes)) {
            content.push('<h3 class="sectionTitle">Classes</h3>');
            content.push('<div style="padding: 20px; margin-left: 30px; margin-right: 15px;" class="w3-card-4" id="classesSection">');
            Object.keys(apexNode.classes).forEach(function (key) {
                content = content.concat(getNodeBody(apexNode.classes[key]));
            });
            content.push('</div>');
            content.push('<br/>');
        }
    } else {
        content.push('<div>');
        content.push('<h3 class="sectionTitle">Enum Values</h3>');
        content.push('<table class="w3-table sectionTitle">');
        content.push('<tr>');
        content.push('<th>Values</th>');
        content.push('</tr>');
        for (const value of apexNode.values) {
            content.push('<tr>');
            content.push('<td class="code datatype">' + value.text + '</td>');
            content.push('</tr>');
        }
        content.push('</table>');
        content.push('<div>');
    }
    return content;
}

function escape(text: string): string {
    if (!text || text.trim().length === 0) {
        return '';
    }
    text = StrUtils.replace(text, '<', '&lt;');
    text = StrUtils.replace(text, '>', '&gt;');
    return text;
}

function getSignature(obj: any, isMethod?: boolean): string {
    let modifiers = getModifiers(obj);
    if (isMethod) {
        let signature = '';
        if (modifiers) {
            signature += modifiers.join(' ');
        }
        if (obj.datatype) {
            if (obj.datatype === 'void') {
                signature += ' <b class="code keyword">' + obj.datatype.name + '</b>';
            } else {
                signature += ' <b class="code">' + styleDatatype(escape(obj.datatype.name)) + '</b>';
            }
        }
        signature += ' ';
        signature += ' <b class="code identifier">' + obj.name + '</b>';
        let params = [];
        if (obj.params && Utils.hasKeys(obj.params)) {
            for (const paramKey of Object.keys(obj.params)) {
                const param = obj.params[paramKey];
                params.push('<b class="code">' + styleDatatype(escape(param.datatype.name)) + '</b> <b class="code identifier">' + param.name + '</b>');
            }
        }
        signature += '<b class="code">(' + params.join(', ') + ')</b>';
        return signature;
    } else {
        if (modifiers) {
            return modifiers.join(' ') + ' <b class="code">' + styleDatatype(escape(obj.datatype.name)) + '</b> <b class="code identifier">' + obj.name + '</b>';
        }
        return '<b class="code">' + styleDatatype(escape(obj.datatype.name)) + '</b> <b class="code identifier">' + obj.name + '</b>';
    }
}

function getModifiers(obj: any): string[] | undefined {
    let modifiers = [];
    if (obj.accessModifier && obj.accessModifier.length > 0) {
        modifiers.push('<b class="code keyword">' + obj.accessModifier.textToLower + '</b>');
    }
    if (obj.definitionModifier && obj.definitionModifier.length > 0) {
        modifiers.push('<b class="code keyword">' + obj.definitionModifier.textToLower + '</b>');
    }
    if (obj.sharingModifier) {
        modifiers.push('<b class="code keyword">' + obj.sharingModifier.textToLower + '</b>');
    }
    if (obj.static) {
        modifiers.push('<b class="code keyword">static</b>');
    }
    if (obj.override) {
        modifiers.push('<b class="code keyword">override</b>');
    }
    if (obj.transient) {
        modifiers.push('<b class="code keyword">transient</b>');
    }
    if (obj.final) {
        modifiers.push('<b class="code keyword">final</b>');
    }
    if (obj.testMethod) {
        modifiers.push('<b class="code keyword">testmethod</b>');
    }
    if (modifiers.length > 0) {
        return modifiers;
    } else {
        return undefined;
    }
}

function getImplements(apexClass: any): string | undefined {
    if (apexClass.implements && apexClass.implements.length > 0) {
        let imps = [];
        for (const imp of apexClass.implements) {
            if (imp.documentation) {
                imps.push('<a target="_blank" href="' + imp.docLink + '">' + imp.name + '</a>');
            } else {
                imps.push('<a href="' + ((imp.parentName) ? imp.parentName : imp.name) + '.html" href="#">' + imp.name + '</a>');
            }
        }
        return imps.join(', ');
    }
    return undefined;
}
