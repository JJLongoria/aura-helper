const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class AutoResponseRulesUtils {

    static createAutoResponseRules(autoResponseRules) {
        let newAutoResponseRules;
        if (autoResponseRules) {
            newAutoResponseRules = Utils.prepareXML(autoResponseRules, AutoResponseRulesUtils.createAutoResponseRules());
        } else {
            newAutoResponseRules = {
                autoResponseRule: []
            };
        }
        return newAutoResponseRules;
    }

    static createAutoResponseRule(fullname, active, ruleEntry) {
        let rEntry = Utils.forceArray(ruleEntry);
        return {
            active: active,
            fullname: fullname,
            ruleEntry: rEntry
        }
    }

    static createRuleEntry(booleanFilter, criteriaItems, formula, replyToEmail, senderEmail, senderName, template) {
        return {
            booleanFilter: booleanFilter,
            criteriaItems: criteriaItems,
            formula: formula,
            replyToEmail: replyToEmail,
            senderEmail: senderEmail,
            senderName: senderName,
            template: template
        }
    }

    static toXML(autoResponseRules, compress) {
        let xmlLines = [];
        if (autoResponseRules) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<AutoResponseRules xmlns="http://soap.sforce.com/2006/04/metadata">');
                for (const autoresponseRule of autoResponseRules.autoResponseRule) {
                    xmlLines.push(Utils.getTabs(1) + '<autoResponseRule>');
                    if (autoresponseRule.fullName !== undefined)
                        xmlLines.push(Utils.getTabs(2) + Utils.getXMLTag('fullName', autoresponseRule.fullName));
                    if (autoresponseRule.active !== undefined)
                        xmlLines.push(Utils.getTabs(2) + Utils.getXMLTag('active', autoresponseRule.active));
                    if (autoresponseRule.ruleEntry) {
                        xmlLines = xmlLines.concat(AutoResponseRulesUtils.getRuleEntriesXMLLines(autoresponseRule.ruleEntry, 2));
                    }
                    xmlLines.push(Utils.getTabs(1) + '</autoResponseRule>');
                }
                xmlLines.push('</AutoResponseRules>');
            } else {
                return AuraParser.toXML(autoResponseRules);
            }
        }
        return xmlLines.join('\n');
    }

    static getRuleEntriesXMLLines(ruleEntry, initIndent) {
        let xmlLines = [];
        let rEntry = Utils.forceArray(ruleEntry);
        for (const ruleEntry of rEntry) {
            xmlLines.push(Utils.getTabs(initIndent) + '<ruleEntry>');
            if (ruleEntry.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', ruleEntry.booleanFilter));
            if (ruleEntry.formula !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', ruleEntry.formula));
            if (ruleEntry.template !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('template', ruleEntry.template));
            if (ruleEntry.replyToEmail !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('replyToEmail', ruleEntry.replyToEmail));
            if (ruleEntry.senderEmail !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('senderEmail', ruleEntry.senderEmail));
            if (ruleEntry.senderName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('senderName', ruleEntry.senderName));
            if (ruleEntry.criteriaItems !== undefined) {
                Utils.sort(ruleEntry.criteriaItems, ['field']);
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', ruleEntry.criteriaItems, true, initIndent + 1));
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</ruleEntry>');
        }
        return xmlLines;
    }

}
module.exports = AutoResponseRulesUtils;