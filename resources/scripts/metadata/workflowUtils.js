const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class WorkflowUtils {

    static createWorkflow(workflow) {
        let newWorkflow;
        if (workflow) {
            newWorkflow = Utils.prepareXML(workflow, WorkflowUtils.createWorkflow());
        } else {
            newWorkflow = {
                alerts: [],
                fieldUpdates: [],
                flowActions: [],
                fullName: undefined,
                knowledgePublishes: [],
                outboundMessages: [],
                rules: [],
                tasks: []
            };
        }
        return newWorkflow;
    }

    static createWorkflowActionReference(name, type) {
        return {
            name: name,
            type: type
        }
    }

    static createWorkflowAlert(ccEmails, description, fullName, isProtected, recipients, senderAddress, senderType, template) {
        return {
            ccEmails: Utils.forceArray(ccEmails),
            description: description,
            fullName: fullName,
            protected: isProtected,
            recipients: Utils.forceArray(recipients),
            senderAddress: senderAddress,
            senderType: senderType,
            template: template,
        }
    }

    static createWorkflowEmailRecipient(field, recipient, type) {
        return {
            field: field,
            recipient: recipient,
            type: type
        }
    }

    static createWorkflowFieldUpdate(description, field, formula, fullName, literalValue, lookupValue, lookupValueType, name, notifyAssignee, operation, isProtected, reevaluateOnChange, targetObject) {
        return {
            description: description,
            field: field,
            formula: formula,
            fullName: fullName,
            literalValue: literalValue,
            lookupValue: lookupValue,
            lookupValueType: lookupValueType,
            name: name,
            notifyAssignee: notifyAssignee,
            operation: operation,
            protected: isProtected,
            reevaluateOnChange: reevaluateOnChange,
            targetObject: targetObject,
        }
    }

    static createWorkflowFlowAction(description, flow, flowInputs, label, language, isProtected) {
        return {
            description: description,
            flow: flow,
            flowInputs: Utils.forceArray(flowInputs),
            label: label,
            language: language,
            protected: isProtected,
        }
    }

    static createWorkflowFlowActionParameter(name, value) {
        return {
            name: name,
            value: value,
        }
    }

    static createWorkflowKnowledgePublish(action, description, label, language, isProtected) {
        return {
            action: action,
            description: description,
            label: label,
            language: language,
            protected: isProtected,
        }
    }

    static createWorkflowOutboundMessage(apiVersion, description, endpointUrl, fields, fullName, includeSessionId, integrationUser, name, isProtected, useDeadLetterQueue) {
        return {
            apiVersion: apiVersion,
            description: description,
            endpointUrl: endpointUrl,
            fields: Utils.forceArray(fields),
            fullName: fullName,
            includeSessionId: includeSessionId,
            integrationUser: integrationUser,
            name: name,
            protected: isProtected,
            useDeadLetterQueue: useDeadLetterQueue
        }
    }

    static createWorkflowRule(actions, active, booleanFilter, criteriaItems, description, formula, fullName, triggerType, workflowTimeTriggers) {
        return {
            actions: actions,
            active: active,
            booleanFilter: booleanFilter,
            criteriaItems: Utils.forceArray(criteriaItems),
            description: description,
            fullName: fullName,
            triggerType: triggerType,
            workflowTimeTriggers: workflowTimeTriggers,
        }
    }

    static createWorkflowTask(assignedTo, assignedToType, description, dueDateOffset, fullName, notifyAssignee, offsetFromField, priority, isProtected, status, subject) {
        return {
            assignedTo: assignedTo,
            assignedToType: assignedToType,
            description: description,
            dueDateOffset: dueDateOffset,
            fullName: fullName,
            notifyAssignee: notifyAssignee,
            offsetFromField: offsetFromField,
            priority: priority,
            protected: isProtected,
            status: status,
            subject: subject
        }
    }

    static createWorkflowTimeTrigger(actions, offsetFromField, timeLength, workflowTimeTriggerUnit) {
        return {
            actions: Utils.forceArray(actions),
            offsetFromField: offsetFromField,
            timeLength: timeLength,
            workflowTimeTriggerUnit: workflowTimeTriggerUnit,
        }
    }

    static toXML(workflow, compress) {
        let xmlLines = [];
        if (workflow) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (workflow.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', workflow.fullName));
                if (workflow.alerts !== undefined)
                    xmlLines = xmlLines.concat(WorkflowUtils.getWorkflowAlertXMLLines(workflow.alerts, 1));
                if (workflow.fieldUpdates !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldUpdates', workflow.fieldUpdates, true, 1));
                if (workflow.flowActions !== undefined)
                    xmlLines = xmlLines.concat(WorkflowUtils.getWorkflowFlowActionXMLLines(workflow.flowActions, 1));
                if (workflow.knowledgePublishes !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('knowledgePublishes', workflow.knowledgePublishes, true, 1));
                if (workflow.outboundMessages !== undefined)
                    xmlLines = xmlLines.concat(WorkflowUtils.getWorkflowOutboundMessageXMLLines(workflow.outboundMessages, 1));
                if (workflow.rules !== undefined)
                    xmlLines = xmlLines.concat(WorkflowUtils.getWorkflowRuleXMLLines(workflow.rules, 1));
                if (workflow.tasks !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('tasks', workflow.tasks, true, 1));
                xmlLines.push('</Workflow>');
            } else {
                return AuraParser.toXML(workflow);
            }
        }
        return xmlLines.join('\n');
    }

    static getWorkflowAlertXMLLines(alerts, initIndent) {
        let xmlLines = [];
        for (const alert of alerts) {
            xmlLines.push(Utils.getTabs(initIndent) + '<alerts>');
            if (alert.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', alert.fullName));
            if (alert.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', alert.description));
            if (alert.protected !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('protected', alert.protected));
            if (alert.senderAddress !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('senderAddress', alert.senderAddress));
            if (alert.senderType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('senderType', alert.senderType));
            if (alert.template !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('template', alert.template));
            if (alert.ccEmails !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('ccEmails', alert.ccEmails, true, initIndent + 1));
            if (alert.recipients !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('recipients', alert.recipients, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</alerts>');
        }
        return xmlLines;
    }

    static getWorkflowFlowActionXMLLines(flowActions, initIndent) {
        let xmlLines = [];
        for (const action of flowActions) {
            xmlLines.push(Utils.getTabs(initIndent) + '<flowActions>');
            if (action.flow !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('flow', action.flow));
            if (action.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', action.label));
            if (action.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', action.description));
            if (action.language !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('language', action.language));
            if (action.protected !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('protected', action.protected));
            if (action.flowInputs !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('flowInputs', action.flowInputs, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</flowActions>');
        }
        return xmlLines;
    }

    static getWorkflowOutboundMessageXMLLines(outboundMessages, initIndent) {
        let xmlLines = [];
        for (const message of outboundMessages) {
            xmlLines.push(Utils.getTabs(initIndent) + '<outboundMessages>');
            if (message.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', message.fullName));
            if (message.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', message.name));
            if (message.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', message.description));
            if (message.endpointUrl !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('endpointUrl', message.endpointUrl));
            if (message.apiVersion !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('apiVersion', message.apiVersion));
            if (message.includeSessionId !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('includeSessionId', message.includeSessionId));
            if (message.integrationUser !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('integrationUser', message.integrationUser));
            if (message.protected !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('protected', message.protected));
            if (message.useDeadLetterQueue !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('useDeadLetterQueue', message.useDeadLetterQueue));
            if (message.fields !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', message.fields, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</outboundMessages>');
        }
        return xmlLines;
    }

    static getWorkflowRuleXMLLines(rules, initIndent) {
        let xmlLines = [];
        for (const rule of rules) {
            xmlLines.push(Utils.getTabs(initIndent) + '<rules>');
            if (rule.fullName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', rule.fullName));
            if (rule.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', rule.name));
            if (rule.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', rule.description));
            if (rule.active !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', rule.active));
            if (rule.formula !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', rule.formula));
            if (rule.triggerType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('triggerType', rule.triggerType));
            if (rule.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', rule.booleanFilter));
            if (rule.criteriaItems !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', rule.criteriaItems, true, initIndent + 1));
            if (rule.workflowTimeTriggers !== undefined)
                xmlLines = xmlLines.concat(WorkflowUtils.getWorkflowTimeTriggerXMLLines(rule.workflowTimeTriggers, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</rules>');
        }
        return xmlLines;
    }

    static getWorkflowTimeTriggerXMLLines(workflowTimeTriggers, initIndent) {
        let xmlLines = [];
        for (const workflowTimeTrigger of workflowTimeTriggers) {
            xmlLines.push(Utils.getTabs(initIndent) + '<workflowTimeTriggers>');
            if (workflowTimeTrigger.offsetFromField !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('offsetFromField', workflowTimeTrigger.offsetFromField));
            if (workflowTimeTrigger.timeLength !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('timeLength', workflowTimeTrigger.timeLength));
            if (workflowTimeTrigger.workflowTimeTriggerUnit !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('workflowTimeTriggerUnit', workflowTimeTrigger.workflowTimeTriggerUnit));
            if (workflowTimeTrigger.actions !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('actions', workflowTimeTrigger.actions, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</workflowTimeTriggers>');
        }
        return xmlLines;
    }

}
module.exports = WorkflowUtils;