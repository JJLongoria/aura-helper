const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ConnectedAppUtils {

    static createConnectedApp(connectedApp) {
        let newConnectedApp;
        if (connectedApp) {
            newConnectedApp = Utils.prepareXML(connectedApp, ConnectedAppUtils.createConnectedApp());
        } else {
            newConnectedApp = {
                attributes: [],
                canvasConfig: undefined,
                contactEmail: undefined,
                contactPhone: undefined,
                description: undefined,
                fullName: undefined,
                iconUrl: undefined,
                infoUrl: undefined,
                ipRanges: [],
                label: undefined,
                logoUrl: undefined,
                mobileStartUrl: undefined,
                oauthConfig: undefined,
                permissionSetName: [],
                plugin: undefined,
                pluginExecutionUser: undefined,
                profileName: [],
                samlConfig: undefined,
                startUrl: undefined
            };
        }
        return newConnectedApp;
    }

    static createConnectedAppAttribute(formula, key) {
        return {
            formula: formula,
            key: key
        }
    }

    static createConnectedAppCanvasConfig(accessMethod, canvasUrl, lifecycleClass, locations, options, samlInitiationMethod) {
        return {
            accessMethod: accessMethod,
            canvasUrl: canvasUrl,
            lifecycleClass: lifecycleClass,
            locations: locations,
            options: options,
            samlInitiationMethod: samlInitiationMethod
        }
    }

    static createConnectedAppIPRange(description, startAddress, endAddress) {
        return {
            description: description,
            startAddress: startAddress,
            endAddress: endAddress
        }
    }

    static createConnectedAppOauthConfig(callbackUrl, certificate, consumerKey, consumerSecret, idTokenConfig, isAdminApproved, scopes, singleLogoutUrl) {
        return {
            callbackUrl: callbackUrl,
            certificate: certificate,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            idTokenConfig: idTokenConfig,
            isAdminApproved: isAdminApproved,
            scopes: scopes,
            singleLogoutUrl: singleLogoutUrl
        }
    }

    static createConnectedAppOauthIdToken(idTokenAudience, idTokenIncludeAttributes, idTokenIncludeCustomPerms, idTokenIncludeStandardClaims, idTokenValidity) {
        return {
            idTokenAudience: idTokenAudience,
            idTokenIncludeAttributes: idTokenIncludeAttributes,
            idTokenIncludeCustomPerms: idTokenIncludeCustomPerms,
            idTokenIncludeStandardClaims: idTokenIncludeStandardClaims,
            idTokenValidity: idTokenValidity
        }
    }

    static createConnectedAppSamlConfig(acsUrl, certificate, entityUrl, encryptionCertificate, encryptionType, issuer, samlIdpSLOBinding, samlNameIdFormat, samlSloUrl, samlSubjectCustomAttr, samlSubjectType) {
        return {
            acsUrl: acsUrl,
            certificate: certificate,
            entityUrl: entityUrl,
            encryptionCertificate: encryptionCertificate,
            encryptionType: encryptionType,
            issuer: issuer,
            samlIdpSLOBinding: samlIdpSLOBinding,
            samlNameIdFormat: samlNameIdFormat,
            samlSloUrl: samlSloUrl,
            samlSubjectCustomAttr: samlSubjectCustomAttr,
            samlSubjectType: samlSubjectType
        }
    }

    static toXML(connectedApp, compress) {
        let xmlLines = [];
        if (connectedApp) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ConnectedApp xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (connectedApp.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', connectedApp.fullName));
                if (connectedApp.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', connectedApp.label));
                if (connectedApp.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', connectedApp.description));
                if (connectedApp.iconUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('iconUrl', connectedApp.iconUrl));
                if (connectedApp.infoUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('infoUrl', connectedApp.infoUrl));
                if (connectedApp.logoUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('logoUrl', connectedApp.logoUrl));
                if (connectedApp.mobileStartUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('mobileStartUrl', connectedApp.mobileStartUrl));
                if (connectedApp.contactPhone !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('contactPhone', connectedApp.contactPhone));
                if (connectedApp.contactEmail !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('contactEmail', connectedApp.contactEmail));
                if (connectedApp.permissionSetName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('permissionSetName', connectedApp.permissionSetName));
                if (connectedApp.plugin !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('plugin', connectedApp.plugin));
                if (connectedApp.pluginExecutionUser !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('pluginExecutionUser', connectedApp.pluginExecutionUser));
                if (connectedApp.profileName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('profileName', connectedApp.profileName));
                if (connectedApp.startUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('startUrl', connectedApp.startUrl));
                if (connectedApp.attributes !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('attributes', connectedApp.attributes, true, 1));
                if (connectedApp.canvasConfig !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('canvasConfig', connectedApp.canvasConfig, true, 1));
                if (connectedApp.ipRanges !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('ipRanges', connectedApp.ipRanges, true, 1));
                if (connectedApp.oauthConfig !== undefined)
                    xmlLines = xmlLines.concat(ConnectedAppUtils.getConnectedAppOauthConfigXMLLines(connectedApp.oauthConfig, 1));
                if (connectedApp.samlConfig !== undefined)
                    xmlLines = xmlLines.concat(ConnectedAppUtils.getConnectedAppSamlConfigXMLLines(connectedApp.samlConfig, 1));
                xmlLines.push('</ConnectedApp>');
            } else {
                return AuraParser.toXML(connectedApp);
            }
        }
        return xmlLines.join('\n');
    }

    static getConnectedAppOauthConfigXMLLines(oauthConfig, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<oauthConfig>');
        if (oauthConfig.callbackUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('callbackUrl', oauthConfig.callbackUrl));
        if (oauthConfig.certificate !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('certificate', oauthConfig.certificate));
        if (oauthConfig.consumerKey !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('consumerKey', oauthConfig.consumerKey));
        if (oauthConfig.consumerSecret !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('consumerSecret', oauthConfig.consumerSecret));
        if (oauthConfig.isAdminApproved !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isAdminApproved', oauthConfig.isAdminApproved));
        if (oauthConfig.singleLogoutUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('singleLogoutUrl', oauthConfig.singleLogoutUrl));
        if (oauthConfig.scopes !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('scopes', oauthConfig.scopes, true, initIndent + 1));
        if (oauthConfig.idTokenConfig !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('idTokenConfig', oauthConfig.idTokenConfig, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</oauthConfig>');
        return xmlLines;
    }

    static getConnectedAppSamlConfigXMLLines(samlConfig, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<samlConfig>');
        if (samlConfig.acsUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('acsUrl', samlConfig.acsUrl));
        if (samlConfig.certificate !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('certificate', samlConfig.certificate));
        if (samlConfig.entityUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('entityUrl', samlConfig.entityUrl));
        if (samlConfig.encryptionCertificate !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encryptionCertificate', samlConfig.encryptionCertificate));
        if (samlConfig.encryptionType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encryptionType', samlConfig.encryptionType));
        if (samlConfig.issuer !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('issuer', samlConfig.issuer));
        if (samlConfig.samlIdpSLOBinding !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('samlIdpSLOBinding', samlConfig.samlIdpSLOBinding));
        if (samlConfig.samlNameIdFormat !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('samlNameIdFormat', samlConfig.samlNameIdFormat));
        if (samlConfig.samlSloUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('samlSloUrl', samlConfig.samlSloUrl));
        if (samlConfig.samlSubjectCustomAttr !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('samlSubjectCustomAttr', samlConfig.samlSubjectCustomAttr));
        if (samlConfig.samlSubjectCustomAttr !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('samlSubjectCustomAttr', samlConfig.samlSubjectCustomAttr));
        xmlLines.push(Utils.getTabs(initIndent) + '</samlConfig>');
        return xmlLines;
    }
}
module.exports = ConnectedAppUtils;