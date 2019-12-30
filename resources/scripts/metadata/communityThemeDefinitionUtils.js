const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CommunityThemeDefinitionUtils {

    static createCommunityThemeDefinition(communityThemDefinition) {
        let newCommunityThemeDefinition;
        if (communityThemDefinition) {
            newCommunityThemeDefinition = Utils.prepareXML(communityThemDefinition, CommunityThemeDefinitionUtils.createCommunityThemeDefinition());
        } else {
            newCommunityThemeDefinition = {
                bundlesInfo: [],
                customThemeLayoutType: [],
                defaultBrandingSet: undefined,
                description: undefined,
                enableExtendedCleanUpOnDelete: undefined,
                fullName: undefined,
                masterLabel: undefined,
                publisher: undefined,
                themeRouteOverride: [],
                themeSetting: []
            };
        }
        return newCommunityThemeDefinition;
    }

    static createCommunityThemeBundleInfo(description, image, order, title, type) {
        return {
            description: description,
            image: image,
            order: order,
            title: title,
            type: type
        }
    }

    static createCommunityThemeLayoutType(description, label) {
        return {
            description: description,
            label: label
        }
    }

    static createCommunityThemeRouteOverride(customThemeLayoutType, pageAttributes, pageType, themeLayoutType) {
        return {
            customThemeLayoutType: customThemeLayoutType,
            pageAttributes: pageAttributes,
            pageType: pageType,
            themeLayoutType: themeLayoutType
        }
    }

    static createCommunityThemeSetting(customThemeLayoutType, themeLayout, themeLayoutType) {
        return {
            customThemeLayoutType: customThemeLayoutType,
            themeLayout: themeLayout,
            themeLayoutType: themeLayoutType
        }
    }

    static toXML(communityThemeDefinition, compress) {
        let xmlLines = [];
        if (communityThemeDefinition) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CommunityTemplateDefinition xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (communityThemeDefinition.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', communityThemeDefinition.fullName));
                if (communityThemeDefinition.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', communityThemeDefinition.masterLabel));
                if (communityThemeDefinition.publisher !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('publisher', communityThemeDefinition.publisher));
                if (communityThemeDefinition.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', communityThemeDefinition.description));
                if (communityThemeDefinition.defaultBrandingSet !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('defaultBrandingSet', communityThemeDefinition.defaultBrandingSet));
                if (communityThemeDefinition.enableExtendedCleanUpOnDelete !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableExtendedCleanUpOnDelete', communityThemeDefinition.enableExtendedCleanUpOnDelete));
                if (communityThemeDefinition.bundlesInfo !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('bundlesInfo', communityThemeDefinition.bundlesInfo, true, 1));
                if (communityThemeDefinition.customThemeLayoutType !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customThemeLayoutType', communityThemeDefinition.customThemeLayoutType, true, 1));
                if (communityThemeDefinition.themeRouteOverride !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('themeRouteOverride', communityThemeDefinition.themeRouteOverride, true, 1));
                if (communityThemeDefinition.themeSetting !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('themeSetting', communityThemeDefinition.themeSetting, true, 1));
                xmlLines.push('</CommunityTemplateDefinition>');
            } else {
                return AuraParser.toXML(communityThemeDefinition);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CommunityThemeDefinitionUtils;