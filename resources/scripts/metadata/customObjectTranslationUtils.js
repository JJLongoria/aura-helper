const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomObjectTranslationUtils {

    static createCustomObjectTranslation(customObjectTranslation) {
        let newCustomObjectTranslation;
        if (customObjectTranslation) {
            newCustomObjectTranslation = Utils.prepareXML(customObjectTranslation, CustomObjectTranslationUtils.createCustomObjectTranslation());
        } else {
            newCustomObjectTranslation = {
                caseValues: [],
                fields: [],
                fieldSets: [],
                fullName: undefined,
                gender: undefined,
                layouts: [],
                nameFieldLabel: undefined,
                namedFilters: [],
                quickActions: [],
                recordTypes: [],
                sharingReasons: [],
                startsWith: undefined,
                validationRules: [],
                webLinks: [],
                workflowTasks: [],
            };
        }
        return newCustomObjectTranslation;
    }

    static createCustomFieldTranslation(caseValues, description, gender, help, label, lookupFilter, name, picklistValues, relationshipLabel, startsWith) {
        return {
            caseValues: Utils.forceArray(caseValues),
            description: description,
            gender: gender,
            help: help,
            label: label,
            lookupFilter: lookupFilter,
            name: name,
            picklistValues: Utils.forceArray(picklistValues),
            relationshipLabel: relationshipLabel,
            startsWith: startsWith
        }
    }

    static createFieldSetTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createLayoutTranslation(layout, layoutType, sections) {
        return {
            layout: layout,
            layoutType: layoutType,
            sections: Utils.forceArray(sections)
        }
    }

    static createLayoutSectionTranslation(label, section) {
        return {
            label: label,
            section: section
        }
    }

    static createLookupFilterTranslation(errorMessage, informationalMessage) {
        return {
            errorMessage: errorMessage,
            informationalMessage: informationalMessage
        }
    }

    static createNamedFilterTranslation(errorMessage, informationalMessage, name) {
        return {
            errorMessage: errorMessage,
            informationalMessage: informationalMessage,
            name: name
        }
    }

    static createObjectNameCaseValue(article, caseType, plural, possessive, value) {
        return {
            article: article,
            caseType: caseType,
            plural: plural,
            possessive: possessive,
            value: value
        }
    }

    static createPicklistValueTranslation(masterLabel, translation) {
        return {
            masterLabel: masterLabel,
            translation: translation
        }
    }

    static createQuickActionTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createRecordTypeTranslation(label, name, description) {
        return {
            label: label,
            name: name,
            description: description
        }
    }

    static createSharingReasonTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createValidationRuleTranslation(errorMessage, name) {
        return {
            errorMessage: errorMessage,
            name: name
        }
    }
    static createWeblinkTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createWorkflowTranslation(description, name, subject) {
        return {
            description: description,
            name: name,
            subject: subject
        }
    }

    static toXML(customObjectTranslation, compress) {
        let xmlLines = [];
        if (customObjectTranslation) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomObjectTranslation xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customObjectTranslation.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customObjectTranslation.fullName));
                if (customObjectTranslation.gender !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('gender', customObjectTranslation.gender));
                if (customObjectTranslation.nameFieldLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('nameFieldLabel', customObjectTranslation.nameFieldLabel));
                if (customObjectTranslation.startsWith !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('startsWith', customObjectTranslation.startsWith));
                if (customObjectTranslation.caseValues !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('caseValues', customObjectTranslation.caseValues, true, 1));
                if (customObjectTranslation.fields !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', customObjectTranslation.fields, true, 1));
                if (customObjectTranslation.fieldSets !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldSets', customObjectTranslation.fieldSets, true, 1));
                if (customObjectTranslation.layouts !== undefined)
                    xmlLines = xmlLines.concat(CustomObjectTranslationUtils.getLayoutTranslationsXMLLines(customObjectTranslation.layouts, 1));
                if (customObjectTranslation.namedFilters !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('namedFilters', customObjectTranslation.namedFilters, true, 1));
                if (customObjectTranslation.quickActions !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('quickActions', customObjectTranslation.quickActions, true, 1));
                if (customObjectTranslation.recordTypes !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('recordTypes', customObjectTranslation.recordTypes, true, 1));
                if (customObjectTranslation.sharingReasons !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('sharingReasons', customObjectTranslation.sharingReasons, true, 1));
                if (customObjectTranslation.validationRules !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('validationRules', customObjectTranslation.validationRules, true, 1));
                if (customObjectTranslation.webLinks !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('webLinks', customObjectTranslation.webLinks, true, 1));
                if (customObjectTranslation.workflowTasks !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('workflowTasks', customObjectTranslation.workflowTasks, true, 1));
                xmlLines.push('</CustomObjectTranslation>');
            } else {
                return AuraParser.toXML(customObjectTranslation);
            }
        }
        return xmlLines.join('\n');
    }

    static getLayoutTranslationsXMLLines(layouts, initIndent) {
        let xmlLines = [];
        for (const layout of layouts) {
            xmlLines.push(Utils.getTabs(initIndent) + '</layouts>');
            if (layout.layout !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('layout', layout.layout));
            if (layout.layoutType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('layoutType', layout.layoutType));
            if (layout.sections !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('sections', layout.sections, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</layouts>');
        }
        return xmlLines;
    }

}
module.exports = CustomObjectTranslationUtils;