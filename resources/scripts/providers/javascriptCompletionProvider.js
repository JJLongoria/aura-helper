const logger = require('../utils/logger');
const SnippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const Config = require('../core/config');
const ProviderUtils = require('./utils');
const applicationContext = require('../core/applicationContext');
const { FileChecker } = require('@aurahelper/core').FileSystem;
const { AuraBundleAnalyzer } = require('@aurahelper/languages').Aura;
const LanguageUtils = require('@aurahelper/languages').LanguageUtils;
const { Utils, StrUtils } = require('@aurahelper/core').CoreUtils;
const CompletionItemKind = vscode.CompletionItemKind;
const Range = vscode.Range;
const Position = vscode.Position;
const SnippetString = vscode.SnippetString;

exports.provider = {
	provideCompletionItems(document, position) {
		return new Promise(function (resolve) {
			let items;
			try {
				if (FileChecker.isJavaScript(document.uri.fsPath)) {
					items = provideJSCompletion(document, position);
					items.sort();
				}
			} catch (error) {
				logger.error(error);
			}
			resolve(items);
		});
	}
}

function provideJSCompletion(document, position) {
	let items = [];
	const activationInfo = ProviderUtils.getActivation(document, position);
	const activation = activationInfo.activation;
	const activationTokens = activation.split('.');
	const jsSnippets = getSnippets(applicationContext.snippets.javascript, activationTokens[0]);
	const component = new AuraBundleAnalyzer(document.fileName.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'), applicationContext.parserData).analize(ProviderUtils.fixPositionOffset(document, position));
	if (component.positionData && component.positionData.query) {
		// Code for support completion on queries
		items = ProviderUtils.getQueryCompletionItems(position, activationInfo, activationTokens, component.positionData);
	} else if (jsSnippets) {
		// Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
		items = getSnippetsCompletionItems(position, activationInfo, jsSnippets);
	} else if (activationTokens.length > 0 && activationTokens[0].toLowerCase() === 'label') {
		items = getLabelsCompletionItems(position, activationInfo, activationTokens);
	} else if (activationTokens[0] === 'v') {
		// Code for completions when user types v.
		if (!Config.getConfig().autoCompletion.activeAttributeSuggest)
			return [];
		let attribute = ProviderUtils.getAttribute(component, activationTokens[1]);
		if (attribute) {
			items = getComponentAttributeMembersCompletionItems(position, activationInfo, activationTokens, attribute, component.positionData);
		} else if (activationTokens.length === 2) {
			items = getAttributesCompletionItems(position, activationInfo, component);
		}
	} else if (activationTokens[0] === 'c') {
		// Code for completions when user types c.
		if (!Config.getConfig().autoCompletion.activeControllerMethodsSuggest)
			return [];
		items = getApexControllerFunctions(position, activationInfo, component);
	} else if (activationTokens[0] === 'helper') {
		// Code for completions when user types helper.
		if (!Config.getConfig().autoCompletion.activeHelperFunctionsSuggest)
			return [];
		items = getHelperFunctions(position, activationInfo, component);
	} else if (activationTokens.length > 1) {
		// Code for completions when position is on empty line or withot components
		items = ProviderUtils.getApexCompletionItems(position, activationTokens, activationInfo);

	} else if (activationTokens.length > 0) {
		// Code for completions when position is on empty line or withot components
		items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo);
	}
	return items;
}

function getSnippetsCompletionItems(position, activationInfo, snippets) {
	const items = [];
	for (const snippet of snippets) {
		const options = ProviderUtils.getCompletionItemOptions(snippet.name + '\n' + snippet.description, snippet.body.join('\n'), new SnippetString(snippet.body.join('\n')), true, CompletionItemKind.Snippet);
		const item = ProviderUtils.createItemForCompletion(snippet.prefix, options);
		if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		items.push(item);
	}
	return items;
}

function getLabelsCompletionItems(position, activationInfo, activationTokens) {
	const items = [];
	const orgNamespace = Config.getNamespace() || 'c';
	if (activationTokens.length == 1 || activationTokens.length == 2) {
		let labels = ProviderUtils.getCustomLabels();
		for (const label of labels) {
			let doc = '  - **Name**: ' + label.fullName + '\n';
			doc += '  - **Value**: ' + label.value + '\n';
			doc += '  - **Category**: ' + label.categories + '\n';
			doc += '  - **Language**: ' + label.language + '\n';
			doc += '  - **Protected**: ' + label.protected;
			const options = ProviderUtils.getCompletionItemOptions(label.shortDescription, doc, '$A.get(\'$Label.' + orgNamespace + '.' + label.fullName + '\')', true, CompletionItemKind.Field);
			const item = ProviderUtils.createItemForCompletion('label.' + label.fullName, options);
			if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
				item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
			items.push(item);
		}
	}
	return items;
}

function getComponentAttributeMembersCompletionItems(attribute, activationTokens, activationInfo, position, positionData) {
	let items;
	const sObject = applicationContext.parserData.sObjectsData[attribute.type.toLowerCase()];
	if (sObject) {
		if (!Config.getConfig().autoCompletion.activeSobjectFieldsSuggestion)
			return [];
		if (activationTokens.length >= 2) {
			let lastObject = sObject;
			let index = 0;
			for (const activationToken of activationTokens) {
				let actToken = activationToken;
				if (index > 1) {
					let fielData;
                    let idField = actToken + 'Id';
                    if (actToken.endsWith('__r'))
                        actToken = actToken.substring(0, actToken.length - 3) + '__c';
                    fielData = ProviderUtils.getFieldData(sObject, idField.toLowerCase()) || ProviderUtils.getFieldData(sObject, actToken);
					if (fielData) {
						if (fielData.referenceTo.length === 1) {
							lastObject = applicationContext.parserData.sObjectsData[fielData.referenceTo[0].toLowerCase()];
						} else {
							lastObject = undefined;
						}
					}
				}
				index++;
			}
			items = ProviderUtils.getSobjectsFieldsCompletionItems(position, activationInfo, activationTokens, lastObject, positionData);
		}
	} else {
		// include Apex Classes Completion
	}
	Utils.sort(items, ['label']);
	return items;
}

function getAttributesCompletionItems(position, activationInfo, component) {
	const items = [];
	for (const attribute of component.attributes) {
		let detail;
		let doc;
		if (attribute.type && attribute.type.value.text)
			detail = 'Type: ' + attribute.type.value.text;
		if (attribute.description && attribute.description.value.text)
			doc = attribute.description.value.text;
		let insertText = '';
		if (activationInfo.lastToken && activationInfo.lastToken.text != "'" && activationInfo.nextToken && activationInfo.nextToken.text !== "'" && activationInfo.lastToken.text != '"' && activationInfo.nextToken && activationInfo.nextToken.text !== '"') {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else if (!activationInfo.lastToken && activationInfo.nextToken && activationInfo.nextToken.text !== '"' && activationInfo.nextToken.text !== "'") {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else if (!activationInfo.lastToken && !activationInfo.nextToken) {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else {
			insertText = 'v.' + attribute.name.value.text;
		}
		const options = ProviderUtils.getCompletionItemOptions(detail, doc, insertText, true, CompletionItemKind.Field);
		const item = ProviderUtils.createItemForCompletion('v.' + attribute.name.value.text, options);
		if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		items.push(item);
	}
	Utils.sort(items, ['label']);
	return items;
}

function getApexControllerFunctions(position, activationInfo, component) {
	let items = [];
	for (const methodName of Object.keys(component.apexFunctions)) {
		const method = component.apexFunctions[methodName];
		if (method.annotation && method.annotation.name == '@AuraEnabled') {
			let detail = '';
			let doc = '';
			/*if (method.comment) {
				item.detail = method.comment.description + '\n';
				for (const commentParam of method.comment.params) {
					item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
				}
			}
			else {*/
			detail = method.signature;
			//}
			doc = "Apex Controller Function";
			let insertText = '';
			if (activationInfo.lastToken && activationInfo.lastToken.text != "'" && activationInfo.nextToken && activationInfo.nextToken.text !== "'" && activationInfo.lastToken.text != '"' && activationInfo.nextToken && activationInfo.nextToken.text !== '"') {
				insertText = '\'c.' + method.name + '\'';
			} else if (!activationInfo.lastToken && activationInfo.nextToken && activationInfo.nextToken.text !== '"' && activationInfo.nextToken.text !== "'") {
				insertText = '\'c.' + method.name + '\'';
			} else if (!activationInfo.lastToken && !activationInfo.nextToken) {
				insertText = '\'c.' + method.name + '\'';
			} else {
				insertText = 'c.' + method.name;
			}

			const options = ProviderUtils.getCompletionItemOptions(detail, doc, insertText, true, CompletionItemKind.Method);
			const item = ProviderUtils.createItemForCompletion('c.' + method.name, options);
			if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
				item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
			items.push(item);
			if (method.params && Utils.hasKeys(method.params)) {
				const snippet = SnippetUtils.getJSApexParamsSnippet(activationInfo, method);
				const detail = "Get " + method.name + " parameters json object";
				let doc = "Return JSON Object with method params\n\n";
				doc += '\t' + StrUtils.replace(snippet, '\n', '\n\t');
				const options = ProviderUtils.getCompletionItemOptions(detail, doc, new SnippetString(snippet), true, CompletionItemKind.Variable);
				const itemParam = ProviderUtils.createItemForCompletion('c.' + method.name + '.params', options);
				if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
					itemParam.range = new Range(new Position(position.line, activationInfo.startColumn), position);
				items.push(itemParam);
			}

		}
	}
	return items;
}

function getHelperFunctions(position, activationInfo, component) {
	let items = [];
	for (const func of component.helperFunctions) {
		/*if (func.comment) {
			item.detail = func.comment.description + '\n';
			for (const commentParam of func.comment.params) {
				item.detail += commentParam.name + ' (' + commentParam.type + '): ' + commentParam.description + ' \n';
			}
		}
		else {
			item.detail = "Aura Helper Function";
		}*/
		let detail = func.auraSignature;
		let doc = 'Apex Controller Function';
		const options = ProviderUtils.getCompletionItemOptions(detail, doc, new SnippetString(getFunctionSnippet(func)), true, CompletionItemKind.Method);
		const item = ProviderUtils.createItemForCompletion('helper.' + func.name, options);
		if (activationInfo.startColumn && position.character >= activationInfo.startColumn)
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		items.push(item);
	}
	return items;
}

function getSnippets(snippets, activationToken) {
	if (!activationToken || activationToken.length === 0)
		return undefined;
	return snippets[activationToken];
}

function getFunctionSnippet(method) {
	let snippet = 'helper.' + method.name + "(";
	let counter = 0;
	for (let param of method.params) {
		if (counter === 0)
			snippet += "${" + (counter + 1) + ":" + param.text + "}";
		else
			snippet += ", ${" + (counter + 1) + ":" + param.text + "}";
	}
	snippet += ")$0";
	return snippet;
}

