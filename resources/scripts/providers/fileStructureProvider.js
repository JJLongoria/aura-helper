const vscode = require('vscode');
const path = require("path");
const logger = require("../main/logger");
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
const AuraParser = languages.AuraParser;
const JavaScriptParser = languages.JavaScriptParser;

function getMethodNode(method) {
    let name = method.name + '(';
    if (method.params && method.params.length > 0) {
        let params = [];
        for (const param of method.params) {
            params.push(param.datatype);
        }
        name += params.join(", ");
    }
    name += ')';
    let type = 'methodElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.description = method.signature;
    fileNode.command = {
        title: "GoToMethod",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [method.line, method.column]
    };
    return fileNode;
}

function getFieldNode(field) {
    let description = '';
    if (field.accessModifier)
        description += field.accessModifier.toLowerCase() + " ";
    else
        description += "public ";
    if (field.isStatic)
        description += "static ";
    if (field.definitionModifier)
        description += field.definitionModifier.toLowerCase() + " ";
    description += field.datatype + ' ' + field.name;
    let name = field.name;
    let type = 'fieldElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.description = description;
    fileNode.command = {
        title: "GoToField",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [field.line, field.column]
    };
    return fileNode;
}

function getClassNode(innerClass) {
    let name = innerClass.name;
    let type;
    let description;
    if (innerClass.isInterface) {
        type = 'interfaceElement';
    } else {
        type = 'classElement';
    }
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.Collapsed, [], innerClass);
    fileNode.command = {
        title: "GoToClass",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [innerClass.line, innerClass.column]
    };
    return fileNode;
}

function getClassElementsNodes(cls) {
    let nodes = [];
    if (cls.fields && cls.fields.length > 0) {
        let fileNode = new FileNode('FIELDS', 'field', '', cls.fields);
        nodes.push(fileNode);
    }
    if (cls.constructors && cls.constructors.length > 0) {
        let fileNode = new FileNode('CONSTRUCTORS', 'method', '', cls.constructors);
        nodes.push(fileNode);
    }
    if (cls.methods && cls.methods.length > 0) {
        let fileNode = new FileNode('METHODS', 'method', '', cls.methods);
        nodes.push(fileNode);
    }
    if (cls.enums && Object.keys(cls.classes).length > 0) {
        let fileNode = new FileNode('INNER CLASSES', 'class', '', cls.classes);
        nodes.push(fileNode);
    }
    if (cls.enums && Object.keys(cls.enums).length > 0) {
        let fileNode = new FileNode('INNER ENUMS', 'enum', '', cls.enums);
        nodes.push(fileNode);
    }
    return nodes;
}

function getEnumValueNode(enumValue) {
    let fileNode = new FileNode(enumValue.name, 'enumValueElement', vscode.TreeItemCollapsibleState.None, []);
    fileNode.command = {
        title: "GoToEnumValue",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [enumValue.line, enumValue.column]
    };
    return fileNode;
}

function getEnumNode(enumNode) {
    let name = enumNode.name;
    let type = 'enumElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.Collapsed, enumNode.enumValues);
    fileNode.command = {
        title: "GoToEnum",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [enumNode.line, enumNode.column]
    };
    return fileNode;
}

function getAttributeNode(attribute){
    let name = attribute.name;
    let type = 'attributeElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.command = {
        title: "GoToAttribute",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [attribute.line, attribute.column]
    };
    return fileNode;
}

function getHandlerNode(handler){
    let name = handler.name;
    let type = 'handlerElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.command = {
        title: "GoToHandler",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [handler.line, handler.column]
    };
    return fileNode;
}

function getEventNode(event){
    let name = event.name;
    let type = 'eventElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.command = {
        title: "GoToEvent",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [event.line, event.column]
    };
    return fileNode;
}

function getFunctionNode(functionNode){
    let name = functionNode.signature;
    let type = 'functionElement';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.command = {
        title: "GoToEvent",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [functionNode.line, functionNode.column]
    };
    return fileNode;
}

