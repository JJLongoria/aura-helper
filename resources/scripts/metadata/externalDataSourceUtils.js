const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ExternalDataSourceUtils {

    static createExternalDataSource(externalDataSource) {
        let newExternalDataSource;
        if (externalDataSource) {
            newExternalDataSource = Utils.prepareXML(externalDataSource, ExternalDataSourceUtils.createExternalDataSource());
        } else {
            newExternalDataSource = {
                authProvider: undefined,
                certificate: undefined,
                customConfiguration: undefined,
                customHttpHeader: [],
                customHttpHeaders: [],
                endpoint: undefined,
                fullName: undefined,
                isWritable: undefined,
                label: undefined,
                oauthRefreshToken: undefined,
                oauthScope: undefined,
                oauthToken: undefined,
                password: undefined,
                principalType: undefined,
                protocol: undefined,
                repository: undefined,
                type: undefined,
                username: undefined,
                version: undefined,
            };
        }
        return newExternalDataSource;
    }

    static createCustomHttpHeader(description, headerFieldName, headerFieldValue, isActive) {
        return {
            description: description,
            headerFieldName: headerFieldName,
            headerFieldValue: headerFieldValue,
            isActive: isActive
        }
    }

    static toXML(externalDataSource, compress) {
        let xmlLines = [];
        if (externalDataSource) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ExternalDataSource xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (externalDataSource.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', externalDataSource.fullName));
                if (externalDataSource.authProvider !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('authProvider', externalDataSource.authProvider));
                if (externalDataSource.certificate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('certificate', externalDataSource.certificate));
                if (externalDataSource.customConfiguration !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customConfiguration', externalDataSource.customConfiguration));
                if (externalDataSource.endpoint !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('endpoint', externalDataSource.endpoint));
                if (externalDataSource.isWritable !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isWritable', externalDataSource.isWritable));
                if (externalDataSource.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', externalDataSource.label));
                if (externalDataSource.oauthRefreshToken !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('oauthRefreshToken', externalDataSource.oauthRefreshToken));
                if (externalDataSource.oauthScope !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('oauthScope', externalDataSource.oauthScope));
                if (externalDataSource.oauthToken !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('oauthToken', externalDataSource.oauthToken));
                if (externalDataSource.password !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('password', externalDataSource.password));
                if (externalDataSource.principalType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('principalType', externalDataSource.principalType));
                if (externalDataSource.protocol !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('protocol', externalDataSource.protocol));
                if (externalDataSource.repository !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('repository', externalDataSource.repository));
                if (externalDataSource.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', externalDataSource.type));
                if (externalDataSource.username !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('username', externalDataSource.username));
                if (externalDataSource.version !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('version', externalDataSource.version));
                if (externalDataSource.customHttpHeader !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customHttpHeader', externalDataSource.customHttpHeader, true, 1));
                if (externalDataSource.customHttpHeaders !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customHttpHeaders', externalDataSource.customHttpHeaders, true, 1));
                xmlLines.push('</ExternalDataSource>');
            } else {
                return AuraParser.toXML(externalDataSource);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = ExternalDataSourceUtils;