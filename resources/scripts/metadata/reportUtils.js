const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ReportUtils {

    static createReport(report) {
        let newReport;
        if (report) {
            newReport = Utils.prepareXML(report, ReportUtils.createReport());
        } else {
            newReport = {
                aggregates: [],
                block: [],
                blockInfo: undefined,
                buckets: [],
                chart: undefined,
                colorRanges: [],
                columns: [],
                crossFilters: [],
                currency: undefined,
                dataCategoryFilters: undefined,
                description: undefined,
                division: undefined,
                filter: undefined,
                folderName: undefined,
                format: undefined,
                formattingRules: [],
                fullName: undefined,
                groupingsAcross: [],
                groupingsDown: [],
                historicalSelector: undefined,
                name: undefined,
                numSubscriptions: undefined,
                params: [],
                reportCustomDetailFormula: undefined,
                reportType: undefined,
                roleHierarchyFilter: undefined,
                rowLimit: undefined,
                scope: undefined,
                showCurrentDate: undefined,
                showDetails: undefined,
                showGrandTotal: undefined,
                showSubTotals: undefined,
                sortColumn: undefined,
                sortOrder: undefined,
                territoryHierarchyFilter: undefined,
                timeFrameFilter: undefined,
                userFilter: undefined
            };
        }
        return newReport;
    }

    static createReportAggregate(acrossGroupingContext, calculatedFormula, datatype, description, developerName, downGroupingContext, isActive, isCrossBlock, masterLabel, reportType, scale) {
        return {
            acrossGroupingContext: acrossGroupingContext,
            calculatedFormula: calculatedFormula,
            datatype: datatype,
            description: description,
            developerName: developerName,
            downGroupingContext: downGroupingContext,
            isActive: isActive,
            isCrossBlock: isCrossBlock,
            masterLabel: masterLabel,
            reportType: reportType,
            scale: scale,
        }
    }

    static createReportBlockInfo(aggregateReferences, blockId, joinTable) {
        return {
            aggregateReferences: Utils.forceArray(aggregateReferences),
            blockId: blockId,
            joinTable: joinTable
        }
    }

    static createReportAggregateReference(aggregate) {
        return {
            aggregate: aggregate
        }
    }

    static createReportBucketField(bucketType, developerName, masterLabel, nullTreatment, otherBucketLabel, sourceColumnName, values) {
        return {
            bucketType: bucketType,
            developerName: developerName,
            masterLabel: masterLabel,
            nullTreatment: nullTreatment,
            otherBucketLabel: otherBucketLabel,
            sourceColumnName: sourceColumnName,
            values: Utils.forceArray(values)
        }
    }

    static createReportBucketFieldValue(sourceValues, value) {
        return {
            sourceValues: sourceValues,
            value: value
        }
    }

    static createReportGrouping(aggregateType, dateGranularity, field, sortByName, sortOrder, sortType) {
        return {
            aggregateType: aggregateType,
            dateGranularity: dateGranularity,
            field: field,
            sortByName: sortByName,
            sortOrder: sortOrder,
            sortType: sortType,
        }
    }

    static createReportHistoricalSelector(snapshot) {
        return {
            snapshot: snapshot
        }
    }

    static createCustomDetailFormulas(calculatedFormula, datatype, description, developerName, label, scale) {
        return {
            calculatedFormula: calculatedFormula,
            datatype: datatype,
            description: description,
            developerName: developerName,
            label: label,
            scale: scale,
        }
    }

    static createReportColorRange(aggregate, columnName, highBreakpoint, highColor, lowBreakpoint, lowColor, midColor) {
        return {
            aggregate: aggregate,
            columnName: columnName,
            highBreakpoint: highBreakpoint,
            highColor: highColor,
            lowBreakpoint: lowBreakpoint,
            lowColor: lowColor,
            midColor: midColor
        }
    }

    static createReportColumn(aggregateTypes, field, reverseColors, showChanges) {
        return {
            aggregateTypes: Utils.forceArray(aggregateTypes),
            field: field,
            reverseColors: reverseColors,
            showChanges: showChanges
        }
    }

    static createReportFilter(booleanFilter, criteriaItems, language) {
        return {
            booleanFilter: booleanFilter,
            criteriaItems: Utils.forceArray(criteriaItems),
            language: language
        }
    }

    static createReportFilterItem(column, columnToColumn, isUnlocked, operator, snapshot, value) {
        return {
            column: column,
            columnToColumn: columnToColumn,
            isUnlocked: isUnlocked,
            operator: operator,
            snapshot: snapshot,
            value: value,
        }
    }

    static createReportFormattingRule(aggregate, columnName, values) {
        return {
            aggregate: aggregate,
            columnName: columnName,
            values: values,
        }
    }

    static createReportFormattingRuleValue(backgroundColor, rangeUpperBound) {
        return {
            backgroundColor: backgroundColor,
            rangeUpperBound: rangeUpperBound,
        }
    }

    static createReportChart(reportChart) {
        let newReportChart;
        if (reportChart) {
            newReportChart = Utils.prepareXML(reportChart, ReportUtils.createReportChart());
        } else {
            newReportChart = {
                backgroundColor1: undefined,
                backgroundColor2: undefined,
                backgroundFadeDir: undefined,
                chartSummaries: [],
                chartType: undefined,
                enableHoverLabels: undefined,
                expandOthers: undefined,
                groupingColumn: undefined,
                legendPosition: undefined,
                location: undefined,
                secondaryGroupingColumn: undefined,
                showAxisLabels: undefined,
                showPercentage: undefined,
                showTotal: undefined,
                showValues: undefined,
                size: undefined,
                summaryAggregate: undefined,
                summaryAxisManualRangeEnd: undefined,
                summaryAxisManualRangeStart: undefined,
                summaryAxisRange: undefined,
                summaryColumn: undefined,
                textColor: undefined,
                textSize: undefined,
                title: undefined,
                titleColor: undefined,
                titleSize: undefined,
            };
        }
        return newReportChart;
    }

    static createChartSummary(aggregate, axisBinding, column) {
        return {
            aggregate: aggregate,
            axisBinding: axisBinding,
            column: column,
        }
    }

    static createChartAxis(x, y, y2) {
        return {
            x: x,
            y: y,
            y2: y2,
        }
    }

    static createReportTimeFrameFilter(dateColumn, endDate, interval, startDate) {
        return {
            dateColumn: dateColumn,
            endDate: endDate,
            interval: interval,
            startDate: startDate
        }
    }

    static createReportCrossFilter(criteriaItems, operation, primaryTableColumn, relatedTable, relatedTableJoinColumn) {
        return {
            criteriaItems: Utils.forceArray(criteriaItems),
            operation: operation,
            primaryTableColumn: primaryTableColumn,
            relatedTable: relatedTable,
            relatedTableJoinColumn: relatedTableJoinColumn
        }
    }

    static toXML(report, compress) {
        let xmlLines = [];
        if (report) {
            if (compress) {
                xmlLines = xmlLines.concat(ReportUtils.getReportXMLLines(report, -1));
            } else {
                return AuraParser.toXML(report);
            }
        }
        return xmlLines.join('\n');
    }

    static getReportXMLLines(reports, initIndent) {
        let xmlLines = [];
        let reportsToProcess = Utils.forceArray(reports);
        let mainLines = initIndent === -1;
        for (const report of reportsToProcess) {
            if (mainLines) {
                initIndent = 0;
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Report xmlns="http://soap.sforce.com/2006/04/metadata">');
            } else {
                xmlLines.push(Utils.getTabs(initIndent) + '<block>');
            }

            if (report.fullName)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', report.fullName));
            if (report.name)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', report.name));
            if (report.description)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', report.description));
            if (report.reportType)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('reportType', report.reportType));
            if (report.scope)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scope', report.scope));
            if (report.folderName)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('folderName', report.folderName));
            if (report.dataCategoryFilters)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('dataCategoryFilters', report.dataCategoryFilters));
            if (report.currency)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('currency', report.currency));
            if (report.division)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('division', report.division));
            if (report.format)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('format', report.format));
            if (report.numSubscriptions)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('numSubscriptions', report.numSubscriptions));
            if (report.roleHierarchyFilter)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('roleHierarchyFilter', report.roleHierarchyFilter));
            if (report.rowLimit)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('rowLimit', report.rowLimit));
            if (report.showCurrentDate)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showCurrentDate', report.showCurrentDate));
            if (report.showDetails)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showDetails', report.showDetails));
            if (report.showGrandTotal)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showGrandTotal', report.showGrandTotal));
            if (report.showSubTotals)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showSubTotals', report.showSubTotals));
            if (report.sortColumn)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortColumn', report.sortColumn));
            if (report.sortOrder)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortOrder', report.sortOrder));
            if (report.territoryHierarchyFilter)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('territoryHierarchyFilter', report.territoryHierarchyFilter));
            if (report.userFilter)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('userFilter', report.userFilter));
            if (report.aggregates)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('aggregates', report.aggregates, true, initIndent + 1));
            if (report.block)
                xmlLines = xmlLines.concat(ReportUtils.getReportXMLLines(report.block, initIndent + 1));
            if (report.blockInfo)
                xmlLines = xmlLines.concat(ReportUtils.getReportBlockInfoXMLLines(report.blockInfo, initIndent + 1));
            if (report.buckets)
                xmlLines = xmlLines.concat(ReportUtils.getReportBucketField(report.buckets, initIndent + 1));
            if (report.chart)
                xmlLines = xmlLines.concat(ReportUtils.getReportChartXMLLines(report.chart, initIndent + 1));
            if (report.colorRanges)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('colorRanges', report.colorRanges, true, initIndent + 1));
            if (report.columns)
                xmlLines = xmlLines.concat(ReportUtils.getColumnsXMLLines(report.columns, initIndent + 1));
            if (report.crossFilters)
                xmlLines = xmlLines.concat(ReportUtils.getReportCrossFilterXMLLines(report.crossFilters, initIndent + 1));
            if (report.filter)
                xmlLines = xmlLines.concat(ReportUtils.getReportFilterXMLLines(report.filter, initIndent + 1));
            if (report.formattingRules)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('formattingRules', report.formattingRules, true, initIndent + 1));
            if (report.groupingsAcross)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('groupingsAcross', report.groupingsAcross, true, initIndent + 1));
            if (report.groupingsDown)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('groupingsDown', report.groupingsDown, true, initIndent + 1));
            if (report.historicalSelector)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('historicalSelector', report.historicalSelector, true, initIndent + 1));
            if (report.params)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('params', report.params, true, initIndent + 1));
            if (report.reportCustomDetailFormula)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('reportCustomDetailFormula', report.reportCustomDetailFormula, true, initIndent + 1));
            if (report.timeFrameFilter)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('timeFrameFilter', report.timeFrameFilter, true, initIndent + 1));
            if (mainLines) {
                xmlLines.push('</Report>');
            } else {
                xmlLines.push(Utils.getTabs(initIndent) + '</block>');
            }
        }
        return xmlLines;
    }

    static getReportBlockInfoXMLLines(blockInfo, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<blockInfo>');
        if (blockInfo.blockId)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('blockId', blockInfo.blockId));
        if (blockInfo.joinTable)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('joinTable', blockInfo.joinTable));
        if (blockInfo.aggregateReferences)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('aggregateReferences', blockInfo.aggregateReferences, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</blockInfo>');
        return xmlLines;
    }

    static getReportBucketField(buckets, initIndent) {
        let xmlLines = [];
        let bucketsToProcess = Utils.forceArray(buckets);
        for (const bucket of bucketsToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<buckets>');
            if (bucket.developerName)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', bucket.developerName));
            if (bucket.masterLabel)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', bucket.masterLabel));
            if (bucket.otherBucketLabel)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('otherBucketLabel', bucket.otherBucketLabel));
            if (bucket.bucketType)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('bucketType', bucket.bucketType));
            if (bucket.nullTreatment)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('nullTreatment', bucket.nullTreatment));
            if (bucket.sourceColumnName)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sourceColumnName', bucket.sourceColumnName));
            if (bucket.values)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('values', bucket.values, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</buckets>');
        }
        return xmlLines;
    }

    static getReportChartXMLLines(chart, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<chart>');
        if (chart.title)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('title', chart.title));
        if (chart.titleColor)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('titleColor', chart.titleColor));
        if (chart.titleSize)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('titleSize', chart.titleSize));
        if (chart.textSize)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('textSize', chart.textSize));
        if (chart.textColor)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('textColor', chart.textColor));
        if (chart.backgroundColor1)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('backgroundColor1', chart.backgroundColor1));
        if (chart.backgroundColor2)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('backgroundColor2', chart.backgroundColor2));
        if (chart.backgroundFadeDir)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('backgroundFadeDir', chart.backgroundFadeDir));
        if (chart.chartType)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('chartType', chart.chartType));
        if (chart.enableHoverLabels)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('enableHoverLabels', chart.enableHoverLabels));
        if (chart.expandOthers)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('expandOthers', chart.expandOthers));
        if (chart.groupingColumn)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('groupingColumn', chart.groupingColumn));
        if (chart.legendPosition)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('legendPosition', chart.legendPosition));
        if (chart.location)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('location', chart.location));
        if (chart.secondaryGroupingColumn)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('secondaryGroupingColumn', chart.secondaryGroupingColumn));
        if (chart.showAxisLabels)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showAxisLabels', chart.showAxisLabels));
        if (chart.showPercentage)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showPercentage', chart.showPercentage));
        if (chart.showTotal)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showTotal', chart.showTotal));
        if (chart.showValues)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showValues', chart.showValues));
        if (chart.size)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('size', chart.size));
        if (chart.summaryAggregate)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryAggregate', chart.summaryAggregate));
        if (chart.summaryAxisManualRangeStart)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryAxisManualRangeStart', chart.summaryAxisManualRangeStart));
        if (chart.summaryAxisManualRangeEnd)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryAxisManualRangeEnd', chart.summaryAxisManualRangeEnd));
        if (chart.summaryAxisRange)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryAxisRange', chart.summaryAxisRange));
        if (chart.summaryColumn)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryColumn', chart.summaryColumn));
        if (chart.chartSummaries)
            xmlLines = xmlLines.concat(ReportUtils.getChartSummariesXMLLines(chart.chartSummaries, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</chart>');
        return xmlLines;
    }

    static getChartSummariesXMLLines(chartSummaries, initIndent) {
        let xmlLines = [];
        let summaries = Utils.forceArray(chartSummaries);
        for (const summary of summaries) {
            xmlLines.push(Utils.getTabs(initIndent) + '<chartSummaries>');
            if (summary.aggregate)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('aggregate', summary.aggregate));
            if (summary.column)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('column', summary.column));
            if (summary.axisBinding)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('axisBinding', summary.axisBinding, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</chartSummaries>');
        }
        return xmlLines;
    }

    static getColumnsXMLLines(reportColumns, initIndent) {
        let xmlLines = [];
        let columns = Utils.forceArray(reportColumns);
        for (const column of columns) {
            xmlLines.push(Utils.getTabs(initIndent) + '<columns>');
            if (column.field)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('field', column.field));
            if (column.reverseColors)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('reverseColors', column.reverseColors));
            if (column.showChanges)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showChanges', column.showChanges));
            if (column.aggregateTypes)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('aggregateTypes', column.aggregateTypes, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</columns>');
        }
        return xmlLines;
    }

    static getReportCrossFilterXMLLines(crossFilters, initIndent) {
        let xmlLines = [];
        let filters = Utils.forceArray(crossFilters);
        for (const filter of filters) {
            xmlLines.push(Utils.getTabs(initIndent) + '<crossFilters>');
            if (filter.relatedTable)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relatedTable', filter.relatedTable));
            if (filter.relatedTableJoinColumn)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relatedTableJoinColumn', filter.relatedTableJoinColumn));
            if (filter.primaryTableColumn)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('primaryTableColumn', filter.primaryTableColumn));
            if (filter.operation)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('operation', filter.operation));
            if (filter.criteriaItems)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', filter.criteriaItems, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</crossFilters>');
        }
        return xmlLines;
    }

    static getReportFilterXMLLines(filters, initIndent) {
        let xmlLines = [];
        let filtersToProcess = Utils.forceArray(filters);
        for (const filter of filtersToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<filter>');
            if (filter.booleanFilter)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', filter.booleanFilter));
            if (filter.language)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('language', filter.language));
            if (filter.criteriaItems)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', filter.criteriaItems, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</filter>');
        }
        return xmlLines;
    }

}
module.exports = ReportUtils;