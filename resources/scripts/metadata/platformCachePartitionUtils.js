const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class PlatformCachePartitionUtils {

    static createPlatformCachePartition(platformCachePartition) {
        let newPlatformCachePartition;
        if (platformCachePartition) {
            newPlatformCachePartition = Utils.prepareXML(platformCachePartition, PlatformCachePartitionUtils.createPlatformCachePartition());
        } else {
            newPlatformCachePartition = {
                description: undefined,
                fullName: undefined,
                isDefaultPartition: undefined,
                masterLabel: undefined,
                platformCachePartitionTypes: []
            };
        }
        return newPlatformCachePartition;
    }

    static createPlatformCachePartitionType(allocatedCapacity, allocatedPurchasedCapacity, allocatedTrialCapacity, cacheType) {
        return {
            allocatedCapacity: allocatedCapacity,
            allocatedPurchasedCapacity: allocatedPurchasedCapacity,
            allocatedTrialCapacity: allocatedTrialCapacity,
            cacheType: cacheType,
        }
    }

    static toXML(platformCachePartition, compress) {
        let xmlLines = [];
        if (platformCachePartition) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<PlatformCachePartition xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (platformCachePartition.fullName)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', platformCachePartition.fullName));
                if (platformCachePartition.masterLabel)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', platformCachePartition.masterLabel));
                if (platformCachePartition.description)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', platformCachePartition.description));
                if (platformCachePartition.isDefaultPartition)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isDefaultPartition', platformCachePartition.isDefaultPartition));
                if (platformCachePartition.platformCachePartitionTypes)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('platformCachePartitionTypes', platformCachePartition.platformCachePartitionTypes, true, 1));
                xmlLines.push('</PlatformCachePartition>');
            } else {
                return AuraParser.toXML(platformCachePartition);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = PlatformCachePartitionUtils;