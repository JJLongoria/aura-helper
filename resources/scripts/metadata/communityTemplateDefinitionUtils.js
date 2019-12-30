const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CommunityTemplateDefinitionUtils {

    static createCommunityTemplateDefinition(communityTemplateDefinition) {
        let newCommunityTemplateDefinition;
        if (communityTemplateDefinition) {
            newCommunityTemplateDefinition = Utils.prepareXML(communityTemplateDefinition, CommunityTemplateDefinitionUtils.createCommunityTemplateDefinition());
        } else {
            newCommunityTemplateDefinition = {
                baseTemplate: undefined,
                bundlesInfo: [],
                category: undefined,
                defaultBrandingSet: undefined,
                defaultThemeDefinition: undefined,
                description: undefined,
                enableExtendedCleanUpOnDelete: undefined,
                fullName: undefined,
                masterLabel: undefined,
                navigationLinkSet: undefined,
                pageSetting: [],
                publisher: undefined,
            }
        }
        return newCommunityTemplateDefinition;
    }

    static createCommunityTemplateBundleInfo(description, image, order, title, type) {
        return {
            description: description,
            image: image,
            order: order,
            title: title,
            type: type
        }
    }

    static createCommunityTemplatePageSetting(page, themeLayout) {
        return {
            page: page,
            themeLayout: themeLayout
        }
    }

    static createNavigationLinkSet(navigationMenuItem) {
        return {
            navigationMenuItem: Utils.forceArray(navigationMenuItem)
        }
    }

    static createNavigationMenuItem(defaultListViewId, label, navigationMenuItemBranding, position, publiclyAvailable, subMenu, target, targetPreference, type) {
        return {
            defaultListViewId: defaultListViewId,
            label: label,
            navigationMenuItemBranding: navigationMenuItemBranding,
            position: position,
            publiclyAvailable: publiclyAvailable,
            subMenu: subMenu,
            target: target,
            targetPreference: targetPreference,
            type: type
        }
    }

    static toXML(communityTemplateDefinition, compress) {
        let xmlLines = [];
        if (communityTemplateDefinition) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CommunityTemplateDefinition xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (communityTemplateDefinition.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', communityTemplateDefinition.fullName));
                if (communityTemplateDefinition.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', communityTemplateDefinition.description));
                if (communityTemplateDefinition.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', communityTemplateDefinition.masterLabel));
                if (communityTemplateDefinition.baseTemplate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('baseTemplate', communityTemplateDefinition.baseTemplate));
                if (communityTemplateDefinition.category !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('category', communityTemplateDefinition.category));
                if (communityTemplateDefinition.defaultBrandingSet !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('defaultBrandingSet', communityTemplateDefinition.defaultBrandingSet));
                if (communityTemplateDefinition.defaultThemeDefinition !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('defaultThemeDefinition', communityTemplateDefinition.defaultThemeDefinition));
                if (communityTemplateDefinition.enableExtendedCleanUpOnDelete !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableExtendedCleanUpOnDelete', communityTemplateDefinition.enableExtendedCleanUpOnDelete));
                if (communityTemplateDefinition.publisher !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('publisher', communityTemplateDefinition.publisher));
                if (communityTemplateDefinition.navigationLinkSet !== undefined)
                    xmlLines = xmlLines.concat(CommunityTemplateDefinitionUtils.getNavigationLinkSetXMLLines(communityTemplateDefinition.navigationLinkSet, 1));
                if (communityTemplateDefinition.bundlesInfo !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('bundlesInfo', communityTemplateDefinition.bundlesInfo, true, 1));
                if (communityTemplateDefinition.pageSetting !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('pageSetting', communityTemplateDefinition.pageSetting, true, 1));
                xmlLines.push('</CommunityTemplateDefinition>');
            } else {
                return AuraParser.toXML(communityTemplateDefinition);
            }
        }
        return xmlLines.join('\n');
    }

    static getNavigationLinkSetXMLLines(navigationLinkSet, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<navigationLinkSet>');
        xmlLines = xmlLines.concat(CommunityTemplateDefinitionUtils.getNavigationMenuItemsXMLLines(navigationLinkSet.navigationMenuItem, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</navigationLinkSet>');
        return xmlLines;
    }

    static getNavigationMenuItemsXMLLines(navigationMenuItem, initIndent) {
        let xmlLines = [];
        let menuItems = Utils.forceArray(navigationMenuItem);
        for (const menuItem of menuItems) {
            xmlLines.push(Utils.getTabs(initIndent) + '<navigationMenuItem>');
            if (menuItem.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', menuItem.label));
            if (menuItem.target !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('target', menuItem.target));
            if (menuItem.targetPreference !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('targetPreference', menuItem.targetPreference));
            if (menuItem.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', menuItem.type));
            if (menuItem.position !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('position', menuItem.position));
            if (menuItem.defaultListViewId !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('defaultListViewId', menuItem.defaultListViewId));
            if (menuItem.navigationMenuItemBranding !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('navigationMenuItemBranding', menuItem.navigationMenuItemBranding));
            if (menuItem.publiclyAvailable !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('publiclyAvailable', menuItem.publiclyAvailable));
            if (menuItem.subMenu !== undefined)
                xmlLines = xmlLines.concat(CommunityTemplateDefinitionUtils.getNavigationMenuItemsXMLLines(menuItem.subMenu, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</navigationMenuItem>');
        }
        return xmlLines;
    }

}
module.exports = CommunityTemplateDefinitionUtils;