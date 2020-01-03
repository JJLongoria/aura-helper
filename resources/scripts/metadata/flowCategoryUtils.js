const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class FlowCategoryUtils {

    static createFlowCategory(flowCategory) {
        let newFlowCategory;
        if (flowCategory) {
            newFlowCategory = Utils.prepareXML(flowCategory, FlowCategoryUtils.createFlowCategory());
        } else {
            newFlowCategory = {
                description: undefined,
                flowCategoryItems: [],
                fullName: undefined,
                masterLabel: undefined
            };
        }
        return newFlowCategory;
    }

    static createFlowCategoryItem(flow) {
        return {
            flow: flow
        }
    }

    static toXML(flowCategory, compress) {
        let xmlLines = [];
        if (flowCategory) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<FlowCategory xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
                if (flowCategory.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', flowCategory.fullName));
                if (flowCategory.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', flowCategory.masterLabel));
                if (flowCategory.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', flowCategory.description));
                if (flowCategory.flowCategoryItems !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('flowCategoryItems', flowCategory.flowCategoryItems, true, 1));
                xmlLines.push('</FlowCategory>');
            } else {
                return AuraParser.toXML(flowCategory);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = FlowCategoryUtils;