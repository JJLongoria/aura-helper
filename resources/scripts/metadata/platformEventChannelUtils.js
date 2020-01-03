const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class PlatformEventChannelUtils {

    static createPlatformEventChannel(platformEventChannel) {
        let newPlatformEventChannel;
        if (platformEventChannel) {
            newPlatformEventChannel = Utils.prepareXML(platformEventChannel, PlatformEventChannelUtils.createPlatformEventChannel());
        } else {
            newPlatformEventChannel = {
                channelMembers: [],
                channelType: undefined,
                fullName: undefined,
                label: undefined
            };
        }
        return newPlatformEventChannel;
    }

    static createPlatformEventChannelSelectedEntity(selectedEntity) {
        return {
            selectedEntity: selectedEntity
        }
    }

    static toXML(platformEventChannel, compress) {
        let xmlLines = [];
        if (platformEventChannel) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<PlatformEventChannel xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (platformEventChannel.fullName)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', platformEventChannel.fullName));
                if (platformEventChannel.label)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', platformEventChannel.label));
                if (platformEventChannel.channelType)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('channelType', platformEventChannel.channelType));
                if (platformEventChannel.channelMembers)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('channelMembers', platformEventChannel.channelMembers, true, 1));
                xmlLines.push('</PlatformEventChannel>');
            } else {
                return AuraParser.toXML(platformEventChannel);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = PlatformEventChannelUtils;