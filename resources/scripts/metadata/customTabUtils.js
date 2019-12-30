const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomTabUtils {

    static createCustomTab(customTab) {
        let newCustomTab;
        if (customTab) {
            newCustomTab = Utils.prepareXML(customTab, CustomTabUtils.createCustomTab());
        } else {
            newCustomTab = {
                actionOverrides: [],
                auraComponent: undefined,
                customObject: undefined,
                description: undefined,
                flexiPage: undefined,
                frameHeight: undefined,
                fullName: undefined,
                hasSidebar: undefined,
                icon: undefined,
                label: undefined,
                lwcComponent: undefined,
                motif: undefined,
                page: undefined,
                scontrol: undefined,
                splashPageLink: undefined,
                url: undefined,
                urlEncodingKey: undefined
            };
        }
        return newCustomTab;
    }

    static createActionOverride(actionName, comment, content, formFactor, skipRecordTypeSelect, type) {
        return {
            actionName: actionName,
            comment: comment,
            content: content,
            formFactor: formFactor,
            skipRecordTypeSelect: skipRecordTypeSelect,
            type: type
        }
    }

    static toXML(customTab, compress) {
        let xmlLines = [];
        if (customTab) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customTab.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customTab.fullName));
                if (customTab.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', customTab.label));
                if (customTab.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', customTab.description));
                if (customTab.auraComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('auraComponent', customTab.auraComponent));
                if (customTab.customObject !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customObject', customTab.customObject));
                if (customTab.flexiPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('flexiPage', customTab.flexiPage));
                if (customTab.frameHeight !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('frameHeight', customTab.frameHeight));
                if (customTab.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customTab.fullName));
                if (customTab.hasSidebar !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasSidebar', customTab.hasSidebar));
                if (customTab.icon !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('icon', customTab.icon));
                if (customTab.lwcComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('lwcComponent', customTab.lwcComponent));
                if (customTab.motif !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('motif', customTab.motif));
                if (customTab.page !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('page', customTab.page));
                if (customTab.scontrol !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('scontrol', customTab.scontrol));
                if (customTab.splashPageLink !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('splashPageLink', customTab.splashPageLink));
                if (customTab.url !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('url', customTab.url));
                if (customTab.urlEncodingKey !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('urlEncodingKey', customTab.urlEncodingKey));
                if (customTab.actionOverrides !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('actionOverrides', customTab.actionOverrides, true, 1));
                xmlLines.push('</CustomTab>');
            } else {
                return AuraParser.toXML(customTab);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomTabUtils;