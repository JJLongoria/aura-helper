const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomHelpMenuSectionUtils {

    static createCustomHelpMenuSection(customHelpMenuSection) {
        let newCustomHelpMenuSection;
        if (customHelpMenuSection) {
            newCustomHelpMenuSection = Utils.prepareXML(customHelpMenuSection, CustomHelpMenuSectionUtils.createCustomHelpMenuSection());
        } else {
            newCustomHelpMenuSection = {
                customHelpMenuItems: [],
                fullName: undefined,
                masterLabel: undefined
            };
        }
        return newCustomHelpMenuSection;
    }

    static createCustomHelpMenuItem(linkURL, masterLabel, sortOrder) {
        return {
            linkURL: linkURL,
            masterLabel: masterLabel,
            sortOrder: sortOrder
        }
    }

    static toXML(customHelpMenuSection, compress) {
        let xmlLines = [];
        if (customHelpMenuSection) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomHelpMenuSection xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customHelpMenuSection.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customHelpMenuSection.fullName));
                if (customHelpMenuSection.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', customHelpMenuSection.masterLabel));
                if (customHelpMenuSection.customHelpMenuItems !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customHelpMenuItems', customHelpMenuSection.customHelpMenuItems, true, 1));
                xmlLines.push('</CustomHelpMenuSection>');
            } else {
                return AuraParser.toXML(customHelpMenuSection);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomHelpMenuSectionUtils;