const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class MlDomainUtils {

    static createMlDomain(mlDomain) {
        let newMlDomain;
        if (mlDomain) {
            newMlDomain = Utils.prepareXML(mlDomain, MlDomainUtils.createMlDomain());
        } else {
            newMlDomain = {
                description: undefined,
                fullName: undefined,
                label: undefined,
                mlIntents: undefined,
                mlSlotClasses: undefined
            };
        }
        return newMlDomain;
    }

    static createMlIntent(description, developerName, label, mlIntentUtterances, relatedMlIntents) {
        return {
            description: description,
            developerName: developerName,
            label: label,
            mlIntentUtterances: Utils.forceArray(mlIntentUtterances),
            relatedMlIntents: Utils.forceArray(relatedMlIntents)
        }
    }

    static createMlIntentUtterance(utterance) {
        return {
            utterance: utterance
        }
    }

    static createMlRelatedIntent(relatedMlIntent) {
        return {
            relatedMlIntent: relatedMlIntent
        }
    }

    static createMlSlotClass(description, developerName, extractionRegex, extractionType, label, mlSlotClassValues) {
        return {
            description: description,
            developerName: developerName,
            extractionRegex: extractionRegex,
            extractionType: extractionType,
            label: label,
            mlSlotClassValues: Utils.forceArray(mlSlotClassValues)
        }
    }

    static createMlSlotClassValue(synonymGroup, value) {
        return {
            synonymGroup: synonymGroup,
            value: value
        }
    }

    static createSynonymGroup(languages, terms) {
        return {
            languages: languages,
            terms: terms
        }
    }

    static toXML(mlDomain, compress) {
        let xmlLines = [];
        if (mlDomain) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<MlDomain xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (mlDomain.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', mlDomain.fullName));
                if (mlDomain.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', mlDomain.label));
                if (mlDomain.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', mlDomain.description));
                if (mlDomain.mlIntents !== undefined)
                    xmlLines = xmlLines.concat(MlDomainUtils.getMLLIntentsXMLLines(mlDomain.mlIntents, 1));
                if (mlDomain.mlSlotClasses !== undefined)
                    xmlLines = xmlLines.concat(MlDomainUtils.getSlotClassesXMLLines(mlDomain.mlSlotClasses, 1));
                xmlLines.push('</MlDomain>');
            } else {
                return AuraParser.toXML(mlDomain);
            }
        }
        return xmlLines.join('\n');
    }

    static getMLLIntentsXMLLines(mlIntents, initIndent) {
        let xmlLines = [];
        let intents = Utils.forceArray(mlIntents);
        for (const intent of intents) {
            xmlLines.push(Utils.getTabs(initIndent) + '<mlIntents>');
            if (intent.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', intent.developerName));
            if (intent.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', intent.description));
            if (intent.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', intent.label));
            if (intent.mlIntentUtterances)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('mlIntentUtterances', intent.mlIntentUtterances, true, initIndent + 1));
            if (intent.relatedMlIntents)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('relatedMlIntents', intent.relatedMlIntents, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</mlIntents>');
        }
        return xmlLines;
    }

    static getSlotClassesXMLLines(mlSlotClasses, initIndent) {
        let xmlLines = [];
        let slots = Utils.forceArray(mlSlotClasses);
        for (const slot of slots) {
            xmlLines.push(Utils.getTabs(initIndent) + '<mlSlotClasses>');
            if (slot.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', slot.developerName));
            if (slot.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', slot.description));
            if (slot.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', slot.label));
            if (slot.extractionRegex !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('extractionRegex', slot.extractionRegex));
            if (slot.extractionType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('extractionType', slot.extractionType));
            if (slot.mlSlotClassValues) {
                let classValues = Utils.forceArray(slot.mlSlotClassValues);
                for (const classValue of classValues) {
                    xmlLines.push(Utils.getTabs(initIndent + 1) + '<mlSlotClassValues>');
                    if (classValue.value !== undefined)
                        xmlLines.push(Utils.getTabs(initIndent + 2) + Utils.getXMLTag('value', classValue.value));
                    if (classValue.synonymGroup !== undefined)
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('synonymGroup', classValue.synonymGroup, true, initIndent + 2));
                    xmlLines.push(Utils.getTabs(initIndent + 1) + '</mlSlotClassValues>');
                }
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</mlSlotClasses>');
        }
        return xmlLines;
    }

}
module.exports = MlDomainUtils;