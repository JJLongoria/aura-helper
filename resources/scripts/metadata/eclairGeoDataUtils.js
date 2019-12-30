const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EclairGeoDataUtils {

    static createEclairGeoData(eclairGeoData) {
        let newEclairGeoData;
        if (eclairGeoData) {
            newEclairGeoData = Utils.prepareXML(eclairGeoData, EclairGeoDataUtils.createEclairGeoData());
        } else {
            newEclairGeoData = {
                content: undefined,
                maps: [],
                masterLabel: undefined
            };
        }
        return newEclairGeoData;
    }

    static createEclairGeoMap(boundingBoxBottom, boundingBoxLeft, boundingBoxRight, boundingBoxTop, mapLabel, mapName, projection) {
        return {
            boundingBoxBottom: boundingBoxBottom,
            boundingBoxLeft: boundingBoxLeft,
            boundingBoxRight: boundingBoxRight,
            boundingBoxTop: boundingBoxTop,
            mapLabel: mapLabel,
            mapName: mapName,
            projection: projection
        }
    }

    static toXML(eclairGeoData, compress) {
        let xmlLines = [];
        if (eclairGeoData) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EclairGeoData xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
                if (eclairGeoData.content !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('content', eclairGeoData.content));
                if (eclairGeoData.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', eclairGeoData.masterLabel));
                if (eclairGeoData.maps !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('maps', eclairGeoData.maps, true, 1));
                xmlLines.push('</EclairGeoData>');
            } else {
                return AuraParser.toXML(eclairGeoData);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EclairGeoDataUtils;