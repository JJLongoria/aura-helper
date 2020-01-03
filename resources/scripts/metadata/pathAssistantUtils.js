const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class PathAssistantUtils {

    static createPathAssistant(pathAssistant) {
        let newPathAssistant;
        if (pathAssistant) {
            newPathAssistant = Utils.prepareXML(pathAssistant, PathAssistantUtils.createPathAssistant());
        } else {
            newPathAssistant = {
                active: undefined,
                entityName: undefined,
                fieldName: undefined,
                fullName: undefined,
                masterLabel: undefined,
                pathAssistantSteps: [],
                recordTypeName: undefined
            };
        }
        return newPathAssistant;
    }

    static createPathAssistantStep(fieldNames, info, picklistValueName) {
        return {
            fieldNames: fieldNames,
            info: info,
            picklistValueName: picklistValueName,
        }
    }

    static toXML(pathAssistant, compress) {
        let xmlLines = [];
        if (pathAssistant) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<PathAssistant xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (pathAssistant.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', pathAssistant.fullName));
                if (pathAssistant.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', pathAssistant.masterLabel));
                if (pathAssistant.recordTypeName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('recordTypeName', pathAssistant.recordTypeName));
                if (pathAssistant.entityName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('entityName', pathAssistant.entityName));
                if (pathAssistant.fieldName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fieldName', pathAssistant.fieldName));
                if (pathAssistant.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', pathAssistant.active));
                if (pathAssistant.pathAssistantSteps)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('pathAssistantSteps', pathAssistant.pathAssistantSteps, true, 1));
                xmlLines.push('</PathAssistant>');
            } else {
                return AuraParser.toXML(pathAssistant);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = PathAssistantUtils;