const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const Config = require('../core/config');
const ApplicationContext = require('../core/applicationContext');
const Window = vscode.window;
const Tokenizer = languages.Tokenizer;
const TokenType = languages.TokenType;
const langUtils = languages.Utils;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const StrUtils = require('../utils/strUtils');

let testClasses = {};
let interfaces = {};
let apexClasses = {};
let batches = {};
let scheduled = {};
let queueables = {};
let restClasses = {};
let enumClasses = {};
let classes;
let namespacesMetadata;
let allNamespaces;
let apexTemplate
let sObjects;
let serverInstance;
let username;
let alias;
exports.run = function () {
    Window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder"
    }).then(function (uri) {
        if (uri && uri.length > 0) {
            let errorShown = false;
            classes = ApplicationContext.userClasses;
            namespacesMetadata = ApplicationContext.namespacesMetadata;
            allNamespaces = ApplicationContext.allNamespaces;
            sObjects = ApplicationContext.sObjects;
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

function createDocumentation(folderPath) {
    return new Promise(async function (resolve, reject) {
        try {
            NotificationManager.showStatusBar('$(sync~spin) Generating Project Doc');
            apexTemplate = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/apexClassPageTemplate.html');
            username = await Config.getAuthUsername();
            serverInstance = await Config.getServerInstance(username);
            alias = Config.getOrgAlias();
            createDocumentationForApexClasses(folderPath);
            resolve();
        } catch (error) {
            if (error.message.indexOf('JSON') !== -1)
                error = 'Create Documentation Error. Aura Helper are running job for Getting Apex Classes Information. Please, run this command when job finish. (See status bar)'
            reject(error);
        }
    });
}

function createDocumentationForApexClasses(folderPath) {
    Object.keys(classes).forEach(function (nameToLower) {
        let apexClass = classes[nameToLower];
        if (apexClass.annotation && apexClass.annotation.toLowerCase() === '@istest') {
            testClasses[apexClass.name] = apexClass;
        } else if (apexClass.isInterface) {
            interfaces[apexClass.name] = apexClass;
        } else if (apexClass.isEnum) {
            enumClasses[apexClass.name] = apexClass;
        } else {
            apexClasses[apexClass.name] = apexClass;
        }
        if (apexClass.annotation && apexClass.annotation.toLowerCase().indexOf('@restresource') !== -1)
            restClasses[apexClass.name] = apexClass;
        if (isBatchClass(apexClass))
            batches[apexClass.name] = apexClass;
        if (isScheduledClass(apexClass))
            scheduled[apexClass.name] = apexClass;
        if (isQueueableClass(apexClass))
            queueables[apexClass.name] = apexClass;
    });
    if (!FileChecker.isExists(folderPath))
        FileWriter.createFolderSync(folderPath);
    if (!FileChecker.isExists(folderPath + '/classes'))
        FileWriter.createFolderSync(folderPath + '/classes');
    let index = createIndex();
    FileWriter.createFileSync(folderPath + '/index.html', index);
    let home = createHome();
    FileWriter.createFileSync(folderPath + '/home.html', home);
    if (!FileChecker.isExists(folderPath + '/resources'))
        FileWriter.createFolderSync(folderPath + '/resources');
    FileWriter.copyFile(Paths.getResourcesPath() + '/images/icon.png', folderPath + '/resources/aurahelper.png', function () {

    });
    Object.keys(classes).forEach(function (className) {
        let classToProcess = classes[className];
        let classContent = createDocumentationForClass(classToProcess);
        FileWriter.createFileSync(folderPath + '/classes/' + classToProcess.name + '.html', classContent);
    });
}

function styleDatatype(datatype) {
    let dataTypeTokens = Tokenizer.tokenize(datatype);
    let index = 0;
    let styledDatatype = [];
    while (index < dataTypeTokens.length) {
        let lastToken = langUtils.getLastToken(dataTypeTokens, index);
        let token = dataTypeTokens[index];
        let tokenChanged = false;
        if (token.tokenType === TokenType.IDENTIFIER) {
            if (lastToken && lastToken.content === '&' && (token.content === 'lt' || token.content === 'gt')) {
                index++;
                continue;
            }
            let contentToLower = token.content.toLowerCase();
            if (!tokenChanged) {
                Object.keys(allNamespaces).forEach(function (nsToLower) {
                    let nsData = namespacesMetadata[nsToLower];
                    if (contentToLower === nsToLower) {
                        tokenChanged = true;
                        styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="' + ((allNamespaces[nsToLower].docLink) ? allNamespaces[nsToLower].docLink : allNamespaces[nsToLower].link) + '">' + nsData.name + '</a></b>');
                    } else if (nsData && nsData[contentToLower]) {
                        tokenChanged = true;
                        styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="' + ((nsData[contentToLower].docLink) ? nsData[contentToLower].docLink : nsData[contentToLower].link) + '">' + nsData[contentToLower].name + '</a></b>');
                    }
                });
            }
            if (!tokenChanged) {
                let nsData = namespacesMetadata["system"];
                if (nsData && nsData[contentToLower]) {
                    tokenChanged = true;
                    styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="' + ((nsData[contentToLower].docLink) ? nsData[contentToLower].docLink : nsData[contentToLower].link) + '">' + nsData[contentToLower].name + '</a></b>');
                }
            }
            if (!tokenChanged) {
                if (sObjects[contentToLower]) {
                    tokenChanged = true;
                    if (contentToLower.endsWith('__c')) {
                        styledDatatype.push('<b class="code sobject"><a style="text-decoration:none;" href="' + serverInstance + '/' + sObjects[contentToLower].keyPrefix + '">' + sObjects[contentToLower].name + '</a></b>');
                    } else if (contentToLower.endsWith('__mdt')) {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://help.salesforce.com/articleView?id=custommetadatatypes_overview.htm&type=5">' + sObjects[contentToLower].name + '</a></b>');
                    } else if (contentToLower.endsWith('__kav')) {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://help.salesforce.com/articleView?id=knowledge_article_types_manage.htm&type=5">' + sObjects[contentToLower].name + '</a></b>');
                    } else {
                        styledDatatype.push('<b class="code sobject"><a target="_blank" style="text-decoration:none;" href="https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_' + contentToLower + '.htm">' + sObjects[contentToLower].name + '</a></b>');
                    }
                } else if (contentToLower === 'sobject') {
                    tokenChanged = true;
                    styledDatatype.push('<b class="code datatype"><a target="_blank" style="text-decoration:none;" href="https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_methods_system_sobject.htm">SObject</a></b>');
                }
            }
            if (!tokenChanged) {
                Object.keys(classes).forEach(function (nameToLower) {
                    let apexClass = classes[nameToLower];
                    if (!tokenChanged) {
                        if (nameToLower === contentToLower) {
                            tokenChanged = true;
                            styledDatatype.push('<b class="code datatype"><a style="text-decoration:none;" href="' + apexClass.name + '.html">' + apexClass.name + '</a></b>');
                        } else if (apexClass.classes[contentToLower]) {
                            styledDatatype.push('<b class="code datatype"><a style="text-decoration:none;" href="' + apexClass.name + '.html">' + apexClass.classes[contentToLower].name + '</a></b>');
                            tokenChanged = true;
                        } else if (apexClass.enums[contentToLower]) {
                            styledDatatype.push('<b class="code datatype"><a style="text-decoration:none;" href="' + apexClass.name + '.html">' + apexClass.enums[contentToLower].name + '</a></b>');
                            tokenChanged = true;
                        }
                    }
                });
            }
            if (!tokenChanged) {
                styledDatatype.push(token.content);
            }
        } else if (token.tokenType === TokenType.COMMA) {
            styledDatatype.push(token.content + ' ');
        } else {
            styledDatatype.push(token.content);
        }
        index++;
    }
    return styledDatatype.join('');
}


function isBatchClass(apexClass) {
    if (apexClass.implementTypes && apexClass.implementTypes.length > 0) {
        for (const impType of apexClass.implementTypes) {
            if (impType.toLowerCase().indexOf('database.batchable') !== -1)
                return true;
        }
    }
    return false;
}

function isScheduledClass(apexClass) {
    if (apexClass.implementTypes && apexClass.implementTypes.length > 0) {
        for (const impType of apexClass.implementTypes) {
            if (impType.toLowerCase().indexOf('schedulable') !== -1)
                return true;
        }
    }
    return false;
}

function isQueueableClass(apexClass) {
    if (apexClass.implementTypes && apexClass.implementTypes.length > 0) {
        for (const impType of apexClass.implementTypes) {
            if (impType.toLowerCase().indexOf('queueable') !== -1)
                return true;
        }
    }
    return false;
}

function createIndex() {
    let navigationContent = getNavigationMenu();
    let pageContent = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/indexTemplate.html');
    pageContent = StrUtils.replace(pageContent, '{!navbar}', navigationContent.join('\n'));
    return pageContent;
}

function getNavigationMenu() {
    let content = [];
    content.push('<a onclick="goToHome()" class="w3-bar-item menu"><b>Home</b></a>')
    if (serverInstance) {
        content.push('<a target="_blank" href="' + serverInstance + '/auradocs/reference.app" class="w3-bar-item menu"><b>Aura Documentation</b></a>')
    }
    if (Object.keys(apexClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item menu" onclick="openCloseAccordion(\'apexClassesSection\')"><b>Classes</b><span class="w3-right">' + Object.keys(apexClasses).length + '</span></a>')
        content.push('<div id="apexClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(apexClasses).forEach(function (className) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + className + '\')">' + className + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(interfaces).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'interfacesSection\')"><b>Interfaces</b><span class="w3-right">' + Object.keys(interfaces).length + '</span></a>')
        content.push('<div id="interfacesSection" class="w3-hide w3-margin-left">');
        Object.keys(interfaces).forEach(function (interfaceName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + interfaceName + '\')">' + interfaceName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(enumClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'interfacesSection\')"><b>Interfaces</b><span class="w3-right">' + Object.keys(enumClasses).length + '</span></a>')
        content.push('<div id="interfacesSection" class="w3-hide w3-margin-left">');
        Object.keys(enumClasses).forEach(function (enumName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + enumName + '\')">' + enumName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(batches).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'batchesSection\')"><b>Batchable Classes</b><span class="w3-right">' + Object.keys(batches).length + '</span></a>')
        content.push('<div id="batchesSection" class="w3-hide w3-margin-left">');
        Object.keys(batches).forEach(function (batchName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + batchName + '\')">' + batchName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(scheduled).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'scheduledSection\')"><b>Schedulable Classes</b><span class="w3-right">' + Object.keys(scheduled).length + '</span></a>')
        content.push('<div id="scheduledSection" class="w3-hide w3-margin-left">');
        Object.keys(scheduled).forEach(function (scheduledName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + scheduledName + '\')">' + scheduledName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(queueables).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'queueableSection\')"><b>Queueable Classes</b><span class="w3-right">' + Object.keys(queueables).length + '</span></a>')
        content.push('<div id="queueableSection" class="w3-hide w3-margin-left">');
        Object.keys(queueables).forEach(function (queueableName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + queueableName + '\')">' + queueableName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(restClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'restClassesSection\')"><b>REST Classes</b><span class="w3-right">' + Object.keys(restClasses).length + '</span></a>')
        content.push('<div id="restClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(restClasses).forEach(function (restName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + restName + '\')">' + restName + '</a>');
        });
        content.push('</div>');
    }
    if (Object.keys(testClasses).length > 0) {
        content.push('<a href="#" class="w3-bar-item  menu" onclick="openCloseAccordion(\'testClassesSection\')"><b>Test Classes</b><span class="w3-right">' + Object.keys(testClasses).length + '</span></a>')
        content.push('<div id="testClassesSection" class="w3-hide w3-margin-left">');
        Object.keys(testClasses).forEach(function (testClassName) {
            content.push('<a href="#" class="w3-bar-item  menu menuLink w3-show" onclick="loadPage(\'' + testClassName + '\')">' + testClassName + '</a>');
        });
        content.push('</div>');
    }
    return content;
}

function createHome() {
    let homeContent = getHome();
    let pageContent = FileReader.readFileSync(Paths.getAssetsPath() + '/documentation/homeTemplate.html');
    pageContent = StrUtils.replace(pageContent, '{!homeTitle}', 'Organization: ' + alias + '<h5 class="sectionTitle">Server Instance: ' + serverInstance + '</h5>');
    pageContent = StrUtils.replace(pageContent, '{!goToEnvironment}', serverInstance);
    pageContent = StrUtils.replace(pageContent, '{!docStructure}', homeContent.join('\n'));
    return pageContent;
}

function getHome() {
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

function createDocumentationForClass(apexClass) {
    let classBody = getClassBody(apexClass);
    let content = StrUtils.replace(apexTemplate, '{!classContent}', classBody.join('\n'));
    return content;
}

function getClassBody(apexClass) {
    let content = [];
    content.push('<div id="classNameSection">');
    content.push('<h2 class="sectionTitle">' + apexClass.name + '</h2>');
    if (apexClass.comment && apexClass.comment.length > 0)
        content.push('<br/>' + StrUtils.replace(apexClass.comment, '\n', '<br/>'));
    content.push('</div>');
    content.push('<br/>');
    if (!apexClass.isEnum) {
        if (apexClass.extends) {
            content.push('<div id="extendsSection">');
            content.push('<h3 class="sectionTitle">Extends</h3>');
            if (apexClass.extends.docLink)
                content.push('<p style="padding-left:20px" class="code datatype"><a target="_blank" href="' + apexClass.extends.docLink + '">' + apexClass.extends.name + '</a></p>');
            else
                content.push('<p style="padding-left:20px" class="code datatype"><a href="' + ((apexClass.extends.parentClass) ? apexClass.extends.parentClass : apexClass.extends.name) + '.html">' + apexClass.extends.name + '</a></p>');
            content.push('</div>');
            content.push('<br/>');

        }
        let imps = getImplements(apexClass);
        if (imps) {
            content.push('<div id="implementsSection">');
            content.push('<h3 class="sectionTitle">Implements</h3>');
            content.push('<p style="padding-left:20px" class="code datatype">' + imps + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        let modifiers = getModifiers(apexClass);
        if (modifiers) {
            content.push('<div id="modifiersSection">');
            content.push('<h3 class="sectionTitle">Modifiers</h3>');
            content.push('<p style="padding-left:20px">' + modifiers.join(', ') + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexClass.annotation && apexClass.annotation.length > 0) {
            content.push('<div id="annotationSection">');
            content.push('<h3 class="sectionTitle">Annotations</h3>');
            content.push('<p style="padding-left:20px">' + apexClass.annotation + '</p>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexClass.fields && apexClass.fields.length > 0) {
            content.push('<div id="fieldsSection">');
            content.push('<h3 class="sectionTitle">Fields</h3>');
            content.push('<ul>');
            for (const field of apexClass.fields) {
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexClass.name + '.' + field.name + '\')"><b>' + field.name + '</b></a>');
                if (field.comment && field.comment.length > 0)
                    content.push('<br/>' + StrUtils.replace(field.comment, '\n', '<br/>'));
                content.push('<div id="' + apexClass.name + '.' + field.name + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px"><b class="code">' + getSignature(field) + '</b></p>');
                content.push('<p style="padding-left:20px">Type: <b class="code">' + styleDatatype(escape(field.datatype)) + '</b></p>');
                content.push('<br/>');
                content.push('</div>');
                content.push('</li>');
            }
            content.push('</ul>');
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexClass.constructors && apexClass.constructors.length > 0) {
            content.push('<div id="constructorsSection">');
            content.push('<h3 class="sectionTitle">Constructors</h3>');
            content.push('<ul>');
            let index = 0;
            for (const constructor of apexClass.constructors) {
                let paramNames = [];
                if (constructor.params && constructor.params.length > 0) {
                    for (const param of constructor.params) {
                        paramNames.push(param.name);
                    }
                }
                let name = constructor.name + '(' + paramNames.join(', ') + ')';
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexClass.name + '.' + constructor.name + '_' + index + '\')"><b>' + name + '</b></a>');
                if (constructor.comment && constructor.comment.description && constructor.comment.description.length > 0) {
                    content.push('<br/>' + constructor.comment.description);
                }
                content.push('<div id="' + apexClass.name + '.' + constructor.name + '_' + index + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px">' + getSignature(constructor, true) + '</p>');
                if (constructor.params && constructor.params.length > 0) {
                    content.push('<h4 class="sectionTitle"><b>Parameters</b></h4>');
                    for (const param of constructor.params) {
                        if (constructor.comment && constructor.comment.params) {
                            let paramComment = constructor.comment.params[param.name];
                            if (paramComment)
                                content.push('<p style="padding-left:20px">' + paramComment.description + '</p>');
                        }
                        content.push('<p style="padding-left:20px"><b class="code identifier">' + param.name + '</b></p>');
                        content.push('<p style="padding-left:30px">Type: <b class="code">' + styleDatatype(escape(param.datatype)) + '</b></p>');
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
        if (apexClass.methods && apexClass.methods.length > 0) {
            content.push('<div id="methodsSection">');
            content.push('<h3 class="sectionTitle">Methods</h3>');
            content.push('<ul>');
            let index = 0;
            for (const method of apexClass.methods) {
                let paramNames = [];
                if (method.params && method.params.length > 0) {
                    for (const param of method.params) {
                        paramNames.push(param.name);
                    }
                }
                let name = method.name + '(' + paramNames.join(', ') + ')';
                content.push('<li style="margin-bottom: 10px">');
                content.push('<a class="w3-bar-item menu" onclick="openCloseAccordion(\'' + apexClass.name + '.' + method.name + '_' + index + '\')"><b>' + name + '</b></a>');
                if (method.comment && method.comment.description && method.comment.description.length > 0) {
                    content.push('<br/>' + method.comment.description);
                }
                content.push('<div id="' + apexClass.name + '.' + method.name + '_' + index + '" class="w3-hide w3-margin-left">');
                content.push('<h4 class="sectionTitle"><b>Signature</b></h4>');
                content.push('<p style="padding-left:20px">' + getSignature(method, true) + '</p>');
                if (method.params && method.params.length > 0) {
                    content.push('<h4 class="sectionTitle"><b>Parameters</b></h4>');
                    for (const param of method.params) {
                        if (method.comment && method.comment.params) {
                            let paramComment = method.comment.params[param.name];
                            if (paramComment)
                                content.push('<p style="padding-left:20px">' + paramComment.description + '</p>');
                        }
                        content.push('<p style="padding-left:20px"><b class="code identifier">' + param.name + '</b></p>');
                        content.push('<p style="padding-left:30px">Type: <b class="code">' + styleDatatype(escape(param.datatype)) + '</b></p>');
                    }
                }
                if (method.datatype && method.datatype !== 'void') {
                    content.push('<h4 class="sectionTitle"><b>Return</b></h4>');
                    content.push('<p style="padding-left:20px">Type: <b class="code">' + styleDatatype(escape(method.datatype)) + '</b></p>');
                    if (method.comment && method.comment.return && method.comment.return.description && method.comment.return.description.length > 0) {
                        content.push('<p style="padding-left:20px">' + method.comment.return.description + '</p>');
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
        if (apexClass.enums && Object.keys(apexClass.enums).length > 0) {
            content.push('<h3 class="sectionTitle">Enums</h3>');
            content.push('<div style="padding: 20px; margin-left: 30px; margin-right: 15px;" class="w3-card-4" id="enumsSection">');
            Object.keys(apexClass.enums).forEach(function (key) {
                content = content.concat(getClassBody(apexClass.enums[key]));
            });
            content.push('</div>');
            content.push('<br/>');
        }
        if (apexClass.classes && Object.keys(apexClass.classes).length > 0) {
            content.push('<h3 class="sectionTitle">Classes</h3>');
            content.push('<div style="padding: 20px; margin-left: 30px; margin-right: 15px;" class="w3-card-4" id="classesSection">');
            Object.keys(apexClass.classes).forEach(function (key) {
                content = content.concat(getClassBody(apexClass.classes[key]));
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
        for (const value of apexClass.enumValues) {
            content.push('<tr>');
            content.push('<td class="code datatype">' + value.name + '</td>');
            content.push('</tr>');
        }
        content.push('</table>');
        content.push('<div>');
    }
    return content;
}

function escape(text) {
    if (!text || text.trim().length === 0)
        return '';
    text = StrUtils.replace(text, '<', '&lt;');
    text = StrUtils.replace(text, '>', '&gt;');
    return text;
}

function getSignature(obj, isMethod) {
    let modifiers = getModifiers(obj);
    if (isMethod) {
        let signature = '';
        if (modifiers)
            signature += modifiers.join(' ');
        if (obj.datatype) {
            if (obj.datatype === 'void')
                signature += ' <b class="code keyword">' + obj.datatype + '</b>';
            else
                signature += ' <b class="code">' + styleDatatype(escape(obj.datatype)) + '</b>';
        }
        signature += ' ';
        signature += ' <b class="code identifier">' + obj.name + '</b>';
        let params = [];
        for (const param of obj.params) {
            params.push('<b class="code">' + styleDatatype(escape(param.datatype)) + '</b> <b class="code identifier">' + param.name + '</b>');
        }
        signature += '<b class="code">(' + params.join(', ') + ')</b>';
        return signature;
    } else {
        if (modifiers)
            return modifiers.join(' ') + ' <b class="code">' + styleDatatype(escape(obj.datatype)) + '</b> <b class="code identifier">' + obj.name + '</b>';
        return '<b class="code">' + styleDatatype(escape(obj.datatype)) + '</b> <b class="code identifier">' + obj.name + '</b>';
    }
}

function getModifiers(obj) {
    let modifiers = [];
    if (obj.accessModifier && obj.accessModifier.length > 0)
        modifiers.push('<b class="code keyword">' + obj.accessModifier.toLowerCase() + '</b>');
    if (obj.definitionModifier && obj.definitionModifier.length > 0)
        modifiers.push('<b class="code keyword">' + obj.definitionModifier.toLowerCase() + '</b>');
    if (obj.inheritedSharing)
        modifiers.push('<b class="code keyword">inherited sharing</b>');
    if (obj.withSharing)
        modifiers.push('<b class="code keyword">with sharing</b>');
    else if (obj.withSharing !== undefined)
        modifiers.push('<b class="code keyword">without sharing</b>');
    if (obj.static)
        modifiers.push('<b class="code keyword">static</b>');
    if (obj.virtual)
        modifiers.push('<b class="code keyword">virtual</b>');
    if (obj.abstract)
        modifiers.push('<b class="code keyword">abstract</b>');
    if (obj.override)
        modifiers.push('<b class="code keyword">override</b>');
    if (obj.transient)
        modifiers.push('<b class="code keyword">transient</b>');
    if (obj.final)
        modifiers.push('<b class="code keyword">final</b>');
    if (obj.testMethod)
        modifiers.push('<b class="code keyword">testmethod</b>');
    if (modifiers.length > 0)
        return modifiers;
    else
        undefined;
}

function getImplements(apexClass) {
    if (apexClass.implements && apexClass.implements.length > 0) {
        let imps = [];
        for (const imp of apexClass.implements) {
            if (imp.docLink)
                imps.push('<a target="_blank" href="' + imp.docLink + '">' + imp.name + '</a>');
            else
                imps.push('<a href="' + ((imp.parentClass) ? imp.parentClass : imp.name) + '.html" href="#">' + imp.name + '</a>');
        }
        return imps.join(', ');
    }
    return undefined;
}
