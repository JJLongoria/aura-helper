import * as vscode from 'vscode';
const Range = vscode.Range;
const { FileReader, PathUtils, FileChecker } = require('@aurahelper/core').FileSystem;
const { DataTypes, ApexNodeTypes, AuraNodeTypes } = require('@aurahelper/core').Values;
const { StrUtils, Utils } = require('@aurahelper/core').CoreUtils;
const XMLDefinitions = require('@aurahelper/xml-definitions');
const applicationContext = require('../core/applicationContext');
const { XMLParser, XMLUtils } = require('@aurahelper/languages').XML;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { AuraParser } = require('@aurahelper/languages').Aura;
const { JSParser } = require('@aurahelper/languages').JavaScript;

const TYPES_BY_APEX_NODE: any = {};
TYPES_BY_APEX_NODE[ApexNodeTypes.CLASS] = vscode.SymbolKind.Class;
TYPES_BY_APEX_NODE[ApexNodeTypes.INTERFACE] = vscode.SymbolKind.Interface;
TYPES_BY_APEX_NODE[ApexNodeTypes.VARIABLE] = vscode.SymbolKind.Field;
TYPES_BY_APEX_NODE[ApexNodeTypes.PROPERTY] = vscode.SymbolKind.Property;
TYPES_BY_APEX_NODE[ApexNodeTypes.TRIGGER] = vscode.SymbolKind.Struct;
TYPES_BY_APEX_NODE[ApexNodeTypes.STATIC_CONSTRUCTOR] = vscode.SymbolKind.Function;
TYPES_BY_APEX_NODE[ApexNodeTypes.INITIALIZER] = vscode.SymbolKind.Object;
TYPES_BY_APEX_NODE[ApexNodeTypes.CONSTRUCTOR] = vscode.SymbolKind.Constructor;
TYPES_BY_APEX_NODE[ApexNodeTypes.METHOD] = vscode.SymbolKind.Method;
TYPES_BY_APEX_NODE[ApexNodeTypes.ENUM] = vscode.SymbolKind.Enum;
TYPES_BY_APEX_NODE[ApexNodeTypes.GETTER] = vscode.SymbolKind.Number;
TYPES_BY_APEX_NODE[ApexNodeTypes.SETTER] = vscode.SymbolKind.Number;
TYPES_BY_APEX_NODE['param'] = vscode.SymbolKind.TypeParameter;
TYPES_BY_APEX_NODE['final'] = vscode.SymbolKind.Constant;
TYPES_BY_APEX_NODE['value'] = vscode.SymbolKind.EnumMember;

const TYPES_BY_AURA_NODE: any = {};
TYPES_BY_AURA_NODE[AuraNodeTypes.APPLICATION] = vscode.SymbolKind.File;
TYPES_BY_AURA_NODE[AuraNodeTypes.ATTRIBUTE] = vscode.SymbolKind.Field;
TYPES_BY_AURA_NODE[AuraNodeTypes.COMPONENT] = vscode.SymbolKind.Struct;
TYPES_BY_AURA_NODE[AuraNodeTypes.DEPENDENCY] = vscode.SymbolKind.Variable;
TYPES_BY_AURA_NODE[AuraNodeTypes.EVENT] = vscode.SymbolKind.Event;
TYPES_BY_AURA_NODE[AuraNodeTypes.HANDLER] = vscode.SymbolKind.Method;
TYPES_BY_AURA_NODE[AuraNodeTypes.REGISTER_EVENT] = vscode.SymbolKind.Event;
TYPES_BY_AURA_NODE['value'] = vscode.SymbolKind.Variable;

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    type: string;

    constructor(type: string) {
        this.type = type;
    }

    static register() {
        setTimeout(() => {
            applicationContext.context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "xml" }, new DocumentSymbolProvider('XML')));
            applicationContext.context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "apex" }, new DocumentSymbolProvider('Apex')));
            applicationContext.context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "html" }, new DocumentSymbolProvider('Aura')));
            applicationContext.context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "javascript" }, new DocumentSymbolProvider('JS')));
        }, 50);
    }

    provideDocumentSymbols(document: vscode.TextDocument, _cancelToken: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        return new Promise<vscode.DocumentSymbol[]>((resolve, reject) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window
            }, (_progress, cancelToken) => {
                return new Promise<void>((progressResolve) => {
                    try {
                        cancelToken.onCancellationRequested(() => {
                            progressResolve();
                            resolve([]);
                        });
                        let symbols: vscode.DocumentSymbol[] = [];
                        if (this.type === 'XML') {
                            symbols = provideXMLSymbols(document);
                        } else if (this.type === 'Apex') {
                            symbols = provideApexSymbols(document);
                        } else if (this.type === 'Aura' && FileChecker.isAuraFile(document.uri.fsPath)) {
                            symbols = provideAuraSymbols(document);
                        } else if (this.type === 'JS' && (FileChecker.isAuraHelperJS(document.uri.fsPath) || FileChecker.isAuraControllerJS(document.uri.fsPath))) {
                            symbols = provideJSSymbols(document);
                        }
                        progressResolve();
                        resolve(symbols);
                    } catch (error) {
                        progressResolve();
                        reject(error);
                    }
                });
            });
        });
    }



}

function provideApexSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const className = PathUtils.getBasename(document.uri.fsPath, 'cls');
    let node;
    if (applicationContext.parserData.userClassesData[className]) {
        node = applicationContext.parserData.userClassesData[className];
    } else {
        const parser = new ApexParser().setContent(FileReader.readDocument(document)).setSystemData(applicationContext.parserData);
        node = parser.parse();
    }
    const range = new Range(node.startToken.range.start.line, node.startToken.range.start.character, node.startToken.range.end.line, node.startToken.range.end.character);
    const symbol = new vscode.DocumentSymbol(node.name, '', TYPES_BY_APEX_NODE[node.nodeType], range, range);
    processApexNode(node, symbol);
    return [symbol];
}

function processApexNode(node: any, parentSymbol: vscode.DocumentSymbol): void {
    if (!Utils.isNull(node.initializer)) {
        const range = new Range(node.initializer.startToken.range.start.line, node.initializer.startToken.range.start.character, node.initializer.startToken.range.end.line, node.initializer.startToken.range.end.character);
        const symbol = new vscode.DocumentSymbol(node.initializer.name, 'Initializer', TYPES_BY_APEX_NODE[node.initializer.nodeType], range, range);
        parentSymbol.children.push(symbol);
    }
    if (!Utils.isNull(node.staticConstructor)) {
        const range = new Range(node.staticConstructor.startToken.range.start.line, node.staticConstructor.startToken.range.start.character, node.staticConstructor.startToken.range.end.line, node.staticConstructor.startToken.range.end.character);
        const symbol = new vscode.DocumentSymbol(node.staticConstructor.name, 'Static Constructor', TYPES_BY_APEX_NODE[node.staticConstructor.nodeType], range, range);
        parentSymbol.children.push(symbol);
    }
    if (!Utils.isNull(node.getter)) {
        const range = new Range(node.getter.startToken.range.start.line, node.getter.startToken.range.start.character, node.getter.startToken.range.end.line, node.getter.startToken.range.end.character);
        const symbol = new vscode.DocumentSymbol(node.getter.name, node.datatype.name, TYPES_BY_APEX_NODE[node.getter.nodeType], range, range);
        parentSymbol.children.push(symbol);
    }
    if (!Utils.isNull(node.setter)) {
        const range = new Range(node.setter.startToken.range.start.line, node.setter.startToken.range.start.character, node.setter.startToken.range.end.line, node.setter.startToken.range.end.character);
        const symbol = new vscode.DocumentSymbol(node.setter.name, node.datatype.name, TYPES_BY_APEX_NODE[node.setter.nodeType], range, range);
        parentSymbol.children.push(symbol);
    }
    if (node.classes && Utils.hasKeys(node.classes)) {
        for (const key of Object.keys(node.classes)) {
            const nodeTmp = node.classes[key];
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(nodeTmp.name, '', TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.interfaces && Utils.hasKeys(node.interfaces)) {
        for (const key of Object.keys(node.interfaces)) {
            const nodeTmp = node.interfaces[key];
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(nodeTmp.name, '', TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.enums && Utils.hasKeys(node.enums)) {
        for (const key of Object.keys(node.enums)) {
            const nodeTmp = node.enums[key];
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(nodeTmp.name, '', TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.values && node.values.length > 0) {
        for (const valueToken of node.values) {
            const range = new Range(valueToken.range.start.line, valueToken.range.start.character, valueToken.range.end.line, valueToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(valueToken.text, '', TYPES_BY_APEX_NODE['value'], range, range);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.variables && Utils.hasKeys(node.variables)) {
        for (const key of Object.keys(node.variables)) {
            const nodeTmp = node.variables[key];
            let symbol;
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            if (nodeTmp.final) {
                symbol = new vscode.DocumentSymbol(nodeTmp.name, nodeTmp.datatype.name, TYPES_BY_APEX_NODE['final'], range, range);
            } else {
                symbol = new vscode.DocumentSymbol(nodeTmp.name, nodeTmp.datatype.name, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            }
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.params && Utils.hasKeys(node.params)) {
        for (const nodeTmp of node.getOrderedParams()) {
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(nodeTmp.name, nodeTmp.datatype.name, TYPES_BY_APEX_NODE['param'], range, range);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.methods && Utils.hasKeys(node.methods)) {
        for (const key of Object.keys(node.methods)) {
            const nodeTmp = node.methods[key];
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(StrUtils.replace(nodeTmp.simplifiedSignature, ',', ', '), nodeTmp.datatype.name, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.constructors && Utils.hasKeys(node.constructors)) {
        for (const key of Object.keys(node.constructors)) {
            const nodeTmp = node.constructors[key];
            const range = new Range(nodeTmp.startToken.range.start.line, nodeTmp.startToken.range.start.character, nodeTmp.startToken.range.end.line, nodeTmp.startToken.range.end.character);
            const symbol = new vscode.DocumentSymbol(StrUtils.replace(nodeTmp.simplifiedSignature, ',', ', '), node.name, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processApexNode(nodeTmp, symbol);
            parentSymbol.children.push(symbol);
        }
    }
}

function provideAuraSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const auraNode = new AuraParser().setContent(FileReader.readDocument(document)).setFileName(PathUtils.removeFileExtension(PathUtils.getBasename(document.uri.fsPath))).parse();
    const range = new Range(auraNode.token.range.start.line, auraNode.token.range.start.character - 1, auraNode.token.range.end.line, auraNode.token.range.end.character + 1);
    const symbol = new vscode.DocumentSymbol(auraNode.fileName, '', TYPES_BY_AURA_NODE[auraNode.nodeType], range, range);
    processAuraNode(auraNode, symbol);
    return [symbol];
}

function processAuraNode(node: any, parentSymbol: vscode.DocumentSymbol): void {
    const keysToAvoid = [
        'nodeType',
        'token',
        'positionData',
        'name',
        'fileName',
        'attributes',
        'events',
        'handlers',
        'controllerFunctions',
        'implementsValues',
        'helperFunctions',
        'apexFunctions',
        'dependencies',
        'qualifiedName',
        'tagName',
        'namespace',
    ];
    for (const fieldKey of Object.keys(node)) {
        if (keysToAvoid.includes(fieldKey)){
            continue;
        }
        const tagAttribute = node[fieldKey];
        if (tagAttribute) {
            const startLine = tagAttribute.name.range.start.line;
            const startCharacter = tagAttribute.name.range.start.character - 1;
            const endLine = tagAttribute.value.range.end.line;
            const endCharacter = tagAttribute.value.range.end.character + 1;
            const range = new Range(startLine, startCharacter, endLine, endCharacter);
            const value = tagAttribute.value.text.toString();
            const symbol = new vscode.DocumentSymbol(fieldKey, value, TYPES_BY_AURA_NODE['value'], range, range);
            parentSymbol.children.push(symbol);
        }
    }
    if (node.attributes && node.attributes.length > 0) {
        const firstElement = node.attributes[0];
        const elementRange = new Range(firstElement.token.range.start.line, firstElement.token.range.start.character, firstElement.token.range.end.line, firstElement.token.range.end.character);
        const elementSymbol = new vscode.DocumentSymbol('Attributes', node.attributes.length.toString(), TYPES_BY_APEX_NODE[vscode.SymbolKind.Array], elementRange, elementRange);
        for (const nodeTmp of node.attributes) {
            const range = new Range(nodeTmp.token.range.start.line, nodeTmp.token.range.start.character, nodeTmp.token.range.end.line, nodeTmp.token.range.end.character);
            const name = (nodeTmp.name && nodeTmp.name.value.text) ? nodeTmp.name.value.text : nodeTmp.tagName;
            const description = (nodeTmp.type) ? nodeTmp.type.value.text : undefined;
            const symbol = new vscode.DocumentSymbol(name, description, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processAuraNode(nodeTmp, symbol);
            elementSymbol.children.push(symbol);
        }
        parentSymbol.children.push(elementSymbol);
    }
    if (node.dependencies && node.dependencies.length > 0) {
        const firstElement = node.dependencies[0];
        const elementRange = new Range(firstElement.token.range.start.line, firstElement.token.range.start.character, firstElement.token.range.end.line, firstElement.token.range.end.character);
        const elementSymbol = new vscode.DocumentSymbol('Dependencies', node.dependencies.length.toString(), TYPES_BY_APEX_NODE[vscode.SymbolKind.Array], elementRange, elementRange);
        for (const nodeTmp of node.dependencies) {
            const range = new Range(nodeTmp.token.range.start.line, nodeTmp.token.range.start.character, nodeTmp.token.range.end.line, nodeTmp.token.range.end.character);
            const description = (nodeTmp.type) ? nodeTmp.type.value.text : undefined;
            const symbol = new vscode.DocumentSymbol(nodeTmp.tagName, description, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processAuraNode(nodeTmp, symbol);
            elementSymbol.children.push(symbol);
        }
        parentSymbol.children.push(elementSymbol);
    }
    if (node.events && node.events.length > 0) {
        const firstElement = node.events[0];
        const elementRange = new Range(firstElement.token.range.start.line, firstElement.token.range.start.character, firstElement.token.range.end.line, firstElement.token.range.end.character);
        const elementSymbol = new vscode.DocumentSymbol('Registered Events', node.events.length.toString(), TYPES_BY_APEX_NODE[vscode.SymbolKind.Array], elementRange, elementRange);
        for (const nodeTmp of node.events) {
            const range = new Range(nodeTmp.token.range.start.line, nodeTmp.token.range.start.character, nodeTmp.token.range.end.line, nodeTmp.token.range.end.character);
            const name = (nodeTmp.name && nodeTmp.name.value.text) ? nodeTmp.name.value.text : nodeTmp.tagName;
            const description = (nodeTmp.type) ? nodeTmp.type.value.text : undefined;
            const symbol = new vscode.DocumentSymbol(name, description, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processAuraNode(nodeTmp, symbol);
            elementSymbol.children.push(symbol);
        }
        parentSymbol.children.push(elementSymbol);
    }
    if (node.handlers && node.handlers.length > 0) {
        const firstElement = node.handlers[0];
        const elementRange = new Range(firstElement.token.range.start.line, firstElement.token.range.start.character, firstElement.token.range.end.line, firstElement.token.range.end.character);
        const elementSymbol = new vscode.DocumentSymbol('Handlers', node.handlers.length.toString(), TYPES_BY_APEX_NODE[vscode.SymbolKind.Array], elementRange, elementRange);
        for (const nodeTmp of node.handlers) {
            const range = new Range(nodeTmp.token.range.start.line, nodeTmp.token.range.start.character, nodeTmp.token.range.end.line, nodeTmp.token.range.end.character);
            const name = (nodeTmp.name) ? nodeTmp.name.value.text : nodeTmp.tagName;
            const description = (nodeTmp.event && nodeTmp.event.value.text) ? nodeTmp.event.value.text : ((nodeTmp.action) ? nodeTmp.action.value.text : undefined);
            const symbol = new vscode.DocumentSymbol(name, description, TYPES_BY_APEX_NODE[nodeTmp.nodeType], range, range);
            processAuraNode(nodeTmp, symbol);
            elementSymbol.children.push(symbol);
        }
        parentSymbol.children.push(elementSymbol);
    }
}

function provideJSSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const jsNode = new JSParser().setContent(FileReader.readDocument(document)).setFileName(PathUtils.removeFileExtension(PathUtils.getBasename(document.uri.fsPath))).parse();
    const range = new Range(0, 0, 0, 1);
    const symbol = new vscode.DocumentSymbol(jsNode.name, '', vscode.SymbolKind.File, range, range);
    for (const nodeTmp of jsNode.methods) {
        const funcRange = new Range(nodeTmp.token.range.start.line, nodeTmp.token.range.start.character, nodeTmp.token.range.end.line, nodeTmp.token.range.end.character);
        const funcSymbol = new vscode.DocumentSymbol(StrUtils.replace(nodeTmp.signature, ',', ', '), '', vscode.SymbolKind.Function, funcRange, funcRange);
        if (nodeTmp.variables && nodeTmp.variables.length) {
            for (const varTmp of nodeTmp.variables) {
                const varRange = new Range(varTmp.range.start.line, varTmp.range.start.character, varTmp.range.end.line, varTmp.range.end.character);
                const varSymbol = new vscode.DocumentSymbol(varTmp.text, '', vscode.SymbolKind.Variable, varRange, varRange);
                funcSymbol.children.push(varSymbol);
            }
        }
        symbol.children.push(funcSymbol);
    }
    return [symbol];
}

function provideXMLSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    let symbols: vscode.DocumentSymbol[] = [];
    const content = FileReader.readDocument(document);
    const contentLines = content.split('\n');
    const xmlRoot = XMLParser.parseXML(content, true);
    const type = Object.keys(xmlRoot)[0];
    const xmlDefinition = XMLDefinitions.getRawDefinition(type);
    if (!xmlDefinition) {
        return symbols;
    }
    const xmlData = xmlRoot[type];
    for (let key of Object.keys(xmlData)) {
        if (key === '@attrs'){
            continue;
        }
        let fieldValue = xmlData[key];
        if (fieldValue !== undefined) {
            if (!Array.isArray(fieldValue) && typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0){
                continue;
            }
            if (Array.isArray(fieldValue) && fieldValue.length === 0){
                continue;
            }
            const fieldDefinition = xmlDefinition[key];
            const fieldSymbols = processXMLField(fieldValue, fieldDefinition, contentLines);
            if (fieldSymbols){
                symbols = symbols.concat(fieldSymbols);
            }
        }
    }
    return symbols;
}

function processXMLField(fieldValue: any, fieldDefinition: any, lines: any[], parentSymbol?: vscode.DocumentSymbol) {
    let symbols: vscode.DocumentSymbol[] = [];
    if (Array.isArray(fieldValue) || fieldDefinition.datatype === DataTypes.ARRAY) {
        fieldValue = XMLUtils.forceArray(fieldValue);
        for (const value of fieldValue) {
            let lastChild = symbols.length > 0 ? symbols[symbols.length - 1] : undefined;
            while (lastChild && lastChild.children.length > 0) {
                lastChild = lastChild.children[lastChild.children.length - 1];
            }
            if (fieldDefinition.fields) {
                const startLine = (lastChild) ? lastChild.selectionRange.end.line : (parentSymbol ? parentSymbol.selectionRange.end.line : 0);
                const range = getRange(lines, fieldDefinition, undefined, XMLUtils.getAttributes(value), startLine);
                const description = (fieldDefinition.fieldKey && Utils.isString(value[fieldDefinition.fieldKey])) ? value[fieldDefinition.fieldKey].toString() : undefined;
                const arraySymbol = new vscode.DocumentSymbol(fieldDefinition.key, description, vscode.SymbolKind.Array, range, range);
                for (let key of Object.keys(fieldDefinition.fields)) {
                    let subFieldValue = value[key];
                    if (subFieldValue !== undefined && subFieldValue !== null) {
                        if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0){
                            continue;
                        }
                        if (Array.isArray(subFieldValue) && subFieldValue.length === 0){
                            continue;
                        }
                        let subFieldDefinition = fieldDefinition.fields[key];
                        if (subFieldDefinition.definitionRef){
                            subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                        }
                        const fieldSymbols = processXMLField(subFieldValue, subFieldDefinition, lines, arraySymbol);
                        if (fieldSymbols){
                            arraySymbol.children = arraySymbol.children.concat(fieldSymbols);
                        }
                    }
                }
                symbols.push(arraySymbol);
            } else {
                const processedValue = fieldDefinition.prepareValue(fieldValue);
                const startLine = (lastChild) ? lastChild.selectionRange.end.line : (parentSymbol ? parentSymbol.selectionRange.end.line : 0);
                const range = getRange(lines, fieldDefinition, processedValue, XMLUtils.getAttributes(fieldValue), startLine);
                const symbol = new vscode.DocumentSymbol(fieldDefinition.key, processedValue, vscode.SymbolKind.Field, range, range);
                symbols.push(symbol);
            }
        }
    } else if (fieldDefinition.datatype === DataTypes.OBJECT) {
        let lastChild = symbols.length > 0 ? symbols[symbols.length - 1] : undefined;
        while (lastChild && lastChild.children.length > 0) {
            lastChild = lastChild.children[lastChild.children.length - 1];
        }
        const startLine = (lastChild) ? lastChild.selectionRange.end.line : (parentSymbol ? parentSymbol.selectionRange.end.line : 0);
        const range = getRange(lines, fieldDefinition, undefined, XMLUtils.getAttributes(fieldValue), startLine);
        const description = (fieldDefinition.fieldKey && Utils.isString(fieldValue[fieldDefinition.fieldKey])) ? fieldValue[fieldDefinition.fieldKey].toString() : undefined;
        const objSymbol = new vscode.DocumentSymbol(fieldDefinition.key, description, vscode.SymbolKind.Object, range, range);
        for (const key of Object.keys(fieldValue)) {
            let subFieldValue = fieldValue[key];
            if (subFieldValue !== undefined && subFieldValue !== null) {
                if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0){
                    continue;
                }
                if (Array.isArray(subFieldValue) && subFieldValue.length === 0){
                    continue;
                }
                let subFieldDefinition = fieldDefinition.fields[key];
                if (subFieldDefinition.definitionRef){
                    subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                }
                const fieldSymbols = processXMLField(subFieldValue, subFieldDefinition, lines, objSymbol);
                if (fieldSymbols){
                    objSymbol.children = objSymbol.children.concat(fieldSymbols);
                }
            }
        }
        symbols.push(objSymbol);
    } else {
        let lastChild = symbols.length > 0 ? symbols[symbols.length - 1] : undefined;
        while (lastChild && lastChild.children.length > 0) {
            lastChild = lastChild.children[lastChild.children.length - 1];
        }
        const processedValue = fieldDefinition.prepareValue(fieldValue);
        const startLine = (lastChild) ? lastChild.selectionRange.end.line : (parentSymbol ? parentSymbol.selectionRange.end.line : 0);
        const range = getRange(lines, fieldDefinition, processedValue, XMLUtils.getAttributes(fieldValue), startLine);
        const symbol = new vscode.DocumentSymbol(fieldDefinition.key, processedValue, vscode.SymbolKind.Field, range, range);
        symbols.push(symbol);
    }
    return symbols;
}

function getRange(lines: string[], fieldDefinition: any, value: any, attributes: any[], nLine: number) {
    let startLine = 0;
    let endLine = 0;
    let startColumn = 0;
    let endColumn = 1;
    const lineNumber = (nLine !== undefined && nLine > 0) ? nLine : 0;
    const len = lines.length;
    for (let i = lineNumber; i < len; i++) {
        const line = lines[i];
        const openTag = '<' + fieldDefinition.key + ((attributes.length > 0) ? (' ' + attributes.join(' ')) : '') + '>';
        const closeTag = '</' + fieldDefinition.key + '>';
        const autoClosedTag = '<' + fieldDefinition.key + ((attributes.length > 0) ? (' ' + attributes.join(' ')) : '') + '/>';
        if (StrUtils.contains(line, openTag)) {
            if (value !== undefined) {
                value = value.toString();
                if (StrUtils.contains(line, value)) {
                    startLine = i;
                    endLine = i;
                    startColumn = line.indexOf(openTag) + (StrUtils.count(line, '\t') * 3);
                    endColumn = startColumn + openTag.length + value.length + closeTag.length;
                    break;
                } else if (StrUtils.contains(value, '\n') && StrUtils.contains(value, line)) {
                    const valueSplits = value.split('\n');
                    startLine = i;
                    endLine = i + valueSplits.length;
                    startColumn = line.indexOf(openTag) + openTag.length + 1 + (StrUtils.count(line, '\t') * 3);
                    endColumn = valueSplits[valueSplits.length - 1].length;
                    break;
                }
            } else {
                startLine = i;
                startColumn = line.indexOf(openTag) + (StrUtils.count(line, '\t') * 3);
                endLine = i;
                endColumn = startColumn + openTag.length;
                break;
            }
        } else if (StrUtils.contains(line, autoClosedTag)) {
            startLine = i;
            startColumn = line.indexOf(autoClosedTag) + (StrUtils.count(line, '\t') * 3);
            endLine = i;
            endColumn = startColumn + autoClosedTag.length;
            break;
        }
    }
    return new Range(startLine, startColumn, endLine, endColumn);
}