const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomLabelsUtils {

    static createCustomLabels(customLabels) {
        let newCustomLabels;
        if (customLabels) {
            newCustomLabels = Utils.prepareXML(customLabels, CustomLabelsUtils.createCustomLabels());
        } else {
            newCustomLabels = {
                fullName: undefined,
                labels: []
            }
        }
        return newCustomLabels;
    }

    static createCustomLabel(categories, fullName, language, isProtected, shortDescription, value) {
        return {
            categories: categories,
            fullName: fullName,
            language: language,
            protected: isProtected,
            shortDescription: shortDescription,
            value: value
        }
    }

    static toXML(customLabels, compress) {
        let xmlLines = [];
        if (customLabels) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customLabels.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customLabels.fullName));
                if (customLabels.labels !== undefined) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('labels', customLabels.labels, true, 1));
                }
                xmlLines.push('</CustomLabels>');
            } else {
                return AuraParser.toXML(customLabels);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomLabelsUtils;