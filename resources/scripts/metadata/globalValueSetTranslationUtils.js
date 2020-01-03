const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class GlobalValueSetTranslationUtils {

    static createGlobalValueSetTranslation(globalValueSetTranslation) {
        let newGlobalValueSetTranslation;
        if (globalValueSetTranslation) {
            newGlobalValueSetTranslation = Utils.prepareXML(globalValueSetTranslation, GlobalValueSetTranslationUtils.createGlobalValueSetTranslation());
        } else {
            newGlobalValueSetTranslation = {
                fullName: undefined,
                valueTranslation: [],
            };
        }
        return newGlobalValueSetTranslation;
    }

    static createValueTranslation(masterLabel, translation) {
        return {
            masterLabel: masterLabel,
            translation: translation
        }
    }

    static toXML(globalValueSetTranslation, compress) {
        let xmlLines = [];
        if (globalValueSetTranslation) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<GlobalValueSetTranslation xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (globalValueSetTranslation.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', globalValueSetTranslation.fullName));
                if (globalValueSetTranslation.valueTranslation !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('valueTranslation', globalValueSetTranslation.valueTranslation, true, 1));
                xmlLines.push('</GlobalValueSetTranslation>');
            } else {
                return AuraParser.toXML(globalValueSetTranslation);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = GlobalValueSetTranslationUtils;