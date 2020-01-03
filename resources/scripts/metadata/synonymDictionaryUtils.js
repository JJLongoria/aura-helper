const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class SynonymDictionaryUtils {

    static createSynonymDictionary(synonymDictionary) {
        let newSynonymDictionary;
        if (synonymDictionary) {
            newSynonymDictionary = Utils.prepareXML(synonymDictionary, SynonymDictionaryUtils.createSynonymDictionary());
        } else {
            newSynonymDictionary = {
                fullName: undefined,
                groups: [],
                isProtected: undefined,
                label: undefined,
            };
        }
        return newSynonymDictionary;
    }

    static createSynonymGroup(languages, terms) {
        return {
            languages: languages,
            terms: Utils.forceArray(terms)
        }
    }

    static toXML(synonymDictionary, compress) {
        let xmlLines = [];
        if (synonymDictionary) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<SynonymDictionary xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (synonymDictionary.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', synonymDictionary.fullName));
                if (synonymDictionary.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', synonymDictionary.label));
                if (synonymDictionary.isProtected !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isProtected', synonymDictionary.isProtected));
                if (synonymDictionary.groups !== undefined)
                    xmlLines = xmlLines.concat(SynonymDictionaryUtils.getGroupsXMLLines(synonymDictionary.groups, 1));
                xmlLines.push('</SynonymDictionary>');
            } else {
                return AuraParser.toXML(synonymDictionary);
            }
        }
        return xmlLines.join('\n');
    }

    static getGroupsXMLLines(groups, initIndent) {
        let xmlLines = [];
        for (const group of groups) {
            xmlLines.push(Utils.getTabs(initIndent) + '<groups>');
            if (group.languages !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('languages', group.languages, true, initIndent + 1));
            if (group.terms !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('terms', group.terms, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</groups>');
        }
        return xmlLines;
    }

}
module.exports = SynonymDictionaryUtils;