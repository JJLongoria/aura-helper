const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomSiteUtils {

    static createCustomSite(customSite) {
        let newCustomSite;
        if (customSite) {
            newCustomSite = Utils.prepareXML(customSite, CustomSiteUtils.createCustomSite());
        } else {
            newCustomSite = {
                active: undefined,
                allowHomePage: undefined,
                allowStandardAnswersPages: undefined,
                allowStandardIdeasPages: undefined,
                allowStandardLookups: undefined,
                allowStandardPortalPages: undefined,
                allowStandardSearch: undefined,
                analyticsTrackingCode: undefined,
                authorizationRequiredPage: undefined,
                bandwidthExceededPage: undefined,
                browserXssProtection: undefined,
                changePasswordPage: undefined,
                chatterAnswersForgotPasswordConfirmPage: undefined,
                chatterAnswersForgotPasswordPage: undefined,
                chatterAnswersHelpPage: undefined,
                chatterAnswersLoginPage: undefined,
                chatterAnswersRegistrationPage: undefined,
                clickjackProtectionLevel: undefined,
                contentSniffingProtection: undefined,
                cspUpgradeInsecureRequests: undefined,
                customWebAddresses: [],
                description: undefined,
                enableAuraRequests: undefined,
                favoriteIcon: undefined,
                fileNotFoundPage: undefined,
                forgotPasswordPage: undefined,
                genericErrorPage: undefined,
                guestProfile: undefined,
                inMaintenancePage: undefined,
                inactiveIndexPage: undefined,
                indexPage: undefined,
                masterLabel: undefined,
                portal: undefined,
                referrerPolicyOriginWhenCrossOrigin: undefined,
                requireHttps: undefined,
                requireInsecurePortalAccess: undefined,
                robotsTxtPage: undefined,
                serverIsDown: undefined,
                siteAdmin: undefined,
                siteRedirectMappings: [],
                siteTemplate: undefined,
                siteType: undefined,
                subdomain: undefined,
                urlPathPrefix: undefined
            };
        }
        return newCustomSite;
    }

    static createSiteRedirectMapping(action, isActive, source, target) {
        return {
            action: action,
            isActive: isActive,
            source: source,
            target: target
        }
    }

    static createSiteWebAddress(certificate, domainName, primary) {
        return {
            certificate: certificate,
            domainName: domainName,
            primary: primary
        }
    }

    static toXML(customSite, compress) {
        let xmlLines = [];
        if (customSite) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomSite xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customSite.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', customSite.masterLabel));
                if (customSite.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', customSite.description));
                if (customSite.guestProfile !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('guestProfile', customSite.guestProfile));
                if (customSite.subdomain !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('subdomain', customSite.subdomain));
                if (customSite.urlPathPrefix !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('urlPathPrefix', customSite.urlPathPrefix));
                if (customSite.favoriteIcon !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('favoriteIcon', customSite.favoriteIcon));
                if (customSite.clickjackProtectionLevel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('clickjackProtectionLevel', customSite.clickjackProtectionLevel));
                if (customSite.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', customSite.active));
                if (customSite.analyticsTrackingCode !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('analyticsTrackingCode', customSite.analyticsTrackingCode));
                if (customSite.authorizationRequiredPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authorizationRequiredPage', customSite.authorizationRequiredPage));
                if (customSite.bandwidthExceededPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('bandwidthExceededPage', customSite.bandwidthExceededPage));
                if (customSite.changePasswordPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('changePasswordPage', customSite.changePasswordPage));
                if (customSite.chatterAnswersForgotPasswordConfirmPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersForgotPasswordConfirmPage', customSite.chatterAnswersForgotPasswordConfirmPage));
                if (customSite.chatterAnswersForgotPasswordPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersForgotPasswordPage', customSite.chatterAnswersForgotPasswordPage));
                if (customSite.chatterAnswersHelpPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersHelpPage', customSite.chatterAnswersHelpPage));
                if (customSite.chatterAnswersLoginPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersLoginPage', customSite.chatterAnswersLoginPage));
                if (customSite.chatterAnswersRegistrationPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersRegistrationPage', customSite.chatterAnswersRegistrationPage));
                if (customSite.fileNotFoundPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fileNotFoundPage', customSite.fileNotFoundPage));
                if (customSite.forgotPasswordPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('forgotPasswordPage', customSite.forgotPasswordPage));
                if (customSite.genericErrorPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('genericErrorPage', customSite.genericErrorPage));
                if (customSite.inMaintenancePage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('inMaintenancePage', customSite.inMaintenancePage));
                if (customSite.inactiveIndexPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('inactiveIndexPage', customSite.inactiveIndexPage));
                if (customSite.indexPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('indexPage', customSite.indexPage));
                if (customSite.portal !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('portal', customSite.portal));
                if (customSite.robotsTxtPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('robotsTxtPage', customSite.robotsTxtPage));
                if (customSite.serverIsDown !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('serverIsDown', customSite.serverIsDown));
                if (customSite.siteAdmin !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('siteAdmin', customSite.siteAdmin));
                if (customSite.siteTemplate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('siteTemplate', customSite.siteTemplate));
                if (customSite.siteType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('siteType', customSite.siteType));
                if (customSite.allowHomePage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowHomePage', customSite.allowHomePage));
                if (customSite.allowStandardAnswersPages !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowStandardAnswersPages', customSite.allowStandardAnswersPages));
                if (customSite.allowStandardIdeasPages !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowStandardIdeasPages', customSite.allowStandardIdeasPages));
                if (customSite.allowStandardLookups !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowStandardLookups', customSite.allowStandardLookups));
                if (customSite.allowStandardPortalPages !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowStandardPortalPages', customSite.allowStandardPortalPages));
                if (customSite.allowStandardSearch !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowStandardSearch', customSite.allowStandardSearch));
                if (customSite.browserXssProtection !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('browserXssProtection', customSite.browserXssProtection));
                if (customSite.contentSniffingProtection !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('contentSniffingProtection', customSite.contentSniffingProtection));
                if (customSite.cspUpgradeInsecureRequests !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('cspUpgradeInsecureRequests', customSite.cspUpgradeInsecureRequests));
                if (customSite.enableAuraRequests !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableAuraRequests', customSite.enableAuraRequests));
                if (customSite.referrerPolicyOriginWhenCrossOrigin !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('referrerPolicyOriginWhenCrossOrigin', customSite.referrerPolicyOriginWhenCrossOrigin));
                if (customSite.requireHttps !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('requireHttps', customSite.requireHttps));
                if (customSite.requireInsecurePortalAccess !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('requireInsecurePortalAccess', customSite.requireInsecurePortalAccess));
                if (customSite.customWebAddresses !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customWebAddresses', customSite.customWebAddresses, true, 1));
                if (customSite.siteRedirectMappings !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('siteRedirectMappings', customSite.siteRedirectMappings, true, 1));
                xmlLines.push('</CustomSite>');
            } else {
                return AuraParser.toXML(customSite);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomSiteUtils;