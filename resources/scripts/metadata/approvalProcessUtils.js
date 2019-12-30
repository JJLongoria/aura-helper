const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class ApprovalProcessUtils {

    static createApprovalProcess(approvalProcess) {
        let newApprovalProcess;
        if (approvalProcess) {
            newApprovalProcess = Utils.prepareXML(approvalProcess, ApprovalProcessUtils.createApprovalProcess());
        } else {
            return {
                active: undefined,
                allowRecall: undefined,
                allowedSubmitters: [],
                approvalPageFields: undefined,
                approvalStep: [],
                description: undefined,
                emailTemplate: undefined,
                enableMobileDeviceAccess: undefined,
                entryCriteria: undefined,
                finalApprovalActions: undefined,
                finalApprovalRecordLock: undefined,
                finalRejectionActions: undefined,
                finalRejectionRecordLock: undefined,
                fullName: undefined,
                initialSubmissionActions: undefined,
                label: undefined,
                nextAutomatedApprover: undefined,
                postTemplate: undefined,
                recallActions: undefined,
                recordEditability: undefined,
                showApprovalHistory: undefined
            }
        }
        return newApprovalProcess;
    }

    static createApprovalSubmitter(submitter, type) {
        return {
            submitter: submitter,
            type: type
        }
    }

    static createApprovalPageField(field) {
        return Utils.forceArray(field);
    }

    static createApprovalStep(name, label, description, allowDelegate, approvalActions, assignedApprover, entryCriteria, ifCriteriaNotMet, rejectBehavior, rejectionActions) {
        return {
            name: name,
            label: label,
            description: description,
            allowDelegate: allowDelegate,
            approvalActions: approvalActions,
            assignedApprover: assignedApprover,
            entryCriteria: entryCriteria,
            ifCriteriaNotMet: ifCriteriaNotMet,
            rejectBehavior: rejectBehavior,
            rejectionActions: rejectionActions
        }
    }

    static createArppovalAction(action) {
        return Utils.forceArray(action);
    }

    static createApprovalStepApprover(approver, whenMultipleApprovers) {
        let appr = Utils.forceArray(approver);
        return {
            approver: appr,
            whenMultipleApprovers: whenMultipleApprovers
        }
    }

    static createApprover(name, type) {
        return {
            name: name,
            type: type
        }
    }

    static createApprovalEntryCriteria(booleanFilter, criteriaItems, formula) {
        let items = Utils.forceArray(criteriaItems);
        return {
            booleanFilter: booleanFilter,
            criteriaItems: items,
            formula: formula
        }
    }

    static createApprovajRejectedBehaviour(type) {
        return type;
    }

    static createNextAutomatedApprover(useApproverFieldOfRecordOwner, userHierarchyField) {
        return {
            useApproverFieldOfRecordOwner: useApproverFieldOfRecordOwner,
            userHierarchyField: userHierarchyField
        }
    }

    static toXML(approvalProcess, compress) {
        let xmlLines = [];
        if (approvalProcess) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<ApprovalProcess xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (approvalProcess.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', approvalProcess.fullName));
                if (approvalProcess.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', approvalProcess.label));
                if (approvalProcess.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', approvalProcess.description));
                if (approvalProcess.active !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', approvalProcess.active));
                if (approvalProcess.recordEditability !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('recordEditability', approvalProcess.recordEditability));
                if (approvalProcess.allowRecall !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowRecall', approvalProcess.allowRecall));
                if (approvalProcess.emailTemplate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('emailTemplate', approvalProcess.emailTemplate));
                if (approvalProcess.postTemplate !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('postTemplate', approvalProcess.postTemplate));
                if (approvalProcess.enableMobileDeviceAccess !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableMobileDeviceAccess', approvalProcess.enableMobileDeviceAccess));
                if (approvalProcess.finalApprovalRecordLock !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('finalApprovalRecordLock', approvalProcess.finalApprovalRecordLock));
                if (approvalProcess.finalApprovalRecordLock !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showApprovalHistory', approvalProcess.showApprovalHistory));
                if (approvalProcess.nextAutomatedApprover !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('nextAutomatedApprover', approvalProcess.nextAutomatedApprover, true, 1));
                if (approvalProcess.allowedSubmitters) {
                    Utils.sort(approvalProcess.allowedSubmitters, ['submitter']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('allowedSubmitters', approvalProcess.allowedSubmitters, true, 1));
                }
                if (approvalProcess.approvalPageFields && approvalProcess.approvalPageFields.field) {
                    Utils.sort(approvalProcess.approvalPageFields.field);
                    xmlLines.push(Utils.getTabs(1) + '<approvalPageFields>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('field', approvalProcess.approvalPageFields.field, true, 2));
                    xmlLines.push(Utils.getTabs(1) + '</approvalPageFields>');
                }
                if (approvalProcess.approvalStep) {
                    xmlLines = xmlLines.concat(ApprovalProcessUtils.getApprovalStepXMLLines(approvalProcess.approvalStep, 2));
                }
                if (approvalProcess.entryCriteria) {
                    xmlLines = xmlLines.concat(ApprovalProcessUtils.getEntryCriteriaXMLLines(approvalProcess.entryCriteria, 2));
                }
                if (approvalProcess.initialSubmissionActions && approvalProcess.initialSubmissionActions.action) {
                    xmlLines.push('\t<initialSubmissionActions>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalProcess.initialSubmissionActions.action, true, 2));
                    xmlLines.push('\t</initialSubmissionActions>');
                }
                if (approvalProcess.finalApprovalActions && approvalProcess.finalApprovalActions.action) {
                    xmlLines.push('\t<finalApprovalActions>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalProcess.finalApprovalActions.action, true, 2));
                    xmlLines.push('\t</finalApprovalActions>');
                }
                if (approvalProcess.finalRejectionActions && approvalProcess.finalRejectionActions.action) {
                    xmlLines.push('\t<finalRejectionActions>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalProcess.finalRejectionActions.action, true, 2));
                    xmlLines.push('\t</finalRejectionActions>');
                }
                if (approvalProcess.recallActions && approvalProcess.recallActions.action) {
                    xmlLines.push('\t<recallActions>');
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalProcess.recallActions.action, true, 2));
                    xmlLines.push('\t</recallActions>');
                }
                xmlLines.push('</ApprovalProcess>');
            } else {
                return AuraParser.toXML(approvalProcess);
            }
        }
        return xmlLines.join('\n');
    }

    static getApprovalStepXMLLines(approvalSteps, initIndent) {
        let xmlLines = [];
        for (const approvalStep of approvalSteps) {
            xmlLines.push(Utils.getTabs(initIndent) + '</approvalStep>');
            if (approvalStep.name !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', approvalStep.name));
            if (approvalStep.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', approvalStep.label));
            if (approvalStep.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', approvalStep.description));
            if (approvalStep.allowDelegate !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('allowDelegate', approvalStep.allowDelegate));
            if (approvalStep.ifCriteriaNotMet !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('ifCriteriaNotMet', approvalStep.ifCriteriaNotMet));
            if (approvalStep.approvalActions && approvalStep.approvalActions.action) {
                xmlLines.push(Utils.getTabs(initIndent + 1) + '<approvalActions>');
                xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalStep.approvalActions.action, true, initIndent + 2));
                xmlLines.push(Utils.getTabs(initIndent + 1) + '</approvalActions>');
            }
            if (approvalStep.assignedApprover && approvalStep.assignedApprover.approver) {
                xmlLines = xmlLines.concat(ApprovalProcessUtils.getAssignedApproverXMLLines(approvalStep.assignedApprover, initIndent + 1));
            }
            if (approvalStep.entryCriteria) {
                xmlLines = xmlLines.concat(ApprovalProcessUtils.getEntryCriteriaXMLLines(approvalStep.entryCriteria, initIndent + 1));
            }
            if (approvalStep.rejectBehavior) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('rejectBehavior', approvalStep.rejectBehavior, true, initIndent + 1));
            }
            if (approvalStep.rejectionActions && approvalStep.rejectionActions.action) {
                xmlLines.push(Utils.getTabs(initIndent + 1) + '<rejectionActions>');
                xmlLines = xmlLines.concat(Utils.getXMLBlock('action', approvalStep.rejectionActions.action, true, initIndent + 2));
                xmlLines.push(Utils.getTabs(initIndent + 1) + '</rejectionActions>');
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</approvalStep>');
        }
        return xmlLines;
    }

    static getAssignedApproverXMLLines(assignedApprover, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<assignedApprover>');
        xmlLines = xmlLines.concat(Utils.getXMLBlock('approver', assignedApprover.approver, true, initIndent + 1));
        if (assignedApprover.whenMultipleApprovers !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + + Utils.getXMLTag('whenMultipleApprovers', assignedApprover.whenMultipleApprovers));
        xmlLines.push(Utils.getTabs(initIndent) + '</assignedApprover>');
        return xmlLines;
    }

    static getEntryCriteriaXMLLines(entryCriteria, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<entryCriteria>');
        if (entryCriteria.booleanFilter !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', entryCriteria.booleanFilter));
        if (entryCriteria.formula !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', entryCriteria.formula));
        if (entryCriteria.criteriaItems !== undefined) {
            Utils.sort(entryCriteria.criteriaItems, ['field']);
            xmlLines = xmlLines.concat(Utils.getXMLBlock('criteriaItems', entryCriteria.criteriaItems, true, initIndent + 1));
        }
        xmlLines.push(Utils.getTabs(initIndent) + '</entryCriteria>');
        return xmlLines;
    }

}
module.exports = ApprovalProcessUtils;