const vscode = require('vscode');
const path = require("path");
const logger = require("../utils/logger");
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
const XMLParser = languages.XMLParser;
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
    if (method.accessModifier && method.accessModifier.toLowerCase() === 'protected')
        type = 'protectedMethodElement';
    if (method.accessModifier && method.accessModifier.toLowerCase() === 'private')
        type = 'privateMethodElement';
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
    if (field.accessModifier && field.accessModifier.toLowerCase() === 'protected')
        type = 'protectedFieldElement';
    if (field.accessModifier && field.accessModifier.toLowerCase() === 'private')
        type = 'privateFieldElement';
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

function getProfileNodes(profile) {
    let nodes = [];
    if (profile.description || profile.userLicense || profile.custom != undefined) {
        let childs = [];
        if (profile.description)
            childs.push({ name: 'description', value: profile.description });
        if (profile.userLicense)
            childs.push({ name: 'userLicense', value: profile.userLicense });
        if (profile.custom != undefined)
            childs.push({ name: 'custom', value: '' + profile.custom });
        let fileNode = new FileNode('MAIN DATA', 'mainData', '', childs);
        nodes.push(fileNode);
    }
    if (profile.applicationVisibilities && profile.applicationVisibilities.length > 0) {
        let fileNode = new FileNode('APP VISIBILITY', 'applicationVisibilities', '', profile.applicationVisibilities);
        nodes.push(fileNode);
    }
    if (profile.classAccesses && profile.classAccesses.length > 0) {
        let fileNode = new FileNode('CLASS ACCESSES', 'classAccesses', '', profile.classAccesses);
        nodes.push(fileNode);
    }
    if (profile.customMetadataTypeAccesses && profile.customMetadataTypeAccesses.length > 0) {
        let fileNode = new FileNode('CUSTOM METADATA ACCESSES', 'customMetadataTypeAccesses', '', profile.customMetadataTypeAccesses);
        nodes.push(fileNode);
    }
    if (profile.customPermissions && profile.customPermissions.length > 0) {
        let fileNode = new FileNode('CUSTOM PERMISSIONS', 'customPermissions', '', profile.customPermissions);
        nodes.push(fileNode);
    }
    if (profile.customSettingAccesses && profile.customSettingAccesses.length > 0) {
        let fileNode = new FileNode('CUSTOM SETTING ACCESSES', 'customSettingAccesses', '', profile.customSettingAccesses);
        nodes.push(fileNode);
    }
    if (profile.externalDataSourceAccesses && profile.externalDataSourceAccesses.length > 0) {
        let fileNode = new FileNode('EXT. DATA SOURCE ACCESSES', 'externalDataSourceAccesses', '', profile.externalDataSourceAccesses);
        nodes.push(fileNode);
    }
    if (profile.fieldPermissions && profile.fieldPermissions.length > 0) {
        let fileNode = new FileNode('FIELD PERMISSIONS', 'fieldPermissions', '', profile.fieldPermissions);
        nodes.push(fileNode);
    }
    if (profile.fieldLevelSecurities && profile.fieldLevelSecurities.length > 0) {
        let fileNode = new FileNode('FIELD LEVEL SECURITY', 'fieldLevelSecurities', '', profile.fieldLevelSecurities);
        nodes.push(fileNode);
    }
    if (profile.flowAccesses && profile.flowAccesses.length > 0) {
        let fileNode = new FileNode('FLOW ACCESSES', 'flowAccesses', '', profile.flowAccesses);
        nodes.push(fileNode);
    }
    if (profile.layoutAssignments && profile.layoutAssignments.length > 0) {
        let fileNode = new FileNode('LAYOUT ASSIGNMENTS', 'layoutAssignments', '', profile.layoutAssignments);
        nodes.push(fileNode);
    }
    if (profile.loginHours) {
        let childs = [];
        if (profile.loginHours.mondayStart != undefined)
            childs.push({ name: 'mondayStart', value: profile.loginHours.mondayStart });
        if (profile.loginHours.mondayEnd != undefined)
            childs.push({ name: 'mondayEnd', value: profile.loginHours.mondayEnd });
        if (profile.loginHours.tuesdayStart != undefined)
            childs.push({ name: 'tuesdayStart', value: profile.loginHours.tuesdayStart });
        if (profile.loginHours.tuesdayEnd != undefined)
            childs.push({ name: 'tuesdayEnd', value: profile.loginHours.tuesdayEnd });
        if (profile.loginHours.wednesdayStart != undefined)
            childs.push({ name: 'wednesdayStart', value: profile.loginHours.wednesdayStart });
        if (profile.loginHours.wednesdayEnd != undefined)
            childs.push({ name: 'wednesdayEnd', value: profile.loginHours.wednesdayEnd });
        if (profile.loginHours.thursdayStart != undefined)
            childs.push({ name: 'thursdayStart', value: profile.loginHours.thursdayStart });
        if (profile.loginHours.thursdayEnd != undefined)
            childs.push({ name: 'thursdayEnd', value: profile.loginHours.thursdayEnd });
        if (profile.loginHours.fridayStart != undefined)
            childs.push({ name: 'fridayStart', value: profile.loginHours.fridayStart });
        if (profile.loginHours.fridayEnd != undefined)
            childs.push({ name: 'fridayEnd', value: profile.loginHours.fridayEnd });
        if (profile.loginHours.saturdayStart != undefined)
            childs.push({ name: 'saturdayStart', value: profile.loginHours.saturdayStart });
        if (profile.loginHours.saturdayEnd != undefined)
            childs.push({ name: 'saturdayEnd', value: profile.loginHours.saturdayEnd });
        if (profile.loginHours.sundayStart != undefined)
            childs.push({ name: 'sundayStart', value: profile.loginHours.sundayStart });
        if (profile.loginHours.sundayEnd != undefined)
            childs.push({ name: 'sundayEnd', value: profile.loginHours.sundayEnd });
        let fileNode = new FileNode('LOGIN HOURS', 'loginHours', '', childs);
        nodes.push(fileNode);
    }
    if (profile.loginIpRanges && profile.loginIpRanges.length > 0) {
        let fileNode = new FileNode('LOGIN IP RANGES', 'loginIpRanges', '', profile.loginIpRanges);
        nodes.push(fileNode);
    }
    if (profile.objectPermissions && profile.objectPermissions.length > 0) {
        let fileNode = new FileNode('OBJECT PERMISSIONS', 'objectPermissions', '', profile.objectPermissions);
        nodes.push(fileNode);
    }
    if (profile.pageAccesses && profile.pageAccesses.length > 0) {
        let fileNode = new FileNode('PAGE ACCESSES', 'pageAccesses', '', profile.pageAccesses);
        nodes.push(fileNode);
    }
    if (profile.profileActionOverrides && profile.profileActionOverrides.length > 0) {
        let fileNode = new FileNode('PROFILE ACTION OVERRIDES', 'profileActionOverrides', '', profile.profileActionOverrides);
        nodes.push(fileNode);
    }
    if (profile.recordTypeVisibilities && profile.recordTypeVisibilities.length > 0) {
        let fileNode = new FileNode('RECORD TYPE VISIBILITY', 'recordTypeVisibilities', '', profile.recordTypeVisibilities);
        nodes.push(fileNode);
    }
    if (profile.tabVisibilities && profile.tabVisibilities.length > 0) {
        let fileNode = new FileNode('TAB VISIBILITY', 'tabVisibilities', '', profile.tabVisibilities);
        nodes.push(fileNode);
    }
    if (profile.userPermissions && profile.userPermissions.length > 0) {
        let fileNode = new FileNode('USER PERMISSIONS', 'userPermissions', '', profile.userPermissions);
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

function getAttributeNode(attribute) {
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

function getHandlerNode(handler) {
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

function getEventNode(event) {
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

function getFunctionNode(functionNode) {
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

function getProfileMainDataNode(mainDataNode) {
    let name = mainDataNode.name;
    let type = 'mainData';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.description = '' + mainDataNode.value;
    let item = {
        type: "mainData",
        parentMember: 'Profile',
        memberName: mainDataNode.name,
        memberValue: mainDataNode.value
    };
    fileNode.command = {
        title: "GoToProfileData",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [0, 0, item]
    };
    return fileNode;
}

function getProfileLoginHourDataNode(loginHourNode) { 
    let name = loginHourNode.name;
    let type = 'loginHour';
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.description = '' + loginHourNode.value;
    let item = {
        type: "loginHour",
        parentMember: 'loginHours',
        memberName: loginHourNode.name,
        memberValue: loginHourNode.value
    };
    fileNode.command = {
        title: "GoToProfileData",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [0, 0, item]
    };
    return fileNode;
}

function getProfilePermissionNode(name, type, permissionNode) {
    let childs = [];
    Object.keys(permissionNode).forEach(function (key) {
        childs.push({ name: key, value: permissionNode[key] });
    });
    let fileNode = new FileNode(name, type, vscode.TreeItemCollapsibleState.Collapsed, childs);
    return fileNode;
}

function getProfilePermissionDataNode(type, parent, profilePermissionDataNode) {
    let fileNode = new FileNode(profilePermissionDataNode.name, type, vscode.TreeItemCollapsibleState.None, []);
    fileNode.description = '' + profilePermissionDataNode.value;
    let item = {
        type: type,
        parentMember: parent,
        memberName: profilePermissionDataNode.name,
        memberValue: '' + profilePermissionDataNode.value
    };
    fileNode.command = {
        title: "GoToProfileData",
        command: "aurahelper.fileExplorer.gotoMember",
        arguments: [0, 0, item]
    };
    return fileNode;
}

class FileStructureTreeProvider {

    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.orderBy = 'default';
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    sortElements(orderBy) {
        this.orderBy = orderBy;
        this.refresh();
    }

    getChildren(element) {
        if (element) {
            let nodes = [];
            if (element.type === 'method') {
                let methodsMap = {};
                for (const method of element.childs) {
                    let name = method.name + '(';
                    if (method.params && method.params.length > 0) {
                        let params = [];
                        for (const param of method.params) {
                            params.push(param.datatype);
                        }
                        name += params.join(", ");
                    }
                    name += ')';
                    methodsMap[name.toLowerCase()] = method;
                }
                let keys = Object.keys(methodsMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getMethodNode(methodsMap[key]));
                }
            } else if (element.type === 'field') {
                let fieldsMap = {};
                for (const field of element.childs) {
                    let name = field.name;
                    fieldsMap[name.toLowerCase()] = field;
                }
                let keys = Object.keys(fieldsMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getFieldNode(fieldsMap[key]));
                }
            } else if (element.type === 'class') {
                let keys = Object.keys(element.childs);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getClassNode(element.childs[key]));
                }
            } else if (element.type === 'classElement' || element.type === 'interfaceElement') {
                nodes = getClassElementsNodes(element.element);
            } else if (element.type === 'enumElement') {
                let enumValueMap = {};
                for (const enumValue of element.childs) {
                    enumValueMap[enumValue.name.toLowerCase()] = enumValue;
                }
                let keys = Object.keys(enumValueMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getEnumValueNode(enumValueMap[key]));
                }
            } else if (element.type === 'enum') {
                let keys = Object.keys(element.childs);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getEnumNode(element.childs[key]));
                }
            } else if (element.type === 'attribute') {
                let attributesMap = {};
                for (const attribute of element.childs) {
                    attributesMap[attribute.name.toLowerCase()] = attribute;
                }
                let keys = Object.keys(attributesMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getAttributeNode(attributesMap[key]));
                }
            } else if (element.type === 'handler') {
                let handlersMap = {};
                for (const handler of element.childs) {
                    handlersMap[handler.name.toLowerCase()] = handler;
                }
                let keys = Object.keys(handlersMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getHandlerNode(handlersMap[key]));
                }
            } else if (element.type === 'event') {
                let eventsMap = {};
                for (const event of element.childs) {
                    eventsMap[event.name.toLowerCase()] = event;
                }
                let keys = Object.keys(eventsMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getEventNode(eventsMap[key]));
                }
            } else if (element.type === 'function') {
                let functionsMap = {};
                for (const func of element.childs) {
                    functionsMap[func.signature.toLowerCase()] = func;
                }
                let keys = Object.keys(functionsMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getFunctionNode(functionsMap[key]));
                }
            } else if (element.type === 'mainData') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfileMainDataNode(permissionDataMap[key]));
                }
            } else if (element.type === 'applicationVisibilities') {
                let permissionDataMap = {};
                for (const appVisibility of element.childs) {
                    permissionDataMap[appVisibility.application] = appVisibility;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'appVisibility', permissionDataMap[key]));
                }
            } else if (element.type === 'appVisibility') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('appVisibilityData', 'applicationVisibilities', permissionDataMap[key]));
                }
            } else if (element.type === 'classAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.apexClass] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'classAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'classAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('classAccessData', 'classAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'customMetadataTypeAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'customMetadataTypeAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'customMetadataTypeAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('customMetadataTypeAccessData', 'customMetadataTypeAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'customPermissions') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'customPermission', permissionDataMap[key]));
                }
            } else if (element.type === 'customPermission') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('customPermissionData', 'customPermissions', permissionDataMap[key]));
                }
            } else if (element.type === 'customSettingAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'customSettingAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'customSettingAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('customSettingAccessData', 'customSettingAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'externalDataSourceAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.externalDataSource] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'externalDataSourceAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'externalDataSourceAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('externalDataSourceAccessData', 'externalDataSourceAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'fieldPermissions') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.field] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'fieldPermission', permissionDataMap[key]));
                }
            } else if (element.type === 'fieldPermission') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('fieldPermissionData', 'fieldPermissions', permissionDataMap[key]));
                }
            } else if (element.type === 'fieldLevelSecurities') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.field] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'fieldLevelSecurity', permissionDataMap[key]));
                }
            } else if (element.type === 'fieldLevelSecurity') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('fieldLevelSecurityData', 'fieldLevelSecurities', permissionDataMap[key]));
                }
            } else if (element.type === 'flowAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.flow] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'flowAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'flowAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('flowAccessData', 'flowAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'layoutAssignments') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    if(data.recordType)
                        permissionDataMap[data.layout + '__' + data.recordType] = data;
                    else
                        permissionDataMap[data.layout] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'layoutAssignment', permissionDataMap[key]));
                }
            } else if (element.type === 'layoutAssignment') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('layoutAssignmentData', 'layoutAssignments', permissionDataMap[key]));
                }
            } else if (element.type === 'loginHours') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfileLoginHourDataNode(permissionDataMap[key]));
                }
            } else if (element.type === 'loginIpRanges') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.startAddress + '-' + data.endAddress] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'loginIpRange', permissionDataMap[key]));
                }
            } else if (element.type === 'loginIpRange') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('loginIpRangeData', 'loginIpRanges', permissionDataMap[key]));
                }
            } else if (element.type === 'objectPermissions') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.object] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'objectPermission', permissionDataMap[key]));
                }
            } else if (element.type === 'objectPermission') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('objectPermissionData', 'objectPermissions', permissionDataMap[key]));
                }
            } else if (element.type === 'pageAccesses') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.apexPage] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'pageAccess', permissionDataMap[key]));
                }
            } else if (element.type === 'pageAccess') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('pageAccessData', 'pageAccesses', permissionDataMap[key]));
                }
            } else if (element.type === 'profileActionOverrides') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.pageOrSobjectType + '__' + data.type + '__' + data.actionName + '__' + data.recordType] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'profileActionOverride', permissionDataMap[key]));
                }
            } else if (element.type === 'profileActionOverride') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('profileActionOverrideData', 'profileActionOverrides', permissionDataMap[key]));
                }
            } else if (element.type === 'recordTypeVisibilities') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.recordType] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'recordTypeVisibility', permissionDataMap[key]));
                }
            } else if (element.type === 'recordTypeVisibility') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('recordTypeVisibilityData', 'recordTypeVisibilities', permissionDataMap[key]));
                }
            } else if (element.type === 'tabVisibilities') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.tab] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'tabVisibility', permissionDataMap[key]));
                }
            } else if (element.type === 'tabVisibility') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('tabVisibilityData', 'tabVisibilities', permissionDataMap[key]));
                }
            } else if (element.type === 'userPermissions') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionNode(key, 'userPermission', permissionDataMap[key]));
                }
            } else if (element.type === 'userPermission') {
                let permissionDataMap = {};
                for (const data of element.childs) {
                    permissionDataMap[data.name] = data;
                }
                let keys = Object.keys(permissionDataMap);
                if (this.orderBy === 'nameASC')
                    keys = keys.sort();
                else if (this.orderBy === 'nameDESC')
                    keys = keys.reverse();
                for (const key of keys) {
                    nodes.push(getProfilePermissionDataNode('userPermissionData', 'userPermissions', permissionDataMap[key]));
                }
            }
            return nodes;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (!editor)
                return undefined;
            if (!FileChecker.isApexClass(editor.document.uri.fsPath) && !FileChecker.isAuraComponent(editor.document.uri.fsPath) && !FileChecker.isJavaScript(editor.document.uri.fsPath) && !FileChecker.isProfile(editor.document.uri.fsPath))
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
            } else if (FileChecker.isAuraComponent(editor.document.uri.fsPath)) {
                let fileStructure = AuraParser.parse(FileReader.readDocument(editor.document));
                let nodes = [];
                if (fileStructure.attributes && fileStructure.attributes.length > 0) {
                    let fileNode = new FileNode('ATTRIBUTES', 'attribute', '', fileStructure.attributes);
                    nodes.push(fileNode);
                }
                if (fileStructure.handlers && fileStructure.handlers.length > 0) {
                    let fileNode = new FileNode('HANDLERS', 'handler', '', fileStructure.handlers);
                    nodes.push(fileNode);
                }
                if (fileStructure.events && fileStructure.events.length > 0) {
                    let fileNode = new FileNode('EVENT', 'event', '', fileStructure.events);
                    nodes.push(fileNode);
                }
                return nodes;
            } else if (FileChecker.isJavaScript(editor.document.uri.fsPath)) {
                let fileStructure = JavaScriptParser.parse(FileReader.readDocument(editor.document));
                let nodes = [];
                if (fileStructure.functions && fileStructure.functions.length > 0) {
                    let fileNode = new FileNode('FUNCTIONS', 'function', '', fileStructure.functions);
                    nodes.push(fileNode);
                }
                return nodes;
            } else if (FileChecker.isProfile(editor.document.uri.fsPath) || FileChecker.isPermissionSet(editor.document.uri.fsPath)) {
                let root = XMLParser.parseXML(FileReader.readDocument(editor.document));
                let nodes = [];
                let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                if (profileRaw)
                    nodes = getProfileNodes(profileRaw);
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
        } else if (this.type === 'protectedMethodElement') {
            iconName = 'MethodProtect_16x.svg';
        } else if (this.type === 'privateMethodElement') {
            iconName = 'MethodPrivate_16x.svg';
        } else if (this.type === 'protectedFieldElement') {
            iconName = 'FieldProtect_16x.svg';
        } else if (this.type === 'privateFieldElement') {
            iconName = 'FieldPrivate_16x.svg';
        }
        return Paths.getImagesPath() + '/' + iconName;
    }
}
exports.FileNode = FileNode;