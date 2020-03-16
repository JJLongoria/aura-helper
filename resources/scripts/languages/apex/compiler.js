const Logger = require('../../main/logger');
const fileSystem = require('../../fileSystem');
const Node = require('./nodes/node');
const CommentNode = require('./nodes/commentNode');
const ClassNode = require('./nodes/classNode');
const InterfaceNode = require('./nodes/interfaceNode');
const EnumNode = require('./nodes/enumNode');
const FileNode = require('./nodes/fileNode');
const VariableNode = require('./nodes/variableNode');
const PropertyNode = require('./nodes/propertyNode');
const MethodNode = require('./nodes/methodNode');
const GetAccesorNode = require('./nodes/getAccesorNode');
const SetAccesorNode = require('./nodes/setAccesorNode');
const ConstructorNode = require('./nodes/constructorNode');
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;

class Compiler {

    static convertSystemClasses() {
        return new Promise(function (resolve) {
            let nsFoldersPath = Paths.getAbsolutePath("./resources/assets/apex/classes");
            let nsFoldersPathResult = Paths.getAbsolutePath("./resources/assets/apex2/classes");
            let nsFolders = FileReader.readDirSync(nsFoldersPath);
            if (!FileChecker.isExists(nsFoldersPathResult))
                FileWriter.createFolderSync(nsFoldersPathResult);
            for (const nsFolder of nsFolders) {
                if (nsFolder.indexOf('namespacesMetadata.json') !== -1)
                    continue;
                let classFiles = FileReader.readDirSync(nsFoldersPath + '/' + nsFolder);
                let classFolderResult = nsFoldersPathResult + '/' + nsFolder;
                if (!FileChecker.isExists(classFolderResult))
                    FileWriter.createFolderSync(classFolderResult);
                for (const classFile of classFiles) {
                    if (classFile.indexOf('namespaceMetadata.json') !== -1)
                        continue;
                    let classContent = JSON.parse(FileReader.readFileSync(nsFoldersPath + '/' + nsFolder + '/' + classFile));
                    let node;
                    let fileNodesMap = {};
                    if (classContent.isInterface) {
                        node = convertInterface(classContent, fileNodesMap);
                    } else if (classContent.isEnum) {
                        node = convertEnum(classContent, fileNodesMap);
                    } else {
                        node = convertClass(classContent, fileNodesMap);
                    }
                    let fileNode = new FileNode(nsFolder.toLowerCase() + '.' + node.getName() + '.file', node.getName());
                    fileNode.setNodeMap(fileNodesMap);
                    fileNode.addChild(node.getId());
                    fileNode.setSystem(true);
                    FileWriter.createFileSync(classFolderResult + '/' + classFile, JSON.stringify(fileNode));
                }
            }
            resolve();
        });
    }
}
module.exports = Compiler;

function convertEnum(content, fileNodesMap) {
    let newNode = new EnumNode(((content.namespace) ? content.namespace.toLowerCase() : '') + '.' + content.name.toLowerCase(), content.name);
    newNode.setNamespace(content.namespace);
    newNode.setAccessModifier(content.accessModifier);
    newNode.setDefinitionModifier(content.definitionModifier);
    if (content.enumValues && content.enumValues.length > 0) {
        for (const str of content.enumValues) {
            let valueNode = new Node(newNode.getId() + '.' + str.toLowerCase(), str);
            valueNode.setParentNodeId(newNode.getId());
            newNode.addValue(valueNode.getId());
            fileNodesMap[valueNode.getId()] = valueNode;
        }
    }
    if (content.description) {
        let comment = new CommentNode(newNode.getId() + '.comment', 'description');
        comment.setText(content.description);
        newNode.setCommentNode(comment.getId());
        fileNodesMap[comment.getId()] = comment;
    }
    fileNodesMap[newNode.getId()] = newNode;
    return newNode;
}

function convertInterface(content, fileNodesMap) {
    let newNode = new InterfaceNode(((content.namespace) ? content.namespace.toLowerCase() : '') + '.' + content.name.toLowerCase(), content.name);
    newNode.setNamespace(content.namespace);
    newNode.setAccessModifier(content.accessModifier);
    newNode.setDefinitionModifier(content.definitionModifier);
    newNode.setExtends(content.extendsType);
    if (content.constructors && content.constructors.length > 0) {
        convertConstructors(newNode, content.constructors, fileNodesMap);
    }
    if (content.methods && content.methods.length > 0) {
        convertMethods(newNode, content.methods, fileNodesMap);
    }
    if (content.description) {
        let comment = new CommentNode(newNode.getId() + '.comment', 'description');
        comment.setText(content.description);
        newNode.setCommentNode(comment.getId());
        fileNodesMap[comment.getId()] = comment;
    }
    fileNodesMap[newNode.getId()] = newNode;
    return newNode;
}

function convertClass(content, fileNodesMap) {
    let newNode = new ClassNode(((content.namespace) ? content.namespace.toLowerCase() : '') + '.' + content.name.toLowerCase(), content.name);
    newNode.setNamespace(content.namespace);
    newNode.setAccessModifier(content.accessModifier);
    newNode.setDefinitionModifier(content.definitionModifier);
    newNode.setWithSharing(content.withSharing);
    newNode.setInheritedSharing(content.inheritedSharing);
    newNode.setExtends(content.extendsType);
    newNode.setImplements(content.implements);
    if (content.fields && content.fields.length > 0) {
        convertFields(newNode, content.fields, fileNodesMap);
    }
    if (content.constructors && content.constructors.length > 0) {
        convertConstructors(newNode, content.constructors, fileNodesMap);
    }
    if (content.methods && content.methods.length > 0) {
        convertMethods(newNode, content.methods, fileNodesMap);
    }
    if (content.classes && Object.keys(content.classes).length > 0) {
        Object.keys(content.classes).forEach(function (key) {
            let classContent = content.classes[key];
            let classNode = convertClass(classContent, fileNodesMap);
            classNode.setId(newNode.getId() + '.class.' + classNode.getName().toLowerCase());
            newNode.addClass(classNode);
        });
    }
    if (content.enums && Object.keys(content.enums).length > 0) {
        Object.keys(content.enums).forEach(function (key) {
            let enumContent = content.classes[key];
            let classNode = convertEnum(enumContent, fileNodesMap);
            classNode.setId(newNode.getId() + '.class.' + classNode.getName().toLowerCase());
            newNode.addClass(classNode);
        });
    }
    if (content.description) {
        let comment = new CommentNode(newNode.getId() + '.comment', 'description');
        comment.setText(content.description);
        newNode.setCommentNode(comment.getId());
        fileNodesMap[comment.getId()] = comment;
    }
    fileNodesMap[newNode.getId()] = newNode;
    return newNode;
}

function convertFields(node, fields, fileNodesMap) {
    for (const field of fields) {
        let property = new PropertyNode(node.getId() + '.' + field.name.toLowerCase(), field.name);
        property.setDefinitionModifier(getDefinitionModifierFromSignature(field.signature));
        property.setAccessModifier(getAccessModifierFromSignature(field.signature));
        property.setStatic(isStaticSignature(field.signature));
        property.setTransient(isTransientSignature(field.signature));
        property.setFinal(isFinalSignature(field.signature));
        property.setDatatype(getDatatypeFromSignature(field.signature, field.name));
        property.setParentNodeId(node.getId());
        if (field.signature.toLowerCase().indexOf('get;')) {
            let getNode = new GetAccesorNode(property.getId() + '.get', 'get');
            getNode.setParentNodeId(property.getId());
            getNode.setDeep(property.getDeep() + 1);
            property.setGetAccesor(getNode.getId());
            fileNodesMap[getNode.getId()] = getNode;
        }
        if (field.signature.toLowerCase().indexOf('set;')) {
            let setNode = new SetAccesorNode(property.getId() + '.get', 'set');
            setNode.setParentNodeId(property.getId());
            setNode.setDeep(property.getDeep() + 1);
            property.setSetAccesor(setNode.getId());
            fileNodesMap[setNode.getId()] = setNode;
        }
        if (field.description) {
            let comment = new CommentNode(property.getId() + '.comment', 'description');
            comment.setText(field.description);
            property.setCommentNode(comment.getId());
            fileNodesMap[comment.getId()] = comment;
        }
        node.addProperty(property.getId());
        fileNodesMap[property.getId()] = property;
    }
}

function convertConstructors(node, constructors, fileNodesMap) {
    for (const constructor of constructors) {
        let constNode = new ConstructorNode(node.getId() + '.' + getSimplifiedSignature(constructor).toLowerCase(), constructor.name);
        constNode.setSignature(constructor.signature);
        constNode.setDefinitionModifier(getDefinitionModifierFromSignature(constructor.signature));
        constNode.setAccessModifier(getAccessModifierFromSignature(constructor.signature));
        constNode.setStatic(isStaticSignature(constructor.signature));
        constNode.setOverride(isOverrideSignature(constructor.signature));
        constNode.setSignature(constructor.signature);
        constNode.setSimplifiedSignature(getSimplifiedSignature(constructor));
        constNode.setParentNodeId(node.getId());
        if (constructor.params.length > 0) {
            convertParams(constNode, constructor.params, fileNodesMap);
        }
        if (constructor.description) {
            let comment = new CommentNode(constNode.getId() + '.comment', 'description');
            comment.setText(constructor.description);
            constNode.setCommentNode(comment.getId());
            fileNodesMap[comment.getId()] = comment;
        }
        node.addConstructor(constNode.getId());
        fileNodesMap[constNode.getId()] = constNode;
    }
}

function convertParams(node, params, fileNodesMap) {
    for (const param of params) {
        let paramNode = new VariableNode(node.getId() + '.' + param.name.toLowerCase(), param.name);
        paramNode.setParentNodeId(node.getId());
        paramNode.setDatatype(param.datatype);
        if (param.description) {
            let comment = new CommentNode(paramNode.getId() + '.comment', 'description');
            comment.setText(param.description);
            paramNode.setCommentNode(comment.getId());
            fileNodesMap[comment.getId()] = comment;
        }
        node.addParam(paramNode.getId());
        fileNodesMap[paramNode.getId()] = paramNode;
    }
}

function convertMethods(node, methods, fileNodesMap) {
    for (const method of methods) {
        let methodNode = new MethodNode(node.getId() + '.' + getSimplifiedSignature(method).toLowerCase(), method.name);
        methodNode.setSignature(method.signature);
        methodNode.setDefinitionModifier(getDefinitionModifierFromSignature(method.signature));
        methodNode.setAccessModifier(getAccessModifierFromSignature(method.signature));
        methodNode.setStatic(isStaticSignature(method.signature));
        methodNode.setOverride(isOverrideSignature(method.signature));
        methodNode.setSignature(method.signature);
        methodNode.setSimplifiedSignature(getSimplifiedSignature(method));
        methodNode.setParentNodeId(node.getId());
        if (method.params && method.params.length > 0) {
            convertParams(methodNode, method.params, fileNodesMap);
        }
        if (method.description) {
            let comment = new CommentNode(methodNode.getId() + '.comment', 'description');
            comment.setText(method.description);
            methodNode.setCommentNode(comment.getId());
            fileNodesMap[comment.getId()] = comment;
        }
        node.addMethod(methodNode.getId());
        fileNodesMap[methodNode.getId()] = methodNode;
    }
}

function getDatatypeFromSignature(signature, name) {
    let startIndex = 0;
    let endIndex = signature.toLowerCase().indexOf(name.toLowerCase());
    if (signature.toLowerCase().indexOf('abstract') !== -1)
        startIndex = signature.toLowerCase().indexOf('abstract') + 'abstract'.length;
    if (signature.toLowerCase().indexOf('virtual') !== -1)
        startIndex = signature.toLowerCase().indexOf('virtual') + 'virtual'.length;
    if (signature.toLowerCase().indexOf('private') !== -1)
        startIndex = signature.toLowerCase().indexOf('private') + 'private'.length;
    if (signature.toLowerCase().indexOf('global') !== -1)
        startIndex = signature.toLowerCase().indexOf('global') + 'global'.length;
    if (signature.toLowerCase().indexOf('static') !== -1)
        startIndex = signature.toLowerCase().indexOf('static') + 'static'.length;
    if (signature.toLowerCase().indexOf('transient') !== -1)
        startIndex = signature.toLowerCase().indexOf('transient') + 'transient'.length;
    if (signature.toLowerCase().indexOf('final') !== -1)
        startIndex = signature.toLowerCase().indexOf('final') + 'final'.length;
    return signature.substring(startIndex, endIndex).trim();
}

function getSimplifiedSignature(obj) {
    let types = [];
    if (obj.params && obj.params.length > 0) {
        for (const param of obj.params) {
            types.push(param.datatype);
        }
    }
    return obj.name + '(' + types.join(', ') + ')';
}

function isStaticSignature(signature) {
    return signature.toLowerCase().indexOf('static') !== -1;
}

function isTransientSignature(signature) {
    return signature.toLowerCase().indexOf('transient') !== -1;
}

function isFinalSignature(signature) {
    return signature.toLowerCase().indexOf('final') !== -1;
}

function isOverrideSignature(signature) {
    return signature.toLowerCase().indexOf('override') !== -1;
}

function getDefinitionModifierFromSignature(signature) {
    let defModifier = undefined;
    if (signature.toLowerCase().indexOf('abstract') !== -1)
        defModifier = 'abstract';
    if (signature.toLowerCase().indexOf('virtual') !== -1)
        defModifier = 'virtual';
    return defModifier;
}

function getAccessModifierFromSignature(signature) {
    let accessModifier = 'public';
    if (signature.toLowerCase().indexOf('private') !== -1)
        accessModifier = 'private';
    if (signature.toLowerCase().indexOf('global') !== -1)
        accessModifier = 'global';
    return accessModifier;
}
