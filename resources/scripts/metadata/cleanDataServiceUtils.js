const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CleanDataServiceUtils {

    static createCleanDataService(cleanDataService) {
        let newCleanDataService;
        if (cleanDataService) {
            newCleanDataService = Utils.prepareXML(cleanDataService, CleanDataServiceUtils.createCleanDataService());
        } else {
            newCleanDataService = {
                cleanRules: [],
                description: undefined,
                fullName: undefined,
                masterLabel: undefined,
                matchEngine: undefined
            };
        }
        return newCleanDataService;
    }

    static createCleanRule(bulkEnabled, bypassTriggers, bypassWorkflow, description, developerName, fieldMappings, masterLabel, matchRule, sourceSobjectType, status, targetSobjectType) {
        return {
            bulkEnabled: bulkEnabled,
            bypassTriggers: bypassTriggers,
            bypassWorkflow: bypassWorkflow,
            description: description,
            developerName: developerName,
            fieldMappings: fieldMappings,
            masterLabel: masterLabel,
            matchRule: matchRule,
            sourceSobjectType: sourceSobjectType,
            status: status,
            targetSobjectType: targetSobjectType
        }
    }

    static craeteFieldMapping(developerName, fieldMappingRows, masterLabel, SObjectType) {
        return {
            developerName: developerName,
            fieldMappingRows: fieldMappingRows,
            masterLabel: masterLabel,
            SObjectType: SObjectType
        }
    }

    static createFieldMappingRow(fieldName, fieldMappingFields, mappingOperation, SObjectType) {
        return {
            fieldName: fieldName,
            fieldMappingFields: fieldMappingFields,
            mappingOperation: mappingOperation,
            SObjectType: SObjectType
        }
    }

    static createFieldMappingField(dataServiceField, dataServiceObjectName, priority) {
        return {
            dataServiceField: dataServiceField,
            dataServiceObjectName: dataServiceObjectName,
            priority: priority
        }
    }

    static toXML(cleanDataService, compress) {
        let xmlLines = [];
        if (cleanDataService) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CleanDataService xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (cleanDataService.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', cleanDataService.fullName));
                if (cleanDataService.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', cleanDataService.description));
                if (cleanDataService.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', cleanDataService.masterLabel));
                if (cleanDataService.matchEngine !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('matchEngine', cleanDataService.matchEngine));
                if (cleanDataService.cleanRules !== undefined)
                    xmlLines = xmlLines.concat(CleanDataServiceUtils.getCleanRulesXMLLines(cleanDataService.cleanRules, 1));
                xmlLines.push('</CleanDataService>');
            } else {
                return AuraParser.toXML(cleanDataService);
            }
        }
        return xmlLines.join('\n');
    }

    static getCleanRulesXMLLines(cleanRules, initIndent) {
        let xmlLines = [];
        for (const cleanRule of cleanRules) {
            xmlLines.push(Utils.getTabs(initIndent) + '<cleanRules>');
            if (cleanRule.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', cleanRule.developerName));
            if (cleanRule.masterLabel !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', cleanRule.masterLabel));
            if (cleanRule.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', cleanRule.description));
            if (cleanRule.status !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('status', cleanRule.status));
            if (cleanRule.sourceSobjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sourceSobjectType', cleanRule.sourceSobjectType));
            if (cleanRule.targetSobjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('targetSobjectType', cleanRule.targetSobjectType));
            if (cleanRule.matchRule !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('matchRule', cleanRule.matchRule));
            if (cleanRule.bulkEnabled !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('bulkEnabled', cleanRule.bulkEnabled));
            if (cleanRule.bypassTriggers !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('bypassTriggers', cleanRule.bypassTriggers));
            if (cleanRule.bypassWorkflow !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('bypassWorkflow', cleanRule.bypassWorkflow));
            if (cleanRule.fieldMappings !== undefined)
                xmlLines = xmlLines.concat(CleanDataServiceUtils.getFieldMappingsXMLLines(cleanRule.fieldMappings, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</cleanRules>');
        }
        return xmlLines;
    }

    static getFieldMappingsXMLLines(fieldMappings, initIndent) {
        let xmlLines = [];
        let mappings = Utils.forceArray(fieldMappings);
        for (const mapping of mappings) {
            xmlLines.push(Utils.getTabs(initIndent) + '<fieldMappings>');
            if (mapping.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', mapping.developerName));
            if (mapping.masterLabel !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', mapping.masterLabel));
            if (mapping.SObjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('SObjectType', mapping.SObjectType));
            if (mapping.fieldMappingRows !== undefined)
                xmlLines = xmlLines.concat(CleanDataServiceUtils.getFieldMappingRowsXMLLines(mapping.fieldMappingRows, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</fieldMappings>');
        }
        return xmlLines;
    }

    static getFieldMappingRowsXMLLines(fieldMappingRows, initIndent) {
        let xmlLines = [];
        let mappings = Utils.forceArray(fieldMappingRows);
        for (const mapping of mappings) {
            xmlLines.push(Utils.getTabs(initIndent) + '<fieldMappingRows>');
            if (mapping.fieldName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fieldName', mapping.fieldName));
            if (mapping.SObjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('SObjectType', mapping.SObjectType));
            if (mapping.mappingOperation !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('mappingOperation', mapping.mappingOperation));
            if (mapping.fieldMappingFields !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldMappingFields', mapping.fieldMappingFields, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</fieldMappingRows>');
        }
        return xmlLines;
    }
}
module.exports = CleanDataServiceUtils;