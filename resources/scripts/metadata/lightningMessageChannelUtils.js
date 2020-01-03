const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class LightningMessageChannelUtils {

    static createLightningMessageChannel(lightningMessageChannel) {
        let newLightningMessageChannel;
        if (lightningMessageChannel) {
            newLightningMessageChannel = Utils.prepareXML(lightningMessageChannel, LightningMessageChannelUtils.createLightningMessageChannel());
        } else {
            newLightningMessageChannel = {
                description: undefined,
                fullName: undefined,
                isExposed: undefined,
                lightningMessageFields: [],
                masterLabel: undefined
            };
        }
        return newLightningMessageChannel;
    }

    static createLightningMessageField(description, fieldName) {
        return {
            description: description,
            fieldName: fieldName
        }
    }

    static toXML(lightningMessageChannel, compress) {
        let xmlLines = [];
        if (lightningMessageChannel) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (lightningMessageChannel.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', lightningMessageChannel.fullName));
                if (lightningMessageChannel.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', lightningMessageChannel.description));
                if (lightningMessageChannel.isExposed !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isExposed', lightningMessageChannel.isExposed));
                if (lightningMessageChannel.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', lightningMessageChannel.masterLabel));
                if (lightningMessageChannel.lightningMessageFields !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('lightningMessageFields', lightningMessageChannel.lightningMessageFields, true, 1));
                xmlLines.push('</LightningMessageChannel>');
            } else {
                return AuraParser.toXML(lightningMessageChannel);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = LightningMessageChannelUtils;