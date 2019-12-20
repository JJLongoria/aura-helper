const Utils = require('./utils');

class CustomApplicationUtils {

    static createCustomApplication(customApp) {
        let customApplication;
        if (customApp) {
            customApplication = CustomApplicationUtils.createCustomApplication();
            let customAppKeys = Object.keys(customApplication);
            Object.keys(customApplication).forEach(function (key) {
                if (customAppKeys.includes(key)) {
                    if (Array.isArray(customAppKeys[key]) || (key !== 'actionOverrides' && key !== 'profileActionOverrides' && key !== 'subscriberTabs'))
                        customApplication[key] = customAppKeys[key];
                    else
                        customApplication[key].push(customAppKeys[key]);
                }
            });
        } else {
            customApplication = {
                actionOverrides: [],
                brand: {},
                consoleConfig: {},
                defaultLandingTab: "",
                description: "",
                formFactors: undefined,
                isNavAutoTempTabsDisabled: false,
                isNavPersonalizationDisabled: false,
                isServiceCloudConsole: false,
                label: "",
                logo: "",
                navType: "",
                preferences: {},
                profileActionOverrides: [],
                setupExperience: "",
                subscriberTabs: [],
                tabs: "",
                uiType: "",
                utilityBar: "",
                workspaceConfig: {}
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
            xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
            xmlLines.push('<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">');
            if (customApplication.actionOverrides) {
                customApplication.actionOverrides.sort(function (a, b) {
                    let nameA = a.pageOrSobjectType + a.actionName + a.content;
                    let nameB = b.pageOrSobjectType + b.actionName + b.content;
                    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                });
                for (const actionOverride of customApplication.actionOverrides) {
                    if (compress)
                        xmlLines.push('\t<actionOverrides>' + Utils.getXMLTag('pageOrSobjectType', actionOverride.pageOrSobjectType) + Utils.getXMLTag('actionName', actionOverride.actionName) + Utils.getXMLTag('comment', actionOverride.comment) + Utils.getXMLTag('content', actionOverride.content) + Utils.getXMLTag('formFactor', actionOverride.formFactor) + Utils.getXMLTag('skipRecordTypeSelect', actionOverride.skipRecordTypeSelect) + Utils.getXMLTag('type', actionOverride.type) + '</actionOverrides>');
                    else
                        xmlLines.push('\t<actionOverrides>\n\t\t' + Utils.getXMLTag('pageOrSobjectType', actionOverride.pageOrSobjectType) + '\n\t\t' + Utils.getXMLTag('actionName', actionOverride.actionName) + '\n\t\t' + Utils.getXMLTag('comment', actionOverride.comment) + '\n\t\t' + Utils.getXMLTag('content', actionOverride.content) + '\n\t\t' + Utils.getXMLTag('formFactor', actionOverride.formFactor) + '\n\t\t' + Utils.getXMLTag('skipRecordTypeSelect', actionOverride.skipRecordTypeSelect) + '\n\t\t' + Utils.getXMLTag('type', actionOverride.type) + '\n\t' + '</actionOverrides>');
                }
            }
            if (customApplication.brand) {
                if (compress) {
                    xmlLines.push('\t<brand>' + Utils.getXMLTag('headerColor', customApplication.brand.headerColor) + Utils.getXMLTag('footerColor', customApplication.brand.footerColor) + Utils.getXMLTag('logo', customApplication.brand.logo) + Utils.getXMLTag('logoVersion', customApplication.brand.logoVersion) + Utils.getXMLTag('shouldOverrideOrgTheme', customApplication.brand.shouldOverrideOrgTheme) + '</brand>');
                } else {
                    xmlLines.push('\t<brand>\n\t\t' + Utils.getXMLTag('headerColor', customApplication.brand.headerColor) + '\n\t\t' + Utils.getXMLTag('footerColor', customApplication.brand.footerColor) + '\n\t\t' + Utils.getXMLTag('logo', customApplication.brand.logo) + '\n\t\t' + Utils.getXMLTag('logoVersion', customApplication.brand.logoVersion) + '\n\t\t' + Utils.getXMLTag('shouldOverrideOrgTheme', customApplication.brand.shouldOverrideOrgTheme) + '\n\t</brand>');
                }
            }
            if (customApplication.consoleConfig) {
                xmlLines.push('\t<consoleConfig>');
                if (customApplication.consoleConfig.componentList.components) {
                    customApplication.consoleConfig.componentList.components.sort(function (a, b) {
                        let nameA = a;
                        let nameB = b;
                        return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                    });
                    xmlLines.push('\t\t<componentList>');
                    xmlLines.push('\t\t\t<alignment>' + customApplication.consoleConfig.componentList.alignment + '</alignment>');
                    for (const component of customApplication.consoleConfig.componentList.components) {
                        xmlLines.push('\t\t\t<components>' + component + '</components>');
                    }
                    xmlLines.push('\t\t</componentList>');
                }
                if (compress) {

                } else {

                }
                xmlLines.push('\t</consoleConfig>');
            }
            xmlLines.push('</CustomApplication>');
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomApplicationUtils;