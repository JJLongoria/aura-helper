const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EmailTemaplteUtils {

    static createEmailTemplate(emailTemplate) {
        let newEmailTemplate;
        if (emailTemplate) {
            newEmailTemplate = Utils.prepareXML(emailTemplate, EmailTemaplteUtils.createEmailTemplate());
        } else {
            newEmailTemplate = {
                apiVersion: undefined,
                attachedDocuments: [],
                attachments: [],
                available: undefined,
                content: undefined,
                description: undefined,
                encodingKey: undefined,
                fullName: undefined,
                letterhead: undefined,
                name: undefined,
                packageVersions: [],
                relatedEntityType: undefined,
                style: undefined,
                subject: undefined,
                textOnly: undefined,
                type: undefined,
                uiType: undefined
            };
        }
        return newEmailTemplate;
    }

    static createAttachment(content, name) {
        return {
            content: content,
            name: name
        }
    }

    static createPackageVersions(namespace, majorNumber, minorNumber) {
        return {
            namespace: namespace,
            majorNumber: majorNumber,
            minorNumber: minorNumber
        }
    }

    static toXML(emailTemplate, compress) {
        let xmlLines = [];
        if (emailTemplate) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EmailTemplate xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (emailTemplate.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', emailTemplate.fullName));
                if (emailTemplate.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', emailTemplate.name));
                if (emailTemplate.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', emailTemplate.description));
                if (emailTemplate.subject !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('subject', emailTemplate.subject));
                if (emailTemplate.content !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('content', emailTemplate.content));
                if (emailTemplate.apiVersion !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('apiVersion', emailTemplate.apiVersion));
                if (emailTemplate.available !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('available', emailTemplate.available));
                if (emailTemplate.encodingKey !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('encodingKey', emailTemplate.encodingKey));
                if (emailTemplate.letterhead !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('letterhead', emailTemplate.letterhead));
                if (emailTemplate.relatedEntityType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('relatedEntityType', emailTemplate.relatedEntityType));
                if (emailTemplate.style !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('style', emailTemplate.style));
                if (emailTemplate.textOnly !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('textOnly', emailTemplate.textOnly));
                if (emailTemplate.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', emailTemplate.type));
                if (emailTemplate.uiType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('uiType', emailTemplate.uiType));
                if (emailTemplate.attachedDocuments !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('attachedDocuments', emailTemplate.attachedDocuments, true, 1));
                if (emailTemplate.attachments !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('attachments', emailTemplate.attachments, true, 1));
                if (emailTemplate.packageVersions !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('packageVersions', emailTemplate.packageVersions, true, 1));
                xmlLines.push('</EmailTemplate>');
            } else {
                return AuraParser.toXML(emailTemplate);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EmailTemaplteUtils;