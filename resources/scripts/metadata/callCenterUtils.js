const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CallCenterUtils {

    static createCallCenter(callCenter) {
        let newCallCenter;
        if (callCenter) {
            newCallCenter = Utils.prepareXML(callCenter, CallCenterUtils.createCallCenter());
        } else {
            newCallCenter = {
                adapterUrl: undefined,
                displayName: undefined,
                displayNameLabel: undefined,
                internalNameLabel: undefined,
                version: undefined,
                sections: undefined
            };
        }
        return newCallCenter;
    }

    static createCallCenterSection(items, label, name) {
        return {
            items: items,
            label: label,
            name: name
        }
    }

    static createCallCenterItem(label, name, value) {
        return {
            label: label,
            name: name,
            value: value
        }
    }

    static toXML(callCenter, compress) {
        let xmlLines = [];
        if (callCenter) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CallCenter xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (callCenter.displayName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('displayName', callCenter.displayName));
                if (callCenter.displayNameLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('displayNameLabel', callCenter.displayNameLabel));
                if (callCenter.internalNameLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('internalNameLabel', callCenter.internalNameLabel));
                if (callCenter.adapterUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('adapterUrl', callCenter.adapterUrl));
                if (callCenter.version !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('version', callCenter.version));
                if (callCenter.sections)
                    xmlLines = xmlLines.concat(CallCenterUtils.getSectionsXMLLines(callCenter.sections, 1));
                xmlLines.push('</CallCenter>');
            } else {
                return AuraParser.toXML(callCenter);
            }
        }
        return xmlLines.join('\n');
    }

    static getSectionsXMLLines(sectionsToProcess, initIndet) {
        let xmlLines = [];
        let sections = Utils.forceArray(sectionsToProcess);
        for (const section of sections) {
            xmlLines.push(Utils.getTabs(initIndet) + '<sections>');
            if (section.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndet + 1) + Utils.getXMLTag('name', section.name));
            if (section.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndet + 1) + Utils.getXMLTag('label', section.label));
            if (section.items !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('items', section.items, true, initIndet + 1));
            xmlLines.push(Utils.getTabs(initIndet) + '</sections>');
        }
        return xmlLines;
    }

}
module.exports = CallCenterUtils;
