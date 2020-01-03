const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class NavigationMenuUtils {

    static createNavigationMenu(navigationMenu) {
        let newNavigationMenu;
        if (navigationMenu) {
            newNavigationMenu = Utils.prepareXML(navigationMenu, NavigationMenuUtils.createNavigationMenu());
        } else {
            newNavigationMenu = {
                container: undefined,
                containerType: undefined,
                fullName: undefined,
                label: undefined,
                navigationMenuItem: [],
            };
        }
        return newNavigationMenu;
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

    static createNavigationSubMenu(navigationMenuItem) {
        return {
            navigationMenuItem: Utils.forceArray(navigationMenuItem)
        }
    }

    static toXML(navigationMenu, compress) {
        let xmlLines = [];
        if (navigationMenu) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<NavigationMenu xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (navigationMenu.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', navigationMenu.fullName));
                if (navigationMenu.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', navigationMenu.label));
                if (navigationMenu.containerType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('containerType', navigationMenu.containerType));
                if (navigationMenu.container !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('container', navigationMenu.container));
                if (navigationMenu.navigationMenuItem !== undefined)
                    xmlLines = xmlLines.concat(NavigationMenuUtils.getNavigationMenuItemXMLLines(navigationMenu.navigationMenuItem, 1));
                xmlLines.push('</NavigationMenu>');
            } else {
                return AuraParser.toXML(navigationMenu);
            }
        }
        return xmlLines.join('\n');
    }

    static getNavigationMenuItemXMLLines(navigationMenuItem, initIndent) {
        let xmlLines = [];
        let menuItems = Utils.forceArray(navigationMenuItem);
        for (const item of menuItems) {
            xmlLines.push(Utils.getTabs(initIndent) + '<navigationMenuItem>');
            if (item.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', item.label));
            if (item.defaultListViewId !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('defaultListViewId', item.defaultListViewId));
            if (item.navigationMenuItemBranding !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('navigationMenuItemBranding', item.navigationMenuItemBranding));
            if (item.position !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('position', item.position));
            if (item.publiclyAvailable !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('publiclyAvailable', item.publiclyAvailable));
            if (item.target !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('target', item.target));
            if (item.targetPreference !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('targetPreference', item.targetPreference));
            if (item.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', item.type));
            if (item.subMenu !== undefined)
                xmlLines = xmlLines.concat(NavigationMenuUtils.getSubmenuXMLLines(item.subMenu, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</navigationMenuItem>');
        }
        return xmlLines;
    }

    static getSubmenuXMLLines(subMenu, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<subMenu>');
        if (subMenu.navigationMenuItem !== undefined)
            xmlLines = xmlLines.concat(NavigationMenuUtils.getNavigationMenuItemXMLLines(subMenu.navigationMenuItem, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</subMenu>');
        return xmlLines;
    }

}
module.exports = NavigationMenuUtils;