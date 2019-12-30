const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ContentAssetUtils {

    static createContentAsset(contentAsset) {
        let newContentAsset;
        if (contentAsset) {
            newContentAsset = Utils.prepareXML(contentAsset, ContentAssetUtils.createContentAsset());
        } else {
            newContentAsset = {
                format: undefined,
                fullName: undefined,
                isVisibleByExternalUsers: undefined,
                language: undefined,
                masterLabel: undefined,
                originNetwork: undefined,
                relationships: [],
                versions: undefined
            };
        }
        return newContentAsset;
    }

    static createContentAssetRelationship(organization) {
        return {
            organization: Utils.forceArray(organization)
        }
    }

    static createContentAssetLink(access, name) {
        return {
            access: access,
            name: name
        }
    }

    static createContentAssetVersions(version) {
        return {
            version: Utils.forceArray(version)
        }
    }

    static createContentAssetVersion(number, pathOnClient, zipEntry) {
        return {
            number: number,
            pathOnClient: pathOnClient,
            zipEntry: zipEntry
        }
    }

    static toXML(contentAsset, compress) {
        let xmlLines = [];
        if (contentAsset) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ContentAsset xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (contentAsset.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', contentAsset.fullName));
                if (contentAsset.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', contentAsset.masterLabel));
                if (contentAsset.format !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('format', contentAsset.format));
                if (contentAsset.isVisibleByExternalUsers !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isVisibleByExternalUsers', contentAsset.isVisibleByExternalUsers));
                if (contentAsset.language !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('language', contentAsset.language));
                if (contentAsset.originNetwork !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('originNetwork', contentAsset.originNetwork));
                if (contentAsset.relationships !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('relationships', contentAsset.relationships, true, 1));
                if (contentAsset.versions !== undefined)
                    xmlLines = xmlLines.concat(ContentAssetUtils.getVersionsXMLLines(contentAsset.versions, 1));
                xmlLines.push('</ContentAsset>');
            } else {
                return AuraParser.toXML(contentAsset);
            }
        }
        return xmlLines.join('\n');
    }

    static getVersionsXMLLines(versions, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<versions>');
        xmlLines = xmlLines.concat(Utils.getXMLBlock('version', versions.version, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</versions>');
        return xmlLines;
    }

}
module.exports = ContentAssetUtils;