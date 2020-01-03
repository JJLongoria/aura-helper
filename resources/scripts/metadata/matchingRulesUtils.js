const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class MatchingRulesUtils {

    static createMatchingRules(matchingRule) {
        let newMatchingRules;
        if (matchingRule) {
            newMatchingRules = Utils.prepareXML(matchingRule, MatchingRulesUtils.createMatchingRules());
        } else {
            newMatchingRules = {
                fullName: undefined,
                matchingRules: [],
            };
        }
        return newMatchingRules;
    }

    static createMatchingRule(booleanFilter, description, label, matchingRuleItems, ruleStatus) {
        return {
            booleanFilter: booleanFilter,
            description: description,
            label: label,
            matchingRuleItems: Utils.forceArray(matchingRuleItems),
            ruleStatus: ruleStatus
        };
    }

    static createMatchingRuleItem(blankValueBehavior, fieldName, matchingMethod) {
        return {
            blankValueBehavior: blankValueBehavior,
            fieldName: fieldName,
            matchingMethod: matchingMethod
        }
    }

    static toXML(matchingRule, compress) {
        let xmlLines = [];
        if (matchingRule) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<MatchingRules xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (matchingRule.matchingRules !== undefined)
                    xmlLines = xmlLines.concat(MatchingRulesUtils.getMatchingRulesXMLLines(matchingRule.matchingRules, 1));
                xmlLines.push('</MatchingRules>');
            } else {
                return AuraParser.toXML(matchingRule);
            }
        }
        return xmlLines.join('\n');
    }

    static getMatchingRulesXMLLines(matchingRules, initIndent) {
        let xmlLines = [];
        for (const rule of matchingRules) {
            xmlLines.push(Utils.getTabs(initIndent) + '<matchingRules>');
            if (rule.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', rule.fullName));
            if (rule.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', rule.label));
            if (rule.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', rule.description));
            if (rule.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', rule.booleanFilter));
            if (rule.ruleStatus !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('ruleStatus', rule.ruleStatus));
            if (rule.matchingRuleItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('matchingRuleItems', rule.matchingRuleItems, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</matchingRules>');
        }
        return xmlLines;
    }

}
module.exports = MatchingRulesUtils;