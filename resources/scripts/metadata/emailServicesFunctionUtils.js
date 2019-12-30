const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EmailServicesFunctionUtils {

    static createEmailServicesFunction(emailServiceFunction) {
        let newEmailServiceFunction;
        if (emailServiceFunction) {
            newEmailServiceFunction = Utils.prepareXML(emailServiceFunction, EmailServiceFunctionUtils.createEmailServiceFunction());
        } else {
            newEmailServiceFunction = {
                apexClass: undefined,
                attachmentOption: undefined,
                authenticationFailureAction: undefined,
                authorizationFailureAction: undefined,
                authorizedSenders: undefined,
                emailServicesAddresses: [],
                errorRoutingAddress: undefined,
                fullName: undefined,
                functionInactiveAction: undefined,
                functionName: undefined,
                isActive: undefined,
                isAuthenticationRequired: undefined,
                isErrorRoutingEnabled: undefined,
                isTextAttachmentsAsBinary: undefined,
                isTlsRequired: undefined,
                overLimitAction: undefined
            };
        }
        return newEmailServiceFunction;
    }

    static createEmailServicesAddress(authorizedSenders, developerName, isActive, localPart, runAsUser) {
        return {
            authorizedSenders: authorizedSenders,
            developerName: developerName,
            isActive: isActive,
            localPart: localPart,
            runAsUser: runAsUser
        }
    }

    static toXML(emailServiceFunction, compress) {
        let xmlLines = [];
        if (emailServiceFunction) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EmailServicesFunction xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (emailServiceFunction.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', emailServiceFunction.fullName));
                if (emailServiceFunction.isActive !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isActive', emailServiceFunction.isActive));
                if (emailServiceFunction.functionName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('functionName', emailServiceFunction.functionName));
                if (emailServiceFunction.apexClass !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('apexClass', emailServiceFunction.apexClass));
                if (emailServiceFunction.attachmentOption !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('attachmentOption', emailServiceFunction.attachmentOption));
                if (emailServiceFunction.authenticationFailureAction !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authenticationFailureAction', emailServiceFunction.authenticationFailureAction));
                if (emailServiceFunction.authorizationFailureAction !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authorizationFailureAction', emailServiceFunction.authorizationFailureAction));
                if (emailServiceFunction.authorizedSenders !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authorizedSenders', emailServiceFunction.authorizedSenders));
                if (emailServiceFunction.errorRoutingAddress !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('errorRoutingAddress', emailServiceFunction.errorRoutingAddress));
                if (emailServiceFunction.functionInactiveAction !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('functionInactiveAction', emailServiceFunction.functionInactiveAction));
                if (emailServiceFunction.isAuthenticationRequired !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isAuthenticationRequired', emailServiceFunction.isAuthenticationRequired));
                if (emailServiceFunction.isErrorRoutingEnabled !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isErrorRoutingEnabled', emailServiceFunction.isErrorRoutingEnabled));
                if (emailServiceFunction.isTextAttachmentsAsBinary !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isTextAttachmentsAsBinary', emailServiceFunction.isTextAttachmentsAsBinary));
                if (emailServiceFunction.isTlsRequired !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isTlsRequired', emailServiceFunction.isTlsRequired));
                if (emailServiceFunction.overLimitAction !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('overLimitAction', emailServiceFunction.overLimitAction));
                if (emailServiceFunction.emailServicesAddresses !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('emailServicesAddresses', emailServiceFunction.emailServicesAddresses, true, 1));
                xmlLines.push('</EmailServicesFunction>');
            } else {
                return AuraParser.toXML(emailServiceFunction);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EmailServicesFunctionUtils;