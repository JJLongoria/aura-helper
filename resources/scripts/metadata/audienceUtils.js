const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class AudienceUtils {

    static createAudience(audience) {
        let newAudience;
        if (audience) {
            newAudience = Utils.prepareXML(audience, AudienceUtils.createAudience());
        } else {
            newAudience = {
                audienceName: undefined,
                container: undefined,
                criteria: undefined,
                criterion: [],
                description: undefined,
                formula: undefined,
                formulaFilterType: undefined,
                fullName: undefined,
                targets: undefined
            };
        }
        return newAudience;
    }

    static createAudienceCriteria(criterion) {
        let criterionRes = Utils.forceArray(criterion);
        return {
            criterion: criterionRes
        }
    }

    static createAudienceCriterion(criteriaNumber, criterionValue, operator, type) {
        return {
            criteriaNumber: criteriaNumber,
            criterionValue: criterionValue,
            operator: operator,
            type: type
        }
    }

    static createAudienceCriteriaValue(city, country, domain, entityField, entityType, fieldValue, isEnabled, permissionName, permissionType, profile, subdivision) {
        return {
            city: city,
            country: country,
            domain: domain,
            entityField: entityField,
            entityType: entityType,
            fieldValue: fieldValue,
            isEnabled: isEnabled,
            permissionName: permissionName,
            permissionType: permissionType,
            profile: profile,
            subdivision: subdivision
        }
    }

    static createPersonalizationTargetsInfos(target) {
        let targetInfos = Utils.forceArray(target);
        return {
            target: targetInfos
        }
    }

    static createPersonalizationTargetInfo(groupName, priority, targetType, targetValue) {
        return {
            groupName: groupName,
            priority: priority,
            targetType: targetType,
            targetValue: targetValue
        }
    }

    static toXML(audience, compress) {
        let xmlLines = [];
        if (audience) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Audience xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (audience.fullName !== undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('fullName', audience.fullName));
                if (audience.audienceName !== undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('audienceName', audience.audienceName));
                if (audience.description !== undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('description', audience.description));
                if (audience.container !== undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('container', audience.container));
                if (audience.formula !== undefined)
                    xmlLines.push('\t' + Utils.getXMLTag('formula', audience.formula));
                if (audience.criteria && audience.criteria.criterion) {
                    xmlLines = xmlLines.concat(AudienceUtils.getCriteriaXMLLines(audience.criterion, 1));
                }
                if (audience.criterion && audience.criterion.length > 0) {
                    xmlLines = xmlLines.concat(AudienceUtils.getCriterionXMLLines(audience.criterion, 1));
                }
                if (audience.targets && audience.targets.target) {
                    xmlLines = xmlLines.concat(AudienceUtils.getTargetsXMLLines(audience.targets.target, 1));
                }
                xmlLines.push('</Audience>');
            } else {
                return AuraParser.toXML(audience);
            }
        }
        return xmlLines.join('\n');
    }

    static getCriteriaXMLLines(criteria, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<criteria>');
        xmlLines = xmlLines.concat(AudienceUtils.getCriterionXMLLines(criteria.criterion, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</criteria>');
        return xmlLines;
    }

    static getCriterionXMLLines(criterion, initIndent) {
        let xmlLines = [];
        let criteria = Utils.forceArray(criterion);
        for (const criterion of criteria) {
            xmlLines.push(Utils.getTabs(initIndent) + '<criterion>');
            if (criterion.criteriaNumber !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('criteriaNumber', criterion.criteriaNumber));
            if (criterion.operator !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('operator', criterion.operator));
            if (criterion.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', criterion.type));
            if (criterion.criterionValue !== undefined) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criterionValue', criterion.criterionValue, true, initIndent + 1));
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</criterion>');
        }
        return xmlLines;
    }

    static getTargetsXMLLines(target, initIndent) {
        let xmlLines = [];
        let targets = Utils.forceArray(target);
        xmlLines.push(Utils.getTabs(initIndent) + '<targets>');
        xmlLines = xmlLines.concat(Utils.getXMLBlock('target', targets, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</targets>');
        return xmlLines;
    }

}
module.exports = AudienceUtils;