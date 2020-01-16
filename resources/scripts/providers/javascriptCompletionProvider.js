const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const languages = require('../languages');
const Utils = require('./utils').Utils;
const applicationContext = require('../main/applicationContext');
const FileChecker = fileSystem.FileChecker;
const BundleAnalizer = languages.BundleAnalizer;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const MarkdownString = vscode.MarkdownString;
const SnippetString = vscode.SnippetString;
const langUtils = languages.Utils;

exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isJavaScript(document.uri.fsPath)) {
            items = provideJSCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}

function provideJSCompletion(document, position) {
    let items;
    let activationInfo = Utils.getActivation(document, position);
    let activation = activationInfo.activation;
    let activationTokens = activation.split('.');
    let similarJSSnippetsNs = getSimilarSnippetsNS(applicationContext.jsSnippets, activationTokens[0]);
    let snippets;
    let queryData = langUtils.getQueryData(document, position);
    let classes = Utils.getClassesFromClassFolder(document);
    let systemMetadata = Utils.getNamespaceMetadataFile('System');
    let namespacesMetadata = Utils.getNamespacesMetadataFile();
    let sObjects = Utils.getObjectsFromMetadataIndex();
    let componentStructure = BundleAnalizer.getComponentStructure(document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'));
    if (FileChecker.isJavaScript(document.uri.fsPath) && applicationContext.jsSnippets[activationTokens[0]] && applicationContext.jsSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.jsSnippets[activationTokens[0]];
    }

    if (queryData) {
        // Code for support completion on queries
        items = Utils.getQueryCompletionItems(activationTokens, activationInfo, queryData, position, 'aurahelper.completion.aura');
    } else if (snippets && snippets.length > 0) {
        // Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
        items = getSnippetsCompletionItems(position, snippets);
    } else if (similarJSSnippetsNs.length > 0 && FileChecker.isJavaScript(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (au (aura.) ...)
        items = getSimilarCompletionItems(position, similarJSSnippetsNs);
    } else if (activationTokens[0] === 'v' || activationTokens[0] === 'c' || activationTokens[0] === 'helper') {
        // Code for completions when user types v. c. or helper.
        if (activationTokens[0] === 'v') {
            // Code for completions when user types v.
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
            if (attribute) {
                items = getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, sObjects, position);
            } else if (activationTokens.length === 2) {
                items = getAttributes(componentStructure, position,);
            }
        } else if (activationTokens[0] === 'c') {
            // Code for completions when user types c.
            if (!config.getConfig().activeControllerMethodsSuggest)
                return Promise.resolve(undefined);
            items = getApexControllerFunctions(componentStructure, position);
        } else if (activationTokens[0] === 'helper') {
            // Code for completions when user types helper.
            if (!config.getConfig().activeHelperFunctionsSuggest)
                return Promise.resolve(undefined);
            items = getHelperFunctions(componentStructure, position);
        }
    } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
        items = getLabelsCompletionItems(activationTokens, position);
    } else if (activationTokens.length > 1) {
        // Code for completions when position is on empty line or withot components
        items = getApexCompletionItems(document, position, activationTokens, activationInfo, classes, systemMetadata, namespacesMetadata, sObjects);

    } else if (activationTokens.length > 0) {
        // Code for completions when position is on empty line or withot components
        items = getAllAvailableCompletionItems(position, classes, systemMetadata, namespacesMetadata, sObjects);

    }
    return items;
}

function getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, sObjects, position) {
    let items;
    if (sObjects.sObjectsToLower.includes(attribute.type.toLowerCase())) {
        if (!config.getConfig().activeSobjectFieldsSuggestion)
            return Promise.resolve(undefined);
        let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[attribute.type.toLowerCase()]);
        if (activationTokens.length >= 2) {
            let lastObject = sObject;
            let index = 0;
            for (const activationToken of activationTokens) {
                let actToken = activationToken;
                if (index > 1) {
                    if (actToken.endsWith('__r'))
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    let fielData = Utils.getFieldData(lastObject, actToken);
                    if (fielData) {
                        if (fielData.referenceTo.length === 1) {
                            lastObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                        } else {
                            lastObject = undefined;
                        }
                    }
                }
                index++;
            }
            items = Utils.getSobjectsFieldsCompletionItems(position, lastObject, 'aurahelper.completion.aura', activationTokens, activationInfo);
        }
    } else {
        // include Apex Classes Completion
    }
    return items;
}

function getAllAvailableCompletionItems(position, classes, systemMetadata, namespacesMetadata, sObjects) {
    let items = [];
    for (const userClass of classes.classes) {
        let options = Utils.getCompletionItemOptions(userClass, 'Custom Apex Class', userClass, true, CompletionItemKind.Class);
        let command = Utils.getCommand('UserClass', 'aurahelper.completion.aura', [position, 'UserClass', userClass]);
        items.push(Utils.createItemForCompletion(userClass, options, command));
    }
    Object.keys(systemMetadata).forEach(function (key) {
        let systemClass = systemMetadata[key];
        if (systemClass.isEnum) {
            let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '') + '\nEnum Values: \n' + systemClass.enumValues.join('\n');
            let options = Utils.getCompletionItemOptions('Enum from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Enum);
            let command = Utils.getCommand('SystemEnum', 'aurahelper.completion.aura', [position, 'SystemEnum', systemClass]);
            items.push(Utils.createItemForCompletion(systemClass.name, options, command));
        } else if (systemClass.isInterface) {
            let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '');
            let options = Utils.getCompletionItemOptions('Interface from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Interface);
            let command = Utils.getCommand('SystemInterface', 'aurahelper.completion.aura', [position, 'SystemInterface', systemClass]);
            items.push(Utils.createItemForCompletion(systemClass.name, options, command));
        } else {
            let description = systemClass.description + ((systemClass.link) ? 'Documentation:\n ' + systemClass.link : '');
            let options = Utils.getCompletionItemOptions('Class from ' + systemClass.namespace + ' Namespace', description, systemClass.name, true, CompletionItemKind.Class);
            let command = Utils.getCommand('SystemClass', 'aurahelper.completion.aura', [position, 'SystemClass', systemClass]);
            items.push(Utils.createItemForCompletion(systemClass.name, options, command));
        }
    });
    Object.keys(namespacesMetadata).forEach(function (key) {
        let nsMetadata = namespacesMetadata[key];
        let options = Utils.getCompletionItemOptions(nsMetadata.description, nsMetadata.docLink, nsMetadata.name, true, CompletionItemKind.Module);
        let command = Utils.getCommand('Namespace', 'aurahelper.completion.aura', [position, 'Namespace', nsMetadata]);
        items.push(Utils.createItemForCompletion(nsMetadata.name, options, command));
    });
    if (config.getConfig().activeSObjectSuggestion) {
        for (const sobject of sObjects.sObjectsToLower) {
            let objName = sObjects.sObjectsMap[sobject];
            let splits = objName.split('__');
            let namespace = '';
            let description = 'Standard SObject';
            if (objName.indexOf('__c') !== -1)
                description = 'Custom SObject';
            if (splits.length > 2) {
                namespace = splits[0].trim();
                description += '\nNamespace: ' + namespace;
            }
            let options = Utils.getCompletionItemOptions(objName, description, objName, true, CompletionItemKind.Class);
            let command = Utils.getCommand('SObject', 'aurahelper.completion.aura', [position, 'SObject', objName]);
            items.push(Utils.createItemForCompletion(objName, options, command));
        }
    }
    return items;
}

