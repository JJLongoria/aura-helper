const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EscalationRulesUtils {

    static createEscalationRules(escalationRules) {
        let newEscalationRules;
        if (escalationRules) {
            newEscalationRules = Utils.prepareXML(escalationRules, EscalationRulesUtils.createEscalationRules());
        } else {
            newEscalationRules = {
                escalationRule: []
            };
        }
        return newEscalationRules;
    }

    static createEscalationRule(active, fullname, ruleEntry) {
        return {
            active: active,
            fullname: fullname,
            ruleEntry: Utils.forceArray(ruleEntry)
        }
    }

    static createRuleEntry(booleanFilter, businessHours, businessHoursSource, criteriaItems, disableEscalationWhenModified, escalationAction, escalationStartTime, formula) {
        return {
            booleanFilter: booleanFilter,
            businessHours: businessHours,
            businessHoursSource: businessHoursSource,
            criteriaItems: criteriaItems,
            disableEscalationWhenModified: disableEscalationWhenModified,
            escalationAction: escalationAction,
            escalationStartTime: escalationStartTime,
            formula: formula
        }
    }

    static createEscalationAction(assignedTo, assignedToTemplate, assignedToType, minutesToEscalation, notifyCaseOwner, notifyEmail, notifyTo, notifyToTemplate) {
        return {
            assignedTo: assignedTo,
            assignedToTemplate: assignedToTemplate,
            assignedToType: assignedToType,
            minutesToEscalation: minutesToEscalation,
            notifyCaseOwner: notifyCaseOwner,
            notifyEmail: notifyEmail,
            notifyTo: notifyTo,
            notifyToTemplate: notifyToTemplate
        }
    }

    static toXML(escalationRules, compress) {
        let xmlLines = [];
        if (escalationRules) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EscalationRules xmlns="http://soap.sforce.com/2006/04/metadata">');
                xmlLines = xmlLines.concat(EscalationRulesUtils.getEscalationRulesXMLLines(escalationRules.escalationRule, 1));
                xmlLines.push('</EscalationRules>');
            } else {
                return AuraParser.toXML(escalationRules);
            }
        }
        return xmlLines.join('\n');
    }

    static getEscalationRulesXMLLines(escalationRules, initIndent) {
        let xmlLines = [];
        for (const escalationRule of escalationRules) {
            xmlLines.push(Utils.getTabs(initIndent) + '<escalationRule>');
            if (escalationRule.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', escalationRule.fullName));
            if (escalationRule.active !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', escalationRule.active));
            if (escalationRule.ruleEntry !== undefined)
                xmlLines = xmlLines.concat(EscalationRulesUtils.getRuleEntriesXMLLines(escalationRule.ruleEntry, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</escalationRule>');
        }
        return xmlLines;
    }

    static getRuleEntriesXMLLines(ruleEntry, initIndent) {
        let xmlLines = [];
        let entries = Utils.forceArray(ruleEntry);
        for (const entry of entries) {
            xmlLines.push(Utils.getTabs(initIndent) + '<ruleEntry>');
            if (entry.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', entry.booleanFilter));
            if (entry.businessHours !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessHours', entry.businessHours));
            if (entry.businessHoursSource !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessHoursSource', entry.businessHoursSource));
            if (entry.disableEscalationWhenModified !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('disableEscalationWhenModified', entry.disableEscalationWhenModified));
            if (entry.escalationStartTime !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('escalationStartTime', entry.escalationStartTime));
            if (entry.formula !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', entry.formula));
            if (entry.criteriaItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', entry.criteriaItems, true, initIndent + 1));
            if (entry.escalationAction !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('escalationAction', entry.escalationAction, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</ruleEntry>');
        }
        return xmlLines;
    }
}
module.exports = EscalationRulesUtils;