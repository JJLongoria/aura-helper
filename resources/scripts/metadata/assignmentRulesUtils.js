const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class AssignmentRulesUtils {

    static createAssignmentRules(assingmentRules) {
        let newAssignmentRules;
        if (assingmentRules) {
            newAssignmentRules = Utils.prepareXML(assingmentRules, AssignmentRulesUtils.createAssignmentRules());
        } else {
            newAssignmentRules = {
                assignmentRule: []
            }
        }
        return newAssignmentRules;
    }

    static createAssignmentRule(fullname, active, ruleEntry) {
        let rEntry = Utils.forceArray(ruleEntry);
        return {
            active: active,
            fullname: fullname,
            ruleEntry: rEntry
        }
    }

    static createRuleEntry(assignedTo, assignedToType, booleanFilter, criteriaItems, formula, notifyCcRecipients, overrideExistingTeams, team, template) {
        return {
            assignedTo: assignedTo,
            assignedToType: assignedToType,
            booleanFilter: booleanFilter,
            criteriaItems: criteriaItems,
            formula: formula,
            notifyCcRecipients: notifyCcRecipients,
            overrideExistingTeams: overrideExistingTeams,
            team: team,
            template: template
        }
    }

    static toXML(assingmentRules, compress) {
        let xmlLines = [];
        if (assingmentRules) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<AssignmentRules xmlns="http://soap.sforce.com/2006/04/metadata">');
                for (const assignmentRule of assingmentRules.assignmentRule) {
                    xmlLines.push(Utils.getTabs(1) + '<assignmentRule>');
                    if (assignmentRule.fullName !== undefined)
                        xmlLines.push(Utils.getTabs(2) + Utils.getXMLTag('fullName', assignmentRule.fullName));
                    if (assignmentRule.active !== undefined)
                        xmlLines.push(Utils.getTabs(2) + Utils.getXMLTag('active', assignmentRule.active));
                    if (assignmentRule.ruleEntry) {
                        xmlLines = xmlLines.concat(AssignmentRulesUtils.getRuleEntriesXMLLines(assignmentRule.ruleEntry, 2));
                    }
                    xmlLines.push(Utils.getTabs(1) + '</assignmentRule>');
                }
                xmlLines.push('</AssignmentRules>');
            } else {
                return AuraParser.toXML(assingmentRules);
            }
        }
        return xmlLines.join('\n');
    }

    static getRuleEntriesXMLLines(ruleEntry, initIndent) {
        let xmlLines = [];
        let rEntry = Utils.forceArray(ruleEntry);
        for (const ruleEntry of rEntry) {
            xmlLines.push(Utils.getTabs(initIndent) + '<ruleEntry>');
            if (ruleEntry.assignedTo !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('assignedTo', ruleEntry.assignedTo));
            if (ruleEntry.assignedToType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('assignedToType', ruleEntry.assignedToType));
            if (ruleEntry.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', ruleEntry.booleanFilter));
            if (ruleEntry.formula !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', ruleEntry.formula));
            if (ruleEntry.template !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('template', ruleEntry.template));
            if (ruleEntry.notifyCcRecipients !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('notifyCcRecipients', ruleEntry.notifyCcRecipients));
            if (ruleEntry.overrideExistingTeams !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('overrideExistingTeams', ruleEntry.overrideExistingTeams));
            if (ruleEntry.team !== undefined) {
                Utils.sort(ruleEntry.team);
                xmlLines = xmlLines.concat(Utils.getXMLBlock('team', ruleEntry.team, true, initIndent + 1));
            }
            if (ruleEntry.criteriaItems !== undefined) {
                Utils.sort(ruleEntry.criteriaItems, ['field']);
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', ruleEntry.criteriaItems, true, initIndent + 1));
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</ruleEntry>');
        }
        return xmlLines;
    }

}
module.exports = AssignmentRulesUtils;