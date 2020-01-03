const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class LightningBoltUtils {

    static createLightningBolt(lightningBolt) {
        let newLightningBolt;
        if (lightningBolt) {
            newLightningBolt = Utils.prepareXML(lightningBolt, LightningBoltUtils.createLightningBolt());
        } else {
            newLightningBolt = {
                category: undefined,
                fullName: undefined,
                lightningBoltFeatures: [],
                lightningBoltImages: [],
                lightningBoltItems: [],
                masterLabel: undefined,
                publisher: undefined,
                summary: undefined
            };
        }
        return newLightningBolt;
    }

    static createLightningBoltFeatures(description, order, title) {
        return {
            description: description,
            order: order,
            title: title
        }
    }

    static createLightningBoltImages(image, order) {
        return {
            image: image,
            order: order
        }
    }

    static createLightningBoltItems(name, type) {
        return {
            name: name,
            type: type
        }
    }

    static toXML(lightningBolt, compress) {
        let xmlLines = [];
        if (lightningBolt) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<LightningBolt xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (lightningBolt.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', lightningBolt.fullName));
                if (lightningBolt.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', lightningBolt.masterLabel));
                if (lightningBolt.category !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('category', lightningBolt.category));
                if (lightningBolt.publisher !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('publisher', lightningBolt.publisher));
                if (lightningBolt.summary !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('summary', lightningBolt.summary));
                if (lightningBolt.lightningBoltFeatures !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('lightningBoltFeatures', lightningBolt.lightningBoltFeatures, true, 1));
                if (lightningBolt.lightningBoltImages !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('lightningBoltImages', lightningBolt.lightningBoltImages, true, 1));
                if (lightningBolt.lightningBoltItems !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('lightningBoltItems', lightningBolt.lightningBoltItems, true, 1));
                xmlLines.push('</LightningBolt>');
            } else {
                return AuraParser.toXML(lightningBolt);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = LightningBoltUtils;