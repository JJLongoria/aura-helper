const logger = require('../main/logger');
const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const Utils = require('./Utils').Utils;
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;

const apexKeywords = [
    "abstract",
    "and",
    "any",
    "activate",
    "array",
    "as",
    "asc",
    "autonomous",
    "begin",
    "bigdecimal",
    "blob",
    "break",
    "bulk",
    "by",
    "byte",
    "case",
    "cast",
    "catch",
    "char",
    "class",
    "collect",
    "commit",
    "const",
    "continue",
    "convertcurrency",
    "decimal",
    "default",
    "delete",
    "desc",
    "do",
    "else",
    "end",
    "enum",
    "exception",
    "exit",
    "export",
    "extends",
    "false",
    "final",
    "finally",
    "float",
    "for",
    "from",
    "future",
    "global",
    "goto",
    "group",
    "having",
    "hint",
    "if",
    "implements",
    "import",
    "in",
    "inner",
    "insert",
    "instanceof",
    "interface",
    "into",
    "int",
    "join",
    "last_90_days",
    "last_month",
    "last_n_days",
    "last_week",
    "like",
    "limit",
    "list",
    "long",
    "loop",
    "map",
    "merge",
    "new",
    "next_90_days",
    "next_month",
    "next_n_days",
    "next_week",
    "not",
    "null",
    "nulls",
    "number",
    "object",
    "of",
    "on",
    "or",
    "outer",
    "override",
    "package",
    "parallel",
    "pragma",
    "private",
    "protected",
    "public",
    "switch",
    "synchronized",
    "system",
    "testmethod",
    "then",
    "this",
    "this_month",
    "this_week",
    "throw",
    "today",
    "tolabel",
    "tomorrow",
    "transaction",
    "trigger",
    "true",
    "try",
    "type",
    "undelete",
    "update",
    "upsert",
    "using",
    "virtual",
    "webservice",
    "when",
    "where",
    "while",
    "yesterday",
];

class ApexParser {

    static getClassBaseStructure() {
        return {
            accessModifier: "",
            definitionModifier: "",
            withSharing: true,
            inheritedSharing: false,
            name: "",
            implements: [],
            extendsType: "",
            isInterface: false,
            isEnum: false,
            enumValues: [],
            commenTokens: [],
            classes: {},
            enums: {},
            fields: [],
            methods: [],
            constructors: [],
            inheritedClasses: {},
            inheritedEnums: {},
            inheritedFields: [],
            inheritedMethods: [],
            inheritedConstructors: [],
            posData: undefined
        };
    }

