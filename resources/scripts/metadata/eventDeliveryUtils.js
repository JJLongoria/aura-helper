const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class EventDeliveryUtils {

    static createEventDelivery(eventDelivery) {
        let newEventDelivery;
        if (eventDelivery) {
            newEventDelivery = Utils.prepareXML(eventDelivery, EventDeliveryUtils.createEventDelivery());
        } else {
            newEventDelivery = {
                eventParameters: [],
                eventSubscription: undefined,
                fullName: undefined,
                referenceData: undefined,
                type: undefined
            };
        }
        return newEventDelivery;
    }

    static createEventParameterMap(parameterName, parameterValue) {
        return {
            parameterName: parameterName,
            parameterValue: parameterValue
        }
    }

    static toXML(eventDelivery, compress) {
        let xmlLines = [];
        if (eventDelivery) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<EventDelivery xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (eventDelivery.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', eventDelivery.fullName));
                if (eventDelivery.eventSubscription !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('eventSubscription', eventDelivery.eventSubscription));
                if (eventDelivery.referenceData !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('referenceData', eventDelivery.referenceData));
                if (eventDelivery.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', eventDelivery.type));
                if (eventDelivery.eventParameters !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('eventParameters', eventDelivery.eventParameters, true, 1));
                xmlLines.push('</EventDelivery>');
            } else {
                return AuraParser.toXML(eventDelivery);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = EventDeliveryUtils;