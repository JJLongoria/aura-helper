const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EventSubscriptionUtils {

    static createEventSubscription(eventSubscription) {
        let newEventSubscription;
        if (eventSubscription) {
            newEventSubscription = Utils.prepareXML(eventSubscription, EventSubscriptionUtils.createEventSubscription());
        } else {
            newEventSubscription = {
                eventParameters: [],
                active: undefined,
                fullName: undefined,
                name: undefined,
                referenceData: undefined,
                eventType: undefined
            };
        }
        return newEventSubscription;
    }

    static createEventParameterMap(parameterName, parameterValue) {
        return {
            parameterName: parameterName,
            parameterValue: parameterValue
        }
    }

    static toXML(eventSubscription, compress) {
        let xmlLines = [];
        if (eventSubscription) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EventSubscription xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (eventSubscription.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', eventSubscription.fullName));
                if (eventSubscription.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', eventSubscription.name));
                if (eventSubscription.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', eventSubscription.active));
                if (eventSubscription.eventType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('eventType', eventSubscription.eventType));
                if (eventSubscription.referenceData !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('referenceData', eventSubscription.referenceData));
                if (eventSubscription.eventParameters !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('eventParameters', eventSubscription.eventParameters, true, 1));
                xmlLines.push('</EventSubscription>');
            } else {
                return AuraParser.toXML(eventSubscription);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EventSubscriptionUtils;