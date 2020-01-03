const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class GlobalPicklistUtils {

    static createGlobalPicklist(globalPicklist) {
        let newGlobalPicklist;
        if (globalPicklist) {
            newGlobalPicklist = Utils.prepareXML(globalPicklist, GlobalPicklistUtils.createGlobalPicklist());
        } else {
            newGlobalPicklist = {
                description: undefined,
                fullName: undefined,
                globalPicklistValues: [],
                masterLabel: undefined,
                sorted: undefined,
            };
        }
        return newGlobalPicklist;
    }

    static createGlobalPicklistValue(color, isDefault, description, isActive) {
        return {
            color: color,
            default: isDefault,
            description: description,
            isActive: isActive
        }
    }

    static toXML(globalPicklist, compress) {
        let xmlLines = [];
        if (globalPicklist) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<GlobalPicklist xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (globalPicklist.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', globalPicklist.fullName));
                if (globalPicklist.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', globalPicklist.masterLabel));
                if (globalPicklist.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', globalPicklist.description));
                if (globalPicklist.sorted !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sorted', globalPicklist.sorted));
                if (globalPicklist.globalPicklistValues !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('globalPicklistValues', globalPicklist.globalPicklistValues, true, 1));
                xmlLines.push('</GlobalPicklist>');
            } else {
                return AuraParser.toXML(globalPicklist);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = GlobalPicklistUtils;