class FileStructureTreeProvider {

    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element) {
        if (element) {
            let nodes = [];
            if (element.type === 'method') {
                for (const method of element.childs) {
                    nodes.push(getMethodNode(method));
                }
            } else if (element.type === 'field') {
                for (const field of element.childs) {
                    nodes.push(getFieldNode(field));
                }
            } else if (element.type === 'class') {
                Object.keys(element.childs).forEach(function (key) {
                    let innerClass = element.childs[key];
                    if (innerClass)
                        nodes.push(getClassNode(innerClass));
                });
            } else if (element.type === 'classElement' || element.type === 'interfaceElement') {
                nodes = getClassElementsNodes(element.element);
            } else if (element.type === 'enumElement') {
                for (const enumValue of element.childs) {
                    nodes.push(getEnumValueNode(enumValue));
                }
            } else if (element.type === 'enum') {
                Object.keys(element.childs).forEach(function (key) {
                    let innerEnum = element.childs[key];
                    if (innerEnum)
                        nodes.push(getEnumNode(innerEnum));
                });
            } else if(element.type === 'attribute'){
                for (const attribute of element.childs) {
                    nodes.push(getAttributeNode(attribute));
                }
            } else if(element.type === 'handler'){
                for (const handler of element.childs) {
                    nodes.push(getHandlerNode(handler));
                }
            } else if(element.type === 'event'){
                for (const event of element.childs) {
                    nodes.push(getEventNode(event));
                }
            } else if(element.type === 'event'){
                for (const event of element.childs) {
                    nodes.push(getEventNode(event));
                }
            } else if(element.type === 'function'){
                for (const event of element.childs) {
                    nodes.push(getFunctionNode(event));
                }
            }
            return nodes;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (!editor)
                return undefined;
            if (!FileChecker.isApexClass(editor.document.uri.fsPath) && !FileChecker.isAuraComponent(editor.document.uri.fsPath) && !FileChecker.isJavaScript(editor.document.uri.fsPath))
                return undefined;
            if (FileChecker.isApexClass(editor.document.uri.fsPath)) {
                let fileStructure = ApexParser.parse(FileReader.readDocument(editor.document));
                let nodes = [];
                if (fileStructure.isEnum) {
                    nodes.push(getEnumNode(fileStructure));
                } else {
                    nodes = getClassElementsNodes(fileStructure);
                }
                return nodes;
            } else if(FileChecker.isAuraComponent(editor.document.uri.fsPath)){
                let fileStructure = AuraParser.parse(FileReader.readDocument(editor.document));
                let nodes = [];
                if(fileStructure.attributes && fileStructure.attributes.length > 0){
                    let fileNode = new FileNode('ATTRIBUTES', 'attribute', '', fileStructure.attributes);
                    nodes.push(fileNode);
                }
                if(fileStructure.handlers && fileStructure.handlers.length > 0){
                    let fileNode = new FileNode('HANDLERS', 'handler', '', fileStructure.handlers);
                    nodes.push(fileNode);
                }
                if(fileStructure.events && fileStructure.events.length > 0){
                    let fileNode = new FileNode('EVENT', 'event', '', fileStructure.events);
                    nodes.push(fileNode);
                }
                return nodes;
            } else if(FileChecker.isJavaScript(editor.document.uri.fsPath)){
                let fileStructure = JavaScriptParser.parse(FileReader.readDocument(editor.document));
                let nodes = [];
                if(fileStructure.functions && fileStructure.functions.length > 0){
                    let fileNode = new FileNode('FUNCTIONS', 'function', '', fileStructure.functions);
                    nodes.push(fileNode);
                }
                return nodes;
            }
        }
    }
    getTreeItem(element) {
        return element;
    }
}
exports.FileStructureTreeProvider = FileStructureTreeProvider;

class FileNode extends vscode.TreeItem {
    constructor(label, type, collapsibleState, childs, element) {
        super(label, collapsibleState);
        this.type = type;
        this.collapsibleState = collapsibleState;
        this.type = type;
        this.childs = childs;
        this.element = element;
    }
    get contextValue() {
        return undefined;
    }
    get iconPath() {
        let iconName = '';
        if (this.type === 'method' || this.type === 'methodElement' || this.type === 'handler' || this.type === 'handlerElement' || this.type === 'function' || this.type === 'functionElement') {
            iconName = 'Cube_16x.svg';
        } else if (this.type === 'field' || this.type === 'fieldElement' || this.type === 'attribute' || this.type === 'attributeElement') {
            iconName = 'Field_16x.svg';
        } else if (this.type === 'event' || this.type === 'eventElement') {
            iconName = 'Event_16x.svg';
        } else if (this.type === 'class' || this.type === 'classElement') {
            iconName = 'Class_16x.svg';
        } else if (this.type === 'interfaceElement') {
            iconName = 'Interface_16x.svg';
        } else if (this.type === 'enum' || this.type === 'enumElement') {
            iconName = 'Enumerator_16x.svg';
        } else if (this.type === 'enumValue' || this.type === 'enumValueElement') {
            iconName = 'EnumItem_16x.svg';
        }
        return Paths.getImagesPath() + '/' + iconName;
    }
}
exports.FileNode = FileNode;