const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class FlexiPageUtils {

    static createFlexiPage(flexiPage) {
        let newFlexiPage;
        if (flexiPage) {
            newFlexiPage = Utils.prepareXML(flexiPage, FlexiPageUtils.createFlexiPage());
        } else {
            newFlexiPage = {
                description: undefined,
                flexiPageRegions: [],
                fullName: undefined,
                masterLabel: undefined,
                pageTemplate: undefined,
                parentFlexiPage: undefined,
                platformActionList: undefined,
                quickActionList: undefined,
                sobjectType: undefined,
                template: undefined,
                type: undefined,

            };
        }
        return newFlexiPage;
    }

    static createFlexiPageRegion(appendable, componentInstances, mode, name, prependable, replaceable, type) {
        return {
            appendable: appendable,
            componentInstances: Utils.forceArray(componentInstances),
            mode: mode,
            name: name,
            prependable: prependable,
            replaceable: replaceable,
            type: type
        }
    }

    static createComponentInstance(componentInstanceProperties, componentName, visibilityRule) {
        return {
            componentInstanceProperties: Utils.forceArray(componentInstanceProperties),
            componentName: componentName,
            visibilityRule: visibilityRule
        }
    }

    static createComponentInstanceProperty(name, type, value) {
        return {
            name: name,
            type: type,
            value: value
        }
    }

    static createUiFormulaRule(booleanFilter, criteria) {
        return {
            booleanFilter: booleanFilter,
            criteria: Utils.forceArray(criteria),
        }
    }

    static createFlexiPageTemplateInstance(name, properties) {
        return {
            name: name,
            properties: Utils.forceArray(properties),
        }
    }

    static createPlatformActionList(actionListContext, platformActionListItems, relatedSourceEntity) {
        return {
            actionListContext: actionListContext,
            platformActionListItems: Utils.forceArray(platformActionListItems),
            relatedSourceEntity: relatedSourceEntity,
        }
    }

    static createPlatformActionListItem(actionName, actionType, sortOrder, subtype) {
        return {
            actionName: actionName,
            actionType: actionType,
            sortOrder: sortOrder,
            subtype: subtype
        }
    }

    static createQuickActionList(quickActionListItems) {
        return {
            quickActionListItems: Utils.forceArray(quickActionListItems)
        }
    }

    static createQuickActionListItem(quickActionName) {
        return {
            quickActionName: quickActionName
        }
    }

    static createUiFormulaCriterion(leftValue, operator, rightValue) {
        return {
            leftValue: leftValue,
            operator: operator,
            rightValue: rightValue,
        }
    }

    static toXML(flexiPage, compress) {
        let xmlLines = [];
        if (flexiPage) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (flexiPage.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', flexiPage.fullName));
                if (flexiPage.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', flexiPage.masterLabel));
                if (flexiPage.sobjectType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sobjectType', flexiPage.sobjectType));
                if (flexiPage.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', flexiPage.description));
                if (flexiPage.pageTemplate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('pageTemplate', flexiPage.pageTemplate));
                if (flexiPage.parentFlexiPage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('parentFlexiPage', flexiPage.parentFlexiPage));
                if (flexiPage.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', flexiPage.type));
                if (flexiPage.flexiPageRegions)
                    xmlLines = xmlLines.concat(FlexiPageUtils.getFlexiPageRegionsXMLLines(flexiPage.flexiPageRegions, 1));
                if (flexiPage.platformActionList)
                    xmlLines = xmlLines.concat(FlexiPageUtils.getPlatformActionListXMLLines(flexiPage.platformActionList, 1));
                if (flexiPage.quickActionList !== undefined)
                    xmlLines = xmlLines.concat(FlexiPageUtils.getQuickActionListXMLLines(flexiPage.quickActionList, 1));
                if (flexiPage.template !== undefined)
                    xmlLines = xmlLines.concat(FlexiPageUtils.getFlexiPageTemplateInstanceXMLLines(flexiPage.template, 1));
                xmlLines.push('</FlexiPage>');
            } else {
                return AuraParser.toXML(flexiPage);
            }
        }
        return xmlLines.join('\n');
    }

    static getFlexiPageRegionsXMLLines(flexiPageRegions, initIndent) {
        let xmlLines = [];
        for (const region of flexiPageRegions) {
            xmlLines.push(Utils.getTabs(initIndent) + '<flexiPageRegions>');
            if (region.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', region.name));
            if (region.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', region.type));
            if (region.appendable !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('appendable', region.appendable));
            if (region.mode !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('mode', region.mode));
            if (region.prependable !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('prependable', region.prependable));
            if (region.replaceable !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('replaceable', region.replaceable));
            if (region.componentInstances)
                xmlLines = xmlLines.concat(FlexiPageUtils.getComponentInstancesXMLLines(region.componentInstances, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</flexiPageRegions>');
        }
        return xmlLines;
    }

    static getComponentInstancesXMLLines(componentInstances, initIndent) {
        let xmlLines = [];
        let components = Utils.forceArray(componentInstances);
        for (const component of components) {
            xmlLines.push(Utils.getTabs(initIndent) + '<componentInstances>');
            if (component.componentName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('componentName', component.componentName));
            if (component.componentInstanceProperties !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('componentInstanceProperties', component.componentInstanceProperties, true, initIndent + 1));
            if (component.visibilityRule)
                xmlLines = xmlLines.concat(FlexiPageUtils.getUiFormulaRuleXMLLines(component.visibilityRule, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</componentInstances>');
        }
        return xmlLines;
    }

    static getUiFormulaRuleXMLLines(visibilityRule, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<visibilityRule>');
        if (visibilityRule.booleanFilter !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', visibilityRule.booleanFilter));
        if (visibilityRule.criteria !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('criteria', visibilityRule.criteria, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</visibilityRule>');
        return xmlLines;
    }

    static getPlatformActionListXMLLines(platformActionList, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<platformActionList>');
        if (platformActionList.actionListContext !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('actionListContext', platformActionList.actionListContext));
        if (platformActionList.relatedSourceEntity !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relatedSourceEntity', platformActionList.relatedSourceEntity));
        if (platformActionList.platformActionListItems !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('platformActionListItems', platformActionList.platformActionListItems, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</platformActionList>');
        return xmlLines;
    }

    static getQuickActionListXMLLines(quickActionList, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<quickActionList>');
        if (quickActionList.quickActionListItems !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('quickActionListItems', quickActionList.quickActionListItems, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</quickActionList>');
        return xmlLines;
    }

    static getFlexiPageTemplateInstanceXMLLines(template, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<template>');
        if (template.name !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', template.name));
        if (template.properties !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('properties', template.properties, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</template>');
        return xmlLines;
    }

}
module.exports = FlexiPageUtils;