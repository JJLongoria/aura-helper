const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class AnalyticSnapshotUtils {

    static createAnalyticSnapshot(analyticSnapshot) {
        let newAnalyticSnapshot;
        if (analyticSnapshot) {
            newAnalyticSnapshot = Utils.prepareXML(analyticSnapshot, AnalyticSnapshotUtils.createAnalyticSnapshot());
        } else {
            newAnalyticSnapshot = {
                description: undefined,
                fullName: undefined,
                groupColumn: undefined,
                mappings: [],
                name: undefined,
                runningUser: undefined,
                sourceReport: undefined,
                targetObject: undefined,
            }
        }
        return newAnalyticSnapshot;
    }

    static createAnalyticSnapshotMapping(aggregateType, sourceField, sourceType, targetField) {
        return {
            aggregateType: aggregateType,
            sourceField: sourceField,
            sourceType: sourceType,
            targetField: targetField
        }
    }

    static createReportJobSourceTypes(snapshot, summary, tabular) {
        return {
            snapshot: snapshot,
            summary: summary,
            tabular: tabular
        }
    }

    static toXML(analyticSnapshot, compress) {
        let xmlLines = [];
        if (analyticSnapshot) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<AnalyticSnapshot xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (analyticSnapshot.name)
                    xmlLines.push('\t' + Utils.getXMLTag('name', analyticSnapshot.name));
                if (analyticSnapshot.fullName)
                    xmlLines.push('\t' + Utils.getXMLTag('fullName', analyticSnapshot.fullName));
                if (analyticSnapshot.description)
                    xmlLines.push('\t' + Utils.getXMLTag('description', analyticSnapshot.description));
                if (analyticSnapshot.groupColumn)
                    xmlLines.push('\t' + Utils.getXMLTag('groupColumn', analyticSnapshot.groupColumn));
                if (analyticSnapshot.runningUser)
                    xmlLines.push('\t' + Utils.getXMLTag('runningUser', analyticSnapshot.runningUser));
                if (analyticSnapshot.sourceReport)
                    xmlLines.push('\t' + Utils.getXMLTag('sourceReport', analyticSnapshot.sourceReport));
                if (analyticSnapshot.targetObject)
                    xmlLines.push('\t' + Utils.getXMLTag('targetObject', analyticSnapshot.targetObject));
                if (analyticSnapshot.mappings && analyticSnapshot.mappings.length > 0) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('mappings', analyticSnapshot.mappings, true, 1));
                }
                xmlLines.push('</AnalyticSnapshot>');
            } else {
                return AuraParser.toXML(analyticSnapshot);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = AnalyticSnapshotUtils;