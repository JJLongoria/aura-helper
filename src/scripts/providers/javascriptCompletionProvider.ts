import * as vscode from 'vscode';
import { Logger } from "../utils/logger";
import { SnippetUtils } from "../utils/snippetUtils";
import { Config } from '../core/config';
import { ActivationToken, ProviderActivationInfo, ProviderUtils } from './utils';
import applicationContext from '../core/applicationContext';
import { MarkDownStringBuilder } from '../output';
import { TemplateUtils } from '../utils/templateUtils';
const { FileChecker, PathUtils, FileReader } = require('@aurahelper/core').FileSystem;
const { AuraBundleAnalyzer } = require('@aurahelper/languages').Aura;
const { JSParser } = require('@aurahelper/languages').JavaScript;
const LanguageUtils = require('@aurahelper/languages').LanguageUtils;
const { Utils, StrUtils } = require('@aurahelper/core').CoreUtils;
const CompletionItemKind = vscode.CompletionItemKind;
const Range = vscode.Range;
const Position = vscode.Position;
const SnippetString = vscode.SnippetString;

export class JSAuraCompletionProvider implements vscode.CompletionItemProvider<vscode.CompletionItem> {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		return new Promise<vscode.CompletionItem[] | undefined>(function (resolve) {
			let items;
			try {
				if (FileChecker.isJavaScript(document.uri.fsPath)) {
					items = provideJSCompletion(document, position);
					if (items) {
						items.sort();
					}
				}
			} catch (error) {
				Logger.error(error);
			}
			resolve(items);
		});
	}
}

function provideJSCompletion(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
	let items: vscode.CompletionItem[] | undefined = [];
	const activationInfo = ProviderUtils.getActivation(document, position);
	const activationTokens = activationInfo.activationTokens;
	const jsSnippets = (activationTokens.length > 0) ? getSnippets(applicationContext.snippets.javascript, activationTokens[0].activation) : undefined;
	const component = new AuraBundleAnalyzer(document.uri.fsPath.replace('Controller.js', '.cmp').replace('Helper.js', '.cmp'), applicationContext.parserData).setActiveFile(document.uri.fsPath).setTabSize(Config.getTabSize()).analize(ProviderUtils.fixPositionOffset(document, position));
	const jsFile = new JSParser(document.uri.fsPath).setContent(FileReader.readDocument(document)).setTabSize(Config.getTabSize()).setCursorPosition(position).parse();
	if (jsFile.positionData && jsFile.positionData.query) {
		// Code for support completion on queries
		items = ProviderUtils.getQueryCompletionItems(position, activationInfo, activationTokens, jsFile.positionData);
	} else if (jsSnippets) {
		// Code for completions when user types any snippets activation preffix (ltn., slds., ltng. ...)
		items = getSnippetsCompletionItems(position, activationInfo, jsSnippets);
	} else if (activationTokens.length > 0 && activationTokens[0].activation.toLowerCase() === 'label') {
		items = getLabelsCompletionItems(position, activationInfo, activationTokens);
	} else if (activationTokens.length > 0 && activationTokens[0].activation === 'v') {
		// Code for completions when user types v.
		if (!Config.getConfig().autoCompletion.activeAttributeSuggest) {
			return [];
		}
		let attribute;
		if (activationTokens.length > 1) {
			ProviderUtils.getAttribute(component, activationTokens[1].activation);
		}
		if (attribute) {
			items = getComponentAttributeMembersCompletionItems(position, activationInfo, activationTokens, attribute, jsFile.positionData);
		} else {
			items = getAttributesCompletionItems(position, activationInfo, component);
		}
	} else if (activationTokens.length > 0 && activationTokens[0].activation === 'c') {
		// Code for completions when user types c.
		if (!Config.getConfig().autoCompletion.activeControllerMethodsSuggest) {
			return [];
		}
		items = getApexControllerFunctions(position, activationInfo, component);
	} else if (activationTokens.length > 0 && activationTokens[0].activation === 'helper') {
		// Code for completions when user types helper.
		if (!Config.getConfig().autoCompletion.activeHelperFunctionsSuggest) {
			return [];
		}
		items = getHelperFunctions(position, activationInfo, component);
	} else if (activationTokens.length > 0) {
		// Code for completions when position is on empty line or withot components
		items = ProviderUtils.getApexCompletionItems(position, activationInfo, undefined, jsFile.positionData);
		if (activationInfo.activationTokens.length === 1 && !activationInfo.activationTokens[0].isQuery && activationInfo.activationTokens[0].nextToken && activationInfo.activationTokens[0].nextToken.text !== '.') {
			items = items.concat(ProviderUtils.getAllAvailableCompletionItems(position, activationInfo));
		}
	} else {
		// Code for completions when position is on empty line or withot components
		items = ProviderUtils.getAllAvailableCompletionItems(position, activationInfo);
	}
	return items;
}

function getSnippetsCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, snippets: any): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];
	for (const snippet of snippets) {
		const documentation = new MarkDownStringBuilder().appendMarkdown(snippet.description + '\n\n');
		documentation.appendMarkdownSeparator();
		documentation.appendMarkdownH4('Snippet');
		documentation.appendJSCodeBlock(snippet.body.join('\n'));
		const options = ProviderUtils.getCompletionItemOptions(snippet.name, documentation.build(), new SnippetString(snippet.body.join('\n')), true, CompletionItemKind.Snippet);
		const item = ProviderUtils.createItemForCompletion(snippet.prefix, options);
		if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		}
		items.push(item);
	}
	return items;
}

function getLabelsCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[]): vscode.CompletionItem[] {
	const items = [];
	const orgNamespace = Config.getNamespace() || 'c';
	if (activationTokens.length === 1 || activationTokens.length === 2) {
		let labels = ProviderUtils.getCustomLabels();
		for (const label of labels) {
			const documentation = new MarkDownStringBuilder();
			documentation.appendMarkdown(label.shortDescription + '\n\n');
			documentation.appendMarkdown('\n\n  - **Name**: `' + label.fullName + '`\n');
			documentation.appendMarkdown('  - **Value**: `' + label.value + '`\n');
			if (label.categories) {
				documentation.appendMarkdown('  - **Category**: `' + label.categories + '`\n');
			}
			documentation.appendMarkdown('  - **Language**: `' + label.language + '`\n');
			documentation.appendMarkdown('  - **Protected**: `' + label.protected + '`\n\n');
			documentation.appendMarkdownSeparator();
			documentation.appendMarkdownH4('Snippet');
			documentation.appendJSCodeBlock('$A.get(\'$Label.' + orgNamespace + '.' + label.fullName + '\')');
			const options = ProviderUtils.getCompletionItemOptions(label.fullName, documentation.build(), '$A.get(\'$Label.' + orgNamespace + '.' + label.fullName + '\')', true, CompletionItemKind.Field);
			const item = ProviderUtils.createItemForCompletion('Label.' + label.fullName, options);
			if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
				item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
			}
			items.push(item);
		}
	}
	return items;
}

function getComponentAttributeMembersCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, activationTokens: ActivationToken[], attribute: any, positionData: any): vscode.CompletionItem[] | undefined {
	let items;
	const sObject = applicationContext.parserData.sObjectsData[attribute.type.toLowerCase()];
	if (sObject) {
		if (!Config.getConfig().autoCompletion.activeSobjectFieldsSuggestion) {
			return [];
		}
		if (activationTokens.length >= 2) {
			let lastObject = sObject;
			let index = 0;
			for (const activationToken of activationTokens) {
				let actToken = activationToken.activation;
				if (index > 1) {
					let fielData;
					let idField = actToken + 'Id';
					if (actToken.endsWith('__r')) {
						actToken = actToken.substring(0, actToken.length - 3) + '__c';
					}
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
			items = ProviderUtils.getSobjectCompletionItems(position, activationInfo, activationTokens, lastObject, positionData);
			Utils.sort(items, ['label']);
		}
	} else {
		// include Apex Classes Completion
	}
	return items;
}

function getAttributesCompletionItems(position: vscode.Position, activationInfo: ProviderActivationInfo, component: any): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];
	for (const attribute of component.attributes) {
		let detail;
		let doc = '';
		if (attribute.description && attribute.description.value.text) {
			doc += attribute.description.value.text + '\n\n';
		}
		if (attribute.type && attribute.type.value.text) {
			doc += 'Type: `' + attribute.type.value.text + '`\n\n';
			detail = 'Type: ' + attribute.type.value.text + '';
		}
		let insertText = '';
		if (activationInfo.lastToken && activationInfo.lastToken.text !== "'" && activationInfo.nextToken && activationInfo.nextToken.text !== "'" && activationInfo.lastToken.text !== '"' && activationInfo.nextToken && activationInfo.nextToken.text !== '"') {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else if (!activationInfo.lastToken && activationInfo.nextToken && activationInfo.nextToken.text !== '"' && activationInfo.nextToken.text !== "'") {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else if (!activationInfo.lastToken && !activationInfo.nextToken) {
			insertText = '\'v.' + attribute.name.value.text + '\'';
		} else {
			insertText = 'v.' + attribute.name.value.text;
		}
		let htmlCodeBlock = '<aura:attribute ';
		if (attribute.name) {
			htmlCodeBlock += attribute.name.name.text + '="' + attribute.name.value.text + '" ';
		}
		if (attribute.type) {
			htmlCodeBlock += attribute.type.name.text + '="' + attribute.type.value.text + '" ';
		}
		if (attribute.default) {
			htmlCodeBlock += attribute.default.name.text + '="' + attribute.default.value.text + '" ';
		}
		if (attribute.access) {
			htmlCodeBlock += attribute.access.name.text + '="' + attribute.access.value.text + '" ';
		}
		if (attribute.description) {
			htmlCodeBlock += attribute.description.name.text + '="' + attribute.description.value.text + '" ';
		}
		htmlCodeBlock += '/>';
		const documentation = new MarkDownStringBuilder().appendMarkdown(doc).appendHTMLCodeBlock(htmlCodeBlock);
		documentation.appendMarkdownSeparator();
		documentation.appendMarkdownH4('Snippet');
		documentation.appendJSCodeBlock(insertText);
		const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), insertText, true, CompletionItemKind.Field);
		const item = ProviderUtils.createItemForCompletion('v.' + attribute.name.value.text, options);
		if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		}
		items.push(item);
	}
	Utils.sort(items, ['label']);
	return items;
}

function getApexControllerFunctions(position: vscode.Position, activationInfo: ProviderActivationInfo, component: any): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];
	for (const methodName of Object.keys(component.apexFunctions)) {
		const method = component.apexFunctions[methodName];
		if (method.annotation && method.annotation.name === '@AuraEnabled') {
			const documentation = new MarkDownStringBuilder();
			let signature = '';
			let description = '';
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
			signature += StrUtils.replace(method.datatype.name, ',', ', ') + ' ' + method.name + "(";
			if (method.comment) {
				if (method.comment.description && method.comment.description.length > 0) {
					description += method.comment.description + '\n\n';
				}
			}
			const tagsData = TemplateUtils.getTagsDataBySource(['params', 'return'], method.comment);
			const paramsTagData = tagsData['params'];
			if (Utils.hasKeys(method.params)) {
				description += '#### Params\n\n';
				let indexParam = 0;
				for (const param of method.getOrderedParams()) {
					const datatype = StrUtils.replace(param.datatype.name, ',', ', ');
					if (indexParam === 0) {
						signature += datatype + ' ' + param.name;
					} else {
						signature += ', ' + datatype + ' ' + param.name;
					}
					description += '  - *' + param.name + '* `' + datatype + '`';
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
					description += '\n';
				}
				description += '\n';
			}
			if (method.datatype && method.datatype.name !== 'void') {
				description += '**Return** `' + method.datatype.name + '`';
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
			let insertText = '';
			if (activationInfo.lastToken && activationInfo.lastToken.text !== "'" && activationInfo.nextToken && activationInfo.nextToken.text !== "'" && activationInfo.lastToken.text !== '"' && activationInfo.nextToken && activationInfo.nextToken.text !== '"') {
				insertText = '\'c.' + method.name + '\'';
			} else if (!activationInfo.lastToken && activationInfo.nextToken && activationInfo.nextToken.text !== '"' && activationInfo.nextToken.text !== "'") {
				insertText = '\'c.' + method.name + '\'';
			} else if (!activationInfo.lastToken && !activationInfo.nextToken) {
				insertText = '\'c.' + method.name + '\'';
			} else {
				insertText = 'c.' + method.name;
			}
			signature += ')';
			documentation.appendApexCodeBlock(signature);
			documentation.appendMarkdown(description);
			documentation.appendMarkdownSeparator();
			documentation.appendMarkdownH4('Snippet');
			documentation.appendJSCodeBlock(insertText);
			const options = ProviderUtils.getCompletionItemOptions(method.datatype.name, documentation.build(), insertText, true, CompletionItemKind.Method);
			const item = ProviderUtils.createItemForCompletion('c.' + method.name, options);
			if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
				item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
			}
			items.push(item);
			if (method.params && Utils.hasKeys(method.params)) {
				const snippet = SnippetUtils.getJSApexParamsSnippet(activationInfo, method);
				const detail = method.name + " Parameters JSON";
				const paramDoc = new MarkDownStringBuilder();
				paramDoc.appendMarkdown("Return JSON Object with method params and comments with value datatypes\n\n");
				paramDoc.appendMarkdownSeparator();
				paramDoc.appendMarkdownH4('Snippet');
				paramDoc.appendJSCodeBlock(snippet);
				const options = ProviderUtils.getCompletionItemOptions(detail, paramDoc.build(), new SnippetString(snippet), true, CompletionItemKind.Variable);
				const itemParam = ProviderUtils.createItemForCompletion('c.' + method.name + '.params', options);
				if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
					itemParam.range = new Range(new Position(position.line, activationInfo.startColumn), position);
				}
				items.push(itemParam);
			}

		}
	}
	return items;
}

function getHelperFunctions(position: vscode.Position, activationInfo: ProviderActivationInfo, component: any): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];
	for (const func of component.helperFunctions) {
		let detail = "Aura Helper Function";
		const documentation = new MarkDownStringBuilder();
		documentation.appendJSCodeBlock(func.auraSignature);
		if (func.comment) {
			documentation.appendMarkdown(func.comment.description + '\n\n');
			for (let i = 0; i < func.params.length; i++) {
				const param = func.params[i];
				const commentData = func.comment.params[param.text];
				if (commentData) {
					documentation.appendMarkdown('  - *@param* ');
					documentation.appendMarkdown('`' + param.text + '` &mdash; ' + commentData.description + '  ');
					if (i < func.params.length - 1) {
						documentation.appendMarkdown('\n');
					}
				}
			}
		} else {
			documentation.appendMarkdown(detail + '\n');
		}
		documentation.appendMarkdown('\n');
		const snippet = getFunctionSnippet(func);
		documentation.appendMarkdownSeparator();
		documentation.appendMarkdownH4('Snippet');
		documentation.appendJSCodeBlock(snippet);
		const options = ProviderUtils.getCompletionItemOptions(detail, documentation.build(), new SnippetString(snippet), true, CompletionItemKind.Method);
		const item = ProviderUtils.createItemForCompletion('helper.' + func.name, options);
		if (activationInfo.startColumn !== undefined && position.character >= activationInfo.startColumn) {
			item.range = new Range(new Position(position.line, activationInfo.startColumn), position);
		}
		items.push(item);
	}
	return items;
}

function getSnippets(snippets: any, activationToken: string): any {
	if (!activationToken || activationToken.length === 0) {
		return undefined;
	}
	return snippets[activationToken];
}

function getFunctionSnippet(method: any): string {
	let snippet = 'helper.' + method.name + "(";
	let counter = 0;
	for (let param of method.params) {
		if (counter === 0) {
			snippet += "${" + (counter + 1) + ":" + param.text + "}";
		} else {
			snippet += ", ${" + (counter + 1) + ":" + param.text + "}";
		}
		counter++;
	}
	snippet += ")$0";
	return snippet;
}

