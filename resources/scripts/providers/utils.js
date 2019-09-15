const fileSystem = require('../fileSystem');
const language = require('../languages');
const logger = require('../main/logger');
const vscode = require('vscode');
const CompletionItemKind = vscode.CompletionItemKind;
const CompletionItem = vscode.CompletionItem;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const FileChecker = fileSystem.FileChecker;
const Tokenizer = language.Tokenizer;
const TokenType = language.TokenType;
class Utils {
    static getObjectsFromMetadataIndex() {
        let sObjects = {
            sObjectsToLower: [],
            sObjectsMap: {},
        };
        let metadataPath = Paths.getMetadataIndexPath();
        let files = FileReader.readDirSync(metadataPath);
        if (files && files.length > 0) {
            for (const fileName of files) {
                let sObjectName = fileName.replace(".json", "").trim();
                let nameToLower = sObjectName.toLowerCase();
                sObjects.sObjectsToLower.push(nameToLower);
                sObjects.sObjectsMap[nameToLower] = sObjectName;
            }
        }
        return sObjects;
    }

    static getObjectFromMetadataIndex(object) {
        let metadataObjectPath = Paths.getMetadataIndexPath() + '/' + object + '.json';
        logger.log(metadataObjectPath);
        if (FileChecker.isExists(metadataObjectPath)) {
            return JSON.parse(FileReader.readFileSync(metadataObjectPath));
        } else {
            return undefined;
        }
    }


    static getFieldData(sObject, fieldName) {
        if (sObject) {
            for (const field of sObject.fields) {
                if (field.name == fieldName)
                    return field;
            }
        }
        return undefined;
    }

    static getSimilar(list, source) {
        let similar = [];
        source = source.toLowerCase();
        for (const name of list) {
            if (name && name.toLowerCase().indexOf(source) !== -1)
                similar.push(name);
        }
        return similar;
    }

    static getActivation(document, position) {
        let activation = "";
        let line = document.lineAt(position.line);
        let lineText = line.text;
        let lineTokens = Tokenizer.tokenize(lineText);
        let index = 0;
        let tokenPos = 0;
        let token;
        while (index < lineTokens.length) {
            token = lineTokens[index];
            if (position.character >= token.startColumn) {
                tokenPos = index;
            }
            index++;
        }
        if(token.tokenType == TokenType.RBRACKET)
            tokenPos--;
        let endLoop = false;
        while (!endLoop) {
            token = lineTokens[tokenPos];
            if (token && (token.tokenType === TokenType.DOT || token.tokenType === TokenType.IDENTIFIER)) {
                activation = token.content + activation;
            } else {
                endLoop = true;
            }
            tokenPos--
            if (tokenPos < 0)
                endLoop = true;
        }
        return activation;
    }

    static getSObjectsCompletionItems(position, similarSobjects, sObjectsMap, command) {
        let items = [];
        for (const sobject of similarSobjects) {
            let objName = sObjectsMap[sobject];
            let item = new CompletionItem(objName, CompletionItemKind.Class);
            item.detail = objName + ' SObject';
            item.insertText = objName;
            item.command = {
                title: 'sObject',
                command: command,
                arguments: [position, 'sObject', objName]
            };
            items.push(item);
        }
        return items;
    }
    
    static getSobjectsFieldsCompletionItems(position, sObject, command) {
        let items = [];
        if (sObject) {
            for (const field of sObject.fields) {
                let item = new CompletionItem(field.name, CompletionItemKind.Class);
                let itemRel;
                item.detail = sObject.name + ' Field';
                item.documentation = "Label: " + field.label + '\n';
                item.documentation += "Length: " + field.length + '\n';
                item.documentation += "Type: " + field.type + '\n';
                item.documentation += "Is Custom: " + field.custom + '\n';
                if (field.referenceTo.length > 0) {
                    item.documentation += "Reference To: " + field.referenceTo.join(", ") + '\n';
                    let name = field.name;
                    if (name.endsWith('__c')) {
                        name = name.substring(0, name.length - 3) + '__r';
                        itemRel = new CompletionItem(name, CompletionItemKind.Class);
                        itemRel.detail = sObject.name + " Relationsip Field";
                        itemRel.insertText = name;
                        itemRel.command = {
                            title: 'sObject',
                            command: command,
                            arguments: [position, 'sObjectRelField', field]
                        };
                    }
                }
                if (field.picklistValues.length > 0) {
                    item.documentation += "Picklist Values: \n";
                    for (const pickVal of field.picklistValues) {
                        item.documentation += pickVal.value + " (" + pickVal.label + ") \n";
                    }
                }
                item.insertText = field.name;
                item.command = {
                    title: 'sObject',
                    command: command,
                    arguments: [position, 'sObjectField', field]
                };
                items.push(item);
                if (itemRel)
                    items.push(itemRel);
            }
        }
        return items;
    }

    static getAttribute(componentStructure, attributeName) {
        if (componentStructure) {
            for (const attribute of componentStructure.attributes) {
                if (attribute.name === attributeName)
                    return attribute;
            }
        }
        return undefined;
    }
}
exports.Utils = Utils;