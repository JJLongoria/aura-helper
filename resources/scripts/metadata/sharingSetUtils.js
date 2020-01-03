const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class SharingSetUtils {

    static createSharingSet(sharingSet) {
        let newSharingSet;
        if (sharingSet) {
            newSharingSet = Utils.prepareXML(sharingSet, SharingSetUtils.createSharingSet());
        } else {
            newSharingSet = {
                accessMappings: [],
                description: undefined,
                fullName: undefined,
                name: undefined,
                profiles: []
            };
        }
        return newSharingSet;
    }

    static createAccessMapping(accessLevel, objectField, object, userField) {
        return {
            accessLevel: accessLevel,
            objectField: objectField,
            object: object,
            userField: userField
        }
    }

    static toXML(sharingSet, compress) {
        let xmlLines = [];
        if (sharingSet) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<SharingSet xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (sharingSet.fullName)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', sharingSet.fullName));
                if (sharingSet.name)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', sharingSet.name));
                if (sharingSet.description)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', sharingSet.description));
                if (sharingSet.accessMappings)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('accessMappings', sharingSet.accessMappings, true, 1));
                if (sharingSet.profiles)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('profiles', sharingSet.profiles, true, 1));
                xmlLines.push('</SharingSet>');
            } else {
                return AuraParser.toXML(sharingSet);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = SharingSetUtils;