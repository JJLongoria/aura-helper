const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EntitlementProcessUtils {

    static createEntitlementProcess(entitlementProcess) {
        let newEntitlementProcess;
        if (entitlementProcess) {
            newEntitlementProcess = Utils.prepareXML(entitlementProcess, EntitlementProcessUtils.createEntitlementProcess());
        } else {
            newEntitlementProcess = {
                active: undefined,
                businessHours: undefined,
                description: undefined,
                entryStartDateField: undefined,
                exitCriteriaBooleanFilter: undefined,
                exitCriteriaFilterItems: [],
                exitCriteriaFormula: undefined,
                fullName: undefined,
                isVersionDefault: undefined,
                milestones: [],
                name: undefined,
                SObjectType: undefined,
                versionMaster: undefined,
                versionNotes: undefined,
                versionNumber: undefined
            };
        }
        return newEntitlementProcess;
    }

    static createEntitlementProcessMilestoneItem(entitlementProcessMilestoneItem) {
        let newEntitlementProcessMilestoneItem;
        if (entitlementProcessMilestoneItem) {
            newEntitlementProcessMilestoneItem = Utils.prepareXML(entitlementProcessMilestoneItem, EntitlementProcessUtils.createEntitlementProcessMilestoneItem());
        } else {
            newEntitlementProcessMilestoneItem = {
                businessHours: undefined,
                criteriaBooleanFilter: undefined,
                milestoneCriteriaFilterItems: [],
                milestoneCriteriaFormula: undefined,
                milestoneName: undefined,
                minutesCustomClass: [],
                minutesToComplete: undefined,
                successActions: [],
                timeTriggers: [],
                useCriteriaStartTime: undefined
            };
        }
        return newEntitlementProcessMilestoneItem;
    }

    static createEntitlementProcessMilestoneTimeTrigger(actions, timeLength, workflowTimeTriggerUnit) {
        return {
            actions: Utils.forceArray(actions),
            timeLength: timeLength,
            workflowTimeTriggerUnit: workflowTimeTriggerUnit
        }
    }

    static createFilterItem(field, operation, value, valueField) {
        return {
            field: field,
            operation: operation,
            value: value,
            valueField: valueField
        }
    }

    static toXML(entitlementProcess, compress) {
        let xmlLines = [];
        if (entitlementProcess) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EntitlementProcess xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (entitlementProcess.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', entitlementProcess.fullName));
                if (entitlementProcess.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', entitlementProcess.name));
                if (entitlementProcess.SObjectType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('SObjectType', entitlementProcess.SObjectType));
                if (entitlementProcess.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', entitlementProcess.description));
                if (entitlementProcess.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', entitlementProcess.active));
                if (entitlementProcess.businessHours !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('businessHours', entitlementProcess.businessHours));
                if (entitlementProcess.entryStartDateField !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('entryStartDateField', entitlementProcess.entryStartDateField));
                if (entitlementProcess.exitCriteriaBooleanFilter !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('exitCriteriaBooleanFilter', entitlementProcess.exitCriteriaBooleanFilter));
                if (entitlementProcess.exitCriteriaFormula !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('exitCriteriaFormula', entitlementProcess.exitCriteriaFormula));
                if (entitlementProcess.isVersionDefault !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isVersionDefault', entitlementProcess.isVersionDefault));
                if (entitlementProcess.versionMaster !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('versionMaster', entitlementProcess.versionMaster));
                if (entitlementProcess.versionNotes !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('versionNotes', entitlementProcess.versionNotes));
                if (entitlementProcess.versionNumber !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('versionNumber', entitlementProcess.versionNumber));
                if (entitlementProcess.exitCriteriaFilterItems !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('exitCriteriaFilterItems', entitlementProcess.exitCriteriaFilterItems, true, 1));
                if (entitlementProcess.milestones !== undefined)
                    xmlLines = xmlLines.concat(EntitlementProcessUtils.getEntitlementProcessMilestoneItemXMLLines(entitlementProcess.milestones, 1));
                xmlLines.push('</EntitlementProcess>');
            } else {
                return AuraParser.toXML(entitlementProcess);
            }
        }
        return xmlLines.join('\n');
    }

    static getEntitlementProcessMilestoneItemXMLLines(milestones, initIndent) {
        let xmlLines = [];
        for (const milestone of milestones) {
            xmlLines.push(Utils.getTabs(initIndent) + '<milestones>');
            if (milestone.milestoneName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('milestoneName', milestone.milestoneName));
            if (milestone.businessHours !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessHours', milestone.businessHours));
            if (milestone.criteriaBooleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('criteriaBooleanFilter', milestone.criteriaBooleanFilter));
            if (milestone.milestoneCriteriaFormula !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('milestoneCriteriaFormula', milestone.milestoneCriteriaFormula));
            if (milestone.minutesCustomClass !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('minutesCustomClass', milestone.minutesCustomClass));
            if (milestone.minutesToComplete !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('minutesToComplete', milestone.minutesToComplete));
            if (milestone.useCriteriaStartTime !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('useCriteriaStartTime', milestone.useCriteriaStartTime));

            if (milestone.milestoneCriteriaFilterItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('milestoneCriteriaFilterItems', milestone.milestoneCriteriaFilterItems, true, initIndent + 1));
            if (milestone.successActions !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('successActions', milestone.successActions, true, initIndent + 1));
            if (milestone.timeTriggers !== undefined)
                xmlLines = xmlLines.concat(EntitlementProcessUtils.getEntitlementProcessMilestoneTimeTriggerXMLLines(milestone.timeTriggers, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</milestones>');
        }
        return xmlLines;
    }

    static getEntitlementProcessMilestoneTimeTriggerXMLLines(timeTriggers, initIndent) {
        let xmlLines = [];
        let triggers = Utils.forceArray(timeTriggers);
        for (const trigger of triggers) {
            xmlLines.push(Utils.getTabs(initIndent) + '<timeTriggers>');
            if (trigger.timeLength !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('timeLength', trigger.timeLength));
            if (trigger.workflowTimeTriggerUnit !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('workflowTimeTriggerUnit', trigger.workflowTimeTriggerUnit));
            if (trigger.actions !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('actions', trigger.actions, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</timeTriggers>');
        }
        return xmlLines;
    }

}
module.exports = EntitlementProcessUtils;