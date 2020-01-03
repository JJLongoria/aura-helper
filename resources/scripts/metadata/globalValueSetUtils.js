const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class GlobalValueSetUTils {

    static createGlobalValueSet(globalValueSet) {
        let newGlobalValueSet;
        if (globalValueSet) {
            newGlobalValueSet = Utils.prepareXML(globalValueSet, GlobalValueSetUTils.createGlobalValueSet());
        } else {
            newGlobalValueSet = {
                customValue: [],
                description: undefined,
                fullName: undefined,
                masterLabel: undefined,
                sorted: undefined
            };
        }
        return newGlobalValueSet;
    }

    static createCustomValue(color, isDefault, description, fullName, isActive, label) {
        return {
            color: color,
            default: isDefault,
            description: description,
            fullName: fullName,
            isActive: isActive,
            label: label
        }
    }

    static toXML(globalValueSet, compress) {
        let xmlLines = [];
        if (globalValueSet) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<GlobalValueSet xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (globalValueSet.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', globalValueSet.fullName));
                if (globalValueSet.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', globalValueSet.masterLabel));
                if (globalValueSet.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', globalValueSet.description));
                if (globalValueSet.sorted !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sorted', globalValueSet.sorted));
                if (globalValueSet.customValue !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customValue', globalValueSet.customValue, true, 1));
                xmlLines.push('</GlobalValueSet>');
            } else {
                return AuraParser.toXML(globalValueSet);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = GlobalValueSetUTils;