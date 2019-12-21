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
                customApplication.actionOverrides.sort(function (a, b) {
                    let nameA = a.pageOrSobjectType + a.actionName + a.content;
                    let nameB = b.pageOrSobjectType + b.actionName + b.content;
                    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                });
                xmlLines = xmlLines.concat(Utils.getXMLBlock('actionOverrides', customApplication.actionOverrides, compress, 1));
            }
            if (customApplication.brand) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('brand', customApplication.brand, compress, 1));
            }
            if (customApplication.consoleConfig) {
                xmlLines.push('\t<consoleConfig>');
                xmlLines.push('\t\t' + Utils.getXMLTag('detailPageRefreshMethod', customApplication.consoleConfig.detailPageRefreshMethod));
                xmlLines.push('\t\t' + Utils.getXMLTag('listRefreshMethod', customApplication.consoleConfig.listRefreshMethod));
                xmlLines.push('\t\t' + Utils.getXMLTag('headerColor', customApplication.consoleConfig.headerColor));
                xmlLines.push('\t\t' + Utils.getXMLTag('footerColor', customApplication.consoleConfig.footerColor));
                xmlLines.push('\t\t' + Utils.getXMLTag('primaryTabColor', customApplication.consoleConfig.primaryTabColor));
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
                if (customApplication.consoleConfig.keyboardShortcuts) {
                    xmlLines.push('\t\t<keyboardShortcuts>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customShortcuts', customApplication.consoleConfig.keyboardShort.cutscustomShortcuts, compress, 3));
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('defaultShortcuts', customApplication.consoleConfig.keyboardShort.defaultShortcuts, compress, 3));
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
            if (customApplication.preferences) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('preferences', customApplication.preferences, compress, 1));
            }
            if (customApplication.profileActionOverrides) {
                customApplication.profileActionOverrides.sort(function (a, b) {
                    let nameA = a.pageOrSobjectType + a.actionName + a.content;
                    let nameB = b.pageOrSobjectType + b.actionName + b.content;
                    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                });
                xmlLines = xmlLines.concat(Utils.getXMLBlock('profileActionOverrides', customApplication.profileActionOverrides, compress, 1));
            }
            if (customApplication.subscriberTabs) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('subscriberTabs', customApplication.subscriberTabs, compress, 1));
            }
            if (customApplication.tabs) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('tabs', customApplication.tabs, compress, 1));
            }
            if (customApplication.workspaceConfig) {
                xmlLines.push('\t<workspaceConfig>');
                xmlLines = xmlLines.concat(Utils.getXMLBlock('mappings', customApplication.workspaceConfig.mappings, compress, 2));
                xmlLines.push('\t</workspaceConfig>');
            }
            xmlLines.push('</CustomApplication>');
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomApplicationUtils;