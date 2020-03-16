const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class DuplicateRuleUtils {

    static createDuplicateRule(duplicateRule) {
        let newDuplicateRule;
        if (duplicateRule) {
            newDuplicateRule = Utils.prepareXML(duplicateRule, DuplicateRuleUtils.createDuplicateRule());
        } else {
            newDuplicateRule = {
                actionOnInsert: undefined,
                actionOnUpdate: undefined,
                alertText: undefined,
                description: undefined,
                duplicateRuleFilter: undefined,
                duplicateRuleMatchRules: [],
                fullName: undefined,
                isActive: undefined,
                masterLabel: undefined,
                operationsOnInsert: [],
                operationsOnUpdate: [],
                securityOption: undefined,
                sortOrder: undefined,
            };
        }
        return newDuplicateRule;
    }

    static createDuplicateRuleMatchRule(matchRuleSObjectType, matchingRule, objectMapping) {
        return {
            matchRuleSObjectType: matchRuleSObjectType,
            matchingRule: matchingRule,
            objectMapping: objectMapping
        }
    }

    static createDuplicateRuleFilter(booleanFilter, duplicateRuleFilterItems) {
        return {
            booleanFilter: booleanFilter,
            duplicateRuleFilterItems: Utils.forceArray(duplicateRuleFilterItems),
        }
    }

    static createDuplicateRuleFilterItem(sortOrder, table) {
        return {
            sortOrder: sortOrder,
            table: table,
        }
    }

    static createObjectMapping(inputObject, mappingFields, outputObject) {
        return {
            inputObject: inputObject,
            mappingFields: Utils.forceArray(mappingFields),
            outputObject: outputObject
        }
    }

    static createObjectMappingField(inputField, outputField) {
        return {
            inputField: inputField,
            outputField: outputField,
        }
    }

    static toXML(duplicateRule, compress) {
        let xmlLines = [];
        if (duplicateRule) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<DuplicateRule xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
                if (duplicateRule.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', duplicateRule.fullName));
                if (duplicateRule.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', duplicateRule.masterLabel));
                if (duplicateRule.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', duplicateRule.description));
                if (duplicateRule.isActive !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isActive', duplicateRule.isActive));
                if (duplicateRule.actionOnInsert !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('actionOnInsert', duplicateRule.actionOnInsert));
                if (duplicateRule.actionOnUpdate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('actionOnUpdate', duplicateRule.actionOnUpdate));
                if (duplicateRule.alertText !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('alertText', duplicateRule.alertText));
                if (duplicateRule.securityOption !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('securityOption', duplicateRule.securityOption));
                if (duplicateRule.sortOrder !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sortOrder', duplicateRule.sortOrder));
                if (duplicateRule.duplicateRuleFilter !== undefined)
                    xmlLines = xmlLines.concat(DuplicateRuleUtils.getDuplicateRuleFilterXMLLines(duplicateRule.duplicateRuleFilter, 1));
                if (duplicateRule.duplicateRuleMatchRules !== undefined)
                    xmlLines = xmlLines.concat(DuplicateRuleUtils.getDuplicateMatchRulesXMLLines(duplicateRule.duplicateRuleMatchRules, 1));
                if (duplicateRule.operationsOnInsert !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('operationsOnInsert', duplicateRule.operationsOnInsert, true, 1));
                if (duplicateRule.operationsOnUpdate !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('operationsOnUpdate', duplicateRule.operationsOnUpdate, true, 1));
                xmlLines.push('</DuplicateRule>');
            } else {
                return AuraParser.toXML(duplicateRule);
            }
        }
        return xmlLines.join('\n');
    }

    static getDuplicateRuleFilterXMLLines(duplicateRuleFilter, initIndent) {
        let xmlLines = [];
        let attributes = Utils.getAttributes(duplicateRuleFilter);
        let keys = Object.keys(duplicateRuleFilter);
        let onlyAttrs = false;
        if (keys.length == 1 && keys.includes('@attrs'))
            onlyAttrs = true;
        if (!onlyAttrs) {
            if (attributes.length > 0)
                xmlLines.push(Utils.getTabs(initIndent) + '<duplicateRuleFilter ' + attributes.join(' ') + '>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '<duplicateRuleFilter>');
            if (duplicateRuleFilter.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', duplicateRuleFilter.booleanFilter));
            if (duplicateRuleFilter.duplicateRuleFilterItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('duplicateRuleFilterItems', duplicateRuleFilter.duplicateRuleFilterItems, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</duplicateRuleFilter>');
        } else {
            if (attributes.length > 0)
                xmlLines.push(Utils.getTabs(initIndent) + '<duplicateRuleFilter ' + attributes.join(' ') + '/>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '<duplicateRuleFilter/>');
        }
        return xmlLines;
    }

    static getDuplicateMatchRulesXMLLines(duplicateRuleMatchRules, initIndent) {
        let xmlLines = [];
        for (const rule of duplicateRuleMatchRules) {
            xmlLines.push(Utils.getTabs(initIndent) + '<duplicateRuleMatchRules>');
            if (rule.matchRuleSObjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('matchRuleSObjectType', rule.matchRuleSObjectType));
            if (rule.matchingRule !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('matchingRule', rule.matchingRule));
            if (rule.objectMapping !== undefined)
                xmlLines = xmlLines.concat(DuplicateRuleUtils.getObjectMappingXMLLines(rule.objectMapping, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</duplicateRuleMatchRules>');
        }
        return xmlLines;
    }

    static getObjectMappingXMLLines(objectMapping, initIndent) {
        let xmlLines = [];
        let attributes = Utils.getAttributes(objectMapping);
        let keys = Object.keys(objectMapping);
        let onlyAttrs = false;
        if (keys.length == 1 && keys.includes('@attrs'))
            onlyAttrs = true;
        if (!onlyAttrs) {
            if (attributes.length > 0)
                xmlLines.push(Utils.getTabs(initIndent) + '<objectMapping ' + attributes.join(' ') + '>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '<objectMapping>');
            if (objectMapping.inputObject !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('inputObject', objectMapping.inputObject));
            if (objectMapping.outputObject !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('outputObject', objectMapping.outputObject));
            if (objectMapping.mappingFields !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('mappingFields', objectMapping.mappingFields, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</objectMapping>');
        } else {
            if (attributes.length > 0)
                xmlLines.push(Utils.getTabs(initIndent) + '<objectMapping ' + attributes.join(' ') + '/>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '<objectMapping/>');
        }
        return xmlLines;
    }

}
module.exports = DuplicateRuleUtils;