const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class Territory2RuleUtils {

    static createTerritory2Rule(territory2Rule) {
        let newTerritory2Rule;
        if (territory2Rule) {
            newTerritory2Rule = Utils.prepareXML(territory2Rule, Territory2RuleUtils.createTerritory2Rule());
        } else {
            newTerritory2Rule = {
                active: undefined,
                booleanFilter: undefined,
                fullName: undefined,
                name: undefined,
                objectType: undefined,
                ruleItems: []
            };
        }
        return newTerritory2Rule;
    }

    static createTerritory2RuleItem(field, operation, value) {
        return {
            field: field,
            operation: operation,
            value: value
        }
    }

    static toXML(territory2Rule, compress) {
        let xmlLines = [];
        if (territory2Rule) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Territory2Rule xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (territory2Rule.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', territory2Rule.fullName));
                if (territory2Rule.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', territory2Rule.name));
                if (territory2Rule.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', territory2Rule.description));
                if (territory2Rule.objectType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('objectType', territory2Rule.objectType));
                if (territory2Rule.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', territory2Rule.active));
                if (territory2Rule.booleanFilter !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('booleanFilter', territory2Rule.booleanFilter));
                if (territory2Rule.ruleItems !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('ruleItems', territory2Rule.ruleItems, true, 1));
                xmlLines.push('</Territory2Rule>');
            } else {
                return AuraParser.toXML(territory2Rule);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = Territory2RuleUtils;