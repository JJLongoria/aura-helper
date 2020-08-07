const logger = require('../utils/logger');
const Tokenizer = require('./tokenizer').Tokenizer;
const TokenType = require('./tokenTypes');
const Utils = require('./utils').Utils;
const fileSystem = require('../fileSystem');
const Output = require('../output');
const OutputChannel = Output.OutputChannel;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const applicationContext = require('../core/applicationContext');
const StrUtils = require('../utils/strUtils');

let batches;

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

const annotations = [
    "auraenabled",
    "deprecated",
    "future",
    "invocablemethod",
    "invocablevariable",
    "istest",
    "namespaceaccessible",
    "readonly",
    "remoteaction",
    "suppresswarnings",
    "testsetup",
    "testvisible",
    "restresource",
    "httpdelete",
    "httpget",
    "httppatch",
    "httppost",
    "httpput"
];

class ApexParser {

    static getClassBaseStructure() {
        return {
            accessModifier: "",
            definitionModifier: "",
            withSharing: true,
            inheritedSharing: false,
            name: "",
            implementTypes: [],
            implements: [],
            extendsType: undefined,
            extends: undefined,
            isInterface: false,
            isEnum: false,
            enumValues: [],
            comment: undefined,
            classes: {},
            enums: {},
            fields: [],
            methods: [],
            constructors: [],
            queries: [],
            posData: undefined,
            parentEnum: undefined,
            parentClass: undefined,
            valueType: undefined,
            keyType: undefined,
            annotation: undefined,
            lastToken: undefined,
        };
    }

    static parseLineData(content, position, fistActivation) {
        let tokens = Tokenizer.tokenize(content);
        let isOnText = false;
        let startColumn;
        let index = 0;
        while (index < tokens.length) {
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let lastToken = Utils.getLastToken(tokens, index);
            if ((token && token.tokenType === TokenType.SQUOTTE && lastToken && lastToken.tokenType !== TokenType.BACKSLASH) && token.startColumn <= position.character) {
                isOnText = !isOnText;
            }
            if (token.content.toLowerCase() === fistActivation && nextToken && nextToken.tokenType === TokenType.DOT)
                startColumn = token.startColumn;
            index++;
        }
        return {
            isOnText: isOnText,
            startColumn: startColumn
        };
    }

    static getFileStructure(content, position, classes, systemMetadata, namespacesMetadata) {
        classes = classes || applicationContext.userClasses;
        systemMetadata = systemMetadata || applicationContext.namespacesMetadata['system'];
        namespacesMetadata = namespacesMetadata || applicationContext.allNamespaces;
        let fileStructure = ApexParser.parse(content, position);
        if (fileStructure.extendsType)
            fileStructure.extends = ApexParser.processExtends(fileStructure.extendsType, classes, systemMetadata, namespacesMetadata);
        if (fileStructure.implementTypes && fileStructure.implementTypes.length > 0)
            fileStructure.implements = ApexParser.processImplements(fileStructure.implementTypes, classes, systemMetadata, namespacesMetadata);
        return fileStructure;
    }

