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
    let activation = Utils.getActivation(document, position);
    let activationTokens = activation.split('.');
    let similarJSSnippetsNs = getSimilarSnippetsNS(applicationContext.jsSnippets, activationTokens[0]);
    let snippets;
    if (FileChecker.isJavaScript(document.uri.fsPath) && applicationContext.jsSnippets[activationTokens[0]] && applicationContext.jsSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.jsSnippets[activationTokens[0]];
    }
    if (snippets && snippets.length > 0) {
        // Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
        items = getSnippetsCompletionItems(position, snippets);
    } else if (similarJSSnippetsNs.length > 0 && FileChecker.isJavaScript(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (au (aura.) ...)
        items = getSimilarCompletionItems(position, similarJSSnippetsNs);
    } else if (activationTokens[0] === 'v' || activationTokens[0] === 'c' || activationTokens[0] === 'helper') {
        // Code for completions when user types v. c. or helper.
        let componentStructure = BundleAnalizer.getComponentStructure(document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'));
        if (activationTokens[0] === 'v') {
            // Code for completions when user types v.
            if (!config.getConfig().activeAttributeSuggest)
                return Promise.resolve(undefined);
            items = getAttributes(componentStructure, position, undefined);
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