function getApexCompletionItems(document, position, activationTokens, activationInfo, classes, systemMetadata, namespacesMetadata, sObjects) {
    let items = [];
    let sObject = Utils.getObjectFromMetadataIndex(sObjects.sObjectsMap[activationTokens[0].toLowerCase()]);
    let lastClass = undefined;
    let parentStruct;
    let index = 0;
    for (let actToken of activationTokens) {
        if (index < activationTokens.length - 1) {
            let actType = Utils.getActivationType(actToken);
            let datatype;
            let className;
            if (sObject) {
                if (actToken.endsWith('__r'))
                    actToken = actToken.substring(0, actToken.length - 3) + '__c';
                let fielData = Utils.getFieldData(sObject, actToken);
                if (fielData) {
                    if (fielData.referenceTo.length === 1) {
                        sObject = Utils.getObjectFromMetadataIndex(fielData.referenceTo[0]);
                    } else {
                        datatype = fielData.type;
                        if (datatype.indexOf('<') !== -1)
                            datatype = datatype.split('<')[0];
                        if (datatype.indexOf('[') !== -1 && datatype.indexOf(']') !== -1)
                            datatype = "List";
                        if (datatype.indexOf('.') !== -1) {
                            let splits = datatype.split('.');
                            if (splits.length === 2) {
                                let parentClassOrNs = splits[0];
                                className = splits[1];
                                if (systemMetadata[parentClassOrNs]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassOrNs);
                                } else if (namespacesMetadata[parentClassOrNs]) {
                                    lastClass = Utils.getClassStructure(document, parentClassOrNs, className);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            } else if (splits.length === 2) {
                                let nsName = splits[0];
                                let parentClassName = splits[1];
                                className = splits[2];
                                if (systemMetadata[parentClassName.toLowerCase()]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassName);
                                } else if (namespacesMetadata[nsName.toLowerCase()]) {
                                    lastClass = Utils.getClassStructure(document, nsName, parentClassName);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            }
                        } else {
                            parentStruct = undefined;
                            if (systemMetadata[datatype.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', datatype);
                                sObject = undefined;
                            }
                        }
                        if (parentStruct && className) {
                            let classFound = false;
                            Object.keys(parentStruct.classes).forEach(function (key) {
                                let innerClass = parentStruct.classes[key];
                                if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                                    classFound = true;
                                    lastClass = innerClass;
                                }
                            });
                            if (!classFound) {
                                Object.keys(parentStruct.enums).forEach(function (key) {
                                    let innerEnum = parentStruct.enums[key];
                                    if (innerEnum.name.toLowerCase() === className.toLowerCase()) {
                                        lastClass = innerEnum;
                                        classFound = true;
                                    }
                                });
                            }
                            if (!classFound)
                                lastClass = undefined;
                        }
                    }
                }
            } else if (lastClass) {
                if (!lastClass.isEnum) {
                    if (actType.type === 'field') {
                        if (lastClass.posData && lastClass.posData.isOnMethod) {
                            let method = Utils.getMethod(lastClass, lastClass.posData.methodSignature);
                            let methodVar = Utils.getVariable(method, actToken);
                            let classVar = Utils.getClassField(lastClass, actToken);
                            if (methodVar)
                                datatype = methodVar.datatype;
                            else if (classVar)
                                datatype = classVar.datatype;
                        } else {
                            let classVar = Utils.getClassField(lastClass, actToken);
                            if (classVar)
                                datatype = classVar.datatype;
                        }
                    } else if (actType.type === 'method') {
                        let method = Utils.getMethodFromCall(lastClass, actType.name, actType.params);
                        if (method)
                            datatype = method.datatype;
                    }
                    if (!datatype) {
                        if (lastClass.parentClass) {
                            parentStruct = Utils.getClassStructure(document, undefined, lastClass.parentClass);
                            className = actToken;
                        } else {
                            if (classes.classesToLower.includes(actToken.toLowerCase())) {
                                lastClass = Utils.getClassStructure(document, undefined, actToken);
                                parentStruct = undefined;
                                sObject = undefined;
                            } else if (systemMetadata[actToken.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', actToken);
                                parentStruct = undefined;
                                sObject = undefined;
                            } else if (sObjects.sObjectsToLower.includes(actToken.toLowerCase())) {
                                sObject = Utils.getObjectFromMetadataIndex(actToken);
                                parentStruct = undefined;
                                lastClass = undefined;
                            }
                        }
                    } else {
                        if (datatype.indexOf('<') !== -1)
                            datatype = datatype.split('<')[0];
                        if (datatype.indexOf('[') !== -1 && datatype.indexOf(']') !== -1)
                            datatype = "List";
                        if (datatype.indexOf('.') !== -1) {
                            let splits = datatype.split('.');
                            if (splits.length === 2) {
                                let parentClassOrNs = splits[0];
                                className = splits[1];
                                if (classes.classesToLower.includes(parentClassOrNs.toLowerCase())) {
                                    parentStruct = Utils.getClassStructure(document, undefined, parentClassOrNs);
                                } else if (systemMetadata[parentClassOrNs]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassOrNs);
                                } else if (namespacesMetadata[parentClassOrNs]) {
                                    lastClass = Utils.getClassStructure(document, parentClassOrNs, className);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            } else if (splits.length === 2) {
                                let nsName = splits[0];
                                let parentClassName = splits[1];
                                className = splits[2];
                                if (classes.classesToLower.includes(parentClassName.toLowerCase())) {
                                    parentStruct = Utils.getClassStructure(document, undefined, parentClassName);
                                } else if (systemMetadata[parentClassName.toLowerCase()]) {
                                    parentStruct = Utils.getClassStructure(document, 'System', parentClassName);
                                } else if (namespacesMetadata[nsName.toLowerCase()]) {
                                    lastClass = Utils.getClassStructure(document, nsName, parentClassName);
                                    parentStruct = undefined;
                                    sObject = undefined;
                                }
                            }
                        } else {
                            parentStruct = undefined;
                            if (lastClass.parentClass && datatype !== 'List') {
                                parentStruct = Utils.getClassStructure(document, undefined, lastClass.parentClass);
                                className = datatype;
                            } else if (classes.classesToLower.includes(datatype.toLowerCase())) {
                                lastClass = Utils.getClassStructure(document, undefined, datatype);
                                sObject = undefined;
                            } else if (systemMetadata[datatype.toLowerCase()]) {
                                lastClass = Utils.getClassStructure(document, 'System', datatype);
                                sObject = undefined;
                            } else if (sObjects.sObjectsToLower.includes(datatype.toLowerCase())) {
                                sObject = Utils.getObjectFromMetadataIndex(datatype);
                                parentStruct = undefined;
                                lastClass = undefined;
                            }
                        }
                    }
                    if (parentStruct && className) {
                        let classFound = false;
                        Object.keys(parentStruct.classes).forEach(function (key) {
                            let innerClass = parentStruct.classes[key];
                            if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                                classFound = true;
                                lastClass = innerClass;
                            }
                        });
                        if (!classFound) {
                            Object.keys(parentStruct.enums).forEach(function (key) {
                                let innerEnum = parentStruct.enums[key];
                                if (innerEnum.name.toLowerCase() === className.toLowerCase()) {
                                    lastClass = innerEnum;
                                    classFound = true;
                                }
                            });
                        }
                        if (!classFound)
                            lastClass = undefined;
                    }
                }
            }
        }
        index++;
    }
    if (lastClass && config.getConfig().activeApexSuggestion) {
        items = Utils.getApexClassCompletionItems(position, lastClass);
    } else if (sObject && config.getConfig().activeSobjectFieldsSuggestion) {
        items = Utils.getSobjectsFieldsCompletionItems(position, sObject, 'aurahelper.completion.aura', activationTokens, activationInfo);
    }
    return items;
}