    static parse(content, position) {
        let tokens = Tokenizer.tokenize(content);
        let fileStructure = this.getClassBaseStructure();
        let index = 0;
        let bracketIndent = 0;
        let accessModifier;
        let isStatic = false;
        let isFinal = false;
        let isAbstract = false;
        let isVirtual = false;
        let definitionModifier;
        let withSharing = true;
        let inheritedSharing = false;
        let annotation;
        let override;
        let commentTokens = [];
        let dataTypeIndexStart;
        let dataTypeIndexEnd;
        let activeClassName = "";
        let activeEnumName = "";
        let testMethod;
        let transient;
        let positionData;
        while (index < tokens.length) {
            let lastToken = Utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let twoNextToken = Utils.getTwoNextToken(tokens, index);
            if (token.tokenType === TokenType.LBRACKET) {
                bracketIndent++;
            }
            else if (token.tokenType === TokenType.RBRACKET) {
                bracketIndent--;
                if (bracketIndent === 1)
                    activeClassName = fileStructure.name;
            }
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
                if (positionData) {
                    positionData.isOnClass = true;
                }
            }
            if (this.isOnText(lastToken, token, nextToken)) {
                let data = this.getText(tokens, index, position);
                index = data.index;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
            } else if (this.isOnCommentLine(token, nextToken)) {
                let data = this.getCommentLine(tokens, index, position);
                index = data.index;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
                dataTypeIndexStart = index;
            } else if (this.isOnCommentBlock(token, nextToken)) {
                let data = this.getCommentBlock(tokens, index, position);
                index = data.index;
                commentTokens = data.commenTokens;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
                dataTypeIndexStart = index;
            } else if (this.isOnAnnotation(token, bracketIndent)) {
                let data = this.getAnnotation(tokens, index, position);
                index = data.index;
                annotation = data.annotation;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
                dataTypeIndexStart = index;
            } else if (this.isAccessModifier(token)) {
                accessModifier = token.content;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isDefinitionModifier(token)) {
                definitionModifier = token.content;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isWithoutSharing(token, nextToken)) {
                withSharing = false;
                inheritedSharing = false;
                dataTypeIndexStart = index + 1;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isInheritedSharing(token, nextToken)) {
                withSharing = false;
                inheritedSharing = true;
                dataTypeIndexStart = index + 1;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isStatic(token)) {
                isStatic = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isFinal(token)) {
                isFinal = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isOverride(token)) {
                override = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isAbstract(token)) {
                isAbstract = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isVirtual(token)) {
                isVirtual = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isTestMethod(token)) {
                testMethod = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isTransient(token)) {
                transient = true;
                dataTypeIndexStart = index;
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isEnum(token, nextToken)) {
                activeEnumName = nextToken.content;
                let data = this.getEnumValues(tokens, index, position);
                if (data.positionData)
                    positionData = data.positionData;
                index = data.index;
                if (bracketIndent === 0) {
                    fileStructure.name = activeEnumName;
                    fileStructure.isInterface = this.isInterface(token, nextToken);
                    fileStructure.accessModifier = accessModifier;
                    fileStructure.definitionModifier = definitionModifier;
                    fileStructure.withSharing = withSharing && !inheritedSharing;
                    fileStructure.inheritedSharing = !withSharing && inheritedSharing;
                    fileStructure.commenTokens = commentTokens;
                    fileStructure.annotation = annotation;
                    fileStructure.line = token.line;
                    fileStructure.column = token.startColumn;
                    fileStructure.abstract = isAbstract;
                    fileStructure.virtual = token.isVirtual;
                    fileStructure.isEnum = true;
                    fileStructure.enumValues = data.enumValues;
                } else if (bracketIndent === 1 && activeClassName && activeClassName === fileStructure.name) {
                    fileStructure.enums[activeEnumName] = this.getClassBaseStructure();
                    fileStructure.enums[activeEnumName].isEnum = true;
                    fileStructure.enums[activeEnumName].enumValues = data.enumValues;
                } else if (bracketIndent === 2 && fileStructure.classes[activeClassName]) {
                    fileStructure.classes[activeClassName].enums[activeEnumName] = this.getClassBaseStructure();
                    fileStructure.classes[activeClassName].enums[activeEnumName].isEnum = true;
                    fileStructure.classes[activeClassName].enums[activeEnumName].enumValues = data.enumValues;
                }
            } else if (this.isClass(token, nextToken) || this.isInterface(token, nextToken)) {
                activeClassName = nextToken.content;
                if (bracketIndent === 0) {
                    fileStructure.name = activeClassName;
                    fileStructure.isInterface = this.isInterface(token, nextToken);
                    fileStructure.accessModifier = accessModifier;
                    fileStructure.definitionModifier = definitionModifier;
                    fileStructure.withSharing = withSharing && !inheritedSharing;
                    fileStructure.inheritedSharing = !withSharing && inheritedSharing;
                    fileStructure.commenTokens = commentTokens;
                    fileStructure.annotation = annotation;
                    fileStructure.line = token.line;
                    fileStructure.column = token.startColumn;
                    fileStructure.abstract = isAbstract;
                    fileStructure.virtual = token.isVirtual;
                } else if (bracketIndent === 1 && !this.isEnum(token, nextToken)) {
                    fileStructure.classes[activeClassName] = this.getClassBaseStructure();
                    fileStructure.classes[activeClassName].name = activeClassName;
                    fileStructure.classes[activeClassName].accessModifier = accessModifier;
                    fileStructure.classes[activeClassName].definitionModifier = definitionModifier;
                    fileStructure.classes[activeClassName].withSharing = withSharing && !inheritedSharing;
                    fileStructure.classes[activeClassName].inheritedSharing = !withSharing && inheritedSharing;
                    fileStructure.classes[activeClassName].annotation = annotation;
                    fileStructure.classes[activeClassName].isInterface = this.isInterface(token, nextToken);
                    fileStructure.classes[activeClassName].commenTokens = commentTokens;
                    fileStructure.classes[activeClassName].line = token.line;
                    fileStructure.classes[activeClassName].column = token.startColumn;
                    fileStructure.classes[activeClassName].abstract = isAbstract;
                    fileStructure.classes[activeClassName].virtual = token.isVirtual;
                }
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
                commentTokens = [];
                accessModifier = undefined;
                definitionModifier = undefined;
                withSharing = true;
                inheritedSharing = false;
                isStatic = undefined;
                isFinal = undefined;
                isAbstract = false;
                isVirtual = false;
                annotation = undefined;
                override = undefined;
                testMethod = undefined;
                transient = false;
            } else if (this.isOnImplements(token)) {
                let data = this.getInterfaces(tokens, index, position);
                index = data.index;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
                if (bracketIndent === 0) {
                    fileStructure.implements = data.interfaces;
                } else {
                    fileStructure.classes[activeClassName].implements = data.interfaces;
                }
            } else if (this.isOnExtends(token)) {
                let data = this.getExtends(tokens, index, position);
                index = data.index;
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.isOnClass = true;
                }
                if (bracketIndent === 0) {
                    fileStructure.extendsType = data.extendsName;
                } else {
                    fileStructure.classes[activeClassName].extendsType = data.extendsName;
                }
            } else if (this.isOnVariableDeclaration(lastToken, token, nextToken, twoNextToken)) {
                dataTypeIndexEnd = index;
                let variable = {
                    name: token.content,
                    datatype: this.getDataType(dataTypeIndexStart + 1, dataTypeIndexEnd, tokens),
                    line: token.line,
                    column: token.startColumn,
                    accessModifier: accessModifier,
                    definitionModifier: definitionModifier,
                    isStatic: isStatic,
                    isFinal: isFinal,
                    transient: transient,
                };
                if (bracketIndent === 1) {
                    fileStructure.fields.push(variable);
                } else if (bracketIndent === 2 && fileStructure.classes[activeClassName]) {
                    fileStructure.classes[activeClassName].fields.push(variable);
                }
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
                if (nextToken.tokenType === TokenType.COMMA) {
                    index++;
                    token = tokens[index];
                    while (token.tokenType !== TokenType.SEMICOLON) {
                        token = tokens[index];
                        nextToken = Utils.getNextToken(tokens, index);
                        if (token.tokenType === TokenType.IDENTIFIER) {
                            let variable = {
                                name: token.content,
                                datatype: this.getDataType(dataTypeIndexStart + 1, dataTypeIndexEnd, tokens),
                                line: token.line,
                                column: token.startColumn,
                                accessModifier: accessModifier,
                                definitionModifier: definitionModifier,
                                isStatic: isStatic,
                                isFinal: isFinal,
                                transient: transient,
                            };
                            if (bracketIndent === 1) {
                                fileStructure.fields.push(variable);
                            } else if (bracketIndent === 2 && fileStructure.classes[activeClassName]) {
                                fileStructure.classes[activeClassName].fields.push(variable);
                            }
                        }
                        if (this.isOnPosition(position, lastToken, token, nextToken)) {
                            positionData = this.getPositionData(position, token, nextToken);
                            if (positionData) {
                                positionData.isOnClass = true;
                            }
                        }
                        index++;
                    }
                }
                commentTokens = [];
                accessModifier = undefined;
                definitionModifier = undefined;
                withSharing = true;
                inheritedSharing = false;
                isStatic = undefined;
                isFinal = undefined;
                isAbstract = false;
                isVirtual = false;
                annotation = undefined;
                override = undefined;
                testMethod = undefined;
                transient = false;

            } else if (this.isOnConstructorDeclaration(lastToken, token, nextToken, activeClassName)) {
                let data = this.getMethodData(tokens, undefined, index, position);
                data.method.commentTokens = commentTokens;
                data.method.annotation = annotation;
                data.method.accesssModifier = accessModifier;
                data.method.definitionModifier = definitionModifier;
                data.method.override = override;
                data.method.testMethod = testMethod;
                data.method.abstract = isAbstract;
                data.method.virtual = isVirtual;
                data.method.signature = this.getMethodSignature(data.method);
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.methodSignature = data.method.signature;
                }
                index = data.index;
                if (bracketIndent === 1) {
                    fileStructure.constructors.push(data.method);
                } else {
                    fileStructure.classes[activeClassName].constructors.push(data.method);
                }
                commentTokens = [];
                accessModifier = undefined;
                definitionModifier = undefined;
                withSharing = true;
                inheritedSharing = false;
                isStatic = undefined;
                isFinal = undefined;
                isAbstract = false;
                isVirtual = false;
                annotation = undefined;
                override = undefined;
                testMethod = undefined;
                transient = false;
            } else if (this.isOnMethodDeclaration(lastToken, token, nextToken)) {
                dataTypeIndexEnd = index;
                let data = this.getMethodData(tokens, this.getDataType(dataTypeIndexStart + 1, dataTypeIndexEnd, tokens), index, position);
                data.method.commentTokens = commentTokens;
                data.method.annotation = annotation;
                data.method.accesssModifier = accessModifier;
                data.method.definitionModifier = definitionModifier;
                data.method.override = override;
                data.method.testMethod = testMethod;
                data.method.abstract = isAbstract;
                data.method.virtual = isVirtual;
                data.method.signature = this.getMethodSignature(data.method);
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.methodSignature = data.method.signature;
                }
                index = data.index;
                if (bracketIndent === 1) {
                    fileStructure.methods.push(data.method);
                } else {
                    fileStructure.classes[activeClassName].methods.push(data.method);
                }
                commentTokens = [];
                accessModifier = undefined;
                definitionModifier = undefined;
                withSharing = true;
                inheritedSharing = false;
                isStatic = undefined;
                isFinal = undefined;
                isAbstract = false;
                isVirtual = false;
                annotation = undefined;
                override = undefined;
                testMethod = undefined;
                transient = false;
            }
            index++;
        }
        fileStructure.posData = positionData;
        return fileStructure;
    }

    static getEnumValues(tokens, index, position) {
        let token = tokens[index];
        let lastToken = Utils.getLastToken(tokens, index);
        let nextToken = Utils.getNextToken(tokens, index);
        let enumValues = [];
        let startValues = false;
        let positionData;
        while (token.tokenType !== TokenType.RBRACKET) {
            lastToken = Utils.getLastToken(tokens, index);
            token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
                if (positionData) {
                    positionData.isOnEnum = true;
                }
            }
            if (startValues && token.tokenType !== TokenType.RBRACKET && token.tokenType === TokenType.IDENTIFIER)
                enumValues.push({
                    name: token.content,
                    line: token.line,
                    column: token.startColumn
                });
            if (token.tokenType === TokenType.LBRACKET)
                startValues = true;
            index++;
        }
        return {
            index: index,
            positionData: positionData,
            enumValues: enumValues
        }
    }

    static getInterfaces(tokens, index, position) {
        var interfaceName = "";
        let token = tokens[index];
        let aBracketIndent = 0;
        let interfaces = [];
        let positionData;
        while (token.content.toLowerCase() !== 'extends' && token.tokenType !== TokenType.LBRACKET) {
            token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let lastToken = Utils.getLastToken(tokens, index);
            if (token.tokenType === TokenType.LABRACKET) {
                aBracketIndent++;
            }
            else if (token.tokenType === TokenType.RABRACKET) {
                aBracketIndent--;
            }
            if (token.tokenType === TokenType.COMMA && aBracketIndent == 0) {
                interfaces.push(interfaceName);
                interfaceName = "";
            } else if (token.content.toLowerCase() !== 'implements' && token.tokenType !== TokenType.LBRACKET) {
                interfaceName += token.content;
            }
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            index++;
        }
        interfaces.push(interfaceName);
        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends')
            index = index - 2;
        if (token.tokenType === TokenType.LBRACKET)
            index = index - 2;
        return {
            index: index,
            interfaces: interfaces,
            positionData: positionData
        };
    }

    static getMethodData(tokens, datatype, index, position) {
        let token = tokens[index];
        let method = {
            name: token.content,
            datatype: datatype,
            params: [],
            declaredVariables: [],
            bodyTokens: [],
            commentTokens: [],
            isConstructor: (datatype === undefined),
            line: token.line,
            column: token.startColumn
        };
        let bracketIndent = 0;
        let parenIndent = 0;
        let startDatatypeIndex;
        let endDataTypeIndex;
        let endLoop = false;
        let positionData;
        while (!endLoop) {
            let lastToken = Utils.getLastToken(tokens, index);
            token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let twoNextToken = Utils.getTwoNextToken(tokens, index);
            if (token.tokenType === TokenType.LBRACKET)
                bracketIndent++;
            else if (token.tokenType === TokenType.RBRACKET)
                bracketIndent--;
            if (bracketIndent === 0)
                method.bodyTokens.push(token);
            if (token.tokenType === TokenType.LBRACKET || token.tokenType === TokenType.SEMICOLON || token.tokenType === TokenType.LPAREN)
                startDatatypeIndex = index;
            if (token.tokenType === TokenType.LPAREN)
                parenIndent++;
            else if (token.tokenType === TokenType.RPAREN)
                parenIndent--;

            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
                if (positionData) {
                    if (bracketIndent === 0 && parenIndent === 1)
                        positionData.isOnMethodParams = true;
                    else if (bracketIndent === 0)
                        positionData.isOnClass = true;
                    else
                        positionData.isOnMethod = true;
                }
            }
            if (bracketIndent == 0 && parenIndent == 1) {
                if (this.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnMethodParams = true;
                    }
                }
                if (token.tokenType === TokenType.COMMA) {
                    startDatatypeIndex = index;
                }
                else if (this.isOnMethodParam(token, nextToken)) {
                    endDataTypeIndex = index;
                    let param = {
                        name: token.content,
                        datatype: this.getDataType(startDatatypeIndex + 1, endDataTypeIndex, tokens),
                        line: token.line,
                        column: token.startColumn
                    };
                    method.params.push(param);
                }
            } else if (bracketIndent > 0) {
                if (this.isOnText(lastToken, token, nextToken)) {
                    let data = this.getText(tokens, index, position);
                    index = data.index;
                    if (data.positionData) {
                        positionData = data.positionData;
                        positionData.isOnMethod = true;
                    }
                    let textTokens = data.textTokens;
                    for (const textToken of textTokens) {
                        method.bodyTokens.push(textToken);
                    }
                } else if (this.isOnCommentLine(token, nextToken)) {
                    let data = this.getCommentLine(tokens, index, position);
                    index = data.index;
                    startDatatypeIndex = index;
                    if (data.positionData) {
                        positionData = data.positionData;
                        positionData.isOnMethod = true;
                    }
                    let commentTokens = data.commenTokens;
                    for (const commentToken of commentTokens) {
                        method.bodyTokens.push(commentToken);
                    }
                } else if (this.isOnCommentBlock(token, nextToken)) {
                    let data = this.getCommentBlock(tokens, index, position);
                    index = data.index;
                    startDatatypeIndex = index;
                    if (data.positionData) {
                        positionData = data.positionData;
                        positionData.isOnMethod = true;
                    }
                    let commentTokens = data.commenTokens;
                    for (const commentToken of commentTokens) {
                        method.bodyTokens.push(commentToken);
                    }
                } else if (this.isOnVariableDeclaration(lastToken, token, nextToken, twoNextToken)) {
                    endDataTypeIndex = index;
                    let variable = {
                        name: token.content,
                        datatype: this.getDataType(startDatatypeIndex + 1, endDataTypeIndex, tokens),
                        line: token.line,
                        column: token.startColumn
                    };
                    method.declaredVariables.push(variable);
                    if (nextToken.tokenType === TokenType.COMMA) {
                        index++;
                        token = tokens[index];
                        while (token.tokenType !== TokenType.SEMICOLON) {
                            token = tokens[index];
                            if (token.tokenType === TokenType.IDENTIFIER) {
                                let variable = {
                                    name: token.content,
                                    datatype: this.getDataType(startDatatypeIndex + 1, endDataTypeIndex, tokens),
                                    line: token.line,
                                    column: token.startColumn
                                };
                                method.declaredVariables.push(variable);
                            }
                            index++;
                            method.bodyTokens.push(token);
                            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                                positionData = this.getPositionData(position, token, nextToken);
                                if (positionData) {
                                    positionData.isOnMethod = true;
                                }
                            }
                        }
                    } else {
                        method.bodyTokens.push(token);
                        if (this.isOnPosition(position, lastToken, token, nextToken)) {
                            positionData = this.getPositionData(position, token, nextToken);
                            if (positionData) {
                                positionData.isOnMethod = true;
                            }
                        }
                    }
                } else {
                    method.bodyTokens.push(token);
                    if (this.isOnPosition(position, lastToken, token, nextToken)) {
                        positionData = this.getPositionData(position, token, nextToken);
                        if (positionData) {
                            positionData.isOnMethod = true;
                        }
                    }
                }
            }
            if (bracketIndent === 0 && (token.tokenType === TokenType.RBRACKET || token.tokenType === TokenType.SEMICOLON))
                endLoop = true;
            index++;
        }
        index--;
        return {
            index: index,
            method: method,
            positionData: positionData
        };
    }

    static getExtends(tokens, index, position) {
        var extendsName = "";
        let token = tokens[index];
        let positionData;
        while (token.tokenType !== TokenType.LBRACKET) {
            token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let lastToken = Utils.getLastToken(tokens, index);
            if (token.tokenType !== TokenType.LBRACKET && token.content.toLowerCase() !== 'extends')
                extendsName += token.content;
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            index++;
        }
        if (token.tokenType === TokenType.LBRACKET)
            index = index - 2;
        return {
            extendsName: extendsName,
            index: index,
            positionData: positionData
        };
    }

    static getCommentLine(tokens, index, position) {
        let commenTokens = [];
        let token = tokens[index];
        let nextToken = Utils.getNextToken(tokens, index);
        let lastToken = Utils.getLastToken(tokens, index);
        let positionData;
        if (this.isOnPosition(position, lastToken, token, nextToken)) {
            positionData = this.getPositionData(position, token, nextToken);
        }
        while (token && nextToken && token.line == nextToken.line) {
            token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            commenTokens.push(token);
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            index++;
        }
        index--;
        return {
            index: index,
            commenTokens: commenTokens,
            positionData
        };
    }

    static getText(tokens, index, position) {
        let textTokens = [];
        let token = tokens[index];
        let nextToken = Utils.getNextToken(tokens, index);
        let lastToken = Utils.getLastToken(tokens, index);
        textTokens.push(token);
        let positionData;
        if (this.isOnPosition(position, lastToken, token, nextToken)) {
            positionData = this.getPositionData(position, token, nextToken);
        }
        index++;
        let endText = false;
        while (!endText) {
            let lastToken = Utils.getLastToken(tokens, index);
            nextToken = Utils.getNextToken(tokens, index);
            token = tokens[index];
            textTokens.push(token);
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            if (token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH)
                endText = true;
            else
                index++;
        }
        return {
            index: index,
            textTokens: textTokens,
            positionData: positionData
        };
    }

    static getCommentBlock(tokens, index, position) {
        let endComment = false;
        let commenTokens = [];
        let nextToken;
        let positionData;
        while (!endComment) {
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let lastToken = Utils.getLastToken(tokens, index);
            commenTokens.push(token);
            endComment = token.tokenType === TokenType.OPERATOR && token.content === '*' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/';
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            index++;
        }
        if (nextToken)
            commenTokens.push(nextToken);
        return {
            index: index,
            commenTokens: commenTokens,
            positionData: positionData
        };
    }

    static getAnnotation(tokens, index, position) {
        let annotation = "";
        let token = tokens[index];
        let nextToken = Utils.getNextToken(tokens, index);
        let lastToken = Utils.getLastToken(tokens, index);
        let positionData;
        while (token.line == nextToken.line) {
            token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            lastToken = Utils.getLastToken(tokens, index);
            annotation += token.content;
            if (this.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            index++;
        }
        return {
            index: index,
            annotation: annotation
        };
    }

    static getPositionData(position, token, nextToken) {
        let positionData;
        if (token.startColumn <= position.character && position.character <= token.endColumn) {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
            let startIndex = position.character - token.startColumn;
            positionData.startPart = token.content.substring(0, startIndex + 1);
            positionData.endPart = token.content.substring(startIndex + 1, token.content.length - 1);
        } else if (token.endColumn <= position.character && position.character <= nextToken.startColumn) {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
            positionData.startPart = token.content;
        } else {
            if (positionData === undefined)
                positionData = {
                    startPart: undefined,
                    endPart: undefined,
                    isOnClass: undefined,
                    isOnMethod: undefined,
                    isOnMethodParams: undefined,
                    isOnEnum: undefined,
                    methodSignature: undefined
                };
        }
        return positionData;
    }

    static isOnPosition(position, lastToken, token, nextToken) {
        if (position && token.line == position.line) {
            if (token.startColumn <= position.character && position.character <= nextToken.startColumn)
                return true;
        } else if (position && lastToken && lastToken.line < position.line && nextToken && position.line < nextToken.line) {
            return true;
        }
        return false;
    }

    static isOnAnnotation(token, bracketIndent) {
        return (bracketIndent === 0 || bracketIndent === 1) && token.tokenType === TokenType.AT;
    }

    static isOnCommentLine(token, nextToken) {
        return token.tokenType === 'operator' && token.content === "/" && nextToken && nextToken.tokenType === 'operator' && nextToken.content === "/";
    }

    static isOnCommentBlock(token, nextToken) {
        return token.tokenType === TokenType.OPERATOR && token.content === '/' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '*';
    }

    static isOnMethodParam(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && (nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.RPAREN) && !apexKeywords.includes(token.content.toLowerCase());
    }

    static isOnVariableDeclaration(lastToken, token, nextToken, twoNextToken) {
        if (lastToken && (lastToken.tokenType === TokenType.IDENTIFIER || lastToken.tokenType === TokenType.RABRACKET || lastToken.tokenType === TokenType.RSQBRACKET) && token.tokenType === TokenType.IDENTIFIER && nextToken && (nextToken.tokenType === TokenType.EQUAL || nextToken.tokenType === TokenType.SEMICOLON || nextToken.tokenType === TokenType.LBRACKET || nextToken.tokenType === TokenType.COLON) && !apexKeywords.includes(token.content.toLowerCase()) && !apexKeywords.includes(lastToken.content.toLowerCase()))
            return true;
        else if (lastToken && (lastToken.tokenType === TokenType.IDENTIFIER || lastToken.tokenType === TokenType.RABRACKET || lastToken.tokenType === TokenType.RSQBRACKET) && token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.COMMA && twoNextToken && twoNextToken.tokenType === TokenType.IDENTIFIER && !apexKeywords.includes(token.content.toLowerCase()) && !apexKeywords.includes(lastToken.content.toLowerCase()))
            if (lastToken.content.toLowerCase() !== 'select')
                true;
        return false;
    }

    static isOnMethodDeclaration(lastToken, token, nextToken) {
        return lastToken && (lastToken.tokenType === TokenType.IDENTIFIER || lastToken.tokenType === TokenType.RABRACKET || lastToken.tokenType === TokenType.RSQBRACKET) && lastToken.content.toLowerCase() !== 'new' && token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.LPAREN && !apexKeywords.includes(token.content.toLowerCase());
    }

    static isOnConstructorDeclaration(lastToken, token, nextToken, className) {
        return lastToken && lastToken.content.toLowerCase() !== "new" && token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.LPAREN && token.content.toLowerCase() === className.toLowerCase();
    }

    static isOnImplements(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'implements';
    }

    static isOnExtends(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends';
    }

    static isOnText(lastToken, token, nextToken) {
        return token.tokenType === TokenType.SQUOTTE && nextToken && nextToken.tokenType != TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH && lastToken.tokenType !== TokenType.SQUOTTE;
    }

    static isAccessModifier(token) {
        return token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private' || token.content.toLowerCase() === 'protected' || token.content.toLowerCase() === 'webservice');
    }

    static isDefinitionModifier(token) {
        return token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'abstract' || token.content.toLowerCase() === 'virtual');
    }

    static isFinal(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "final";
    }

    static isStatic(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "static";
    }

    static isTransient(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "transient";
    }

    static isTestMethod(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "testmethod";
    }

    static isOverride(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "override";
    }

    static isAbstract(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "abstract";
    }

    static isVirtual(token) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === "virtual";
    }

    static isWithoutSharing(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'without' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'sharing';
    }

    static isInheritedSharing(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'inherited' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'sharing';
    }

    static isClass(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'class' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER;
    }

    static isEnum(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'enum' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER;
    }

    static isInterface(token, nextTokentoken, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'interface' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER;
    }

    static parseForComment(content) {
        var data = {
            classData: {
                modifier: undefined,
                isAbstract: false,
                isVirtual: false,
                interfaces: [],
                extendsFrom: undefined,
                name: undefined,
                withSharing: true,

            },
            methodData: {
                annotation: undefined,
                name: undefined,
                isStatic: false,
                isFinal: false,
                isAbstract: false,
                isVirtual: false,
                params: [],
                returnType: undefined,
                signature: undefined
            }
        }
        let parenIndent = 0;
        let aBracketIndent = 0;
        let returnIndexStart = 0;
        let returnIndexEnd = 0;
        let tokens = Tokenizer.tokenize(content);
        let index = 0;
        let isClass = content.toLowerCase().indexOf(' class ') !== -1;
        let endLoop = false;
        while (!endLoop) {
            let token = tokens[index];
            let lastToken = Utils.getLastToken(tokens, index);
            let nextToken = Utils.getNextToken(tokens, index);
            if (token.tokenType !== TokenType.SEMICOLON && token.tokenType !== TokenType.LBRACKET) {
                if (isClass) {
                    if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private'))
                        data.classData.modifier = token.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'without' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'sharing')
                        data.classData.withSharing = false;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'class' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER)
                        data.classData.name = nextToken.content;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract')
                        data.classData.isAbstrac = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual')
                        data.classData.isVirtual = true;
                    else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'implements') {
                        var interfaceName = "";
                        while (token.content !== 'extends' || token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if (token.tokenType === TokenType.COMMA && aBracketIndent == 0) {
                                data.classData.interfaces.push(interfaceName);
                                interfaceName = "";
                            } else {
                                interfaceName += token.content;
                            }
                            index++;
                        }
                        if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                            var extendsName = "";
                            while (token.tokenType !== TokenType.LBRACKET) {
                                token = tokens[index];
                                if (token.tokenType !== TokenType.LBRACKET)
                                    extendsName += token.content;
                                index++;
                            }
                            data.classData.extendsFrom = extendsName;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
                        var extendsName = "";
                        while (token.tokenType !== TokenType.LBRACKET) {
                            token = tokens[index];
                            if (token.tokenType !== TokenType.LBRACKET)
                                extendsName += token.content;
                            index++;
                        }
                        data.classData.extendsFrom = extendsName;
                    }
                } else {
                    if (token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'public' || token.content.toLowerCase() === 'global' || token.content.toLowerCase() === 'private' || token.content.toLowerCase() === 'webservice' || token.content.toLowerCase() === 'protected')) {
                        data.methodData.modifier = token.content;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'abstract') {
                        data.methodData.isAbstrac = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'virtual') {
                        data.methodData.isVirtual = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'static') {
                        data.methodData.isStatic = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'final') {
                        data.methodData.isFinal = true;
                        returnIndexStart = index + 1;
                    } else if (token.tokenType === TokenType.AT && nextToken && nextToken.tokenType === TokenType.IDENTIFIER) {
                        data.methodData.annotation = "@";
                        while (token.line == nextToken.line) {
                            index++;
                            token = tokens[index];
                            nextToken = Utils.getNextToken(tokens, index);
                            data.methodData.annotation += token.content;
                        }
                    } else if (token.tokenType === TokenType.IDENTIFIER && nextToken && nextToken.tokenType === TokenType.LPAREN) {
                        returnIndexEnd = index;
                        data.methodData.name = token.content;
                        let param = {
                            name: "",
                            type: ""
                        };
                        while (token.tokenType !== TokenType.RPAREN) {
                            token = tokens[index];
                            lastToken = Utils.getLastToken(tokens, index);
                            nextToken = Utils.getNextToken(tokens, index);
                            if (token.tokenType === TokenType.LPAREN) {
                                parenIndent++;
                            }
                            else if (token.tokenType === TokenType.RPAREN) {
                                parenIndent--;
                            }
                            else if (token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if ((nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.RPAREN) && token.tokenType !== TokenType.LPAREN && aBracketIndent == 0) {
                                param.name = token.content;
                                data.methodData.params.push(param);
                                param = {
                                    name: "",
                                    type: ""
                                };
                            } else if (parenIndent > 0 && token.tokenType !== TokenType.LPAREN && token.tokenType !== TokenType.COMMA) {
                                param.type += token.content;
                            }
                            index++;
                        }
                        index--;
                        if (!data.methodData.modifier)
                            data.methodData.modifier = 'public';
                        data.methodData.returnType = ApexParser.getDataType(returnIndexStart, returnIndexEnd, tokens);
                        data.methodData.signature = data.methodData.modifier;
                        if (data.methodData.isStatic)
                            data.methodData.signature += ' static';
                        if (data.methodData.isAbstrac)
                            data.methodData.signature += ' abstract';
                        if (data.methodData.isVirtual)
                            data.methodData.signature += ' virtual'
                        if (data.methodData.isVirtual)
                            data.methodData.signature += ' virtual'
                        if (data.methodData.returnType)
                            data.methodData.signature += ' ' + data.methodData.returnType;
                        else
                            data.methodData.signature += ' void';
                        data.methodData.signature += ' ' + data.methodData.name + '(';
                        let params = [];
                        for (const param of data.methodData.params) {
                            params.push(param.type + ' ' + param.name);
                        }
                        data.methodData.signature += params.join(', ');
                        data.methodData.signature += ')';
                    }
                }
            }
            else {
                endLoop = true;
            }
            index++;
        }
        return data;
    }

    static getDataType(indexStart, indexEnd, tokens) {
        let returnType = '';
        if (tokens[indexStart] && tokens[indexStart].tokenType === TokenType.RBRACKET)
            indexStart++;
        for (let index = indexStart; index < indexEnd; index++) {
            returnType += tokens[index].content;
        }
        return returnType;
    }

    static getParentData(classStructure, parentClass, filePath) {
        if (parentClass.extendsType && parentClass.extendsType.length > 0) {
            let extendsType = parentClass.extendsType;
            if (extendsType.indexOf('<') !== -1)
                extendsType = extendsType.split('<')[0];
            if (extendsType.indexOf('[') !== -1)
                extendsType = extendsType.split('[')[0];
            let className = extendsType + ".cls";
            let systemClassName = extendsType + ".json";
            let userClassPath = Paths.getBasename(filePath) + "/" + className;
            let systemClassPath = Paths.getSystemClassesPath() + "/" + systemClassName;
            if (FileChecker.isExists(userClassPath)) {
                parentClass = ApexParser.parse(FileReader.readFileSync(userClassPath));
            } else if (FileChecker.isExists(systemClassPath)) {
                parentClass = JSON.parse(FileReader.readFileSync(systemClassPath));
            }
            classStructure = this.getParentData(classStructure, parentClass, filePath);
        } else if (parentClass.implements.length > 0) {
            for (let implement of parentClass.implements) {
                if (implement.indexOf('<') !== -1)
                    implement = implement.split('<')[0];
                if (implement.indexOf('[') !== -1)
                    implement = implement.split('[')[0];
                let className = implement + ".cls";
                let systemClassName = implement + ".json";
                let userClassPath = Paths.getBasename(filePath) + "/" + className;
                let systemClassPath = Paths.getSystemClassesPath() + "/" + systemClassName;
                if (FileChecker.isExists(userClassPath)) {
                    parentClass = ApexParser.parse(FileReader.readFileSync(userClassPath));
                } else if (FileChecker.isExists(systemClassPath)) {
                    parentClass = JSON.parse(FileReader.readFileSync(systemClassPath));
                }
                classStructure = this.getParentData(classStructure, parentClass, filePath);
            }
        } else {
            if (parentClass && parentClass.name !== classStructure.name) {
                if (parentClass.fields && parentClass.fields.length > 0) {
                    for (const field of parentClass.fields) {
                        let exists = false;
                        for (const existingField of classStructure.fields) {
                            if (field.name.toLowerCase() === existingField.name.toLowerCase()) {
                                exists = true;
                                break;
                            }
                        }
                        classStructure.inheritedFields.push(field);
                        if (!exists)
                            classStructure.fields.push(field);
                    }
                }
                if (parentClass.methods && parentClass.methods.length > 0) {
                    for (const method of parentClass.methods) {
                        let exists = false;
                        for (const existingMethod of classStructure.methods) {
                            if (method.signature.toLowerCase() === existingMethod.signature.toLowerCase()) {
                                exists = true;
                                break;
                            }
                        }
                        classStructure.inheritedMethods.push(method);
                        if (!exists)
                            classStructure.methods.push(method);
                    }
                }
                if (parentClass.constuctors && parentClass.constuctors.length > 0) {
                    for (const constructor of parentClass.constuctors) {
                        let exists = false;
                        for (const existingConstructor of classStructure.constuctors) {
                            if (constructor.signature.toLowerCase() === existingConstructor.signature.toLowerCase()) {
                                exists = true;
                                break;
                            }
                        }
                        classStructure.inheritedConstructors.push(constructor);
                        if (!exists)
                            classStructure.constuctors.push(constructor);
                    }
                }
                if (parentClass.classes && parentClass.classes.length > 0) {
                    Object.keys(parentClass.classes).forEach(function (key) {
                        let exists = false;
                        Object.keys(classStructure.classes).forEach(function (existingKey) {
                            if (key.toLowerCase() === existingKey.toLowerCase())
                                exists = true;
                        });
                        classStructure.inheritedClasses[key] = parentClass.classes[key];
                        if (!exists)
                            classStructure.classes[key] = parentClass.classes[key];
                    });
                }
                if (parentClass.enums && parentClass.enums.length > 0) {
                    Object.keys(parentClass.enums).forEach(function (key) {
                        let exists = false;
                        Object.keys(classStructure.enums).forEach(function (existingKey) {
                            if (key.toLowerCase() === existingKey.toLowerCase())
                                exists = true;
                        });
                        classStructure.inheritedEnums[key] = parentClass.enums[key];
                        if (!exists)
                            classStructure.enums[key] = parentClass.enums[key];
                    });
                }
            }
        }
        return classStructure;
    }

    static getMethodSignature(method) {
        let signature = "";
        if (method.accessModifier)
            signature += method.accessModifier.toLowerCase() + " ";
        else
            signature += "public ";
        if (method.isStatic)
            signature += "static ";
        if (method.abstract)
            signature += "abstract ";
        if (method.virtual)
            signature += "virtual ";
        if (method.virtual)
            signature += "override ";
        if (method.datatype)
            signature += method.datatype + " ";
        signature += method.name + "("
        let params = [];
        for (const param of method.params) {
            params.push(param.datatype + " " + param.name);
        }
        signature += params.join(", ");
        signature += method.name + ")"
        return signature;
    }
}
exports.ApexParser = ApexParser;