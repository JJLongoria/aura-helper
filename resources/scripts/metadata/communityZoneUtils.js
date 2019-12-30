const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CommunityZoneUtils {

    static createCommunityZone(communityZone) {
        let newCommunityZone;
        if (communityZone) {
            newCommunityZone = Utils.prepareXML(communityZone, CommunityZoneUtils.createCommunityZone());
        } else {
            newCommunityZone = {
                active: undefined,
                chatterAnswersFacebookSsoUrl: undefined,
                communityFeedPage: undefined,
                description: undefined,
                emailFooterDocument: undefined,
                emailHeaderDocument: undefined,
                emailNotificationUrl: undefined,
                enableChatterAnswers: undefined,
                enablePrivateQuestions: undefined,
                expertsGroup: undefined,
                fullName: undefined,
                portal: undefined,
                portalEmailNotificationUrl: undefined,
                reputationLevels: undefined,
                showInPortal: undefined,
                site: undefined
            };
        }
        return newCommunityZone;
    }

    static createReputationLevels(chatterAnswersReputationLevels, ideaReputationLevels) {
        return {
            chatterAnswersReputationLevels: Utils.forceArray(chatterAnswersReputationLevels),
            ideaReputationLevels: Utils.forceArray(ideaReputationLevels)
        }
    }

    static createChatterAnswerRepurationLevel(name, value) {
        return {
            name: name,
            value: value
        }
    }

    static createIdeaReputationLevel(name, value) {
        return {
            name: name,
            value: value
        }
    }

    static toXML(communityZone, compress) {
        let xmlLines = [];
        if (communityZone) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Community xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (communityZone.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', communityZone.fullName));
                if (communityZone.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', communityZone.description));
                if (communityZone.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', communityZone.active));
                if (communityZone.portal !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('portal', communityZone.portal));
                if (communityZone.portalEmailNotificationUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('portalEmailNotificationUrl', communityZone.portalEmailNotificationUrl));
                if (communityZone.showInPortal !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showInPortal', communityZone.showInPortal));
                if (communityZone.site !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('site', communityZone.site));
                if (communityZone.communityFeedPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('communityFeedPage', communityZone.communityFeedPage));
                if (communityZone.emailFooterDocument !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('emailFooterDocument', communityZone.emailFooterDocument));
                if (communityZone.emailHeaderDocument !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('emailHeaderDocument', communityZone.emailHeaderDocument));
                if (communityZone.emailNotificationUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('emailNotificationUrl', communityZone.emailNotificationUrl));
                if (communityZone.enableChatterAnswers !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableChatterAnswers', communityZone.enableChatterAnswers));
                if (communityZone.chatterAnswersFacebookSsoUrl !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chatterAnswersFacebookSsoUrl', communityZone.chatterAnswersFacebookSsoUrl));
                if (communityZone.enablePrivateQuestions !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enablePrivateQuestions', communityZone.enablePrivateQuestions));
                if (communityZone.expertsGroup !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('expertsGroup', communityZone.expertsGroup));
                if (communityZone.reputationLevels !== undefined)
                    xmlLines = xmlLines.concat(CommunityZoneUtils.getReputationLevelsXMLLines(communityZone.reputationLevels, 1));
                xmlLines.push('</Community>');
            } else {
                return AuraParser.toXML(communityZone);
            }
        }
        return xmlLines.join('\n');
    }

    static getReputationLevelsXMLLines(reputationLevels, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<reputationLevels>');
        if (reputationLevels.chatterAnswersReputationLevels !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('chatterAnswersReputationLevels', reputationLevels.chatterAnswersReputationLevels, true, initIndent + 1));
        if (reputationLevels.ideaReputationLevels !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('ideaReputationLevels', reputationLevels.ideaReputationLevels, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</reputationLevels>');
        return xmlLines;
    }

}
module.exports = CommunityZoneUtils;