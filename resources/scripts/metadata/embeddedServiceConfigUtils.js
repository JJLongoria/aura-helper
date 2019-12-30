const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EmbeddedServiceConfigUtils {

    static createEmbeddedServiceConfig(embeddedServiceConfig) {
        let newEmbeddedServiceConfig;
        if (embeddedServiceConfig) {
            newEmbeddedServiceConfig = Utils.prepareXML(embeddedServiceConfig, EmbeddedServiceConfigUtils.createEmbeddedServiceConfig());
        } else {
            newEmbeddedServiceConfig = {
                areGuestUsersAllowed: undefined,
                authMethod: undefined,
                customMinimizedComponent: undefined,
                embeddedServiceCustomComponents: [],
                embeddedServiceCustomLabels: [],
                embeddedServiceFlowConfig: [],
                embeddedServiceFlows: [],
                fullName: undefined,
                masterLabel: undefined,
                shouldHideAuthDialog: undefined,
                site: undefined
            };
        }
        return newEmbeddedServiceConfig;
    }

    static createEmbeddedServiceCustomComponent(customComponent, customComponentType) {
        return {
            customComponent: customComponent,
            customComponentType: customComponentType
        }
    }

    static createEmbeddedServiceCustomLabel(customLabel, feature, labelKey) {
        return {
            customLabel: customLabel,
            feature: feature,
            labelKey: labelKey
        }
    }

    static createEmbeddedServiceFlow(flow, flowType, isAuthenticationRequired) {
        return {
            flow: flow,
            flowType: flowType,
            isAuthenticationRequired: isAuthenticationRequired
        }
    }

    static createEmbeddedServiceFlowConfig(enabled) {
        return {
            enabled: enabled
        }
    }

    static toXML(embeddedServiceConfig, compress) {
        let xmlLines = [];
        if (embeddedServiceConfig) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EmbeddedServiceConfig xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (embeddedServiceConfig.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', embeddedServiceConfig.fullName));
                if (embeddedServiceConfig.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', embeddedServiceConfig.masterLabel));
                if (embeddedServiceConfig.areGuestUsersAllowed !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('areGuestUsersAllowed', embeddedServiceConfig.areGuestUsersAllowed));
                if (embeddedServiceConfig.authMethod !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authMethod', embeddedServiceConfig.authMethod));
                if (embeddedServiceConfig.customMinimizedComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customMinimizedComponent', embeddedServiceConfig.customMinimizedComponent));
                if (embeddedServiceConfig.shouldHideAuthDialog !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('shouldHideAuthDialog', embeddedServiceConfig.shouldHideAuthDialog));
                if (embeddedServiceConfig.site !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('site', embeddedServiceConfig.site));
                if (embeddedServiceConfig.embeddedServiceCustomComponents !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('embeddedServiceCustomComponents', embeddedServiceConfig.embeddedServiceCustomComponents, true, 1));
                if (embeddedServiceConfig.embeddedServiceCustomLabels !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('embeddedServiceCustomLabels', embeddedServiceConfig.embeddedServiceCustomLabels, true, 1));
                if (embeddedServiceConfig.embeddedServiceFlowConfig !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('embeddedServiceFlowConfig', embeddedServiceConfig.embeddedServiceFlowConfig, true, 1));
                if (embeddedServiceConfig.embeddedServiceFlows !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('embeddedServiceFlows', embeddedServiceConfig.embeddedServiceFlows, true, 1));
                xmlLines.push('</EmbeddedServiceConfig>');
            } else {
                return AuraParser.toXML(embeddedServiceConfig);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EmbeddedServiceConfigUtils;