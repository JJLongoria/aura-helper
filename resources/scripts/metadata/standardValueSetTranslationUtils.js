const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class StandardValueSetTranslationUtils {

    static createStandardValueSetTranslation(standardValueSetTranslation) {
        let newStandardValueSetTranslation;
        if (standardValueSetTranslation) {
            newStandardValueSetTranslation = Utils.prepareXML(standardValueSetTranslation, StandardValueSetTranslationUtils.createStandardValueSetTranslation());
        } else {
            newStandardValueSetTranslation = {
                fullName: undefined,
                valueTranslation: [],
            };
        }
        return newStandardValueSetTranslation;
    }

    static createValueTranslation(masterLabel, translation) {
        return {
            masterLabel: masterLabel,
            translation: translation
        }
    }

    static toXML(standardValueSetTranslation, compress) {
        let xmlLines = [];
        if (standardValueSetTranslation) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<StandardValueSetTranslation xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (standardValueSetTranslation.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', standardValueSetTranslation.fullName));
                if (standardValueSetTranslation.valueTranslation !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('valueTranslation', standardValueSetTranslation.valueTranslation, true, 1));
                xmlLines.push('</StandardValueSetTranslation>');
            } else {
                return AuraParser.toXML(standardValueSetTranslation);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = StandardValueSetTranslationUtils;