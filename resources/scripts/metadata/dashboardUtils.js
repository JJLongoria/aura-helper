const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class DashboardUtils {

    static createDashboard(dashboard) {
        let newDashboard;
        if (dashboard) {
            newDashboard = Utils.prepareXML(dashboard, DashboardUtils.createDashboard());
        } else {
            newDashboard = {
                backgroundEndColor: undefined,
                backgroundFadeDirection: undefined,
                backgroundStartColor: undefined,
                chartTheme: undefined,
                colorPalette: undefined,
                dashboardChartTheme: undefined,
                dashboardColorPalette: undefined,
                dashboardFilters: [],
                dashboardGridLayout: undefined,
                dashboardType: undefined,
                description: undefined,
                folderName: undefined,
                fullName: undefined,
                isGridLayout: undefined,
                dashboardResultRefreshedDate: undefined,
                dashboardResultRunningUser: undefined,
                leftSection: undefined,
                middleSection: undefined,
                numSubscriptions: undefined,
                rightSection: undefined,
                runningUser: undefined,
                textColor: undefined,
                title: undefined,
                titleColor: undefined,
                titleSize: undefined,
            };
        }
        return newDashboard;
    }

    static createDashboardFilter(dashboardFilterOptions, name) {
        return {
            dashboardFilterOptions: Utils.forceArray(dashboardFilterOptions),
            name: name
        }
    }

    static createDashboardFielterOptions(operator, values) {
        return {
            operator: operator,
            values: Utils.forceArray(values)
        }
    }

    static createDashboardGridLayout(dashboardGridComponents, numberOfColumns, rowHeight) {
        return {
            dashboardGridComponents: Utils.forceArray(dashboardGridComponents),
            numberOfColumns: numberOfColumns,
            rowHeight: rowHeight
        }
    }

    static createDashboardGridComponent(colSpan, columnIndex, dashboardComponent, rowIndex, rowSpan) {
        return {
            colSpan: colSpan,
            columnIndex: columnIndex,
            dashboardComponent: dashboardComponent,
            rowIndex: rowIndex,
            rowSpan: rowSpan
        }
    }

    static createDashboardComponent(dashboardComponent) {
        let newDashboardComponent;
        if (dashboardComponent) {
            newDashboardComponent = Utils.prepareXML(dashboardComponent, DashboardUtils.createDashboardComponent());
        } else {
            newDashboardComponent = {
                chartAxisRange: undefined,
                chartAxisRangeMax: undefined,
                chartAxisRangeMin: undefined,
                chartSummary: undefined,
                componentType: undefined,
                dashboardFilterColumns: [],
                dashboardTableColumn: [],
                displayUnits: undefined,
                drillDownUrl: undefined,
                drillEnabled: undefined,
                drillToDetailEnabled: undefined,
                enableHover: undefined,
                expandOthers: undefined,
                flexComponentProperties: undefined,
                footer: undefined,
                gaugeMax: undefined,
                gaugeMin: undefined,
                groupingColumn: undefined,
                GroupingSortProperties: undefined,
                header: undefined,
                indicatorBreakpoint1: undefined,
                indicatorBreakpoint2: undefined,
                indicatorHighColor: undefined,
                indicatorLowColor: undefined,
                indicatorMiddleColor: undefined,
                legendPosition: undefined,
                maxValuesDisplayed: undefined,
                metricLabel: undefined,
                page: undefined,
                pageHeightInPixels: undefined,
                report: undefined,
                scontrol: undefined,
                scontrolHeightInPixels: undefined,
                showPercentage: undefined,
                showPicturesOnCharts: undefined,
                showPicturesOnTables: undefined,
                showTotal: undefined,
                showValues: undefined,
                sortBy: undefined,
                title: undefined,
                useReportChart: undefined,
            };
        }
        return newDashboardComponent;
    }

    static createDashboardFilterColumn(column) {
        return {
            column: column
        }
    }

    static createDashboardTableColumn(aggregateType, column, showTotal, sortBy) {
        return {
            aggregateType: Utils.forceArray(aggregateType),
            column: column,
            showTotal: showTotal,
            sortBy: sortBy
        }
    }

    static createDashboardFlexTableComponentProperties(flexTableColumn, flexTableSortInfo, hideChatterPhotos, decimalPrecision) {
        return {
            flexTableColumn: flexTableColumn,
            flexTableSortInfo: flexTableSortInfo,
            hideChatterPhotos: hideChatterPhotos,
            decimalPrecision: decimalPrecision
        }
    }

    static createDashboardComponentGroupingSortProperties(groupingSorts) {
        return {
            groupingSorts: groupingSorts
        }
    }

    static createDashboardComponentGroupingSort(groupingLevel, inheritedReportGroupingSort, sortColumn, sortOrder) {
        return {
            groupingLevel: groupingLevel,
            inheritedReportGroupingSort: inheritedReportGroupingSort,
            sortColumn: sortColumn,
            sortOrder: sortOrder
        }
    }

    static createDashboardComponentColumn(breakPoint1, breakPoint2, breakPointOrder, highRangeColor, lowRangeColor, midRangeColor, reportColumn, showTotal, type) {
        return {
            breakPoint1: breakPoint1,
            breakPoint2: breakPoint2,
            breakPointOrder: breakPointOrder,
            highRangeColor: highRangeColor,
            lowRangeColor: lowRangeColor,
            midRangeColor: midRangeColor,
            reportColumn: reportColumn,
            showTotal: showTotal,
            type: type
        }
    }

    static createDashboardComponentSortInfo(ComponentSortColumn, sortOrder) {
        return {
            ComponentSortColumn: ComponentSortColumn,
            sortOrder: sortOrder
        }
    }

    static createDashboardComponentSection(columnSize, components) {
        return {
            columnSize: columnSize,
            components: Utils.forceArray(components)
        }
    }

    static createDashboardComponentFilter(RowLabelAscending, RowLabelDescending, RowValueAscending, RowValueDescending) {
        return {
            RowLabelAscending: RowLabelAscending,
            RowLabelDescending: RowLabelDescending,
            RowValueAscending: RowValueAscending,
            RowValueDescending: RowValueDescending
        }
    }

    static toXML(dashboard, compress) {
        let xmlLines = [];
        if (dashboard) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Dashboard xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (dashboard.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', dashboard.fullName));
                if (dashboard.title !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('title', dashboard.title));
                if (dashboard.titleColor !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('titleColor', dashboard.titleColor));
                if (dashboard.titleSize !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('titleSize', dashboard.titleSize));
                if (dashboard.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', dashboard.description));
                if (dashboard.dashboardType !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dashboardType', dashboard.dashboardType));
                if (dashboard.folderName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('folderName', dashboard.folderName));
                if (dashboard.backgroundStartColor !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('backgroundStartColor', dashboard.backgroundStartColor));
                if (dashboard.backgroundEndColor !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('backgroundEndColor', dashboard.backgroundEndColor));
                if (dashboard.backgroundFadeDirection !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('backgroundFadeDirection', dashboard.backgroundFadeDirection));
                if (dashboard.chartTheme !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('chartTheme', dashboard.chartTheme));
                if (dashboard.colorPalette !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('colorPalette', dashboard.colorPalette));
                if (dashboard.dashboardChartTheme !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dashboardChartTheme', dashboard.dashboardChartTheme));
                if (dashboard.dashboardColorPalette !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dashboardColorPalette', dashboard.dashboardColorPalette));
                if (dashboard.isGridLayout !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isGridLayout', dashboard.isGridLayout));
                if (dashboard.dashboardResultRefreshedDate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dashboardResultRefreshedDate', dashboard.dashboardResultRefreshedDate));
                if (dashboard.dashboardResultRunningUser !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dashboardResultRunningUser', dashboard.dashboardResultRunningUser));
                if (dashboard.numSubscriptions !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('numSubscriptions', dashboard.numSubscriptions));
                if (dashboard.runningUser !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('runningUser', dashboard.runningUser));
                if (dashboard.textColor !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('textColor', dashboard.textColor));



                if (dashboard.dashboardFilters !== undefined)
                    xmlLines = xmlLines.concat(DashboardUtils.getDashboardFiltersXMLLines(dashboard.dashboardFilters, 1));
                if (dashboard.dashboardGridLayout !== undefined)
                    xmlLines = xmlLines.concat(DashboardUtils.getDashboardGridLayoutXMLLines(dashboard.dashboardGridLayout, 1));
                if (dashboard.leftSection !== undefined)
                    xmlLines = xmlLines.concat(DashboardUtils.getDashboardComponentSectionXMLLines(dashboard.leftSection, 1, 'leftSection'));
                if (dashboard.middleSection !== undefined)
                    xmlLines = xmlLines.concat(DashboardUtils.getDashboardComponentSectionXMLLines(dashboard.middleSection, 1, 'middleSection'));
                if (dashboard.rightSection !== undefined)
                    xmlLines = xmlLines.concat(DashboardUtils.getDashboardComponentSectionXMLLines(dashboard.rightSection, 1, 'rightSection'));
                xmlLines.push('</Dashboard>');
            } else {
                return AuraParser.toXML(dashboard);
            }
        }
        return xmlLines.join('\n');
    }

    static getDashboardFiltersXMLLines(dashboardFilters, initIndent) {
        let xmlLines = [];
        for (const filter of dashboardFilters) {
            xmlLines.push(Utils.getTabs(initIndent) + '<dashboardFilters>');
            if (filter.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', filter.name));
            if (filter.dashboardFilterOptions !== undefined)
                xmlLines = xmlLines.concat(DashboardUtils.getDashboardFilterOptionsXMLLines(filter.dashboardFilterOptions, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</dashboardFilters>');
        }
        return xmlLines;
    }

    static getDashboardFilterOptionsXMLLines(dashboardFilterOptions, initIndent) {
        let xmlLines = [];
        let options = Utils.forceArray(dashboardFilterOptions);
        for (const option of options) {
            xmlLines.push(Utils.getTabs(initIndent) + '<dashboardFilterOptions>');
            if (option.operator !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('operator', option.operator));
            if (option.values !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('values', option.values, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</dashboardFilterOptions>');
        }
        return xmlLines;
    }

    static getDashboardGridLayoutXMLLines(dashboardGridLayout, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<dashboardGridLayout>');
        if (dashboardGridLayout.numberOfColumns !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('numberOfColumns', dashboardGridLayout.numberOfColumns));
        if (dashboardGridLayout.rowHeight !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('rowHeight', dashboardGridLayout.rowHeight));
        xmlLines.push(Utils.getTabs(initIndent) + '</dashboardGridLayout>');
        return xmlLines;
    }

    static getDashboardGridComponentsXMLLines(dashboardGridComponents, initIndent) {
        let xmlLines = [];
        let components = Utils.forceArray(dashboardGridComponents);
        for (const component of components) {
            xmlLines.push(Utils.getTabs(initIndent) + '<dashboardGridComponents>');
            if (component.rowIndex !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('rowIndex', component.rowIndex));
            if (component.rowSpan !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('rowSpan', component.rowSpan));
            if (component.columnIndex !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('columnIndex', component.columnIndex));
            if (component.colSpan !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('colSpan', component.colSpan));
            if (component.dashboardComponent)
                xmlLines = xmlLines.concat(DashboardUtils.getDashboardComponentXMLLines(component.dashboardComponent, initIndent + 1, 'dashboardComponent'));
            xmlLines.push(Utils.getTabs(initIndent) + '</dashboardGridComponents>');
        }
        return xmlLines;
    }

    static getDashboardComponentXMLLines(dashboardComponent, initIndent, tagName) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<' + tagName + '>');
        if (dashboardComponent.title !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('title', dashboardComponent.title));
        if (dashboardComponent.componentType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('componentType', dashboardComponent.componentType));
        if (dashboardComponent.header !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('header', dashboardComponent.header));
        if (dashboardComponent.footer !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('footer', dashboardComponent.footer));
        if (dashboardComponent.chartAxisRange !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('chartAxisRange', dashboardComponent.chartAxisRange));
        if (dashboardComponent.chartAxisRangeMin !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('chartAxisRangeMin', dashboardComponent.chartAxisRangeMin));
        if (dashboardComponent.chartAxisRangeMax !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('chartAxisRangeMax', dashboardComponent.chartAxisRangeMax));
        if (dashboardComponent.displayUnits !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayUnits', dashboardComponent.displayUnits));
        if (dashboardComponent.drillDownUrl !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('drillDownUrl', dashboardComponent.drillDownUrl));
        if (dashboardComponent.drillEnabled !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('drillEnabled', dashboardComponent.drillEnabled));
        if (dashboardComponent.drillToDetailEnabled !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('drillToDetailEnabled', dashboardComponent.drillToDetailEnabled));
        if (dashboardComponent.enableHover !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('enableHover', dashboardComponent.enableHover));
        if (dashboardComponent.expandOthers !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('expandOthers', dashboardComponent.expandOthers));
        if (dashboardComponent.gaugeMax !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('gaugeMax', dashboardComponent.gaugeMax));
        if (dashboardComponent.gaugeMin !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('gaugeMin', dashboardComponent.gaugeMin));
        if (dashboardComponent.groupingColumn !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('groupingColumn', dashboardComponent.groupingColumn));
        if (dashboardComponent.indicatorBreakpoint1 !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indicatorBreakpoint1', dashboardComponent.indicatorBreakpoint1));
        if (dashboardComponent.indicatorBreakpoint2 !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indicatorBreakpoint2', dashboardComponent.indicatorBreakpoint2));
        if (dashboardComponent.indicatorHighColor !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indicatorHighColor', dashboardComponent.indicatorHighColor));
        if (dashboardComponent.indicatorMiddleColor !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indicatorMiddleColor', dashboardComponent.indicatorMiddleColor));
        if (dashboardComponent.indicatorLowColor !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indicatorLowColor', dashboardComponent.indicatorLowColor));
        if (dashboardComponent.legendPosition !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('legendPosition', dashboardComponent.legendPosition));
        if (dashboardComponent.maxValuesDisplayed !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('maxValuesDisplayed', dashboardComponent.maxValuesDisplayed));
        if (dashboardComponent.metricLabel !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('metricLabel', dashboardComponent.metricLabel));
        if (dashboardComponent.page !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('page', dashboardComponent.page));
        if (dashboardComponent.pageHeightInPixels !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('pageHeightInPixels', dashboardComponent.pageHeightInPixels));
        if (dashboardComponent.report !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('report', dashboardComponent.report));
        if (dashboardComponent.scontrol !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scontrol', dashboardComponent.scontrol));
        if (dashboardComponent.scontrolHeightInPixels !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scontrolHeightInPixels', dashboardComponent.scontrolHeightInPixels));
        if (dashboardComponent.showPercentage !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showPercentage', dashboardComponent.showPercentage));
        if (dashboardComponent.showPicturesOnCharts !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showPicturesOnCharts', dashboardComponent.showPicturesOnCharts));
        if (dashboardComponent.showPicturesOnTables !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showPicturesOnTables', dashboardComponent.showPicturesOnTables));
        if (dashboardComponent.showTotal !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showTotal', dashboardComponent.showTotal));
        if (dashboardComponent.showValues !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showValues', dashboardComponent.showValues));
        if (dashboardComponent.sortBy !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortBy', dashboardComponent.sortBy));
        if (dashboardComponent.useReportChart !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('useReportChart', dashboardComponent.useReportChart));
        if (dashboardComponent.chartSummary !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('chartSummary', dashboardComponent.chartSummary, true, initIndent + 1));
        if (dashboardComponent.dashboardFilterColumns !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('dashboardFilterColumns', dashboardComponent.dashboardFilterColumns, true, initIndent + 1));
        if (dashboardComponent.dashboardTableColumn !== undefined)
            xmlLines = xmlLines.concat(DashboardUtils.getDashboardTableColumnsXMLLines(dashboardComponent.dashboardTableColumn, initIndent + 1));
        if (dashboardComponent.flexComponentProperties !== undefined)
            xmlLines = xmlLines.concat(DashboardUtils.getFlexComponentPropertiesXMLLines(dashboardComponent.flexComponentProperties, initIndent + 1));
        if (dashboardComponent.groupingSortProperties !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('groupingSortProperties', dashboardComponent.groupingSortProperties, true, initIndent + 1));

        xmlLines.push(Utils.getTabs(initIndent) + '</' + tagName + '>');
        return xmlLines;
    }

    static getDashboardTableColumnsXMLLines(dashboardTableColumn, initIndent) {
        let xmlLines = [];
        let columns = Utils.forceArray(dashboardTableColumn);
        for (const column of columns) {
            xmlLines.push(Utils.getTabs(initIndent) + '<dashboardTableColumn>');
            if (column.column !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('column', column.column));
            if (column.showTotal !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showTotal', column.showTotal));
            if (column.sortBy !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortBy', column.sortBy));
            if (column.aggregateType !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('aggregateType', column.aggregateType, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</dashboardTableColumn>');
        }
        return xmlLines;
    }

    static getFlexComponentPropertiesXMLLines(flexComponentProperties, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<flexComponentProperties>');
        if (flexComponentProperties.hideChatterPhotos !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('hideChatterPhotos', flexComponentProperties.hideChatterPhotos));
        if (flexComponentProperties.decimalPrecision !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('decimalPrecision', flexComponentProperties.decimalPrecision));
        if (flexComponentProperties.flexTableColumn !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('flexTableColumn', flexComponentProperties.flexTableColumn, true, initIndent + 1));
        if (flexComponentProperties.flexTableSortInfo !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('flexTableSortInfo', flexComponentProperties.flexTableSortInfo, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</flexComponentProperties>');
        return xmlLines;
    }

    static getDashboardComponentSectionXMLLines(dashboardSection, initIndent, tagName) {
        let xmlLines = [];
        let components = Utils.forceArray(dashboardSection.components);
        xmlLines.push(Utils.getTabs(initIndent) + '<' + tagName + '>');
        if (dashboardSection.columnSize !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('columnSize', dashboardSection.columnSize, true, initIndent + 1));
        for (const component of components) {
            xmlLines = xmlLines.concat(DashboardUtils.getDashboardComponentXMLLines(component, initIndent + 1, 'components'));
        }
        xmlLines.push(Utils.getTabs(initIndent) + '</' + tagName + '>');
        return xmlLines;
    }

}
module.exports = DashboardUtils;