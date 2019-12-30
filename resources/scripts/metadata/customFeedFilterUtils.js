const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class CustomFeedFilterUtils {

    static createCustomFeedFilter(customFeedFilter) {
        let newCustomFeedFilter;
        if (customFeedFilter) {
            newCustomFeedFilter = Utils.prepareXML(customFeedFilter, CustomFeedFilterUtils.createCustomFeedFilter());
        } else {
            newCustomFeedFilter = {
                criteria: [],
                description: undefined,
                fullName: undefined,
                label: undefined,
                isProtected: undefined
            };
        }
        return newCustomFeedFilter;
    }

    static createFeedFilterCriterion(feedItemType, feedItemVisibility, relatedSObjectType) {
        return {
            feedItemType: feedItemType,
            feedItemVisibility: feedItemVisibility,
            relatedSObjectType: relatedSObjectType
        }
    }

    static toXML(customFeedFilter, compress) {
        let xmlLines = [];
        if (customFeedFilter) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<CustomFeedFilter xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (customFeedFilter.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', customFeedFilter.fullName));
                if (customFeedFilter.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', customFeedFilter.label));
                if (customFeedFilter.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', customFeedFilter.description));
                if (customFeedFilter.isProtected !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isProtected', customFeedFilter.isProtected));
                if (customFeedFilter.criteria !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('criteria', customFeedFilter.criteria, true, 1));
                xmlLines.push('</CustomFeedFilter>');
            } else {
                return AuraParser.toXML(customFeedFilter);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = CustomFeedFilterUtils;