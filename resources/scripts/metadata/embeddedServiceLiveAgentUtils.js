const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EmbeddedServiceLiveAgentUtils {

    static createEmbeddedServiceLiveAgent(embeddedServiceLiveAgent) {
        let newEmbeddedServiceLiveAgent;
        if (embeddedServiceLiveAgent) {
            newEmbeddedServiceLiveAgent = Utils.prepareXML(embeddedServiceLiveAgent, EmbeddedServiceLiveAgentUtils.createEmbeddedServiceLiveAgent());
        } else {
            newEmbeddedServiceLiveAgent = {
                avatarImg: undefined,
                customPrechatComponent: undefined,
                embeddedServiceConfig: undefined,
                embeddedServiceQuickActions: [],
                enabled: undefined,
                fontSize: undefined,
                fullName: undefined,
                headerBackgroundImg: undefined,
                isOfflineCaseEnabled: undefined,
                isQueuePositionEnabled: undefined,
                liveAgentChatUrl: undefined,
                liveAgentContentUrl: undefined,
                liveChatButton: undefined,
                liveChatDeployment: undefined,
                masterLabel: undefined,
                offlineCaseBackgroundImg: undefined,
                prechatBackgroundImg: undefined,
                prechatEnabled: undefined,
                prechatJson: undefined,
                scenario: undefined,
                smallCompanyLogoImg: undefined,
                waitingStateBackgroundImg: undefined,
            };
        }
        return newEmbeddedServiceLiveAgent;
    }

    static createEmbeddedServiceQuickAction(embeddedServiceLiveAgent, order, quickActionDefinition, quickActionType) {
        return {
            embeddedServiceLiveAgent: embeddedServiceLiveAgent,
            order: order,
            quickActionDefinition: quickActionDefinition,
            quickActionType: quickActionType
        }
    }

    static toXML(embeddedServiceLiveAgent, compress) {
        let xmlLines = [];
        if (embeddedServiceLiveAgent) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EmbeddedServiceConfig xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (embeddedServiceLiveAgent.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', embeddedServiceLiveAgent.fullName));
                if (embeddedServiceLiveAgent.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', embeddedServiceLiveAgent.masterLabel));
                if (embeddedServiceLiveAgent.embeddedServiceConfig !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('embeddedServiceConfig', embeddedServiceLiveAgent.embeddedServiceConfig));
                if (embeddedServiceLiveAgent.enabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enabled', embeddedServiceLiveAgent.enabled));
                if (embeddedServiceLiveAgent.avatarImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('avatarImg', embeddedServiceLiveAgent.avatarImg));
                if (embeddedServiceLiveAgent.customPrechatComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customPrechatComponent', embeddedServiceLiveAgent.customPrechatComponent));
                if (embeddedServiceLiveAgent.fontSize !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fontSize', embeddedServiceLiveAgent.fontSize));
                if (embeddedServiceLiveAgent.headerBackgroundImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('headerBackgroundImg', embeddedServiceLiveAgent.headerBackgroundImg));
                if (embeddedServiceLiveAgent.isOfflineCaseEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isOfflineCaseEnabled', embeddedServiceLiveAgent.isOfflineCaseEnabled));
                if (embeddedServiceLiveAgent.isQueuePositionEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isQueuePositionEnabled', embeddedServiceLiveAgent.isQueuePositionEnabled));
                if (embeddedServiceLiveAgent.liveAgentChatUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('liveAgentChatUrl', embeddedServiceLiveAgent.liveAgentChatUrl));
                if (embeddedServiceLiveAgent.liveAgentContentUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('liveAgentContentUrl', embeddedServiceLiveAgent.liveAgentContentUrl));
                if (embeddedServiceLiveAgent.liveChatButton !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('liveChatButton', embeddedServiceLiveAgent.liveChatButton));
                if (embeddedServiceLiveAgent.liveChatDeployment !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('liveChatDeployment', embeddedServiceLiveAgent.liveChatDeployment));
                if (embeddedServiceLiveAgent.offlineCaseBackgroundImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('offlineCaseBackgroundImg', embeddedServiceLiveAgent.offlineCaseBackgroundImg));
                if (embeddedServiceLiveAgent.prechatBackgroundImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('prechatBackgroundImg', embeddedServiceLiveAgent.prechatBackgroundImg));
                if (embeddedServiceLiveAgent.prechatEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('prechatEnabled', embeddedServiceLiveAgent.prechatEnabled));
                if (embeddedServiceLiveAgent.prechatJson !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('prechatJson', embeddedServiceLiveAgent.prechatJson));
                if (embeddedServiceLiveAgent.scenario !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('scenario', embeddedServiceLiveAgent.scenario));
                if (embeddedServiceLiveAgent.smallCompanyLogoImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('smallCompanyLogoImg', embeddedServiceLiveAgent.smallCompanyLogoImg));
                if (embeddedServiceLiveAgent.waitingStateBackgroundImg !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('waitingStateBackgroundImg', embeddedServiceLiveAgent.waitingStateBackgroundImg));
                if (embeddedServiceLiveAgent.embeddedServiceQuickActions !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('embeddedServiceQuickActions', embeddedServiceLiveAgent.embeddedServiceQuickActions, true, 1));
                xmlLines.push('</EmbeddedServiceConfig>');
            } else {
                return AuraParser.toXML(embeddedServiceLiveAgent);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EmbeddedServiceLiveAgentUtils;