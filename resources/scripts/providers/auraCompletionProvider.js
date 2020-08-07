const languages = require('../languages');
const logger = require('../utils/logger');
const applicationContext = require('../core/applicationContext');
const config = require('../core/config');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Utils = require('./utils').Utils;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const SnippetString = vscode.SnippetString;
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const MarkdownString = vscode.MarkdownString;
const BundleAnalizer = languages.BundleAnalizer;
const AuraParser = languages.AuraParser;
const Tokenizer = languages.Tokenizer;
const langUtils = languages.Utils;

exports.provider = {
    provideCompletionItems(document, position) {
        return new Promise(function (resolve) {
            let items;
            if (FileChecker.isAuraComponent(document.uri.fsPath)) {
                items = provideAuraComponentCompletion(document, position);
                items.sort();
            }
            resolve(items);
        });
    }
}

function provideAuraComponentCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    let isComponentTag = onComponentTag(document, position);
    let componentTagData;
    if (isComponentTag)
        componentTagData = analizeComponentTag(document, position);
    let activationInfo = Utils.getActivation(document, position);
    let activation = activationInfo.activation;
    let activationTokens = activation.split('.');
    let activationOption1 = line.substring(position.character - 2, position.character);
    let similarAuraSnippetsNs = getSimilarSnippetsNS(applicationContext.auraSnippets, activationTokens[0]);
    let similarSldsSnippetsNs = getSimilarSnippetsNS(applicationContext.sldsSnippets, activationTokens[0]);
    let componentStructure = BundleAnalizer.getComponentStructure(document.fileName);
    let classes = applicationContext.userClasses;
    let allNamespaces = applicationContext.allNamespaces;
    let systemMetadata = allNamespaces['system'];
    let sObjects = applicationContext.sObjects;
    let queryData = langUtils.getQueryData(document, position);
    let snippets;
    if (FileChecker.isAuraComponent(document.uri.fsPath) && applicationContext.auraSnippets[activationTokens[0]] && applicationContext.auraSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.auraSnippets[activationTokens[0]];
    } else if (FileChecker.isAuraComponent(document.uri.fsPath) && applicationContext.sldsSnippets[activationTokens[0]] && applicationContext.sldsSnippets[activationTokens[0]].length > 0) {
        snippets = applicationContext.sldsSnippets[activationTokens[0]];
    }
    if (queryData) {
        // Code for support completion on queries
        items = Utils.getQueryCompletionItems(activationTokens, activationInfo, queryData, position, 'aurahelper.completion.aura');
    } else if (snippets && snippets.length > 0) {
        // Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
        items = getSnippetsCompletionItems(position, snippets);
    } else if (similarAuraSnippetsNs.length > 0 && FileChecker.isAuraComponent(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (lt (ltn.), (ltng.) ...)
        items = getSimilarCompletionItems(position, similarAuraSnippetsNs);
    } else if (similarSldsSnippetsNs.length > 0 && FileChecker.isAuraComponent(document.uri.fsPath)) {
        // Code for completions when user types a similar words of snippets activations (sl (slds.) ...)
        items = getSimilarCompletionItems(position, similarSldsSnippetsNs);
    } else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
        items = getLabelsCompletionItems(activationTokens, position);
    } else if ((activationTokens[0] === 'v' || activationTokens[0] === 'c')) {
        if (activationTokens[0] === 'v' && activationTokens.length > 1) {
            // Code for completions when user types v.
            if (!config.getConfig().autoCompletion.activeAttributeSuggest)
                return [];
            let attribute = Utils.getAttribute(componentStructure, activationTokens[1]);
            if (attribute) {
                items = getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, sObjects, position);
            } else if (activationTokens.length === 2) {
                items = getAttributesCompletionItems(componentStructure, position, componentTagData);
            }
        } else if (activationTokens[0] === 'c' && activationTokens.length === 2) {
            // Code for completions when user types c.
            if (!config.getConfig().autoCompletion.activeControllerFunctionsSuggest)
                return [];
            items = getControllerFunctionsCompletionItems(componentStructure, position, componentTagData);
        }
    } else if (activationOption1 === 'c:') {
        if (!config.getConfig().autoCompletion.activeComponentSuggest)
            return [];
        // Code for completions when user types c:
        items = getComponentsCompletionItems(position, document, componentTagData);
    } else if (line.indexOf('<c:') !== -1) {
        if (line.toLowerCase().trim() === '<c:' && !isComponentTag) {
            // Code for completions when user types <c:
            if (!config.getConfig().autoCompletion.activeComponentSuggest)
                return [];
            items = getComponentsCompletionItems(position, document, componentTagData);
        } else if (isComponentTag) {
            // Code for completions when position is on a start custom component tag <c:componentName >
            if (!config.getConfig().autoCompletion.activeCustomComponentCallSuggest)
                return [];
            let lineSplits = line.split(':');
            if (lineSplits.length >= 2) {
                let componentName = lineSplits[1].split(' ')[0];
                if (componentName) {
                    let filePath = Paths.getFolderPath(Paths.getFolderPath(document.uri.fsPath)) + '/' + componentName + '/' + componentName + '.cmp';
                    let componentStructure = BundleAnalizer.getComponentStructure(filePath);
                    items = getComponentAttributesCompletionItems(componentStructure, componentTagData, position);
                }
            }
        }
    } else if (isComponentTag) {
        // Code for completions when position is on a start standard component tag <ns:componentName >
        if (!config.getConfig().autoCompletion.activeComponentCallSuggest)
            return [];
        if (!componentTagData.isOnAttributeValue) {
            // Code for completions when position is on attribute value (position to put attributes) <ns:componentName attr="value" [thispos] attr="value">
            items = getBaseComponentsAttributesCompletionItems(componentTagData, position);
        } else if (componentTagData.isOnAttributeValue && componentTagData.isParamEmpty) {
            // Code for completions when position is on attribute param value and value is empty <ns:componentName attr="[thispos]" attr="value">
            items = getAttributeTypesCompletionItems(activationTokens, activationInfo, document, position, componentTagData, componentStructure, getBaseComponentAttributes(componentTagData), classes, systemMetadata, allNamespaces, sObjects);
        } else if (activationTokens.length > 1) {
            items = Utils.getApexCompletionItems(position, activationTokens, activationInfo, undefined, classes, systemMetadata, allNamespaces, sObjects);
        } else {
            items = Utils.getAllAvailableCompletionItems(position, undefined, classes, systemMetadata, allNamespaces, sObjects);
        }
    } else if (activationTokens.length > 1) {
        // Code for completions when position is on empty line or withot components
        items = Utils.getApexCompletionItems(position, activationTokens, activationInfo, undefined, classes, systemMetadata, allNamespaces, sObjects);

    } else if (activationTokens.length > 0) {
        // Code for completions when position is on empty line or withot components
        items = Utils.getAllAvailableCompletionItems(position, undefined, classes, systemMetadata, allNamespaces, sObjects);

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
            let command = Utils.getCommand('CustomLabelAura', 'aurahelper.completion.aura', [position, 'CustomLabelAura', { label: label }]);
            items.push(Utils.createItemForCompletion(label.fullName, options, command));
        }
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

