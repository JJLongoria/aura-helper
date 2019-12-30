const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CMSConnectSourceUtils {

    static createCMSConnectSource(CMSConnectSource) {
        let newCMSConnectSource;
        if (CMSConnectSource) {
            newCMSConnectSource = Utils.prepareXML(CMSConnectSource, CMSConnectSourceUtils.createCMSConnectSource());
        } else {
            newCMSConnectSource = {
                cmsConnectAsset: [],
                cmsConnectLanguage: [],
                cmsConnectPersonalization: [],
                cmsConnectResourceType: [],
                connectionType: undefined,
                cssScope: undefined,
                developerName: undefined,
                fullName: undefined,
                languageEnabled: undefined,
                masterLabel: undefined,
                namedCredential: undefined,
                personalizationEnabled: undefined,
                rootPath: undefined,
                sortOrder: undefined,
                status: undefined,
                type: undefined,
                websiteUrl: undefined
            };
        }
        return newCMSConnectSource
    }

    static createCMSConnectAsset(assetPath, assetType, sortOrder) {
        return {
            assetPath: assetPath,
            assetType: assetType,
            sortOrder: sortOrder
        }
    }

    static createCMSConnectLanguage(cmsLanguage, language) {
        return {
            cmsLanguage: cmsLanguage,
            language: language
        }
    }

    static createCMSConnectPersonalization(connectorPage, connectorPageAsset) {
        return {
            connectorPage: connectorPage,
            connectorPageAsset: connectorPageAsset,
        }
    }

    static createCMSConnectResourceType(cmsConnectResourceDefinition, developerName, masterLabel, resourceType) {
        return {
            cmsConnectResourceDefinition: cmsConnectResourceDefinition,
            developerName: developerName,
            masterLabel: masterLabel,
            resourceType: resourceType
        }
    }

    static createCMSConnectResourceDefinition(developerName, masterLabel, options, payloadType, resourceIdPath, resourceNamePath, resourcePath, rootNodePath) {
        return {
            developerName: developerName,
            masterLabel: masterLabel,
            options: options,
            payloadType: payloadType,
            resourceIdPath: resourceIdPath,
            resourceNamePath: resourceNamePath,
            resourcePath: resourcePath,
            rootNodePath: rootNodePath
        }
    }

    static toXML(CMSConnectSource, compress) {
        let xmlLines = [];
        if (CMSConnectSource) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CMSConnectSource xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (CMSConnectSource.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', CMSConnectSource.fullName));
                if (CMSConnectSource.developerName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('developerName', CMSConnectSource.developerName));
                if (CMSConnectSource.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', CMSConnectSource.masterLabel));
                if (CMSConnectSource.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', CMSConnectSource.type));
                if (CMSConnectSource.status !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('status', CMSConnectSource.status));
                if (CMSConnectSource.rootPath !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('rootPath', CMSConnectSource.rootPath));
                if (CMSConnectSource.websiteUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('websiteUrl', CMSConnectSource.websiteUrl));
                if (CMSConnectSource.cssScope !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('cssScope', CMSConnectSource.cssScope));
                if (CMSConnectSource.namedCredential !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('namedCredential', CMSConnectSource.namedCredential));
                if (CMSConnectSource.sortOrder !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sortOrder', CMSConnectSource.sortOrder));
                if (CMSConnectSource.personalizationEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('personalizationEnabled', CMSConnectSource.personalizationEnabled));
                if (CMSConnectSource.languageEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('languageEnabled', CMSConnectSource.languageEnabled));
                if (CMSConnectSource.cmsConnectAsset !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('cmsConnectAsset', CMSConnectSource.cmsConnectAsset, true, 1));
                if (CMSConnectSource.cmsConnectLanguage !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('cmsConnectLanguage', CMSConnectSource.cmsConnectLanguage, true, 1));
                if (CMSConnectSource.cmsConnectPersonalization !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('cmsConnectPersonalization', CMSConnectSource.cmsConnectPersonalization, true, 1));
                if (CMSConnectSource.cmsConnectResourceType !== undefined)
                    xmlLines = xmlLines.concat(CMSConnectSourceUtils.getCMSConnectResourceTypeXMLLines(CMSConnectSource.cmsConnectResourceType, 1));
                xmlLines.push('</CMSConnectSource>');
            } else {
                return AuraParser.toXML(CMSConnectSource);
            }
        }
        return xmlLines.join('\n');
    }

    static getCMSConnectResourceTypeXMLLines(cmsConnectResourceType, initIndent) {
        let xmlLines = [];
        let resourceTypes = Utils.forceArray(cmsConnectResourceType);
        for (const resourceType of resourceTypes) {
            xmlLines.push(Utils.getTabs(initIndent) + '<CMSConnectSource>');
            if (resourceType.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', resourceType.developerName));
            if (resourceType.masterLabel !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', resourceType.masterLabel));
            if (resourceType.resourceType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('resourceType', resourceType.resourceType));
            if (resourceType.cmsConnectResourceDefinition !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('cmsConnectResourceDefinition', resourceType.cmsConnectResourceDefinition, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</CMSConnectSource>');
        }
        return xmlLines;
    }

}
module.exports = CMSConnectSourceUtils;