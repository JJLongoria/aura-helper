const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const config = require('../main/config');
const languages = require('../languages');
const Utils = require('./utils').Utils;
const FileChecker = fileSystem.FileChecker;
const BundleAnalizer = languages.BundleAnalizer;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;

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
    if (activationTokens[0] === 'v' || activationTokens[0] === 'c' || activationTokens[0] === 'helper') {
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
    } else {
        // Code for completions in othercases
        items = Utils.provideSObjetsCompletion(document, position, 'aurahelper.completion.aura');
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
            let item = new CompletionItem('c.' + method.name, CompletionItemKind.Method);
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
        }
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