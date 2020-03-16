const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class QuickActionUtils {

    static createQuickAction(quickAction) {
        let newQuickAction;
        if (quickAction) {
            newQuickAction = Utils.prepareXML(quickAction, QuickActionUtils.createQuickAction());
        } else {
            newQuickAction = {
                canvas: undefined,
                description: undefined,
                fieldOverrides: [],
                flowDefinition: undefined,
                height: undefined,
                icon: undefined,
                isProtected: undefined,
                label: undefined,
                lightningComponent: undefined,
                optionsCreateFeedItem: undefined,
                page: undefined,
                quickActionLayout: undefined,
                standardLabel: undefined,
                successMessage: undefined,
                targetObject: undefined,
                targetParentField: undefined,
                targetRecordType: undefined,
                type: undefined,
                width: undefined
            };
        }
        return newQuickAction;
    }

    static createFieldOverride(field, formula, literalValue) {
        return {
            field: field,
            formula: formula,
            literalValue: literalValue
        }
    }

    static createQuickActionLayout(layoutSectionStyle, quickActionLayoutColumns) {
        return {
            layoutSectionStyle: layoutSectionStyle,
            quickActionLayoutColumns: Utils.forceArray(quickActionLayoutColumns)
        }
    }

    static createQuickActionLayoutColumn(quickActionLayoutItems) {
        return {
            quickActionLayoutItems: Utils.forceArray(quickActionLayoutItems)
        }
    }

    static createQuickActionLayoutItem(emptySpace, field, uiBehavior) {
        return {
            emptySpace: emptySpace,
            field: field,
            uiBehavior: uiBehavior
        }
    }

    static toXML(quickAction, compress) {
        let xmlLines = [];
        if (quickAction) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (quickAction.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', quickAction.label));
                if (quickAction.standardLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('standardLabel', quickAction.standardLabel));
                if (quickAction.type !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', quickAction.type));
                if (quickAction.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', quickAction.description));
                if (quickAction.height !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('height', quickAction.height));
                if (quickAction.width)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('width', quickAction.width));
                if (quickAction.icon !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('icon', quickAction.icon));
                if (quickAction.targetObject !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('targetObject', quickAction.targetObject));
                if (quickAction.targetParentField !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('targetParentField', quickAction.targetParentField));
                if (quickAction.targetRecordType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('targetRecordType', quickAction.targetRecordType));
                if (quickAction.canvas !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('canvas', quickAction.canvas));
                if (quickAction.flowDefinition !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('flowDefinition', quickAction.flowDefinition));
                if (quickAction.lightningComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('lightningComponent', quickAction.lightningComponent));
                if (quickAction.page !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('page', quickAction.page));
                if (quickAction.successMessage !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('successMessage', quickAction.successMessage));
                if (quickAction.isProtected !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isProtected', quickAction.isProtected));
                if (quickAction.optionsCreateFeedItem !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('optionsCreateFeedItem', quickAction.optionsCreateFeedItem));
                if (quickAction.fieldOverrides !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldOverrides', quickAction.fieldOverrides, true, 1));
                if (quickAction.quickActionLayout !== undefined)
                    xmlLines = xmlLines.concat(QuickActionUtils.getQuickActionLayoutXMLLines(quickAction.quickActionLayout, 1));
                xmlLines.push('</QuickAction>');
            } else {
                return AuraParser.toXML(quickAction);
            }
        }
        return xmlLines.join('\n');
    }

    static getQuickActionLayoutXMLLines(quickActionLayout, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<quickActionLayout>');
        if (quickActionLayout.layoutSectionStyle !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('layoutSectionStyle', quickActionLayout.layoutSectionStyle));
        if (quickActionLayout.quickActionLayoutColumns !== undefined)
            xmlLines = xmlLines.concat(QuickActionUtils.getQuickActionLayoutColumnXMLLines(quickActionLayout.quickActionLayoutColumns, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</quickActionLayout>');
        return xmlLines;
    }

    static getQuickActionLayoutColumnXMLLines(quickActionLayoutColumns, initIndent) {
        let xmlLines = [];
        let columns = Utils.forceArray(quickActionLayoutColumns);
        for (const column of columns) {
            xmlLines.push(Utils.getTabs(initIndent) + '<quickActionLayoutColumns>');
            if (column.quickActionLayoutItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('quickActionLayoutItems', column.quickActionLayoutItems, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</quickActionLayoutColumns>');
        }
        return xmlLines;
    }
}
module.exports = QuickActionUtils;