function getAttributeTypesCompletionItems(activationTokens, activationInfo, document, position, componentTagData, componentStructure, componentAttributes, classes, systemMetadata, allNamespaces, sObjects) {
    let items = [];
    let attributeData;
    let baseComponentsDetail = applicationContext.componentsDetail;
    for (const attribute of componentAttributes) {
        if (attribute.name === componentTagData.attributeName) {
            attributeData = attribute;
        }
    }
    if (attributeData) {
        if (componentTagData.namespace === "aura" && componentTagData.name === "attribute" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const dataType of baseComponentsDetail.datatypes) {
                let item = new CompletionItem(dataType, CompletionItemKind.Value);
                item.detail = "Attribute Datatype";
                item.insertText = dataType;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrDataType', dataType]
                };
                items.push(item);
            }
            if (activationTokens.length > 1) {
                items = items.concat(Utils.getApexCompletionItems(position, activationTokens, activationInfo, undefined, classes, systemMetadata, allNamespaces, sObjects));
            } else {
                items = items.concat(Utils.getAllAvailableCompletionItems(position, undefined, classes, systemMetadata, allNamespaces, sObjects));
            }
        } else if ((attributeData.name === 'pullToBoundary' || attributeData.name === 'size' || attributeData.name === 'iconSize') && attributeData.type.toLowerCase() === 'string') {
            for (const size of baseComponentsDetail.sizes) {
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "avatar" || componentTagData.name === "buttonIcon") && size === "x-smal" && size !== 'small' && size !== 'medium' && size !== 'large')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonIconStateful" && size !== 'xx-small' && size === "x-smal" && size !== 'small' && size !== 'medium')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonMenu" && size === "x-smal" && size !== 'small' && size !== 'medium' && size !== 'large')
                    continue;
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "layout" || componentTagData.name === "spinner") && size !== 'small' && size !== 'medium' && size !== 'large')
                    continue;
                let item = new CompletionItem(size, CompletionItemKind.Value);
                item.detail = "SLDS " + size + " Size";
                item.insertText = size;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrSize', size]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'access' && attributeData.type.toLowerCase() === 'string') {
            for (const access of baseComponentsDetail.access) {
                let item = new CompletionItem(access, CompletionItemKind.Value);
                item.detail = "Attribute / Component access";
                item.insertText = access;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrAccess', access]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'flexibility' && attributeData.type.toLowerCase() === 'object') {
            for (const flexibility of baseComponentsDetail.flexibilities) {
                let item = new CompletionItem(flexibility, CompletionItemKind.Value);
                item.detail = "Flexibility Value";
                item.insertText = flexibility;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'flexibilityValue', flexibility]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'timeZoneName' && attributeData.type.toLowerCase() === 'string') {
            for (const timeZoneName of baseComponentsDetail.timeZoneNames) {
                let item = new CompletionItem(timeZoneName, CompletionItemKind.Value);
                item.detail = "Time Zone Style";
                item.insertText = timeZoneName;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'timeZoneStyle', timeZoneName]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'padding' && attributeData.type.toLowerCase() === 'string') {
            for (const padding of baseComponentsDetail.paddings) {
                let item = new CompletionItem(padding, CompletionItemKind.Value);
                item.detail = "Padding Value";
                item.insertText = padding;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'paddingValue', padding]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'density' && attributeData.type.toLowerCase() === 'string') {
            for (const density of baseComponentsDetail.densities) {
                let item = new CompletionItem(density, CompletionItemKind.Value);
                item.detail = "Density Value";
                item.insertText = density;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'densityValue', density]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'severity' && attributeData.type.toLowerCase() === 'string') {
            for (const severity of baseComponentsDetail.severities) {
                let item = new CompletionItem(severity, CompletionItemKind.Value);
                item.detail = "Severity Value";
                item.insertText = severity;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'severityValue', severity]
                };
                items.push(item);
            }
        } else if ((attributeData.name === 'sortedDirection' || attributeData.name === 'defaultSortDirection') && attributeData.type.toLowerCase() === 'string') {
            for (const sort of baseComponentsDetail.sortValues) {
                let item = new CompletionItem(sort, CompletionItemKind.Value);
                item.detail = "Sort Value";
                item.insertText = sort;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'attrAccess', sort]
                };
                items.push(item);
            }
        } else if (attributeData.type.toLowerCase() === 'boolean') {
            for (const boolValue of baseComponentsDetail.booleans) {
                let item = new CompletionItem(boolValue, CompletionItemKind.Value);
                item.detail = "Boolean Value";
                item.insertText = boolValue;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'boolValue', boolValue]
                };
                items.push(item);
            }
        } else if (attributeData.type.toLowerCase() === 'action') {
            for (const func of componentStructure.controllerFunctions) {
                let item = new CompletionItem(func.name, CompletionItemKind.Function);
                if (func.comment) {
                    item.detail = func.comment.description + '\n';
                    for (const commentParam of func.comment.params) {
                        item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
                    }
                }
                else {
                    item.detail = "Aura Controller Function";
                }
                item.preselect = true;
                item.documentation = func.auraSignature;
                item.insertText = '{!c.' + func.name + '}';
                item.command = {
                    title: 'Aura Controller Function',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'function', func, componentTagData]
                };
                items.push(item);
            }
        } else if (attributeData.name === 'variant' && attributeData.type.toLowerCase() === 'string') {
            for (const variant of baseComponentsDetail.variants) {
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "outputField" || componentTagData.name === "slider") && variant !== 'standard' && variant !== 'label-hidden')
                    continue;
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "path" || componentTagData.name === "picklistPath") && variant !== 'linear' && variant !== 'non-linear')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "avatar" && variant !== 'circle' && variant !== 'square')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "spinner" && variant !== 'base' && variant !== 'brand' && variant !== 'inverse')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "tabset" && variant !== 'default' && variant !== 'scoped' && variant !== 'vertical')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "progressIndicator" && variant !== 'base' && variant !== 'shaded')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "progressBar" && variant !== 'base' && variant !== 'circular')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "inputRichText" && variant !== 'bottom-toolbar')
                    continue;
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "textarea" || componentTagData.name === "select" || componentTagData.name === "radioGroup" || componentTagData.name === "inputName" || componentTagData.name === "inputLocation" || componentTagData.name === "checkboxGroup" || componentTagData.name === "combobox" || componentTagData.name === "input" || componentTagData.name === "inputAddress") && variant !== 'standard' && variant !== 'label-hidden' && variant !== 'label-inline' && variant !== 'label-stacked')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "card" && variant !== 'base' && variant !== 'narrow')
                    continue;
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "button" || componentTagData.name === "buttonStateful") && variant !== 'base' && variant !== 'neutral' && variant !== 'brand' && variant !== 'destructive' && variant !== 'inverse' && variant !== 'success')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonIcon" && variant !== 'bare' && variant !== 'container' && variant !== 'brand' && variant !== 'border' && variant !== 'border-filled' && variant !== 'bare-inverse' && variant !== 'border-inverse')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonIconStateful" && variant !== 'border' && variant !== 'border-filled' && variant !== 'border-inverse')
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonMenu" && variant !== 'bare' && variant !== 'container' && variant !== 'border' && variant !== 'border-filled' && variant !== 'bare-inverse' && variant !== 'border-inverse')
                    continue;
                let item = new CompletionItem(variant, CompletionItemKind.Value);
                item.detail = "Variant Value";
                item.insertText = variant;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'variantValue', variant]
                };
                items.push(item);
            }
        } else if ((attributeData.name === 'type' || attributeData.name === 'buttonType') && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.buttonTypes) {
                if (componentTagData.namespace === "lightning" && (componentTagData.name === "button" || componentTagData.name === "buttonIcon") && type !== 'button' && type !== 'reset' && type !== 'submit')
                    continue;
                if (componentTagData.namespace === "ui" && (componentTagData.name === "button") && type !== 'button' && type !== 'reset' && type !== 'submit')
                    continue;
                let item = new CompletionItem(type, CompletionItemKind.Value);
                item.detail = "Button Type Value";
                item.insertText = type;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'buttonTypeValue', type]
                };
                items.push(item);
            }
        } else if ((attributeData.name === 'alignmentBump' || attributeData.name === 'verticalAlign' || attributeData.name === 'horizontalAlign' || attributeData.name === 'menuAlignment' || attributeData.name === 'iconPosition' || attributeData.name === 'dropdownAlignment') && attributeData.type.toLowerCase() === 'string') {
            for (const componentPosition of baseComponentsDetail.positions) {
                if (componentTagData.namespace === "lightning" && componentTagData.name === "button" && componentPosition !== "left" && componentPosition !== "right")
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "layoutItem" && componentPosition !== "left" && componentPosition !== "right" && componentPosition !== "top" && componentPosition !== "bottom")
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "layoutcomponent" && attributeData.name === 'horizontalAlign' && componentPosition !== "center" && componentPosition !== "space" && componentPosition !== "spread" && componentPosition !== "end")
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "layoutcomponent" && attributeData.name === 'verticalAlign' && componentPosition !== "start" && componentPosition !== "center" && componentPosition !== "end" && componentPosition !== "stretch")
                    continue;
                if (componentTagData.namespace === "lightning" && componentTagData.name === "buttonMenu" && componentPosition !== "left" && componentPosition !== "right" && componentPosition !== "auto" && componentPosition !== "center" && componentPosition !== "bottom-left" && componentPosition !== "bottom-center" && position !== "bottom-right")
                    continue;
                let item = new CompletionItem(componentPosition, CompletionItemKind.Value);
                if (attributeData.name === 'alignmentBump' || attributeData.name === 'verticalAlign' || attributeData.name === 'horizontalAlign' || attributeData.name === 'menuAlignment' || attributeData.name === 'dropdownAlignment')
                    item.detail = "Allignment Value";
                else
                    item.detail = "Icon Position Value";
                item.insertText = componentPosition;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'positionValue', componentPosition]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "dynamicIcon" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.dynamicIcons) {
                let item = new CompletionItem(type, CompletionItemKind.Value);
                item.detail = "Dynamic Icon Type";
                item.insertText = type;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'dynamicIconType', type]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "formattedName" && attributeData.name === 'format' && attributeData.type.toLowerCase() === 'string') {
            for (const format of baseComponentsDetail.nameFormats) {
                let item = new CompletionItem(format, CompletionItemKind.Value);
                item.detail = "Name Format";
                item.insertText = format;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'nameFormat', format]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "formattedNumber" && attributeData.name === 'style' && attributeData.type.toLowerCase() === 'string') {
            for (const style of baseComponentsDetail.numberStyles) {
                let item = new CompletionItem(style, CompletionItemKind.Value);
                item.detail = "Number Style";
                item.insertText = style;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'numberStyle', style]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "formattedNumber" && attributeData.name === 'currencyDisplayAs' && attributeData.type.toLowerCase() === 'string') {
            for (const display of baseComponentsDetail.currencyDisplays) {
                let item = new CompletionItem(display, CompletionItemKind.Value);
                item.detail = "Currency Display";
                item.insertText = display;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'currencyDisplay', display]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "formattedUrl" && attributeData.name === 'target' && attributeData.type.toLowerCase() === 'string') {
            for (const target of baseComponentsDetail.urlTargets) {
                let item = new CompletionItem(target, CompletionItemKind.Value);
                item.detail = "Target Value";
                item.insertText = target;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'urlTarget', target]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "progressIndicator" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.progressTypes) {
                let item = new CompletionItem(type, CompletionItemKind.Value);
                item.detail = "Progress Type Value";
                item.insertText = type;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'progressTypeValue', type]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "radioGroup" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const type of baseComponentsDetail.inputTypes) {
                let item = new CompletionItem(type, CompletionItemKind.Value);
                item.detail = "Input Type Value";
                item.insertText = type;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'inputTypeValues', type]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "lightning" && componentTagData.name === "slider" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const componentPosition of baseComponentsDetail.positions) {
                let item = new CompletionItem(componentPosition, CompletionItemKind.Value);
                item.detail = "Input Type Value";
                item.insertText = componentPosition;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'positionValue', componentPosition]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "force" && componentTagData.name === "recordData" && attributeData.name === 'mode' && attributeData.type.toLowerCase() === 'string') {
            for (const mode of baseComponentsDetail.recordModes) {
                let item = new CompletionItem(mode, CompletionItemKind.Value);
                item.detail = "Record Mode";
                item.insertText = mode;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'positionValue', mode]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "forceChatter" && componentTagData.name === "feed" && attributeData.name === 'feedDesign' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.feedDesigns) {
                let item = new CompletionItem(feed, CompletionItemKind.Value);
                item.detail = "Feed Design";
                item.insertText = feed;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'feedDesignValue', feed]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "forceChatter" && componentTagData.name === "feed" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.feedTypes) {
                let item = new CompletionItem(feed, CompletionItemKind.Value);
                item.detail = "Feed Type";
                item.insertText = feed;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'feedTypeValue', feed]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "forceChatter" && componentTagData.name === "fullFeed" && attributeData.name === 'type' && attributeData.type.toLowerCase() === 'string') {
            for (const feed of baseComponentsDetail.fullFeedTypes) {
                let item = new CompletionItem(feed, CompletionItemKind.Value);
                item.detail = "Full Feed Type";
                item.insertText = feed;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'fullFeedTypeValue', feed]
                };
                items.push(item);
            }
        } else if (componentTagData.namespace === "forceChatter" && componentTagData.name === "publisher" && attributeData.name === 'context' && attributeData.type.toLowerCase() === 'string') {
            for (const ctx of baseComponentsDetail.publisherContexts) {
                let item = new CompletionItem(ctx, CompletionItemKind.Value);
                item.detail = "Publisher Context";
                item.insertText = ctx;
                item.preselect = true;
                item.command = {
                    title: 'Aura Code Completion',
                    command: 'aurahelper.completion.aura',
                    arguments: [position, 'fullFeedTypeValue', ctx]
                };
                items.push(item);
            }
        } else if (activationTokens.length > 1) {
            items = items.concat(Utils.getApexCompletionItems(position, activationTokens, activationInfo, undefined, classes, systemMetadata, allNamespaces, sObjects));
        } else {
            items = items.concat(Utils.getAllAvailableCompletionItems(position, undefined, classes, systemMetadata, allNamespaces, sObjects));
        }
    }
    return items;
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

function onComponentTag(document, position) {
    let endLoop = false;
    let line = position.line;
    while (!endLoop) {
        if (line <= 0)
            endLoop = true;
        let lineText = document.lineAt(line).text;
        let lineTokens = Tokenizer.tokenize(lineText);
        if (line == position.line) {
            let index = 0;
            let fromIndex = 0;
            while (index < lineTokens.length) {
                let token = lineTokens[index];
                if (position.character > token.startColumn)
                    fromIndex = index;
                index++;
            }
            index = fromIndex;
            if (fromIndex > 0) {
                while (index >= 0) {
                    let token = lineTokens[index];
                    if (token.tokenType === 'lABracket')
                        return true;
                    if (token.tokenType === 'rABracket')
                        return false;
                    index--;
                }
            }
        }
        else {
            let index = lineTokens.length - 1;
            while (index >= 0) {
                let token = lineTokens[index];
                if (token.tokenType === 'lABracket')
                    return true;
                if (token.tokenType === 'rABracket')
                    return false;
                index--;
            }
        }
        line--;
    }
    return false;
}

function analizeComponentTag(document, position) {
    let componentTag = "";
    let line = position.line;
    let startTagLine = line;
    let endLoop = false;
    while (!endLoop) {
        let lineText = document.lineAt(line).text;
        if (lineText.indexOf('<') !== -1) {
            startTagLine = line;
            endLoop = true;
        }
        line--
        if (line < 0)
            endLoop = true;
    }
    endLoop = false;
    line = startTagLine;
    while (!endLoop) {
        let lineText = document.lineAt(line).text;
        if (lineText.indexOf('>') !== -1) {
            componentTag += lineText + '\n';
            endLoop = true;
        } else {
            componentTag += lineText + '\n';
        }
        line++;
    }
    let componentTagData = AuraParser.componentTagData(componentTag, position);
    return componentTagData;
}

function getBaseComponentAttributes(componentTagData) {
    let attributes = [];
    let baseComponentsDetail = applicationContext.componentsDetail;
    attributes.push({
        name: "aura:id",
        access: "global",
        type: "String",
        description: "Aura ID of the component",
        required: false,
        default: false,
    });
    let notRoot = baseComponentsDetail.notRoot;
    if (notRoot[componentTagData.namespace] && !notRoot[componentTagData.namespace].includes(componentTagData.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            attributes.push(attribute);
        }
    }
    if (baseComponentsDetail[componentTagData.namespace]) {
        let baseComponentNS = baseComponentsDetail[componentTagData.namespace];
        if (baseComponentNS[componentTagData.name]) {
            for (const attribute of baseComponentNS[componentTagData.name]) {
                attributes.push(attribute);
            }
        }
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'css', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'input', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'html', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'select', componentTagData)) {
        attributes.push(rootElement);
    }
    for (const rootElement of getRootAttributes(baseComponentsDetail, 'inputField', componentTagData)) {
        attributes.push(rootElement);
    }
    return attributes;
}

function getBaseComponentsAttributesCompletionItems(componentTagData, position) {
    logger.logJSON("componentTagData", componentTagData);
    let baseComponentsDetail = applicationContext.componentsDetail;
    let items = [];
    let haveAuraId = false;
    Object.keys(componentTagData.attributes).forEach(function (key) {
        if (key === 'aura:id') {
            haveAuraId = true;
        }
    });
    if (!haveAuraId)
        items.push(getCodeCompletionItemAttribute('aura:id', 'Type: String', 'Aura ID of the component', 'String', position, 'aura:id'));
    let notRoot = baseComponentsDetail.notRoot;
    if (notRoot[componentTagData.namespace] && !notRoot[componentTagData.namespace].includes(componentTagData.name)) {
        for (const attribute of baseComponentsDetail['root']['component']) {
            let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
            items.push(item);
        }
    }
    if (baseComponentsDetail[componentTagData.namespace]) {
        let baseComponentNS = baseComponentsDetail[componentTagData.namespace];
        if (baseComponentNS[componentTagData.name]) {
            for (const attribute of baseComponentNS[componentTagData.name]) {
                let exists = false;
                let existingAttributes = componentTagData.attributes;
                Object.keys(existingAttributes).forEach(function (key) {
                    if (key === attribute.name) {
                        exists = true;
                    }
                });
                if (!exists) {
                    let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
                    items.push(item);
                }
            }
        }
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'css', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'input', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'html', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'select', componentTagData, position)) {
        items.push(rootElement);
    }
    for (const rootElement of getRootItems(baseComponentsDetail, 'inputField', componentTagData, position)) {
        items.push(rootElement);
    }
    return items;
}

