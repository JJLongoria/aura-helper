const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomPermissionUtils {

    static createCustomPermission(customPermission) {
        let newCustomPermission;
        if (customPermission) {
            newCustomPermission = Utils.prepareXML(customPermission, CustomPermissionUtils.createCustomPermission());
        } else {
            newCustomPermission = {
                connectedApp: undefined,
                description: undefined,
                fullName: undefined,
                label: undefined,
                requiredPermission: undefined
            };
        }
        return newCustomPermission;
    }

    static createCustomPermissionDependencyRequired(customPermission, dependency) {
        return {
            customPermission: customPermission,
            dependency: dependency
        }
    }

    static toXML(customPermission, compress) {
        let xmlLines = [];
        if (customPermission) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomPermission xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customPermission.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customPermission.fullName));
                if (customPermission.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', customPermission.label));
                if (customPermission.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', customPermission.description));
                if (customPermission.connectedApp !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('connectedApp', customPermission.connectedApp));
                if (customPermission.requiredPermission !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('requiredPermission', customPermission.requiredPermission, true, 1));
                xmlLines.push('</CustomPermission>');
            } else {
                return AuraParser.toXML(customPermission);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomPermissionUtils;