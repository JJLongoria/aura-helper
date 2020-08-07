const logger = require('../utils/logger');
const fileSystem = require('../fileSystem');
const applicationContext = require('../core/applicationContext');
const JavaScriptParser = require('./javascriptParser').JavaScriptParser;
const AuraParser = require('./auraParser').AuraParser;
const ApexParser = require('./apexParser').ApexParser;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const FileChecker = fileSystem.FileChecker;

class BundleAnalizer {
    static getComponentStructure(componentPath, position) {
        let baseComponentsDetail = applicationContext.componentsDetail;
        let componentName = Paths.getBasename(componentPath).replace('.cmp', '');
        let componentFileText = FileReader.readFileSync(componentPath);
        let componentStructure = AuraParser.parse(componentFileText);
        if (!componentStructure.attributes) {
            componentStructure.attributes = [];
        }
        for (const rootDetail of baseComponentsDetail['root']['component']) {
            componentStructure.attributes.push(rootDetail);
        }
        componentStructure.controllerFunctions = BundleAnalizer.getControllerFunctions(componentPath);
        componentStructure.helperFunctions = BundleAnalizer.getHelperFunctions(componentPath);
        if (componentStructure.controller) {
            let classPath = componentPath.replace('aura/' + componentName + '/' + componentName + '.cmp', 'classes/' + componentStructure.controller + '.cls');
            let classStructure = ApexParser.getFileStructure(FileReader.readFileSync(classPath));
            componentStructure.apexFunctions = classStructure.methods;
        }
        let parentComponentStructure = componentStructure;
        while (parentComponentStructure.extends) {
            let parentComponentName = parentComponentStructure.extends.replace('c:', '');
            let parentFileName = componentPath.replace(new RegExp(componentName, 'g'), parentComponentName);
            parentComponentStructure = AuraParser.parse(FileReader.readFileSync(parentFileName));
            parentComponentStructure.controllerFunctions = BundleAnalizer.getControllerFunctions(parentFileName);
            parentComponentStructure.helperFunctions = BundleAnalizer.getHelperFunctions(parentFileName);
            if (parentComponentStructure.controller) {
                let classPath = componentPath.replace('aura/' + componentName + '/' + componentName + '.cmp', 'classes\/' + parentComponentStructure.controller + '.cls');
                let classStructure = ApexParser.getFileStructure(FileReader.readFileSync(classPath));
                for (const method of classStructure.methods) {
                    let existing = false;
                    for (const existingMethod of componentStructure.apexFunctions) {
                        if (method.name === existingMethod.name) {
                            existing = true;
                            break;
                        }
                    }
                    if (!existing)
                        componentStructure.apexFunctions.push(method);
                }
            }
            for (const attribute of parentComponentStructure.attributes) {
                let existing = false;
                for (const existingAttr of componentStructure.attributes) {
                    if (attribute.name === existingAttr.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.attributes.push(attribute);
            }
            for (const implement of parentComponentStructure.implements) {
                let existing = false;
                for (const existingImp of componentStructure.implements) {
                    if (existingImp === implement) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.implements.push(implement);
            }
            for (const event of parentComponentStructure.events) {
                let existing = false;
                for (const existingEvent of componentStructure.events) {
                    if (event.name === existingEvent.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.events.push(event);
            }
            for (const handler of parentComponentStructure.handlers) {
                let existing = false;
                for (const existingHandler of componentStructure.handlers) {
                    if (handler.name === existingHandler.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.handlers.push(handler);
            }
            for (const func of parentComponentStructure.controllerFunctions) {
                let existing = false;
                for (const existingFunc of componentStructure.controllerFunctions) {
                    if (func.name === existingFunc.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.controllerFunctions.push(func);
            }
            for (const func of parentComponentStructure.helperFunctions) {
                let existing = false;
                for (const existingFunc of componentStructure.helperFunctions) {
                    if (func.name === existingFunc.name) {
                        existing = true;
                        break;
                    }
                }
                if (!existing)
                    componentStructure.helperFunctions.push(func);
            }
        }
        if (componentStructure.implements && componentStructure.implements.length > 0) {
            for (const implement of componentStructure.implements) {
                let interfaceToCheck = implement;
                if (interfaceToCheck.indexOf('lightning:isUrlAddressable') !== -1)
                    interfaceToCheck = 'lightning:hasPageReference';
                let splits = interfaceToCheck.split(':');
                let ns = splits[0];
                let componentName = splits[1];
                let interfaceNS = baseComponentsDetail[ns];
                if (interfaceNS) {
                    let attributes = interfaceNS[componentName];
                    if (attributes && attributes.length > 0) {
                        for (const attribute of attributes) {
                            let existing = false;
                            for (const existingAttr of componentStructure.attributes) {
                                if (attribute.name === existingAttr.name) {
                                    existing = true;
                                    break;
                                }
                            }
                            if (!existing)
                                componentStructure.attributes.push(attribute);
                        }
                    }
                }
            }
        }
        return componentStructure;
    }

    static getControllerFunctions(componentPath) {
        let controllerPath = componentPath.replace('.cmp', 'Controller.js');
        let functions = [];
        if (FileChecker.isExists(controllerPath)) {
            let fileStructure = JavaScriptParser.parse(FileReader.readFileSync(controllerPath));
            functions = fileStructure.functions;
        }
        return functions;
    }

    static getHelperFunctions(componentPath) {
        let helperPath = componentPath.replace('.cmp', 'Helper.js');
        let functions = [];
        if (FileChecker.isExists(helperPath)) {
            let fileStructure = JavaScriptParser.parse(FileReader.readFileSync(helperPath));
            functions = fileStructure.functions;
        }
        return functions;
    }

}
exports.BundleAnalizer = BundleAnalizer;