function getCodeCompletionItemAttribute(name, detail, description, datatype, position, data) {
    let item = new CompletionItem(name, CompletionItemKind.Variable);
    item.detail = detail;
    item.documentation = description;
    if (datatype === 'action') {
        item.insertText = new SnippetString(name + '="${1:jsAction}" ');
    }
    else {
        item.insertText = new SnippetString(name + '="$1" $0');
    }
    item.preselect = true;
    item.command = {
        title: 'Aura Code Completion',
        command: 'aurahelper.completion.aura',
        arguments: [position, 'itemAttribute', data]
    };
    return item;
}

function getRootAttributes(baseComponentsDetail, rootElement, componentTagData) {
    let attributes = [];
    if (baseComponentsDetail.components[componentTagData.namespace] && baseComponentsDetail.components[componentTagData.namespace][rootElement]) {
        let rootAttributes = baseComponentsDetail.components[componentTagData.namespace][rootElement];
        if (rootAttributes.includes(componentTagData.name)) {
            for (const attribute of baseComponentsDetail['root'][rootElement]) {
                attributes.push(attribute);
            }
        }
    }
    return attributes;
}

function getRootItems(baseComponentsDetail, rootElement, componentTagData, position) {
    let items = [];
    if (baseComponentsDetail.components[componentTagData.namespace] && baseComponentsDetail.components[componentTagData.namespace][rootElement]) {
        let rootAttributes = baseComponentsDetail.components[componentTagData.namespace][rootElement];
        if (rootAttributes.includes(componentTagData.name)) {
            for (const attribute of baseComponentsDetail['root'][rootElement]) {
                let exists = false;
                let existingAttributes = componentTagData.attributes;
                Object.keys(existingAttributes).forEach(function (key) {
                    if (key === attribute.name) {
                        exists = true;
                    }
                });
                if (!exists) {
                    let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
                    items.push(item);
                }
            }
        }
    }
    return items;
}

function getComponentAttributesCompletionItems(componentStructure, componentTagData, position) {
    let items = [];
    for (const attribute of componentStructure.attributes) {
        let exists = false;
        Object.keys(componentTagData.attributes).forEach(function (key) {
            if (key === attribute.name) {
                exists = true;
            }
        });
        if (!exists) {
            let item = getCodeCompletionItemAttribute(attribute.name, 'Type: ' + attribute.type, attribute.description, attribute.type.toLowerCase(), position, attribute);
            items.push(item);
        }
    }
    return items;
}

function getAttributesCompletionItems(componentStructure, position, componentTagData) {
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

function getControllerFunctionsCompletionItems(componentStructure, position, componentTagData) {
    let items = [];
    for (const func of componentStructure.controllerFunctions) {
        let item = new CompletionItem('c.' + func.name, CompletionItemKind.Function);
        if (func.comment) {
            item.detail = func.comment.description + '\n';
            for (const commentParam of func.comment.params) {
                item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
            }
        }
        else {
            item.detail = "Aura Controller Function";
        }
        item.preselect = true;
        item.documentation = func.auraSignature;
        item.insertText = func.name;
        item.command = {
            title: 'Aura Controller Function',
            command: 'aurahelper.completion.aura',
            arguments: [position, 'function', func, componentTagData]
        };
        items.push(item);
    }
    return items;
}

function getComponentsCompletionItems(position, document, componentTagData) {
    let items = [];
    let auraFolder = Paths.getFolderPath(Paths.getFolderPath(document.uri.fsPath));
    let folders = FileReader.readDirSync(auraFolder);
    for (const folder of folders) {
        let files = FileReader.readDirSync(auraFolder + '/' + folder);
        let isAppEvent;
        let isCompEvent;
        let isComponent;
        let isApp;
        for (const file of files) {
            if (file.indexOf('.cmp') !== -1) {
                isComponent = true;
                break;
            } else if (file.indexOf('.evt') !== -1) {
                isCompEvent = FileReader.readFileSync(auraFolder + '/' + folder + '/' + file).toLowerCase().indexOf('type="component"')
                isAppEvent = FileReader.readFileSync(auraFolder + '/' + folder + '/' + file).toLowerCase().indexOf('type="application"');
                break;
            } else if (file.indexOf('.app') !== -1) {
                isApp = true;
                break;
            }
        }
        let item = new CompletionItem('c:' + folder, CompletionItemKind.Module);
        let title = '';
        if (isComponent) {
            item.documentation = 'Aura Component ' + folder;
            title = 'Aura Component';
        } else if (isCompEvent) {
            item.documentation = 'Aura Component Event ' + folder;
            title = 'Aura Component Event';
        } else if (isAppEvent) {
            item.documentation = 'Aura Application Event ' + folder;
            title = 'Aura Application Event';
        } else if (isApp) {
            item.documentation = 'Aura Application ' + folder;
            title = 'Aura Application';
        }
        item.preselect = true;
        item.detail = title;
        item.insertText = folder;
        let data = {
            name: folder
        };
        item.command = {
            title: title,
            command: 'aurahelper.completion.aura',
            arguments: [position, title, data, componentTagData]
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