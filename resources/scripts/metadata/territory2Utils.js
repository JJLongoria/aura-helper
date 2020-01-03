const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class Territory2Utils {

    static createTerritory2(territory2) {
        let newTerritory2;
        if (territory2) {
            newTerritory2 = Utils.prepareXML(territory2, Territory2Utils.createTerritory2());
        } else {
            newTerritory2 = {
                accountAccessLevel: undefined,
                caseAccessLevel: undefined,
                contactAccessLevel: undefined,
                customFields: [],
                description: undefined,
                fullName: undefined,
                name: undefined,
                opportunityAccessLevel: undefined,
                parentTerritory: undefined,
                ruleAssociations: [],
                territory2Type: undefined,
            };
        }
        return newTerritory2;
    }

    static createFieldValue(name, value) {
        return {
            name: name,
            value: value
        }
    }

    static createTerritory2RuleAssociation(inherited, ruleName) {
        return {
            inherited: inherited,
            ruleName: ruleName
        }
    }

    static toXML(territory2, compress) {
        let xmlLines = [];
        if (territory2) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Territory2 xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">');
                if (territory2.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', territory2.fullName));
                if (territory2.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', territory2.name));
                if (territory2.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', territory2.description));
                if (territory2.accountAccessLevel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('accountAccessLevel', territory2.accountAccessLevel));
                if (territory2.contactAccessLevel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('contactAccessLevel', territory2.contactAccessLevel));
                if (territory2.opportunityAccessLevel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('opportunityAccessLevel', territory2.opportunityAccessLevel));
                if (territory2.caseAccessLevel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('caseAccessLevel', territory2.caseAccessLevel));
                if (territory2.parentTerritory !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('parentTerritory', territory2.parentTerritory));
                if (territory2.territory2Type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('territory2Type', territory2.territory2Type));
                if (territory2.customFields !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customFields', territory2.customFields, true, 1));
                if (territory2.ruleAssociations !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('ruleAssociations', territory2.ruleAssociations, true, 1));
                xmlLines.push('</Territory2>');
            } else {
                return AuraParser.toXML(territory2);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = Territory2Utils;