function getLabelsCompletionItems(activationTokens, position) {
    let items = [];
    let orgNamespace = config.getOrgNamespace();
    if (!orgNamespace || orgNamespace.length == 0)
        orgNamespace = 'c';
    if (activationTokens.length == 2) {
        let labels = Utils.getCustomLabels();
        for (const label of labels) {
            let doc = 'Name: ' + label.fullName + '\n';
            doc += 'Value: ' + label.value + '\n';
            doc += 'Category: ' + label.categories + '\n';
            doc += 'Language: ' + label.language + '\n';
            doc += 'Protected: ' + label.protected;
            let options = Utils.getCompletionItemOptions(label.shortDescription, doc, label.fullName, true, CompletionItemKind.Field);
            let command = Utils.getCommand('CustomLabelJS', 'aurahelper.completion.aura', [position, 'CustomLabelJS', { label: label, orgNamespace: orgNamespace }]);
            items.push(Utils.createItemForCompletion(label.fullName, options, command));
        }
    }
    return items;
}

function getAttributes(componentStructure, position, componentTagData) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let item = new CompletionItem('v.' + attribute.name, CompletionItemKind.Field);
        item.detail = 'Type: ' + attribute.type;
        item.documentation = attribute.description;
        item.insertText = attribute.name;
        item.command = {
            title: 'Aura Component Attribute',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'attribute', attribute, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getApexControllerFunctions(componentStructure, position) {
    let items = [];
    for (const method of componentStructure.apexFunctions) {
        if (method.annotation && method.annotation == '@AuraEnabled') {
            let item = new CompletionItem(method.name, CompletionItemKind.Method);
            if (method.comment) {
                item.detail = method.comment.description + '\n';
                for (const commentParam of method.comment.params) {
                    item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                }
            }
            else {
                item.detail = "Apex Controller Function";
            }
            item.preselect = true;
            item.documentation = method.signature;
            item.insertText = method.name;
            item.command = {
                title: 'Apex Controller Function',
                command: 'aurahelper.completion.aura',
                arguments: [position, 'method', method]
            };
            items.push(item);
            if (method.params && method.params.length) {
                let itemParams = new CompletionItem(method.name + '.params', CompletionItemKind.Variable);
                itemParams.detail = "Get method parameters on json object";
                itemParams.preselect = true;
                itemParams.documentation = "Return JSON Object with method params";
                itemParams.insertText = method.name + '.params';
                itemParams.command = {
                    title: 'Apex Controller Params',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'params', method]
                };
                items.push(itemParams);
            }
        }
    }
    return items;
}

function getHelperFunctions(componentStructure, position) {
    let items = [];
    for (const func of componentStructure.helperFunctions) {
        let item = new CompletionItem('helper.' + func.name, CompletionItemKind.Function);
        if (func.comment) {
            item.detail = func.comment.description + '\n';
            for (const commentParam of func.comment.params) {
                item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
            }
        }
        else {
            item.detail = "Aura Helper Function";
        }
        item.preselect = true;
        item.documentation = func.auraSignature;
        item.insertText = func.signature;
        item.command = {
            title: 'Aura Helper Function',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'function', func]
        };
        items.push(item);
    }
    return items;
}

function getSimilarSnippetsNS(snippets, activationToken) {
    let similarSnippets = [];
    if (!activationToken || activationToken.length === 0)
        return similarSnippets;
    Object.keys(snippets).forEach(function (key) {
        if (key.startsWith(activationToken))
            similarSnippets.push(snippets[key]);
    });
    return similarSnippets;
}

function getSimilarCompletionItems(position, similars) {
    let items = [];
    for (const similar of similars) {
        for (const snippet of similar) {
            let item = new CompletionItem(snippet.prefix, CompletionItemKind.Snippet);
            item.detail = snippet.name + '\n' + snippet.description;
            item.documentation = new MarkdownString(snippet.body.join('\n'));
            item.insertText = new SnippetString(snippet.body.join('\n'));
            item.preselect = true;
            item.command = {
                title: 'Aura Code Completion',
                command: 'aurahelper.completion.aura',
                arguments: [position, 'snippet', snippet]
            };
            items.push(item);
        }
    }
    return items;
}

function getSnippetsCompletionItems(position, snippets) {
    let items = [];
    for (const snippet of snippets) {
        let item = new CompletionItem(snippet.prefix, CompletionItemKind.Snippet);
        item.detail = snippet.name + '\n' + snippet.description;
        item.documentation = new MarkdownString(snippet.body.join('\n'));
        item.insertText = new SnippetString(snippet.body.join('\n'));
        item.preselect = true;
        item.command = {
            title: 'Aura Code Completion',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'snippet', snippet]
        };
        items.push(item);
    }
    return items;
}