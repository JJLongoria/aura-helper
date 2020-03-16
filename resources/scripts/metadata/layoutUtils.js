const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class LayoutUtils {

    static createLayout(layout) {
        let newLayout;
        if (layout) {
            newLayout = Utils.prepareXML(layout, LayoutUtils.createLayout());
        } else {
            newLayout = {
                customButtons: [],
                customConsoleComponents: undefined,
                emailDefault: undefined,
                excludeButtons: [],
                feedLayout: undefined,
                fullName: undefined,
                headers: [],
                layoutSections: [],
                miniLayout: undefined,
                multilineLayoutFields: [],
                platformActionList: undefined,
                quickActionList: undefined,
                relatedContent: undefined,
                relatedLists: [],
                relatedObjects: [],
                runAssignmentRulesDefault: undefined,
                showEmailCheckbox: undefined,
                showHighlightsPanel: undefined,
                showInteractionLogPanel: undefined,
                showKnowledgeComponent: undefined,
                showRunAssignmentRulesCheckbox: undefined,
                showSolutionSection: undefined,
                showSubmitAndAttachButton: undefined,
                summaryLayout: undefined
            };
        }
        return newLayout;
    }

    static createCustomConsoleComponents(primaryTabComponents, subtabComponents) {
        return {
            primaryTabComponents: primaryTabComponents,
            subtabComponents: subtabComponents
        }
    }

    static createPrimaryTabComponents(component, containers) {
        return {
            component: Utils.forceArray(component),
            containers: Utils.forceArray(containers)
        }
    }

    static createConsoleComponent(height, location, visualforcePage, width) {
        return {
            height: height,
            location: location,
            visualforcePage: visualforcePage,
            width: width
        }
    }

    static createContainer(height, isContainerAutoSizeEnabled, region, sidebarComponents, style, unit, width) {
        return {
            height: height,
            isContainerAutoSizeEnabled: isContainerAutoSizeEnabled,
            region: region,
            sidebarComponents: Utils.forceArray(sidebarComponents),
            style: style,
            unit: unit,
            width: width
        }
    }

    static createSidebarComponent(componentType, createAction, enableLinking, height, label, lookup, page, relatedlists, unit, updateAction, width) {
        return {
            componentType: componentType,
            createAction: createAction,
            enableLinking: enableLinking,
            height: height,
            label: label,
            lookup: lookup,
            page: page,
            relatedlists: Utils.forceArray(relatedlists),
            unit: unit,
            updateAction: updateAction,
            width: width
        }
    }

    static createRelatedList(hideOnDetail, name) {
        return {
            hideOnDetail: hideOnDetail,
            name: name
        }
    }

    static createSubtabComponents(component, containers) {
        return {
            component: Utils.forceArray(component),
            containers: Utils.forceArray(containers)
        }
    }

    static createFeedLayout(autocollapsePublisher, compactFeed, feedFilterPosition, feedFilters, fullWidthFeed, hideSidebar, leftComponents, rightComponents) {
        return {
            autocollapsePublisher: autocollapsePublisher,
            compactFeed: compactFeed,
            feedFilterPosition: feedFilterPosition,
            feedFilters: Utils.forceArray(feedFilters),
            fullWidthFeed: fullWidthFeed,
            hideSidebar: hideSidebar,
            leftComponents: Utils.forceArray(leftComponents),
            rightComponents: Utils.forceArray(rightComponents)
        }
    }

    static createFeedLayoutComponent(componentType, height, page) {
        return {
            componentType: componentType,
            height: height,
            page: page
        }
    }

    static createFeedLayoutFilter(feedFilterName, feedFilterType, feedItemType) {
        return {
            feedFilterName: feedFilterName,
            feedFilterType: feedFilterType,
            feedItemType: feedItemType
        }
    }

    static createMiniLayout(fields, relatedLists) {
        return {
            fields: Utils.forceArray(fields),
            relatedLists: Utils.forceArray(relatedLists)
        }
    }

    static createLayoutSection(customLabel, detailHeading, editHeading, label, layoutColumns, style) {
        return {
            customLabel: customLabel,
            detailHeading: detailHeading,
            editHeading: editHeading,
            label: label,
            layoutColumns: Utils.forceArray(layoutColumns),
            style: style
        }
    }

    static createLayoutColumn(layoutItems, reserved) {
        return {
            layoutItems: Utils.forceArray(layoutItems),
            reserved: reserved
        }
    }

    static createLayoutItem(behavior, canvas, component, customLink, emptySpace, field, height, page, analyticsCloudComponent, reportChartComponent, scontrol, showLabel, showScrollbars, width) {
        return {
            behavior: behavior,
            canvas: canvas,
            component: component,
            customLink: customLink,
            emptySpace: emptySpace,
            field: field,
            height: height,
            page: page,
            analyticsCloudComponent: analyticsCloudComponent,
            reportChartComponent: reportChartComponent,
            scontrol: scontrol,
            showLabel: showLabel,
            showScrollbars: showScrollbars,
            width: width
        }
    }

    static createAnalyticsCloudComponentLayoutItem(assetType, devName, error, filter, height, hideOnError, showSharing, showTitle, width) {
        return {
            assetType: assetType,
            devName: devName,
            error: error,
            filter: filter,
            height: height,
            hideOnError: hideOnError,
            showSharing: showSharing,
            showTitle: showTitle,
            width: width
        }
    }

    static createReportChartComponentLayoutItem(cacheData, contextFilterableField, error, hideOnError, includeContext, reportName, showTitle, size) {
        return {
            cacheData: cacheData,
            contextFilterableField: contextFilterableField,
            error: error,
            hideOnError: hideOnError,
            includeContext: includeContext,
            reportName: reportName,
            showTitle: showTitle,
            size: size
        }
    }

    static creatPlatformActionList(actionListContext, platformActionListItems, relatedSourceEntity) {
        return {
            actionListContext: actionListContext,
            platformActionListItems: Utils.forceArray(platformActionListItems),
            relatedSourceEntity: relatedSourceEntity
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

    static createRelatedContent(relatedContentItems) {
        return {
            relatedContentItems: Utils.forceArray(relatedContentItems)
        }
    }

    static createRelatedContentItem(layoutItem) {
        return {
            layoutItem: layoutItem
        }
    }

    static createRelatedListItem(customButtons, excludeButtons, fields, relatedList, sortField, sortOrder) {
        return {
            customButtons: Utils.forceArray(customButtons),
            excludeButtons: Utils.forceArray(excludeButtons),
            fields: Utils.forceArray(fields),
            relatedList: relatedList,
            sortField: sortField,
            sortOrder: sortOrder
        }
    }

    static createSummaryLayout(masterLabel, sizeX, sizeY, sizeZ, summaryLayoutItems, summaryLayoutStyle) {
        return {
            masterLabel: masterLabel,
            sizeX: sizeX,
            sizeY: sizeY,
            sizeZ: sizeZ,
            summaryLayoutItems: Utils.forceArray(summaryLayoutItems),
            summaryLayoutStyle: summaryLayoutStyle
        }
    }

    static createSummaryLayoutItem(customLink, field, posX, posY, posZ) {
        return {
            customLink: customLink,
            field: field,
            posX: posX,
            posY: posY,
            posZ: posZ
        }
    }

    static toXML(layout, compress) {
        let xmlLines = [];
        if (layout) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Layout xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (layout.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', layout.fullName));
                if (layout.emailDefault !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('emailDefault', layout.emailDefault));
                if (layout.runAssignmentRulesDefault !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('runAssignmentRulesDefault', layout.runAssignmentRulesDefault));
                if (layout.showEmailCheckbox !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showEmailCheckbox', layout.showEmailCheckbox));
                if (layout.showHighlightsPanel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showHighlightsPanel', layout.showHighlightsPanel));
                if (layout.showInteractionLogPanel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showInteractionLogPanel', layout.showInteractionLogPanel));
                if (layout.showKnowledgeComponent !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showKnowledgeComponent', layout.showKnowledgeComponent));
                if (layout.showRunAssignmentRulesCheckbox !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showRunAssignmentRulesCheckbox', layout.showRunAssignmentRulesCheckbox));
                if (layout.showSolutionSection !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showSolutionSection', layout.showSolutionSection));
                if (layout.showSubmitAndAttachButton !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showSubmitAndAttachButton', layout.showSubmitAndAttachButton));
                if (layout.headers !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('headers', layout.headers, true, 1));
                if (layout.relatedObjects !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('relatedObjects', layout.relatedObjects, true, 1));
                if (layout.customButtons !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customButtons', layout.customButtons, true, 1));
                if (layout.excludeButtons !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('excludeButtons', layout.excludeButtons, true, 1));
                if (layout.multilineLayoutFields !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('multilineLayoutFields', layout.multilineLayoutFields, true, 1));
                if (layout.customConsoleComponents !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getCustomConsoleComponentsXMLLines(layout.customConsoleComponents, 1));
                if (layout.feedLayout !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getFeedLayoutXMLLines(layout.feedLayout, 1));
                if (layout.layoutSections !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getLayoutSectionsXMLLines(layout.layoutSections, 1));
                if (layout.miniLayout !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getMiniLayoutXMLLines(layout.miniLayout, 1));
                if (layout.platformActionList !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getPlatformActionListXMLLines(layout.platformActionList, 1));
                if (layout.quickActionList !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getQuickActionListXMLLines(layout.quickActionList, 1));
                if (layout.relatedContent !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getRelatedContentXMLLines(layout.relatedContent, 1));
                if (layout.relatedLists !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getRelatedListsItemXMLines(layout.relatedLists, 1));
                if (layout.summaryLayout !== undefined)
                    xmlLines = xmlLines.concat(LayoutUtils.getSummaryLayoutXMLLines(layout.summaryLayout, 1));
                xmlLines.push('</Layout>');
            } else {
                return AuraParser.toXML(layout);
            }
        }
        return xmlLines.join('\n');
    }



    static getCustomConsoleComponentsXMLLines(customConsoleComponents, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<customConsoleComponents>');
        if (customConsoleComponents.primaryTabComponents !== undefined)
            xmlLines = xmlLines.concat(LayoutUtils.getPrimaryTabComponentsXMLLines(customConsoleComponents.primaryTabComponents, initIndent + 1));
        if (customConsoleComponents.subtabComponents !== undefined)
            xmlLines = xmlLines.concat(LayoutUtils.getSubtabComponentsXMLLines(customConsoleComponents.subtabComponents, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</customConsoleComponents>');
        return xmlLines;
    }

    static getPrimaryTabComponentsXMLLines(primaryTabComponents, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<primaryTabComponents>');
        if (primaryTabComponents.component !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('component', primaryTabComponents.component, true, initIndent + 1));
        if (primaryTabComponents.containers !== undefined)
            xmlLines = xmlLines.concat(LayoutUtils.getContainerXMLLines(primaryTabComponents.containers, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</primaryTabComponents>');
        return xmlLines;
    }

    static getSubtabComponentsXMLLines(subtabComponents, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<subtabComponents>');
        if (subtabComponents.component !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('component', subtabComponents.component, true, initIndent + 1));
        if (subtabComponents.containers !== undefined)
            xmlLines = xmlLines.concat(LayoutUtils.getContainerXMLLines(subtabComponents.containers, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</subtabComponents>');
        return xmlLines;
    }

    static getContainerXMLLines(containers, initIndent) {
        let xmlLines = [];
        let containersToProcess = Utils.forceArray(containers);
        for (const container of containersToProcess) {
            xmlLines.push(Utils.getTabs(initIndent) + '<containers>');
            if (container.height !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('height', container.height));
            if (container.width !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('width', container.width));
            if (container.unit !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('unit', container.unit));
            if (container.isContainerAutoSizeEnabled !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isContainerAutoSizeEnabled', container.isContainerAutoSizeEnabled));
            if (container.region !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('region', container.region));
            if (container.style !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('style', container.style));
            if (container.sidebarComponents !== undefined)
                xmlLines = xmlLines.concat(LayoutUtils.getSidebarComponentsXMLLines(container.sidebarComponents, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</containers>');
        }
        return xmlLines;
    }

    static getSidebarComponentsXMLLines(sidebarComponents, initIndent) {
        let xmlLines = [];
        let components = Utils.forceArray(sidebarComponents);
        for (const component of components) {
            xmlLines.push(Utils.getTabs(initIndent) + '<sidebarComponents>');
            if (component.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', component.label));
            if (component.height !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('height', component.height));
            if (component.width !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('width', component.width));
            if (component.componentType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('componentType', component.componentType));
            if (component.createAction !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('createAction', component.createAction));
            if (component.updateAction !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('updateAction', component.updateAction));
            if (component.enableLinking !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('enableLinking', component.enableLinking));
            if (component.lookup !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('lookup', component.lookup));
            if (component.page !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('page', component.page));
            if (component.unit !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('unit', component.unit));
            if (component.relatedlists !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('relatedlists', component.relatedlists, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</sidebarComponents>');
        }
        return xmlLines;
    }

    static getFeedLayoutXMLLines(feedLayout, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<feedLayout>');
        if (feedLayout.autocollapsePublisher !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('autocollapsePublisher', feedLayout.autocollapsePublisher));
        if (feedLayout.compactFeed !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('compactFeed', feedLayout.compactFeed));
        if (feedLayout.feedFilterPosition !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('feedFilterPosition', feedLayout.feedFilterPosition));
        if (feedLayout.fullWidthFeed !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullWidthFeed', feedLayout.fullWidthFeed));
        if (feedLayout.hideSidebar !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('hideSidebar', feedLayout.hideSidebar));
        if (feedLayout.feedFilters !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('feedFilters', feedLayout.feedFilters, true, initIndent + 1));
        if (feedLayout.leftComponents !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('leftComponents', feedLayout.leftComponents, true, initIndent + 1));
        if (feedLayout.rightComponents !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('rightComponents', feedLayout.rightComponents, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</feedLayout>');
        return xmlLines;
    }

    static getLayoutSectionsXMLLines(layoutSections, initIndent) {
        let xmlLines = [];
        for (const section of layoutSections) {
            xmlLines.push(Utils.getTabs(initIndent) + '<layoutSections>');
            if (section.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', section.label));
            if (section.customLabel !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('customLabel', section.customLabel));
            if (section.detailHeading !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('detailHeading', section.detailHeading));
            if (section.editHeading !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('editHeading', section.editHeading));
            if (section.style !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('style', section.style));
            if (section.layoutColumns !== undefined)
                xmlLines = xmlLines.concat(LayoutUtils.getLayoutColumnsXMLLines(section.layoutColumns, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</layoutSections>');
        }
        return xmlLines;
    }

    static getLayoutColumnsXMLLines(layoutColumns, initIndent) {
        let xmlLines = [];
        let columns = Utils.forceArray(layoutColumns);
        for (const column of columns) {
            xmlLines.push(Utils.getTabs(initIndent) + '<layoutColumns>');
            if (column.reserved !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('reserved', column.reserved));
            if (column.layoutItems !== undefined)
                xmlLines = xmlLines.concat(LayoutUtils.getLayoutItemsXMLLines(column.layoutItems, initIndent + 1, false));
            xmlLines.push(Utils.getTabs(initIndent) + '</layoutColumns>');
        }
        return xmlLines;
    }

    static getLayoutItemsXMLLines(layoutItems, initIndent, singular) {
        let xmlLines = [];
        let items = Utils.forceArray(layoutItems);
        for (const item of items) {
            if (singular)
                xmlLines.push(Utils.getTabs(initIndent) + '<layoutItem>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '<layoutItems>');
            if (item.behavior !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('behavior', item.behavior));
            if (item.canvas !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('canvas', item.canvas));
            if (item.component !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('component', item.component));
            if (item.customLink !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('customLink', item.customLink));
            if (item.emptySpace !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('emptySpace', item.emptySpace));
            if (item.field !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('field', item.field));
            if (item.height !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('height', item.height));
            if (item.width !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('width', item.width));
            if (item.page !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('page', item.page));
            if (item.scontrol !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scontrol', item.scontrol));
            if (item.showLabel !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showLabel', item.showLabel));
            if (item.showScrollbars !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showScrollbars', item.showScrollbars));
            if (item.analyticsCloudComponent !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('analyticsCloudComponent', item.analyticsCloudComponent, true, initIndent + 1));
            if (item.reportChartComponent !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('reportChartComponent', item.reportChartComponent, true, initIndent + 1));
            if (singular)
                xmlLines.push(Utils.getTabs(initIndent) + '</layoutItem>');
            else
                xmlLines.push(Utils.getTabs(initIndent) + '</layoutItems>');
        }
        return xmlLines;
    }

    static getMiniLayoutXMLLines(miniLayout, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<miniLayout>');
        if (miniLayout.fields !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', miniLayout.fields, true, initIndent + 1));
        if (miniLayout.relatedLists !== undefined)
            xmlLines = xmlLines.concat(LayoutUtils.getRelatedListsItemXMLines(miniLayout.relatedLists, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</miniLayout>');
        return xmlLines;
    }

    static getRelatedListsItemXMLines(relatedLists, initIndent) {
        let xmlLines = [];
        let lists = Utils.forceArray(relatedLists);
        for (const list of lists) {
            xmlLines.push(Utils.getTabs(initIndent) + '<relatedLists>');
            if (list.relatedList !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relatedList', list.relatedList));
            if (list.sortField !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortField', list.sortField));
            if (list.sortOrder !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sortOrder', list.sortOrder));
            if (list.fields !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', list.fields, true, initIndent + 1));
            if (list.customButtons !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('customButtons', list.customButtons, true, initIndent + 1));
            if (list.excludeButtons !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('excludeButtons', list.excludeButtons, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</relatedLists>');
        }
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

    static getRelatedContentXMLLines(relatedContent, initIndent) {
        let xmlLines = [];
        let items = Utils.forceArray(relatedContent.relatedContentItems);
        xmlLines.push(Utils.getTabs(initIndent) + '<relatedContent>');
        for (const item of items) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + '<relatedContentItems>');
            if (item.layoutItem !== undefined)
                xmlLines = xmlLines.concat(LayoutUtils.getLayoutItemsXMLLines(item.layoutItem, initIndent + 1, true));
            xmlLines.push(Utils.getTabs(initIndent + 1) + '</relatedContentItems>');
        }
        xmlLines.push(Utils.getTabs(initIndent) + '</relatedContent>');
        return xmlLines;
    }

    static getSummaryLayoutXMLLines(summaryLayout, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<summaryLayout>');
        if (summaryLayout.masterLabel !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', summaryLayout.masterLabel));
        if (summaryLayout.summaryLayoutStyle !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryLayoutStyle', summaryLayout.summaryLayoutStyle));
        if (summaryLayout.sizeX !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sizeX', summaryLayout.sizeX));
        if (summaryLayout.sizeY !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sizeY', summaryLayout.sizeY));
        if (summaryLayout.sizeZ !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sizeZ', summaryLayout.sizeZ));
        if (summaryLayout.summaryLayoutItems !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('summaryLayoutItems', summaryLayout.summaryLayoutItems, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</summaryLayout>');
        return xmlLines;
    }

}
module.exports = LayoutUtils;