const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../core/config');
const languages = require('../languages');
const Utils = require('./utils').Utils;
const applicationContext = require('../core/applicationContext');
const FileChecker = fileSystem.FileChecker;
const BundleAnalizer = languages.BundleAnalizer;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const MarkdownString = vscode.MarkdownString;
const SnippetString = vscode.SnippetString;
const langUtils = languages.Utils;
const Paths = fileSystem.Paths;

exports.provider = {
    provideCompletionItems(document, position) {
        return new Promise(function (resolve) {
            let items;
            if (FileChecker.isJavaScript(document.uri.fsPath)) {
                items = provideJSCompletion(document, position);
                items.sort();
            }
            resolve(items);
        });
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
    let classes = applicationContext.userClasses;
    let allNamespaces = applicationContext.namespacesMetadata;
    let systemMetadata = allNamespaces['system'];
    let sObjects = applicationContext.sObjects;
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
    } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
        items = getLabelsCompletionItems(activationTokens, position);
    } else if (activationTokens[0] === 'v' || activationTokens[0] === 'c' || activationTokens[0] === 'helper') {
        // Code for completions when user types v. c. or helper.
        if (activationTokens[0] === 'v') {
            // Code for completions when user types v.
            if (!config.getConfig().autoCompletion.activeAttributeSuggest)
                return [];
            let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
            if (attribute) {
                items = getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, sObjects, position);
            } else if (activationTokens.length === 2) {
                items = getAttributes(componentStructure, position);
            }
        } else if (activationTokens[0] === 'c') {
            // Code for completions when user types c.
            if (!config.getConfig().autoCompletion.activeControllerMethodsSuggest)
                return [];
            items = getApexControllerFunctions(componentStructure, position);
        } else if (activationTokens[0] === 'helper') {
            // Code for completions when user types helper.
            if (!config.getConfig().autoCompletion.activeHelperFunctionsSuggest)
                return [];
            items = getHelperFunctions(componentStructure, position);
        }
    } else if (activationTokens.length > 1) {
        // Code for completions when position is on empty line or withot components
        items = Utils.getApexCompletionItems(position, activationTokens, activationInfo, undefined, classes, systemMetadata, allNamespaces, sObjects);

    } else if (activationTokens.length > 0) {
        // Code for completions when position is on empty line or withot components
        items = Utils.getAllAvailableCompletionItems(position, undefined,classes, systemMetadata, allNamespaces, sObjects);

    }
    return items;
}

function getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, sObjects, position) {
    let items;
    if (sObjects[attribute.type.toLowerCase()]) {
        if (!config.getConfig().autoCompletion.activeSobjectFieldsSuggestion)
            return [];
        let sObject = sObjects[attribute.type.toLowerCase()];
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
                            lastObject = sObjects[fielData.referenceTo[0]];
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

function getLabelsCompletionItems(activationTokens, position) {
    let items = [];
    if (activationTokens.length == 1 || activationTokens.length == 2) {
        let labels = Utils.getCustomLabels();
        for (const label of labels) {
            let doc = 'Name: ' + label.fullName + '\n';
            doc += 'Value: ' + label.value + '\n';
            doc += 'Category: ' + label.categories + '\n';
            doc += 'Language: ' + label.language + '\n';
            doc += 'Protected: ' + label.protected;
            let options = Utils.getCompletionItemOptions(label.shortDescription, doc, label.fullName, true, CompletionItemKind.Field);
            let command = Utils.getCommand('CustomLabelJS', 'aurahelper.completion.aura', [position, 'CustomLabelJS', { label: label }]);
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
        item.insertText = func.snippet;
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