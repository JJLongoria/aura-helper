const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ModerationRuleUtils {

    static createModerationRule(moderationRule) {
        let newModerationRule;
        if (moderationRule) {
            newModerationRule = Utils.prepareXML(moderationRule, ModerationRuleUtils.createModerationRule());
        } else {
            newModerationRule = {
                action: undefined,
                actionLimit: undefined,
                active: undefined,
                description: undefined,
                entitiesAndFields: [],
                fullName: undefined,
                masterLabel: undefined,
                notifyLimit: undefined,
                userCriteria: undefined,
                userMessage: undefined
            };
        }
        return newModerationRule;
    }

    static createModeratedEntityField(entityName, fieldName, keywordList) {
        return {
            entityName: entityName,
            fieldName: fieldName,
            keywordList: keywordList
        }
    }

    static createModerationRuleType(type) {
        return {
            type: type
        }
    }

    static createRateLimitTimePeriod(timePeriod) {
        return {
            timePeriod: timePeriod
        }
    }

    static toXML(moderationRule, compress) {
        let xmlLines = [];
        if (moderationRule) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ModerationRule xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (moderationRule.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', moderationRule.fullName));
                if (moderationRule.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', moderationRule.masterLabel));
                if (moderationRule.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', moderationRule.description));
                if (moderationRule.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', moderationRule.active));
                if (moderationRule.action !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('action', moderationRule.action));
                if (moderationRule.actionLimit !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('actionLimit', moderationRule.actionLimit));
                if (moderationRule.notifyLimit !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('notifyLimit', moderationRule.notifyLimit));
                if (moderationRule.userCriteria !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('userCriteria', moderationRule.userCriteria));
                if (moderationRule.userMessage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('userMessage', moderationRule.userMessage));
                if (moderationRule.entitiesAndFields)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('entitiesAndFields', moderationRule.entitiesAndFields, true, 1));
                xmlLines.push('</ModerationRule>');
            } else {
                return AuraParser.toXML(moderationRule);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = ModerationRuleUtils;