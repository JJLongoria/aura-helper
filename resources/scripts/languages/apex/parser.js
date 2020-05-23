const Logger = require('../../utils/logger');
const StrUils = require('../../utils/strUtils');
const annotations = require('./annotations');
const keywords = require('./keywords');
const Tokenizer = require('../tokenizer').Tokenizer;
const Lexer = require('./lexer');
const TokenType = require('./tokenTypes');
const Utils = require('../utils').Utils;
const FileNode = require('./nodes/fileNode');
const ClassNode = require('./nodes/classNode');
const InterfaceNode = require('./nodes/interfaceNode');
const EnumNode = require('./nodes/enumNode');
const DatatypeNode = require('./nodes/datatypeNode');
const ArrayDatatypeNode = require('./nodes/arrayDatatypeNode');
const ParametrizedDatatypeNode = require('./nodes/parametrizedDatatype');
const MethodNode = require('./nodes/methodNode');
const ConstructorNode = require('./nodes/constructorNode');
const InitializerNode = require('./nodes/initializerNode');
const StaticConstructorNode = require('./nodes/staticConstructorNode');
const CommentNode = require('./nodes/commentNode');
const VariableNode = require('./nodes/variableNode');
const PropertyNode = require('./nodes/propertyNode');
const IfNode = require('./nodes/ifNode');
const ElseIfNode = require('./nodes/elseIfNode');
const ElseNode = require('./nodes/elseNode');
const WhileNode = require('./nodes/whileNode');
const ForNode = require('./nodes/fornode');
const ForeachNode = require('./nodes/foreachNode');
const DoWhileNode = require('./nodes/dowhileNode');
const TryNode = require('./nodes/tryNode');
const CatchNode = require('./nodes/catchNode');
const FinallyNode = require('./nodes/finallyNode');
const RunAsNode = require('./nodes/runAsNode');
const LiteralNode = require('./nodes/literalNode');
const FlowStructureNode = require('./nodes/flowStructureNode');
const GetAccesorNode = require('./nodes/getAccesorNode');
const SetAccesorNode = require('./nodes/setAccesorNode');
const StatementNode = require('./nodes/statementNode');
const ApplicationContext = require('../../core/applicationContext');
const AnnotationNode = require('./nodes/annotationNode');

let nodesMap = {};
let namespaces = {};
let sObjects = {};
let systemNamespace = {};
let classes = {};
let initialNodes = [];

let accessModifier;
let definitionModifier;
let sharingModifier;
let staticKeyword;
let final;
let override;
let transient;
let testMethod;
let annotation;
let nComments = 0;
let nAnnotations = 0;
let nFlowControls = 0;
let datatype;

class Parser {

    static parse(fileName, content, position) {
        accessModifier = undefined;
        definitionModifier = undefined;
        sharingModifier = undefined;
        staticKeyword = undefined;
        final = undefined;
        override = undefined;
        transient = undefined;
        testMethod = undefined;
        annotation = undefined;
        nComments = 0;
        nAnnotations = 0;
        let fileNode = new FileNode(fileName.substring(0, fileName.indexOf('.')) + '.file', fileName);
        let node = {};
        node = fileNode;
        let tokens = Lexer.tokenize(content);
        let index = 0;
        while (index < tokens.length) {
            let lastToken = Utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            if (openBracket(token)) {
                if (lastToken && (lastToken.type === TokenType.BRACKET.CURLY_OPEN || lastToken.type === TokenType.BRACKET.CURLY_CLOSE || lastToken.type === TokenType.PUNCTUATION.SEMICOLON || lastToken.type === TokenType.COMMENT.CONTENT || lastToken.type === TokenType.COMMENT.LINE || lastToken.type === TokenType.COMMENT.LINE_DOC || lastToken.type === TokenType.COMMENT.BLOCK_END)) {
                    let newNode = new InitializerNode(node.getId() + '.initializer', 'Initializer', token);
                    newNode.setDeep(node.getDeep() + 1);
                    newNode.setParentNodeId(node.getId());
                    nodesMap[newNode.getId()] = newNode;
                    node.addChild(newNode);
                    node = newNode;
                } else if (node instanceof FlowStructureNode && token.isAux())
                    node.setOneLineBlock(false);
            } else if (closeBracket(token)) {
                if (node && node.getParentNodeId()) {
                    if (!token.isAux())
                        node.setEndToken(token);
                    if (node.getParentNodeId() === fileNode.getId())
                        node = fileNode;
                    else
                        node = nodesMap[node.getParentNodeId()];
                } else
                    node = fileNode;
            } else if (token.type === TokenType.PUNCTUATION.SEMICOLON) {
                if (node && node.getParentNodeId()) {
                    if ((node instanceof GetAccesorNode || node instanceof SetAccesorNode) && lastToken && (lastToken.type === TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER || lastToken.type === TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER)) {
                        node = nodesMap[node.getParentNodeId()];
                    } else if ((node instanceof MethodNode || node instanceof ConstructorNode) && lastToken && lastToken.type === TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE) {
                        node = nodesMap[node.getParentNodeId()];
                    }
                }
            } else if (isAccessModifier(token)) {
                accessModifier = token;
            } else if (isDefinitionModifier(token)) {
                definitionModifier = token;
            } else if (isSharingModifier(token)) {
                sharingModifier = token;
            } else if (isStatic(token)) {
                staticKeyword = token;
            } else if (isFinal(token)) {
                final = token;
            } else if (isOverride(token)) {
                override = token;
            } else if (isTestMethod(token)) {
                testMethod = token;
            } else if (isTransient(token)) {
                transient = token;
            } else if (isCommentLine(token)) {
                let newNode = new CommentNode(node.getId() + '.comment.' + nComments, 'BlockComment.' + nComments, token);
                index = processCommentLine(newNode, tokens, index);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                newNode.setBlock(false);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                nComments++;
            } else if (openCommentBlock(token)) {
                let newNode = new CommentNode(node.getId() + '.comment.' + nComments, 'BlockComment.' + nComments, token);
                index = processCommentBlock(newNode, tokens, index);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                newNode.setBlock(true);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                nComments++;
            } else if (isAnnotation(token)) {
                let newNode = new AnnotationNode(node.getId() + '.annotation(' + token.textToLower + ').' + nAnnotations, token.text, token);
                index = processAnnotation(newNode, tokens, index);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                annotation = newNode;
                nAnnotations++;
            } else if (isClass(token)) {
                let newNode = new ClassNode(node.getId() + '.' + token.textToLower + '.class', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setSharingModifier(sharingModifier);
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isInterface(token)) {
                let newNode = new InterfaceNode(node.getId() + '.' + token.textToLower + '.interface', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isEnum(token)) {
                let newNode = new EnumNode(node.getId() + '.' + token.textToLower + '.enum', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isProperty(token)) {
                let newNode = new PropertyNode(node.getId() + '.' + token.textToLower + '.property', token.text, token);
                datatype.setId(newNode.getId() + '.datatype');
                nodesMap[datatype.getId()] = datatype;
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                newNode.setTransient(transient);
                newNode.setStatic(staticKeyword);
                newNode.setDatatype(datatype);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isGetterAccessor(token)) {
                let newNode = new GetAccesorNode(node.getId() + '.' + token.textToLower, token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.setGetAccessor(newNode);
                node = newNode;
                resetModifiers();
            } else if (isSetterAccessor(token)) {
                let newNode = new SetAccesorNode(node.getId() + '.' + token.textToLower, token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.setSetAccessor(newNode);
                node = newNode;
                resetModifiers();
            } else if (isDatatype(token)) {
                let newNode = new DatatypeNode(node.getId() + '.datatype.', '', token);
                index = processDatatype(newNode, tokens, index);
                newNode.setDeep(node.getDeep() + 1);
                newNode.setParentNodeId(node.getId());
                datatype = newNode;
            } else if (isStaticConstructorDeclaration(token)) {
                let newNode = new StaticConstructorNode(node.getId() + '.' + token.textToLower + '.constructor', token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isConstructorDeclaration(token, node.getName())) {
                let newNode = new ConstructorNode(node.getId() + '.' + token.textToLower + '.constructor', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                newNode.setOverride(override);
                index = processMethodSignature(newNode, tokens, index);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isMethodDeclaration(token)) {
                let newNode = new MethodNode(node.getId() + '.' + token.textToLower + '.function', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                newNode.setOverride(override);
                newNode.setStatic(staticKeyword);
                newNode.setTestMethod(testMethod);
                index = processMethodSignature(newNode, tokens, index);
                datatype.setId(newNode.getId() + '.datatype');
                nodesMap[datatype.getId()] = datatype;
                newNode.setReturn(datatype);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                resetModifiers();
            } else if (isIfFlowControl(token)) {
                let newNode = new IfNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isElseIfFlowControl(token)) {
                let newNode = new ElseIfNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isElseFlowControl(token)) {
                let newNode = new ElseNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isForFlowControl(token)) {
                let newNode;
                if (isForLoop(tokens, index)) {
                    newNode = new ForNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                } else {
                    newNode = new ForeachNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                }
                newNode.setDeep(node.getDeep() + 1);
                newNode.setParentNodeId(node.getId());
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isDoWhile(token)) {
                let newNode = new DoWhileNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isWhileFlowControl(token)) {
                let newNode;
                if (isWhileFromDoWhile(tokens, index)) {
                    let doNode = nodesMap[node.getLastNodeId()];
                    newNode = new WhileNode(doNode.getId() + '.' + token.textToLower, token.text, token);
                    newNode.setParentNodeId(doNode.getId());
                    nodesMap[newNode.getId()] = newNode;
                    nodesMap[node.getLastNodeId()].setWhile(newNode);
                    node = newNode;
                } else {
                    newNode = new WhileNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                    newNode.setDeep(node.getDeep() + 1);
                    newNode.setParentNodeId(node.getId());
                    nodesMap[newNode.getId()] = newNode;
                    node.addChild(newNode);
                    node = newNode;
                    nFlowControls++;
                }
            } else if (isTry(token)) {
                let newNode = new TryNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isCatch(token)) {
                let newNode = new CatchNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isFinally(token)) {
                let newNode = new FinallyNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isRunAs(token)) {
                let newNode = new RunAsNode(node.getId() + '.' + token.textToLower + '.' + nFlowControls, token.text, token);
                newNode.setParentNodeId(node.getId());
                newNode.setDeep(node.getDeep() + 1);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node = newNode;
                nFlowControls++;
            } else if (isVariableDeclaration(token)) { 
                let newNode = new VariableNode(node.getId() + '.' + token.textToLower + '.variable', token.text, token);
                newNode.setAccessModifier(accessModifier);
                newNode.setDefinitionModifier(definitionModifier);
                newNode.setParentNodeId(node.getId());
                newNode.setAnnotation(annotation);
                newNode.setDeep(node.getDeep() + 1);
                newNode.setStatic(staticKeyword);
                datatype.setId(newNode.getId() + '.datatype');
                nodesMap[datatype.getId()] = datatype;
                newNode.setDatatype(datatype);
                nodesMap[newNode.getId()] = newNode;
                node.addChild(newNode);
                node.addDeclaredVariable(newNode);
                resetModifiers();
            }
            index++;
        }
        Logger.logJSON('node', node);
    }

}
module.exports = Parser;

function resetModifiers() {
    accessModifier = undefined;
    definitionModifier = undefined;
    sharingModifier = undefined;
    staticKeyword = undefined;
    final = undefined;
    override = undefined;
    transient = undefined;
    testMethod = undefined;
    annotation = undefined;
    datatype = undefined;
}

function isDatatype(token) {
    return token && (token.type === TokenType.DATATYPE.COLLECTION || token.type === TokenType.DATATYPE.CUSTOM_CLASS || token.type === TokenType.DATATYPE.PRIMITIVE || token.type === TokenType.DATATYPE.SOBJECT || token.type === TokenType.DATATYPE.SUPPORT_CLASS || token.type === TokenType.DATATYPE.SUPPORT_NAMESPACE || token.type === TokenType.ENTITY.CLASS_MEMBER || token.type === TokenType.ENTITY.SUPPORT_CLASS_MEMBER);
}

function isAnnotation(token) {
    return token && token.type === TokenType.ANNOTATION.ENTITY;
}

function isConstructorDeclaration(token, nodeName) {
    return token && token.type === TokenType.DECLARATION.ENTITY.FUNCTION && nodeName && nodeName.toLowerCase() === token.textToLower;
}

function isMethodDeclaration(token) {
    return token && token.type === TokenType.DECLARATION.ENTITY.FUNCTION;
}

function isStaticConstructorDeclaration(token) {
    return token && token.type === TokenType.KEYWORD.DECLARATION.STATIC_CONSTRUCTOR;
}

function isVariableDeclaration(token) { 
    return token && token.type === TokenType.DECLARATION.ENTITY.VARIABLE;
}

function openBracket(token) {
    return token && token.type === TokenType.BRACKET.CURLY_OPEN;
}

function closeBracket(token) {
    return token && token.type === TokenType.BRACKET.CURLY_CLOSE;
}

function isAccessModifier(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.ACCESS;
}

function openCommentBlock(token) {
    return token && token.type === TokenType.COMMENT.BLOCK_START;
}

function closeCommentBlock(token) {
    return token && token.type === TokenType.COMMENT.BLOCK_END;
}

function isCommentLine(token) {
    return token && (token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC);
}

function isDefinitionModifier(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.DEFINITION;
}

function isSharingModifier(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.SHARING;
}

function isStatic(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.STATIC;
}

function isFinal(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.FINAL;
}

function isTestMethod(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.TEST_METHOD;
}

function isOverride(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.OVERRIDE;
}

function isTransient(token) {
    return token && token.type === TokenType.KEYWORD.MODIFIER.TRANSIENT;
}

function isClass(token) {
    return token && token.type === TokenType.DECLARATION.ENTITY.CLASS;
}

function isInterface(token) {
    return token && token.type === TokenType.DECLARATION.ENTITY.INTERFACE;
}

function isEnum(token) {
    return token && token.type === TokenType.DECLARATION.ENTITY.ENUM;
}

function isProperty(token) {
    return token && token.type === TokenType.DECLARATION.ENTITY.PROPERTY;
}

function isGetterAccessor(token) {
    return token && token.type === TokenType.KEYWORD.DECLARATION.PROPERTY_GETTER;
}

function isSetterAccessor(token) {
    return token && token.type === TokenType.KEYWORD.DECLARATION.PROPERTY_SETTER;
}

function isIfFlowControl(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.IF;
}

function isElseIfFlowControl(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE_IF;
}

function isElseFlowControl(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.ELSE;
}

function isForFlowControl(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.FOR;
}

function isForLoop(tokens, index) {
    let token = tokens[index];
    while (token && token.type !== TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE) {
        token = tokens[index];
        if (token.type === TokenType.PUNCTUATION.SEMICOLON)
            return true;
        index++;
    }
    return false;
}

function isWhileFlowControl(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.WHILE;
}

function isWhileFromDoWhile(tokens, index) {
    let token = tokens[index];
    while (token && token.type !== TokenType.BRACKET.PARENTHESIS_GUARD_CLOSE) {
        token = tokens[index];
        if (token.type === TokenType.PUNCTUATION.SEMICOLON)
            return true;
        index++;
    }
    token = tokens[index];
    if (token.type === TokenType.PUNCTUATION.SEMICOLON)
        return true;
    else
        return false;
}

function isDoWhile(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.DO;
}

function isTry(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.TRY;
}

function isCatch(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.CATCH;
}

function isFinally(token) {
    return token && token.type === TokenType.KEYWORD.FLOW_CONTROL.FINALLY;
}

function isRunAs(token) {
    return token && token.type === TokenType.ENTITY.SUPPORT_CLASS_FUNCTION && token.textToLower === 'runas';
}



function processMethodSignature(node, tokens, index) {
    index++;
    let token = tokens[index];
    let datatype;
    let paramName;
    let methodParams = [];
    let types = [];
    let params = [];
    while (token.type !== TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE) {
        token = tokens[index];
        if (!paramName && isDatatype(token)) {
            let newNode = new DatatypeNode(node.getId() + '.datatype.', '', token);
            index = processDatatype(newNode, tokens, index);
            newNode.setDeep(node.getDeep() + 1);
            newNode.setParentNodeId(node.getId());
            datatype = newNode;
        } else if (datatype && paramName && (token.type === TokenType.PUNCTUATION.COMMA || token.type === TokenType.BRACKET.PARENTHESIS_PARAM_CLOSE)) {
            types.push(datatype.getName());
            params.push(datatype.getName() + ' ' + paramName.text);
            methodParams.push({
                name: paramName,
                datatype: datatype
            });
            datatype = undefined;
            paramName = undefined;
        } else if (datatype) {
            paramName = token;
        }
        index++;
    }
    node.setSimplifiedSignature(node.getName() + '(' + types.join(', ') + ')');
    let signature = '';
    if (node.getAccessModifier())
        signature += node.getAccessModifier().textToLower + ' ';
    if (node.getDefinitionModifier())
        signature += node.getDefinitionModifier().textToLower + ' ';
    if (node instanceof MethodNode && node.getTestMethod())
        signature += node.getTestMethod().textToLower + ' ';
    if (node instanceof MethodNode && node.getWebService())
        signature += node.getWebService().textToLower + ' ';
    if (node instanceof MethodNode && node.getStatic())
        signature += node.getStatic().textToLower + ' ';
    if (node.getOverride())
        signature += node.getOverride().textToLower + ' ';
    signature += node.getReturn() + ' ' + node.getName().textToLower + '(' + params.join(', ') + ')';
    node.setSignature(signature);
    node.setId(node.getParentNodeId() + '.' + node.getSimplifiedSignature().toLowerCase() + '.function');
    for (const param of methodParams) {
        let newNode = new VariableNode(node.getId() + '.' + param.name.textToLower + '.param', param.name.text, param.name);
        datatype.setId(newNode.getId() + '.datatype');
        nodesMap[datatype.getId()] = datatype;
        newNode.setParentNodeId(node.getId());
        newNode.setDeep(node.getDeep() + 1);
        newNode.setDatatype(datatype);
        nodesMap[newNode.getId()] = newNode;
        node.addParam(newNode);
    }
    index--;
    return index;
}

function processAnnotation(node, tokens, index) {
    let nextToken = Utils.getNextToken(tokens, index);
    if (nextToken && nextToken.type === TokenType.BRACKET.ANNOTATION_PARAM_OPEN) {
        index++;
        let token = nextToken;
        let text = '';
        while (token.type !== TokenType.BRACKET.ANNOTATION_PARAM_CLOSE) {
            token = tokens[index];
            text += token.text;
            index++;
        }
        node.setText(text);
    }
    index--;
    return index;
}

function processCommentBlock(node, tokens, index) {
    let token = tokens[index];
    while (!closeCommentBlock(token)) {
        token = tokens[index];
        node.addToken(token);
        index++;
    }
    node.setEndToken(token);
    return index;
}

function processCommentLine(node, tokens, index) {
    let token = tokens[index];
    while (token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC || token.type === TokenType.COMMENT.CONTENT) {
        token = tokens[index];
        if (token.type === TokenType.COMMENT.LINE || token.type === TokenType.COMMENT.LINE_DOC || token.type === TokenType.COMMENT.CONTENT) {
            node.addToken(token);
            node.setEndToken(token);
            index++;
        }
    }
    index--;
    return index;
}

function processDatatype(node, tokens, index) {
    let endLoop = false;
    let bracketIndent = 0;
    let datatype = '';
    let token = tokens[index];
    while (!endLoop) {
        token = tokens[index];
        if (token.type === TokenType.BRACKET.PARAMETRIZED_TYPE_OPEN)
            bracketIndent++;
        else if (token.type === TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE)
            bracketIndent--;
        endLoop = !isDatatype(token) && token.type !== TokenType.BRACKET.PARAMETRIZED_TYPE_OPEN && token.type !== TokenType.BRACKET.PARAMETRIZED_TYPE_CLOSE && token.type !== TokenType.BRACKET.SQUARE_OPEN && token.type !== TokenType.BRACKET.SQUARE_CLOSE && token.type !== TokenType.PUNCTUATION.OBJECT_ACCESSOR && token.type !== TokenType.PUNCTUATION.COMMA && bracketIndent === 0;
        if (!endLoop) {
            datatype += token.text;
            node.setEndToken(token);
            index++;
        }
    }
    node.setName(datatype);
    node.setDatatypeText(datatype);
    index--;
    return index;
}