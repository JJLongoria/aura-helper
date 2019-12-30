const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomApplicationUtils {

    static createCustomApplication(customApp) {
        let customApplication;
        if (customApp) {
            customApplication = Utils.prepareXML(customApp, CustomApplicationUtils.createCustomApplication());
        } else {
            customApplication = {
                actionOverrides: [],
                brand: undefined,
                consoleConfig: undefined,
                defaultLandingTab: undefined,
                description: undefined,
                formFactors: undefined,
                isNavAutoTempTabsDisabled: undefined,
                isNavPersonalizationDisabled: undefined,
                isServiceCloudConsole: undefined,
                label: undefined,
                logo: undefined,
                navType: undefined,
                preferences: undefined,
                profileActionOverrides: [],
                setupExperience: undefined,
                subscriberTabs: [],
                tabs: undefined,
                uiType: undefined,
                utilityBar: undefined,
                workspaceConfig: undefined
            }
        }
        return customApplication;
    }

    static createActionOverride(actionName, comment, content, formFactor, pageOrSobjectType, skipRecordTypeSelect, type) {
        return {
            actionName: actionName,
            comment: comment,
            content: content,
            formFactor: formFactor,
            pageOrSobjectType: pageOrSobjectType,
            skipRecordTypeSelect: skipRecordTypeSelect,
            type: type
        }
    }

    static createAppBrand(footerColor, headerColor, logo, logoVersion, shouldOverrideOrgTheme) {
        return {
            footerColor: footerColor,
            headerColor: headerColor,
            logo: logo,
            logoVersion: logoVersion,
            shouldOverrideOrgTheme: shouldOverrideOrgTheme
        }
    }

    static createAppComponentList(alignment, components) {
        return {
            alignment: alignment,
            components: components,
        }
    }

    static createAppPreferences(enableCustomizeMyTabs, enableKeyboardShortcuts, enableListViewHover, enableListViewReskin, enableMultiMonitorComponents, enablePinTabs, enableTabHover, enableTabLimits, saveUserSessions) {
        return {
            enableCustomizeMyTabs: enableCustomizeMyTabs,
            enableKeyboardShortcuts: enableKeyboardShortcuts,
            enableListViewHover: enableListViewHover,
            enableListViewReskin: enableListViewReskin,
            enableMultiMonitorComponents: enableMultiMonitorComponents,
            enablePinTabs: enablePinTabs,
            enableTabHover: enableTabHover,
            enableTabLimits: enableTabLimits,
            saveUserSessions: saveUserSessions
        }
    }

    static createAppProfileActionOverride(actionName, content, formFactor, pageOrSobjectType, profile, recordType, type) {
        return {
            actionName: actionName,
            content: content,
            formFactor: formFactor,
            pageOrSobjectType: pageOrSobjectType,
            profile: profile,
            recordType: recordType,
            type: type
        }
    }

    static createaAppWorkspaceConfig(mappings) {
        return {
            mappings: mappings
        }
    }

    static createWorkspaceMapping(fieldName, tab) {
        return {
            fieldName: fieldName,
            tab: tab
        }
    }

    static createCustomShorcut(action, active, keyCommand, description, eventName) {
        return {
            action: action,
            active: active,
            keyCommand: keyCommand,
            description: description,
            eventName: eventName
        }
    }

    static createDefaultShorcut(action, active, keyCommand) {
        return {
            action: action,
            active: active,
            keyCommand: keyCommand
        }
    }

    static createKeyboardShorcuts(customShortcuts, defaultShortcuts) {
        return {
            customShortcuts: customShortcuts,
            defaultShortcuts: defaultShortcuts
        }
    }

    static createListPlacement(height, location, units, width) {
        return {
            height: height,
            location: location,
            units: units,
            width: width
        }
    }

    static createLiveAgentConfig(enableLiveChat, openNewAccountSubtab, openNewCaseSubtab, openNewContactSubtab, openNewLeadSubtab, openNewVFPageSubtab, pageNamesToOpen, showKnowledgeArticles) {
        return {
            enableLiveChat: enableLiveChat,
            openNewAccountSubtab: openNewAccountSubtab,
            openNewCaseSubtab: openNewCaseSubtab,
            openNewContactSubtab: openNewContactSubtab,
            openNewLeadSubtab: openNewLeadSubtab,
            openNewVFPageSubtab: openNewVFPageSubtab,
            pageNamesToOpen: pageNamesToOpen,
            showKnowledgeArticles: showKnowledgeArticles
        }
    }

    static createPushNotification(fieldNames, objectName) {
        return {
            fieldNames: fieldNames,
            objectName: objectName
        }
    }

    static createServiceCloudConsoleConfig(componentList, detailPageRefreshMethod, footerColor, headerColor, keyboardShortcuts, listPlacement, listRefreshMethod, liveAgentConfig, primaryTabColor, pushNotifications, tabLimitConfig, whiteListedDomains) {
        return {
            componentList: componentList,
            detailPageRefreshMethod: detailPageRefreshMethod,
            footerColor: footerColor,
            headerColor: headerColor,
            keyboardShortcuts: keyboardShortcuts,
            listPlacement: listPlacement,
            listRefreshMethod: listRefreshMethod,
            liveAgentConfig: liveAgentConfig,
            primaryTabColor: primaryTabColor,
            pushNotifications: pushNotifications,
            tabLimitConfig: tabLimitConfig,
            whiteListedDomains: whiteListedDomains
        }
    }

    static createTabLimitConfig(maxNumberOfPrimaryTabs, maxNumberOfSubTabs) {
        return {
            maxNumberOfPrimaryTabs: maxNumberOfPrimaryTabs,
            maxNumberOfSubTabs: maxNumberOfSubTabs
        }
    }

    static toXML(customApplication, compress) {
        let xmlLines = [];
        if (customApplication) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customApplication.label)
                    xmlLines.push('\t' + Utils.getXMLTag('label', customApplication.label));
                if (customApplication.logo)
                    xmlLines.push('\t' + Utils.getXMLTag('logo', customApplication.logo));
                if (customApplication.description)
                    xmlLines.push('\t' + Utils.getXMLTag('description', customApplication.description));
                if (customApplication.navType)
                    xmlLines.push('\t' + Utils.getXMLTag('logo', customApplication.navType));
                if (customApplication.defaultLandingTab)
                    xmlLines.push('\t' + Utils.getXMLTag('defaultLandingTab', customApplication.defaultLandingTab));
                if (customApplication.setupExperience)
                    xmlLines.push('\t' + Utils.getXMLTag('setupExperience', customApplication.setupExperience));
                if (customApplication.uiType)
                    xmlLines.push('\t' + Utils.getXMLTag('uiType', customApplication.uiType));
                if (customApplication.utilityBar)
                    xmlLines.push('\t' + Utils.getXMLTag('utilityBar', customApplication.utilityBar));
                if (customApplication.formFactors)
                    xmlLines.push('\t' + Utils.getXMLTag('defaultLandingTab', customApplication.formFactors));
                if (customApplication.isNavAutoTempTabsDisabled != undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('isNavAutoTempTabsDisabled', customApplication.isNavAutoTempTabsDisabled));
                if (customApplication.isNavPersonalizationDisabled != undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('isNavPersonalizationDisabled', customApplication.isNavPersonalizationDisabled));
                if (customApplication.isServiceCloudConsole != undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('isServiceCloudConsole', customApplication.isServiceCloudConsole));
                if (customApplication.actionOverrides) {
                    Utils.sort(customApplication.actionOverrides, ['pageOrSobjectType', 'actionName', 'content']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('actionOverrides', customApplication.actionOverrides, compress, 1));
                }
                if (customApplication.brand) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('brand', customApplication.brand, compress, 1));
                }
                if (customApplication.consoleConfig) {
                    xmlLines.push('\t<consoleConfig>');
                    if (customApplication.consoleConfig.detailPageRefreshMethod)
                        xmlLines.push('\t\t' + Utils.getXMLTag('detailPageRefreshMethod', customApplication.consoleConfig.detailPageRefreshMethod));
                    if (customApplication.consoleConfig.listRefreshMethod)
                        xmlLines.push('\t\t' + Utils.getXMLTag('listRefreshMethod', customApplication.consoleConfig.listRefreshMethod));
                    if (customApplication.consoleConfig.headerColor)
                        xmlLines.push('\t\t' + Utils.getXMLTag('headerColor', customApplication.consoleConfig.headerColor));
                    if (customApplication.consoleConfig.footerColor)
                        xmlLines.push('\t\t' + Utils.getXMLTag('footerColor', customApplication.consoleConfig.footerColor));
                    if (customApplication.consoleConfig.primaryTabColor)
                        xmlLines.push('\t\t' + Utils.getXMLTag('primaryTabColor', customApplication.consoleConfig.primaryTabColor));
                    if (customApplication.consoleConfig.componentList && customApplication.consoleConfig.componentList.components) {
                        customApplication.consoleConfig.componentList.components.sort(function (a, b) {
                            let nameA = a;
                            let nameB = b;
                            return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                        });
                        Utils.sort(customApplication.consoleConfig.componentList.components);
                        xmlLines.push('\t\t<componentList>');
                        xmlLines.push('\t\t\t<alignment>' + customApplication.consoleConfig.componentList.alignment + '</alignment>');
                        for (const component of customApplication.consoleConfig.componentList.components) {
                            xmlLines.push('\t\t\t<components>' + component + '</components>');
                        }
                        xmlLines.push('\t\t</componentList>');
                    } else if (customApplication.consoleConfig.CustomApplicationComponents && customApplication.consoleConfig.CustomApplicationComponents.customApplicationComponent) {
                        Utils.sort(customApplication.consoleConfig.CustomApplicationComponents.customApplicationComponent);
                        xmlLines.push('\t\t<CustomApplicationComponents>');
                        xmlLines.push('\t\t\t<alignment>' + customApplication.consoleConfig.CustomApplicationComponents.alignment + '</alignment>');
                        for (const component of customApplication.consoleConfig.CustomApplicationComponents.customApplicationComponent) {
                            xmlLines.push('\t\t\t<customApplicationComponent>' + component + '</customApplicationComponent>');
                        }
                        xmlLines.push('\t\t</CustomApplicationComponents>');
                    }
                    if (customApplication.consoleConfig.keyboardShortcuts) {
                        Utils.sort(customApplication.consoleConfig.keyboardShortcuts.customShortcuts, ['action']);
                        Utils.sort(customApplication.consoleConfig.keyboardShortcuts.defaultShortcuts ['action']);
                        xmlLines.push('\t\t<keyboardShortcuts>');
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('customShortcuts', customApplication.consoleConfig.keyboardShortcuts.customShortcuts, compress, 3));
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('defaultShortcuts', customApplication.consoleConfig.keyboardShortcuts.defaultShortcuts, compress, 3));
                        xmlLines.push('\t\t<keyboardShortcuts>');
                    }
                    if (customApplication.consoleConfig.listPlacement) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('listPlacement', customApplication.consoleConfig.listPlacement, compress, 2));
                    }
                    if (customApplication.consoleConfig.liveAgentConfig) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('liveAgentConfig', customApplication.consoleConfig.liveAgentConfig, compress, 2));
                    }
                    if (customApplication.consoleConfig.pushNotifications) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('pushNotifications', customApplication.consoleConfig.pushNotifications, compress, 2));
                    }
                    if (customApplication.consoleConfig.pushNotifications) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('pushNotifications', customApplication.consoleConfig.pushNotifications, compress, 2));
                    }
                    if (customApplication.consoleConfig.tabLimitConfig) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('tabLimitConfig', customApplication.consoleConfig.tabLimitConfig, compress, 2));
                    }
                    if (customApplication.consoleConfig.whiteListedDomains) {
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('whiteListedDomains', customApplication.consoleConfig.whiteListedDomains, compress, 2));
                    }
                    xmlLines.push('\t</consoleConfig>');
                }
                if (customApplication.preferences) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('preferences', customApplication.preferences, compress, 1));
                }
                if (customApplication.profileActionOverrides) {
                    Utils.sort(customApplication.profileActionOverrides, ['pageOrSobjectType', 'actionName', 'content']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('profileActionOverrides', customApplication.profileActionOverrides, compress, 1));
                }
                if (customApplication.subscriberTabs) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('subscriberTabs', customApplication.subscriberTabs, compress, 1));
                }
                if (customApplication.tabs) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('tabs', customApplication.tabs, compress, 1));
                }
                if (customApplication.workspaceConfig && customApplication.workspaceConfig.mappings) {
                    Utils.sort(customApplication.workspaceConfig.mappings, ['tab']);
                    xmlLines.push('\t<workspaceConfig>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('mappings', customApplication.workspaceConfig.mappings, compress, 2));
                    xmlLines.push('\t</workspaceConfig>');
                }
                xmlLines.push('</CustomApplication>');
            } else { 
                return AuraParser.toXML(customApplication);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomApplicationUtils;