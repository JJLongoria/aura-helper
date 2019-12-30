const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomMetadataUtils {

    static createCustomMetadata(customMetadata) {
        let newCustomMetadata;
        if (customMetadata) {
            newCustomMetadata = Utils.prepareXML(customMetadata, CustomMetadataUtils.createCustomMetadata());
        } else {
            newCustomMetadata = {
                description: undefined,
                fullName: undefined,
                label: undefined,
                protected: undefined,
                values: [],
            }
        }
        return newCustomMetadata;
    }

    static createCustomMetadataValue(field, value) { 
        return {
            field: field,
            value: value
        }
    }

    static toXML(customMetadata, compress) {
        let xmlLines = [];
        if (customMetadata) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">');
                if (customMetadata.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customMetadata.fullName));
                if (customMetadata.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', customMetadata.label));
                if (customMetadata.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', customMetadata.description));
                if (customMetadata.protected !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('protected', customMetadata.protected));
                if (customMetadata.values !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('values', customMetadata.values, true, 1));
                xmlLines.push('</CustomMetadata>');
            } else {
                return AuraParser.toXML(customMetadata);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomMetadataUtils;