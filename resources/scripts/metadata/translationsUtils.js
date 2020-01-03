const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class TranslationsUtils {

    static createTranslations(translations) {
        let newTranslations;
        if (translations) {
            newTranslations = Utils.prepareXML(translations, TranslationsUtils.createTranslations());
        } else {
            newTranslations = {
                customApplications: [],
                customLabels: [],
                customPageWebLinks: [],
                customTabs: [],
                flowDefinitions: [],
                fullName: undefined,
                globalPicklists: [],
                quickActions: [],
                reportTypes: [],
                scontrols: []
            };
        }
        return newTranslations;
    }

    static createCustomApplicationTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createCustomLabelTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createCustomPageWebLinkTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createCustomTabTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createFlowDefinitionTranslation(flows, fullName, label) {
        return {
            flows: Utils.forceArray(flows),
            fullName: fullName,
            label: label
        }
    }

    static createFlowTranslation(choices, fullName, label, screens, stages) {
        return {
            choices: Utils.forceArray(choices),
            fullName: fullName,
            label: label,
            screens: Utils.forceArray(screens),
            stages: Utils.forceArray(stages),
        }
    }

    static createFlowChoiceTranslation(choiceText, name, userInput) {
        return {
            choiceText: choiceText,
            name: name,
            userInput: userInput
        }
    }

    static createFlowChoiceUserInputTranslation(promptText, validationRule) {
        return {
            promptText: promptText,
            validationRule: validationRule,
        }
    }

    static createFlowInputValidationRuleTranslation(errorMessage) {
        return {
            errorMessage: errorMessage
        }
    }

    static createFlowScreenTranslation(fields, helpText, name, pausedText) {
        return {
            fields: Utils.forceArray(fields),
            helpText: helpText,
            name: name,
            pausedText: pausedText,
        }
    }

    static createFlowScreenFieldTranslation(fieldText, helpText, name, validationRule) {
        return {
            fieldText: fieldText,
            helpText: helpText,
            name: name,
            validationRule: validationRule
        }
    }

    static createFlowStageTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createFlowTextTemplateTranslation(name, text) {
        return {
            name: name,
            text: text
        }
    }

    static createGlobalPicklistTranslation(name, picklistValues) {
        return {
            name: name,
            picklistValues: Utils.forceArray(picklistValues)
        }
    }

    static createGlobalQuickActionTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createPicklistValueTranslation(masterLabel, translation) {
        return {
            masterLabel: masterLabel,
            translation: translation
        }
    }

    static createReportTypeTranslation(description, label, name, sections) {
        return {
            description: description,
            label: label,
            name: name,
            sections: Utils.forceArray(sections)
        }
    }

    static createReportTypeSectionTranslation(columns, label, name) {
        return {
            columns: Utils.forceArray(columns),
            label: label,
            name: name
        }
    }

    static createReportTypeColumnTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static createScontrolTranslation(label, name) {
        return {
            label: label,
            name: name
        }
    }

    static toXML(translations, compress) {
        let xmlLines = [];
        if (translations) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Translations xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (translations.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', translations.fullName));
                if (translations.customApplications !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customApplications', translations.customApplications, true, 1));
                if (translations.customLabels !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customLabels', translations.customLabels, true, 1));
                if (translations.customPageWebLinks !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customPageWebLinks', translations.customPageWebLinks, true, 1));
                if (translations.customTabs !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customTabs', translations.customTabs, true, 1));
                if (translations.quickActions !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('quickActions', translations.quickActions, true, 1));
                if (translations.scontrols !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('scontrols', translations.scontrols, true, 1));
                if (translations.flowDefinitions !== undefined)
                    xmlLines = xmlLines.concat(TranslationsUtils.getFlowDefinitionTranslationXMLLines(translations.flowDefinitions, 1));
                if (translations.reportTypes !== undefined)
                    xmlLines = xmlLines.concat(TranslationsUtils.getReportTypeTranslationXMLLines(translations.reportTypes, 1));
                xmlLines.push('</Translations>');
            } else {
                return AuraParser.toXML(translations);
            }
        }
        return xmlLines.join('\n');
    }

    static getFlowDefinitionTranslationXMLLines(flowDefinitions, initIndent) {
        let xmlLines = [];
        for (const flowDefinition of flowDefinitions) {
            xmlLines.push(Utils.getTabs(initIndent) + '<flowDefinitions>');
            if (flowDefinition.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', flowDefinition.fullName));
            if (flowDefinition.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', flowDefinition.label));
            if (flowDefinition.flows !== undefined)
                xmlLines = xmlLines.concat(TranslationsUtils.getFlowTranslationXMLLines(flowDefinition.flows, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</flowDefinitions>');
        }
        return xmlLines.join('\n');
    }

    static getFlowTranslationXMLLines(flows, initIndent) {
        let xmlLines = [];
        let flowsToProcess = Utils.forceArray(flows);
        for (const flow of flowsToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<flows>');
            if (flow.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', flow.fullName));
            if (flow.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', flow.label));
            if (flow.choices !== undefined)
                xmlLines = xmlLines.concat(TranslationsUtils.getFlowChoiceTranslationXMLLines(flow.choices, initIndent + 1));
            if (flow.screens !== undefined)
                xmlLines = xmlLines.concat(TranslationsUtils.getFlowScreenTranslationXMLLines(flow.screens, initIndent + 1));
            if (flow.stages !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('stages', flow.stages, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</flows>');
        }
        return xmlLines.join('\n');
    }

    static getFlowChoiceTranslationXMLLines(choices, initIndent) {
        let xmlLines = [];
        let choicesToProcess = Utils.forceArray(choices);
        for (const choice of choicesToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<choices>');
            if (choice.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', choice.name));
            if (choice.choiceText !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('choiceText', choice.choiceText));
            if (choice.userInput !== undefined) {
                let line = [];
                line.push(Utils.getTabs(initIndent + 1) + '<userInput>');
                if (choice.userInput.promptText !== undefined)
                    line.push(Utils.getXMLTag('promptText', choice.userInput.promptText));
                if (choice.userInput.validationRule !== undefined)
                    line = line.concat(Utils.getXMLBlock('scontrols', choice.userInput.validationRule, true, 0));
                line.push('</userInput>');
                xmlLines.push(line.join(''));
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</choices>');
        }
        return xmlLines;
    }

    static getFlowScreenTranslationXMLLines(screens, initIndent) {
        let xmlLines = [];
        let screensToProcess = Utils.forceArray(screens);
        for (const screen of screensToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<screens>');
            if (screen.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', screen.name));
            if (screen.helpText !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('helpText', screen.helpText));
            if (screen.pausedText !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('pausedText', screen.pausedText));
            if (screen.fields !== undefined)
                xmlLines = xmlLines.concat(TranslationsUtils.getFlowScreenFieldTranslationXMLLines(screen.fields, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</screens>');
        }
        return xmlLines;
    }

    static getFlowScreenFieldTranslationXMLLines(fields, initIndent) {
        let xmlLines = [];
        let fieldsToProcess = Utils.forceArray(fields);
        for (const field of fieldsToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<fields>');
            if (field.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', field.name));
            if (field.fieldText !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fieldText', field.fieldText));
            if (field.helpText !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('helpText', field.helpText));
            if (field.validationRule !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('validationRule', field.validationRule, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</fields>');
        }
        return xmlLines;
    }

    static getReportTypeTranslationXMLLines(reportTypes, initIndent) {
        let xmlLines = [];
        for (const report of reportTypes) {
            xmlLines.push(Utils.getTabs(initIndent) + '<reportTypes>');
            if (report.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', report.name));
            if (report.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', report.label));
            if (report.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', report.description));
            if (report.sections !== undefined)
                xmlLines = xmlLines.concat(TranslationsUtils.getReportTypeSectionTranslationXMLLines(report.sections, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</reportTypes>');
        }
        return xmlLines;
    }

    static getReportTypeSectionTranslationXMLLines(sections, initIndent) {
        let xmlLines = [];
        let sectionsToProcess = Utils.forceArray(sections);
        for (const section of sectionsToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<sections>');
            if (section.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', section.name));
            if (section.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', section.label));
            if (section.columns !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('columns', section.columns, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</sections>');
        }
        return xmlLines;
    }
}
module.exports = TranslationsUtils;