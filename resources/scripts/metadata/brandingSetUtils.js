const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class BrandingSetUtils {

    static createBrandingSet(brandingSet) {
        let newBrandingSet;
        if (brandingSet) {
            newBrandingSet = Utils.prepareXML(brandingSet, BrandingSetUtils.createBrandingSet());
        } else {
            newBrandingSet = {
                brandingSetProperty: [],
                description: undefined,
                fullName: undefined,
                masterLabel: undefined,
                type: undefined
            };
        }
        return newBrandingSet;
    }

    static createBrandingSetProperty(propertyName, propertyValue) {
        return {
            propertyName: propertyName,
            propertyValue: propertyValue
        }
    }

    static toXML(brandingSet, compress) {
        let xmlLines = [];
        if (brandingSet) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<BrandingSet xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (brandingSet.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', brandingSet.fullName));
                if (brandingSet.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', brandingSet.masterLabel));
                if (brandingSet.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', brandingSet.type));
                if (brandingSet.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', brandingSet.description));
                if (brandingSet.brandingSetProperty !== undefined) {
                    Utils.sort(brandingSet.brandingSetProperty, ['propertyName']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('brandingSetProperty', brandingSet.brandingSetProperty, true, 1));
                }
                xmlLines.push('</BrandingSet>');
            } else {
                return AuraParser.toXML(brandingSet);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = BrandingSetUtils;