const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ManagedContentTypeUtils {

    static createManagedContentType(managedContentType) {
        let newManagedContentType;
        if (managedContentType) {
            newManagedContentType = Utils.prepareXML(managedContentType, ManagedContentTypeUtils.createManagedContentType());
        } else {
            newManagedContentType = {
                description: undefined,
                developerName: undefined,
                fullName: undefined,
                managedContentNodeTypes: [],
                masterLabel: undefined
            };
        }
        return newManagedContentType;
    }

    static createManagedContentNodeType(helpText, isLocalizable, isRequired, nodeLabel, nodeName, nodeType, placeholderText) {
        return {
            helpText: helpText,
            isLocalizable: isLocalizable,
            isRequired: isRequired,
            nodeLabel: nodeLabel,
            nodeName: nodeName,
            nodeType: nodeType,
            placeholderText: placeholderText
        }
    }

    static toXML(managedContentType, compress) {
        let xmlLines = [];
        if (managedContentType) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ManagedContentType xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (managedContentType.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', managedContentType.fullName));
                if (managedContentType.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', managedContentType.description));
                if (managedContentType.developerName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('developerName', managedContentType.developerName));
                if (managedContentType.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', managedContentType.masterLabel));
                if (managedContentType.managedContentNodeTypes !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('managedContentNodeTypes', managedContentType.managedContentNodeTypes, true, 1));
                xmlLines.push('</ManagedContentType>');
            } else {
                return AuraParser.toXML(managedContentType);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = ManagedContentTypeUtils;