    static processExtends(extendType, classes, systemMetadata, namespacesMetadata) {
        let struct;
        let className;
        if (extendType.indexOf('<') !== -1)
            extendType = extendType.split('<')[0];
        if (extendType.indexOf('[') !== -1 && extendType.indexOf(']') !== -1)
            extendType = "List";
        if (extendType.indexOf('.') !== -1) {
            let splits = extendType.split('.');
            if (splits.length === 2) {
                let parentClassOrNs = splits[0];
                className = splits[1];
                if (classes[parentClassOrNs.toLowerCase()]) {
                    struct = classes[parentClassOrNs.toLowerCase()]
                } else if (namespacesMetadata[parentClassOrNs.toLowerCase()]) {
                    let namespaceMetadata = applicationContext.namespacesMetadata[parentClassOrNs.toLowerCase()];
                    if (namespaceMetadata[className.toLowerCase()])
                        struct = namespaceMetadata[className.toLowerCase()];
                }
                if (!struct && systemMetadata[parentClassOrNs.toLowerCase()]) {
                    struct = systemMetadata[parentClassOrNs.toLowerCase()];
                }
            } else if (splits.length > 2) {
                let nsName = splits[0];
                let parentClassName = splits[1];
                className = splits[2];
                if (classes[parentClassName.toLowerCase()]) {
                    struct = classes[parentClassName.toLowerCase()];
                } else if (namespacesMetadata[nsName.toLowerCase()]) {
                    let namespaceMetadata = applicationContext.namespacesMetadata[nsName.toLowerCase()];
                    if (namespaceMetadata[parentClassName.toLowerCase()])
                        struct = namespaceMetadata[parentClassName.toLowerCase()];
                }
                if (!struct && systemMetadata[className.toLowerCase()]) {
                    struct = systemMetadata[className.toLowerCase()];
                }
            }
        } else {
            if (classes[extendType.toLowerCase()]) {
                struct = classes[extendType.toLowerCase()];
            } else if (systemMetadata[extendType.toLowerCase()]) {
                struct = systemMetadata[extendType.toLowerCase()];
            }
        }
        if (struct && className) {
            Object.keys(struct.classes).forEach(function (key) {
                let innerClass = struct.classes[key];
                if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                    struct = innerClass;
                }
            });
        }
        if (struct) {
            if (struct.extendsType)
                struct.extends = ApexParser.processExtends(struct.extendsType, classes, systemMetadata, namespacesMetadata);
            if (struct.implementTypes && struct.implementTypes.length > 0)
                struct.implements = ApexParser.processImplements(struct.implementTypes, classes, systemMetadata, namespacesMetadata);
        }
        return struct
    }

    static processImplements(implementTypes, classes, systemMetadata, namespacesMetadata) {
        let implementObjects = [];
        for (let impType of implementTypes) {
            let struct;
            let className;
            if (impType.indexOf('<') !== -1)
                impType = impType.split('<')[0];
            if (impType.indexOf('[') !== -1 && impType.indexOf(']') !== -1)
                impType = "List";
            if (impType.indexOf('.') !== -1) {
                let splits = impType.split('.');
                if (splits.length === 2) {
                    let parentClassOrNs = splits[0];
                    className = splits[1];
                    if (classes[parentClassOrNs.toLowerCase()]) {
                        struct = classes[parentClassOrNs.toLowerCase()];
                    } else if (namespacesMetadata[parentClassOrNs.toLowerCase()]) {
                        let namespaceMetadata = applicationContext.namespacesMetadata[parentClassOrNs.toLowerCase()];
                        if (namespaceMetadata[className.toLowerCase()])
                            struct = namespaceMetadata[className.toLowerCase()];
                    }
                    if (!struct && systemMetadata[parentClassOrNs.toLowerCase()]) {
                        struct = systemMetadata[parentClassOrNs.toLowerCase()];
                    }
                } else if (splits.length > 2) {
                    let nsName = splits[0];
                    let parentClassName = splits[1];
                    className = splits[2];
                    if (classes[parentClassName.toLowerCase()]) {
                        struct = classes[parentClassName.toLowerCase()];
                    } else if (namespacesMetadata[nsName.toLowerCase()]) {
                        let namespaceMetadata = applicationContext.namespacesMetadata[nsName.toLowerCase()];
                        if (namespaceMetadata[parentClassName.toLowerCase()])
                            struct = namespaceMetadata[parentClassName.toLowerCase()]
                    }
                    if (!struct && systemMetadata[parentClassName.toLowerCase()]) {
                        struct = systemMetadata[parentClassName.toLowerCase()]
                    }
                }
            } else {
                if (classes[impType.toLowerCase()]) {
                    struct = classes[impType.toLowerCase()];
                } else if (systemMetadata[impType.toLowerCase()]) {
                    struct = systemMetadata[impType.toLowerCase()];
                }
            }
            if (struct && className) {
                Object.keys(struct.classes).forEach(function (key) {
                    let innerClass = struct.classes[key];
                    if (innerClass.name.toLowerCase() === className.toLowerCase()) {
                        struct = innerClass;
                    }
                });
            }
            if (struct) {
                implementObjects.push(struct);
                if (struct.extendsType)
                    implementObjects.push(ApexParser.processExtends(struct.extendsType, classes, systemMetadata, namespacesMetadata));
                if (struct.implementTypes && struct.implementTypes.length > 0)
                    implementObjects = implementObjects.concat(ApexParser.processImplements(struct.implementTypes, classes, systemMetadata, namespacesMetadata));
            }
        }
        return implementObjects;
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
        let activeClassNameToLower = "";
        let activeEnumNameToLower = "";
        let testMethod;
        let transient;
        let positionData;
        let newLinesFromComment = 0;
        while (index < tokens.length) {
            let lastToken = Utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let twoNextToken = Utils.getTwoNextToken(tokens, index);
            let newLine = lastToken && token && lastToken.line < token.line;
            if (commentTokens.length > 0 && newLine) {
                newLinesFromComment++;
            }
            if (newLinesFromComment > 1) {
                newLinesFromComment = 0;
                commentTokens = [];
            }
            if (token.tokenType === TokenType.LBRACKET) {
                bracketIndent++;
            } else if (token.tokenType === TokenType.RBRACKET) {
                bracketIndent--;
                if (bracketIndent === 1) {
                    activeClassName = fileStructure.name;
                    activeClassNameToLower.toLowerCase();
                }
                if (bracketIndent === 0)
                    fileStructure.lastToken = token;
            }
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
            } else if (this.isOnAnnotation(token, nextToken, bracketIndent)) {
                let data = this.getAnnotation(tokens, index, position);
                if (commentTokens.length > 0 && newLine)
                    newLinesFromComment--;
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
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isDefinitionModifier(token)) {
                definitionModifier = token.content;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isWithoutSharing(token, nextToken)) {
                withSharing = false;
                inheritedSharing = false;
                dataTypeIndexStart = index + 1;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isInheritedSharing(token, nextToken)) {
                withSharing = false;
                inheritedSharing = true;
                dataTypeIndexStart = index + 1;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isStatic(token)) {
                isStatic = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isFinal(token)) {
                isFinal = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isOverride(token)) {
                override = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isAbstract(token)) {
                isAbstract = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isVirtual(token)) {
                isVirtual = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isTestMethod(token)) {
                testMethod = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isTransient(token)) {
                transient = true;
                dataTypeIndexStart = index;
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnClass = true;
                    }
                }
            } else if (this.isEnum(token, nextToken)) {
                activeEnumName = nextToken.content;
                activeEnumNameToLower = activeEnumName.toLowerCase();
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
                    fileStructure.comment = ApexParser.extractDataFromClassComment(Utils.transformTokensToText(commentTokens));
                    fileStructure.annotation = annotation;
                    fileStructure.line = token.line;
                    fileStructure.column = token.startColumn;
                    fileStructure.abstract = isAbstract;
                    fileStructure.virtual = token.isVirtual;
                    fileStructure.isEnum = true;
                    fileStructure.enumValues = data.enumValues;
                    fileStructure.parentEnum = undefined;
                    fileStructure.parentClass = undefined;
                } else if (bracketIndent === 1 && activeClassName && activeClassName === fileStructure.name) {
                    fileStructure.enums[activeEnumNameToLower] = this.getClassBaseStructure();
                    fileStructure.enums[activeEnumNameToLower].name = activeEnumName;
                    fileStructure.enums[activeEnumNameToLower].isEnum = true;
                    fileStructure.enums[activeEnumNameToLower].enumValues = data.enumValues;
                    fileStructure.enums[activeEnumNameToLower].parentEnum = fileStructure.name;
                    fileStructure.enums[activeEnumNameToLower].parentClass = undefined;
                } else if (bracketIndent === 2 && fileStructure.classes[activeClassNameToLower]) {
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower] = this.getClassBaseStructure();
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower].name = activeEnumName;
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower].isEnum = true;
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower].enumValues = data.enumValues;
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower].parentEnum = fileStructure.name;
                    fileStructure.classes[activeClassNameToLower].enums[activeEnumNameToLower].parentClass = activeClassName;
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
            } else if (this.isClass(token, nextToken) || this.isInterface(token, nextToken)) {
                activeClassName = nextToken.content;
                activeClassNameToLower = activeClassName.toLowerCase();
                if (bracketIndent === 0) {
                    fileStructure.name = activeClassName;
                    fileStructure.isInterface = this.isInterface(token, nextToken);
                    fileStructure.accessModifier = accessModifier;
                    fileStructure.definitionModifier = definitionModifier;
                    fileStructure.withSharing = withSharing && !inheritedSharing;
                    fileStructure.inheritedSharing = !withSharing && inheritedSharing;
                    fileStructure.comment = ApexParser.extractDataFromClassComment(Utils.transformTokensToText(commentTokens));
                    fileStructure.annotation = annotation;
                    fileStructure.line = token.line;
                    fileStructure.column = token.startColumn;
                    fileStructure.abstract = isAbstract;
                    fileStructure.virtual = token.isVirtual;
                    fileStructure.parentEnum = undefined;
                    fileStructure.parentClass = undefined;
                } else if (bracketIndent === 1 && !this.isEnum(token, nextToken)) {
                    fileStructure.classes[activeClassNameToLower] = this.getClassBaseStructure();
                    fileStructure.classes[activeClassNameToLower].name = activeClassName;
                    fileStructure.classes[activeClassNameToLower].accessModifier = accessModifier;
                    fileStructure.classes[activeClassNameToLower].definitionModifier = definitionModifier;
                    fileStructure.classes[activeClassNameToLower].withSharing = withSharing && !inheritedSharing;
                    fileStructure.classes[activeClassNameToLower].inheritedSharing = !withSharing && inheritedSharing;
                    fileStructure.classes[activeClassNameToLower].annotation = annotation;
                    fileStructure.classes[activeClassNameToLower].isInterface = this.isInterface(token, nextToken);
                    fileStructure.classes[activeClassNameToLower].comment = ApexParser.extractDataFromClassComment(Utils.transformTokensToText(commentTokens));
                    fileStructure.classes[activeClassNameToLower].line = token.line;
                    fileStructure.classes[activeClassNameToLower].column = token.startColumn;
                    fileStructure.classes[activeClassNameToLower].abstract = isAbstract;
                    fileStructure.classes[activeClassNameToLower].virtual = token.isVirtual;
                    fileStructure.classes[activeClassNameToLower].parentEnum = undefined;
                    fileStructure.classes[activeClassNameToLower].parentClass = fileStructure.name;
                }
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
                    fileStructure.implementTypes = data.interfaces;
                } else {
                    fileStructure.classes[activeClassNameToLower].implementTypes = data.interfaces;
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
                    fileStructure.classes[activeClassNameToLower].extendsType = data.extendsName;
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
                    static: isStatic,
                    final: isFinal,
                    transient: transient,
                    comment: ApexParser.extractDataFromVarComment(Utils.transformTokensToText(commentTokens))
                };
                if (bracketIndent === 1) {
                    fileStructure.fields.push(variable);
                } else if (bracketIndent === 2 && fileStructure.classes[activeClassNameToLower]) {
                    fileStructure.classes[activeClassNameToLower].fields.push(variable);
                }
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
                                static: isStatic,
                                final: isFinal,
                                transient: transient,
                                comment: ApexParser.extractDataFromVarComment(Utils.transformTokensToText(commentTokens))
                            };
                            if (bracketIndent === 1) {
                                fileStructure.fields.push(variable);
                            } else if (bracketIndent === 2 && fileStructure.classes[activeClassNameToLower]) {
                                fileStructure.classes[activeClassNameToLower].fields.push(variable);
                            }
                        }
                        if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
                data.method.annotation = annotation;
                data.method.accessModifier = accessModifier;
                data.method.definitionModifier = definitionModifier;
                data.method.override = override;
                data.method.testMethod = testMethod;
                data.method.abstract = isAbstract;
                data.method.static = isStatic;
                data.method.virtual = isVirtual;
                data.method.signature = this.getMethodSignature(data.method);
                data.method.comment = ApexParser.extractDataFromMethodComment(Utils.transformTokensToText(commentTokens), data.method);
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.methodSignature = data.method.signature;
                }
                index = data.index;
                if (bracketIndent === 1) {
                    fileStructure.constructors.push(data.method);
                } else {
                    fileStructure.classes[activeClassNameToLower].constructors.push(data.method);
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
                data.method.annotation = annotation;
                data.method.accessModifier = accessModifier;
                data.method.definitionModifier = definitionModifier;
                data.method.override = override;
                data.method.testMethod = testMethod;
                data.method.abstract = isAbstract;
                data.method.static = isStatic;
                data.method.virtual = isVirtual;
                data.method.signature = this.getMethodSignature(data.method);
                data.method.overrideSignature = this.getMethodSignature(data.method, true);
                data.method.comment = ApexParser.extractDataFromMethodComment(Utils.transformTokensToText(commentTokens), data.method);
                if (data.positionData) {
                    positionData = data.positionData;
                    positionData.methodSignature = data.method.signature;
                }
                index = data.index;
                if (bracketIndent === 1) {
                    fileStructure.methods.push(data.method);
                } else {
                    fileStructure.classes[activeClassNameToLower].methods.push(data.method);
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
            } else if (ApexParser.isQuery(token, nextToken)) {
                let data = ApexParser.getQuery(tokens, index, position);
                index = data.index;
                if (bracketIndent === 1) {
                    fileStructure.queries.push({
                        query: Utils.transformTokensToText(data.queryTokens).trim(),
                        line: nextToken.line,
                        isOnLoop: data.isOnLoop
                    });
                } else if (bracketIndent === 2 && activeClassName && fileStructure[activeClassNameToLower]) {
                    fileStructure[activeClassNameToLower].queries.push({
                        query: Utils.transformTokensToText(data.queryTokens).trim(),
                        line: nextToken.line,
                        isOnLoop: data.isOnLoop
                    });
                } else {
                    fileStructure.queries.push({
                        query: Utils.transformTokensToText(data.queryTokens).trim(),
                        line: nextToken.line,
                        isOnLoop: data.isOnLoop
                    });
                }
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
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
            body: undefined,
            comment: undefined,
            isConstructor: (datatype === undefined),
            line: token.line,
            column: token.startColumn,
            queries: [],
            lastToken: undefined
        };
        let bracketIndent = 0;
        let parenIndent = 0;
        let aParenIndent = 0;
        let startDatatypeIndex;
        let endDataTypeIndex;
        let endLoop = false;
        let positionData;
        let bodyTokens = [];
        while (!endLoop) {
            let lastToken = Utils.getLastToken(tokens, index);
            token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            let twoNextToken = Utils.getTwoNextToken(tokens, index);
            if (token.tokenType === TokenType.LBRACKET)
                bracketIndent++;
            else if (token.tokenType === TokenType.RBRACKET)
                bracketIndent--;
            if (bracketIndent === 0) {
                bodyTokens.push(token);
                method.lastToken = token;
            }
            if (token.tokenType === TokenType.LBRACKET || token.tokenType === TokenType.SEMICOLON || token.tokenType === TokenType.LPAREN)
                startDatatypeIndex = index;
            if (token.tokenType === TokenType.LPAREN)
                parenIndent++;
            else if (token.tokenType === TokenType.RPAREN)
                parenIndent--;
            if (token.tokenType === TokenType.LABRACKET)
                aParenIndent++;
            else if (token.tokenType === TokenType.RABRACKET)
                aParenIndent--;

            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
                if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                    positionData = this.getPositionData(position, token, nextToken);
                    if (positionData) {
                        positionData.isOnMethodParams = true;
                    }
                }
                if (token.tokenType === TokenType.COMMA && aParenIndent === 0) {
                    startDatatypeIndex = index;
                }
                else if (this.isOnMethodParam(token, nextToken) && aParenIndent === 0) {
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
                    bodyTokens = bodyTokens.concat(data.textTokens);
                } else if (this.isOnCommentLine(token, nextToken)) {
                    let data = this.getCommentLine(tokens, index, position);
                    index = data.index;
                    startDatatypeIndex = index;
                    if (data.positionData) {
                        positionData = data.positionData;
                        positionData.isOnMethod = true;
                    }
                    bodyTokens = bodyTokens.concat(data.commenTokens);
                } else if (this.isOnCommentBlock(token, nextToken)) {
                    let data = this.getCommentBlock(tokens, index, position);
                    index = data.index;
                    startDatatypeIndex = index;
                    if (data.positionData) {
                        positionData = data.positionData;
                        positionData.isOnMethod = true;
                    }
                    bodyTokens = bodyTokens.concat(data.commenTokens);
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
                        while (token.tokenType !== TokenType.EQUAL && token.tokenType !== TokenType.SEMICOLON) {
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
                            bodyTokens.push(token);
                            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                                positionData = this.getPositionData(position, token, nextToken);
                                if (positionData) {
                                    positionData.isOnMethod = true;
                                }
                            }
                        }
                    } else {
                        bodyTokens.push(token);
                        if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                            positionData = this.getPositionData(position, token, nextToken);
                            if (positionData) {
                                positionData.isOnMethod = true;
                            }
                        }
                    }
                } else if (ApexParser.isQuery(token, nextToken)) {
                    let data = ApexParser.getQuery(tokens, index, position);
                    index = data.index;
                    method.queries.push({
                        query: Utils.transformTokensToText(data.queryTokens).trim(),
                        line: nextToken.line,
                        isOnLoop: data.isOnLoop
                    });
                    bodyTokens = bodyTokens.concat(data.queryTokens);
                } else {
                    bodyTokens.push(token);
                    if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                        positionData = this.getPositionData(position, token, nextToken);
                        if (positionData) {
                            positionData.isOnMethod = true;
                        }
                    }
                }
            }
            if (bracketIndent === 0 && (token.tokenType === TokenType.RBRACKET || token.tokenType === TokenType.SEMICOLON))
                endLoop = true;
            if (!endLoop)
                index++;
        }
        method.body = Utils.transformTokensToText(bodyTokens);
        method.body = method.body.substring(method.body.indexOf('{'));
        //index--;
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
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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

    static getQuery(tokens, index, position) {
        let queryTokens = [];
        let positionData;
        let finish = false;
        while (!finish) {
            let lastToken = Utils.getLastToken(tokens, index);
            let token = tokens[index];
            let nextToken = Utils.getNextToken(tokens, index);
            queryTokens.push(token);
            if (token && token.tokenType === TokenType.RSQBRACKET)
                finish = true;
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = ApexParser.getPositionData(position, token, nextToken);
            }
            if (!finish)
                index++;
        }
        return {
            queryTokens: queryTokens,
            index: index,
            positionData: positionData,
            isOnLoop: false
        }
    }

    static getCommentLine(tokens, index, position) {
        let commenTokens = [];
        let token = tokens[index];
        let nextToken = Utils.getNextToken(tokens, index);
        let lastToken = Utils.getLastToken(tokens, index);
        let positionData;
        if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
            positionData = this.getPositionData(position, token, nextToken);
        }
        while (token && nextToken && token.line == nextToken.line) {
            token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            commenTokens.push(token);
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
        if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
            positionData = this.getPositionData(position, token, nextToken);
        }
        index++;
        let endText = false;
        while (!endText) {
            let lastToken = Utils.getLastToken(tokens, index);
            nextToken = Utils.getNextToken(tokens, index);
            token = tokens[index];
            textTokens.push(token);
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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

    static isSameToken(source, target) {
        if (source && target && source.line === target.line) {
            if (source.startColumn === target.startColumn && source.tokenType === target.tokenType && source.content === target.content)
                return true;
        }
        return false;
    }

    static getCommentBlock(tokens, index, position) {
        let endComment = false;
        let commenTokens = [];
        let nextToken;
        let positionData;
        let firstAsteriskToken;
        while (!endComment) {
            let token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            let lastToken = Utils.getLastToken(tokens, index);
            if (token && token.tokenType === TokenType.OPERATOR && token.content === '*' && !firstAsteriskToken)
                firstAsteriskToken = token;
            commenTokens.push(token);
            endComment = !ApexParser.isSameToken(firstAsteriskToken, token) && token.tokenType === TokenType.OPERATOR && token.content === '*' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '/' && token.endColumn === nextToken.startColumn;
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
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
        let finish = false;
        let withParents = false;
        while (!finish) {
            token = tokens[index];
            nextToken = Utils.getNextToken(tokens, index);
            lastToken = Utils.getLastToken(tokens, index);
            if (token.tokenType === TokenType.AT || annotations.includes(token.content.toLowerCase()) || withParents) {
                annotation += token.content;
                if (token.content.toLowerCase() === 'restresource') {
                    withParents = true;
                } else if (!withParents && token.tokenType !== TokenType.AT) {
                    finish = true;
                }
            }
            if (withParents && token.tokenType === TokenType.RPAREN) {
                withParents = false;
                finish = true;
            }
            if (Utils.isOnPosition(position, lastToken, token, nextToken)) {
                positionData = this.getPositionData(position, token, nextToken);
            }
            if (!finish)
                index++;
        }
        return {
            index: index,
            annotation: annotation,
            positionData: positionData
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

    static isOnAnnotation(token, nextToken, bracketIndent) {
        return (bracketIndent === 0 || bracketIndent === 1) && token.tokenType === TokenType.AT && nextToken && annotations.includes(nextToken.content.toLowerCase());
    }

    static isOnCommentLine(token, nextToken) {
        return token.tokenType === 'operator' && token.content === "/" && nextToken && nextToken.tokenType === 'operator' && nextToken.content === "/" && token.endColumn === nextToken.startColumn;
    }

    static isOnCommentBlock(token, nextToken) {
        return token.tokenType === TokenType.OPERATOR && token.content === '/' && nextToken && nextToken.tokenType === TokenType.OPERATOR && nextToken.content === '*' && token.endColumn === nextToken.startColumn;
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

    static isInterface(token, nextToken) {
        return token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'interface' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER;
    }

    static isQuery(token, nextToken) {
        return token.tokenType === TokenType.LSQBRACKET && nextToken && nextToken.content.toLowerCase() === 'select';
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
        let isClass = content.toLowerCase().split(' ').includes('class');
        let endLoop = false;
        while (!endLoop) {
            let token = tokens[index];
            let lastToken = Utils.getLastToken(tokens, index);
            let nextToken = Utils.getNextToken(tokens, index);
            if (token &&  token.tokenType !== TokenType.SEMICOLON && token.tokenType !== TokenType.LBRACKET) {
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
                        while (token && (token.content !== 'extends' || token.tokenType !== TokenType.LBRACKET)) {
                            token = tokens[index];
                            if (token && token.tokenType === TokenType.LABRACKET) {
                                aBracketIndent++;
                            }
                            else if (token && token.tokenType === TokenType.RABRACKET) {
                                aBracketIndent--;
                            }
                            if (token && token.tokenType === TokenType.COMMA && aBracketIndent == 0) {
                                data.classData.interfaces.push(interfaceName);
                                interfaceName = "";
                            } else if(token) {
                                interfaceName += token.content;
                            }
                            index++;
                        }
                        if (token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'extends') {
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
                            if (nextToken && (nextToken.tokenType === TokenType.COMMA || nextToken.tokenType === TokenType.RPAREN) && token.tokenType !== TokenType.LPAREN && aBracketIndent == 0) {
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

    static getMethodSignature(method, override) {
        let signature = "";
        if (method.accessModifier)
            signature += method.accessModifier.toLowerCase() + " ";
        else
            signature += "public ";
        if (method.definitionModifier)
            signature += method.definitionModifier.toLowerCase() + " ";
        if (method.isStatic)
            signature += "static ";
        if (method.abstract)
            signature += "abstract ";
        if (method.virtual)
            signature += "virtual ";
        if (method.override || override)
            signature += "override ";
        if (method.datatype)
            signature += method.datatype + " ";
        signature += method.name + "("
        let params = [];
        for (const param of method.params) {
            params.push(param.datatype + " " + param.name);
        }
        signature += params.join(", ");
        signature += ")"
        return signature;
    }

    static async compileAllApexClasses() {
        return new Promise(async  (resolve, reject) => {
            let classesFolder = Paths.getMetadataRootFolder() + '/' + 'classes'
            if (!FileChecker.isExists(classesFolder)) {
                resolve();
                return;
            }
            let files = FileReader.readDirSync(classesFolder, { onlyFiles: true, extensions: ['.cls'] });
            if (!files || files.length === 0) {
                resolve();
                return;
            }
            if (FileChecker.isExists(Paths.getCompiledClassesPath())) {
                let compiledFiles = FileReader.readDirSync(Paths.getCompiledClassesPath());
                if (compiledFiles.length > 0) {
                    resolve();
                    return;
                }
            }
            let nBatches = 1;
            let recordsPerBatch = 200;
            batches = [];
            let counter = 0;
            let batch;
            for (const file of files) {
                if (!batch) {
                    batch = {
                        batchId: 'Bacth_' + counter,
                        records: [],
                        completed: false
                    }
                    counter++;
                }
                if (batch) {
                    batch.records.push(file);
                    if (batch.records.length === recordsPerBatch) {
                        batches.push(batch);
                        batch = undefined;
                    }
                }
            }
            if (batch)
                batches.push(batch);
            for (const batchToProcess of batches) {
                await ApexParser.compileAllClasses(batchToProcess.records).then(function () {
                    batchToProcess.completed = true;
                    let nCompleted = 0;
                    for (const resultBatch of batches) {
                        if (resultBatch.completed)
                            nCompleted++;
                    }
                    if (nCompleted === batches.length) {
                        resolve();
                    }
                }).catch(function (error) {
                    OutputChannel.output('Error When Getting Apex Classes Info: \n' + error + '\n');
                    resolve();
                });
            }
        });
    }

    static compileAllClasses(files) {
        return new Promise(async function (resolve, reject) {
            try {
                let classesFolder = Paths.getMetadataRootFolder() + '/' + 'classes'
                let targetFolder = Paths.getCompiledClassesPath();
                if (!FileChecker.isExists(targetFolder))
                    FileWriter.createFolderSync(targetFolder);
                for (const file of files) {
                    await ApexParser.compileClass(classesFolder + '/' + file, targetFolder);
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static compileClass(file, targetFolder) {
        return new Promise(function (resolve, reject) {
            try {
                if (!FileChecker.isExists(targetFolder))
                    FileWriter.createFolderSync(targetFolder);
                FileReader.readFile(file, function (errorRead, data) {
                    if (errorRead) {
                        reject(errorRead);
                    } else {
                        try {
                            let fileStructure = ApexParser.getFileStructure(data.toString());
                            FileWriter.createFile(targetFolder + '/' + fileStructure.name + '.json', JSON.stringify(fileStructure, null, 2), function (path, errorWrite) {
                                if (errorWrite)
                                    reject(errorWrite);
                                else
                                    resolve(fileStructure);
                            });
                        } catch (errorParse) {
                            reject(errorParse);
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static extractDataFromVarComment(comment) {
        let commentLines = comment.split('\n');
        let linesTmp = [];
        for (let lineTmp of commentLines) {
            lineTmp = lineTmp.trim();
            if (lineTmp.indexOf('/**') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '/**', '');
            if (lineTmp.indexOf('*/') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '*/', '');
            if (lineTmp.startsWith('*'))
                lineTmp = lineTmp.substring(1);
            if (lineTmp.startsWith('//'))
                lineTmp = lineTmp.substring(2);
            linesTmp.push(lineTmp.trim());
        }
        return linesTmp.join('\n');
    }

    static extractDataFromClassComment(comment) {
        let commentLines = comment.split('\n');
        let linesTmp = [];
        for (let lineTmp of commentLines) {
            lineTmp = lineTmp.trim();
            if (lineTmp.indexOf('/**') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '/**', '');
            if (lineTmp.indexOf('*/') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '*/', '');
            if (lineTmp.startsWith('*'))
                lineTmp = lineTmp.substring(1);
            linesTmp.push(lineTmp.trim());
        }
        return linesTmp.join('\n');
    }

    static extractDataFromMethodComment(comment, methodData) {
        let commentData = {
            description: "",
            params: undefined,
            return: undefined,
        };
        let linesTmp = [];
        let commentLines = comment.split('\n');
        for (let lineTmp of commentLines) {
            lineTmp = lineTmp.trim();
            if (lineTmp.indexOf('/**') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '/**', '');
            if (lineTmp.indexOf('*/') !== -1)
                lineTmp = StrUtils.replace(lineTmp, '*/', '');
            if (lineTmp.startsWith('*'))
                lineTmp = lineTmp.substring(1);
            linesTmp.push(lineTmp.trim());
        }
        commentLines = linesTmp;
        let apexCommentTemplate = JSON.parse(FileReader.readFileSync(Paths.getApexCommentUserTemplatePath()));
        let paramRegexp = ApexParser.getParamRegexp(apexCommentTemplate.methodComment.paramBody);
        let returnRegexp = ApexParser.getReturnRegexp(apexCommentTemplate.methodComment.returnBody);
        let params = [];
        let returnData = '';
        let description = '';
        let startReturn = false;
        let startParams = false;
        let param;
        for (const line of commentLines) {
            let paramMatch = paramRegexp.exec(line);
            let returnMatch = returnRegexp.exec(line);
            if (paramMatch) {
                if (param) {
                    params.push(param.trim());
                    param = undefined;
                }
                param = paramMatch[0].trim();
                startParams = true;
                startReturn = false;
            } else if (returnMatch) {
                if (param) {
                    params.push(param.trim());
                    param = undefined;
                }
                returnData = returnMatch[0].trim();
                startReturn = true;
                startParams = false;
            } else {
                if (startReturn && line.trim().length > 0) {
                    if (returnData.length > 0)
                        returnData += '\n' + line.trim();
                    else
                        returnData += line.trim();
                } else if (startParams && line.trim().length > 0) {
                    if (param.length > 0)
                        param += '\n' + line.trim();
                    else
                        param += line.trim();
                } else if (line.trim().length > 0) {
                    if (description.length > 0)
                        description += '\n' + line.trim();
                }
            }
        }
        if (param) {
            params.push(param.trim());
            param = undefined;
        }
        commentData.description = description.trim();
        let processedParams = ApexParser.processParams(params, apexCommentTemplate.methodComment.paramBody);
        let processedReturn = ApexParser.processParams(params, apexCommentTemplate.methodComment.paramBody);
        if (processedParams) {
            commentData.params = ApexParser.mapParamsWithCommentData(processedParams, methodData.params);
        }
        if (processedReturn) {
            commentData.return = ApexParser.mapReturnWithCommentData(processedReturn, methodData.datatype);
        }
        return commentData;
    }

    static mapParamsWithCommentData(processedParams, methodParams) {
        let commentParams = {};
        for (const processedParam of processedParams) {
            let methodParam;
            if (processedParam['{!param.name}']) {
                methodParam = ApexParser.findParam(processedParam['{!param.name}'], methodParams);
            } else {
                methodParam = methodParams[0];
            }
            if (methodParam) {
                commentParams[methodParam.name] = {
                    name: methodParam.name,
                    type: methodParam.datatype,
                    description: processedParam['{!param.description}']
                };
            }
        }
        return commentParams;
    }

    static findParam(paramName, methodParams) {
        for (const param of methodParams) {
            if (param.name === paramName)
                return param;
        }
        return undefined;
    }

    static mapReturnWithCommentData(processedReturn, returnDataType) {
        let returnData = {
            type: returnDataType,
            description: processedReturn['{!return.description}']
        };
        return returnData;
    }

    static processParams(params, paramTemplate) {
        if (params.length === 0)
            return undefined;
        let returnParams = [];
        let templateSplits = paramTemplate.split(/({!param.name}|{!param.type}|{!param.description})+/);
        let partsWithoutData = [];
        for (let split of templateSplits) {
            if (split !== '{!param.name}' && split !== '{!param.type}' && split !== '{!param.description}' && split.length > 0) {
                split = StrUtils.replace(split, '(', '\\(');
                split = StrUtils.replace(split, ')', '\\)');
                split = StrUtils.replace(split, '/', '\\/');
                split = StrUtils.replace(split, ':', '\\:');
                partsWithoutData.push(split);
            }
        }
        for (const param of params) {
            let paramSplits = param.split(new RegExp('(' + partsWithoutData.join('|') + ')+'));
            let filterData = paramSplits.filter(n => !templateSplits.includes(n) && n.length > 0);
            let filterTemplates = templateSplits.filter(n => !paramSplits.includes(n) && n.length > 0);
            let commentData = {};
            let index = 0;
            for (const filterTemp of filterTemplates) {
                commentData[filterTemp] = filterData[index];
                index++;
            }
            returnParams.push(commentData);
        }
        return returnParams;
    }

    static processReturn(returnData, returnTemplate) {
        if (!returnData || returnData.length === 0)
            return undefined;
        let templateSplits = returnTemplate.split(/({!return.type}|{!return.description})+/);
        let partsWithoutData = [];
        for (let split of templateSplits) {
            if (split !== '{!return.type}' && split !== '{!return.description}' && split.length > 0) {
                split = StrUtils.replace(split, '(', '\\(');
                split = StrUtils.replace(split, ')', '\\)');
                split = StrUtils.replace(split, '/', '\\/');
                split = StrUtils.replace(split, ':', '\\:');
                partsWithoutData.push(split);
            }
        }
        let paramSplits = returnData.split(new RegExp('(' + partsWithoutData.join('|') + ')+'));
        let filterData = paramSplits.filter(n => !templateSplits.includes(n));
        let filterTemplates = templateSplits.filter(n => !paramSplits.includes(n) && n.length > 0);
        let returnedData = {};
        let index = 0;
        for (const filterTemp of filterTemplates) {
            returnedData[filterTemp] = filterData[index];
            index++;
        }
        return filterData;
    }

    static getParamRegexp(paramBody) {
        let paramRegexp = StrUtils.replace(paramBody, '(', '\\(');
        paramRegexp = StrUtils.replace(paramRegexp, ')', '\\)');
        paramRegexp = StrUtils.replace(paramRegexp, '/', '\\/');
        paramRegexp = StrUtils.replace(paramRegexp, ':', '\\:');
        paramRegexp = StrUtils.replace(paramRegexp, '{!param.name}', '([a-zA-Z0-9À-ÿ]|_|–|\\[|\\]|<|>|\\.)+');
        paramRegexp = StrUtils.replace(paramRegexp, '{!param.type}', '([a-zA-Z0-9À-ÿ]|_|–|\\[|\\]|<|>|\\.|\\s*|\\,)+');
        paramRegexp = StrUtils.replace(paramRegexp, '{!param.description}', '([a-zA-Z0-9À-ÿ]|_|–|\\[|\\]|<|>|\\.|\\s*|.*)*');
        return new RegExp(paramRegexp, "gmi");
    }

    static getReturnRegexp(paramBody) {
        let paramRegexp = StrUtils.replace(paramBody, '(', '\\(');
        paramRegexp = StrUtils.replace(paramRegexp, ')', '\\)');
        paramRegexp = StrUtils.replace(paramRegexp, '/', '\\/');
        paramRegexp = StrUtils.replace(paramRegexp, ':', '\\:');
        paramRegexp = StrUtils.replace(paramRegexp, '{!return.type}', '([a-zA-Z0-9À-ÿ]|_|–|\\[|\\]|<|>|\\.|\\s*|\\,)+');
        paramRegexp = StrUtils.replace(paramRegexp, '{!return.description}', '([a-zA-Z0-9À-ÿ]|_|–|\\[|\\]|<|>|\\.|\\s*|.*)*');
        return new RegExp(paramRegexp, "gmi");
    }

    static availableCommentTags() {
        return [
            '{!method.description}',
            '{!method.params}',
            '{!method.return}',
            '{!class.description}',
            '{!param.name}',
            '{!param.type}',
            '{!param.description}',
            '{!return.type}',
            '{!return.description}'
        ];
    }

    static isLoop(token, nextToken) {
        return token && ((token.tokenType === TokenType.IDENTIFIER && (token.content.toLowerCase() === 'for' || token.content.toLowerCase() === 'while') && nextToken && nextToken.tokenType === TokenType.LPAREN) || (token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'do' && nextToken && nextToken.tokenType === TokenType.LBRACKET))
    }

    static isIfStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'if' && nextToken && nextToken.tokenType === TokenType.LPAREN;
    }

    static isElseIfStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'else' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER && nextToken.content.toLowerCase() === 'if';
    }

    static isElseStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'else' && nextToken && nextToken.content.toLowerCase() !== 'if';
    }

    static isTryStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'try' && nextToken && nextToken.tokenType === TokenType.LBRACKET;
    }

    static isCatchStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'catch' && nextToken && nextToken.tokenType === TokenType.LPAREN;
    }

    static isFinallyStatement(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'finally' && nextToken && nextToken.tokenType === TokenType.LBRACKET;
    }

    static isThrow(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'throw' && nextToken && nextToken.tokenType === TokenType.IDENTIFIER;
    }

    static isBreak(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'break' && nextToken && nextToken.tokenType === TokenType.SEMICOLON;
    }

    static isContinue(token, nextToken) {
        return token && token.tokenType === TokenType.IDENTIFIER && token.content.toLowerCase() === 'continue' && nextToken && nextToken.tokenType === TokenType.SEMICOLON;
    }

    static isAssignation(token, nextToken) {
        return token && token.tokenType === TokenType.EQUAL && nextToken && nextToken.tokenType !== TokenType.EQUAL;
    }
}
exports.ApexParser = ApexParser;
