const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class BotUtils {

    static createBot(bot) {
        let newBot;
        if (bot) {
            newBot = Utils.prepareXML(bot, BotUtils.createBot());
        } else {
            newBot = {
                botMlDomain: undefined,
                botUser: undefined,
                botVersions: undefined,
                contextVariables: undefined,
                description: undefined,
                fullName: undefined,
                label: undefined,
            };
        }
        return newBot;
    }

    static createConversationContextVariable(contextVariableMappings, dataType, developerName, label, SObjectType) {
        return {
            contextVariableMappings: contextVariableMappings,
            dataType: dataType,
            developerName: developerName,
            label: label,
            SObjectType: SObjectType
        }
    }

    static createConversationContextVariableMapping(fieldName, messageType, SObjectType) {
        return {
            fieldName: fieldName,
            messageType: messageType,
            SObjectType: SObjectType
        }
    }

    static createLocaMIDomain(label, mlIntents, mlSlotClasses, name) {
        return {
            label: label,
            mlIntents: mlIntents,
            mlSlotClasses: mlSlotClasses,
            name: name
        }
    }

    static createBotVersion(fullName, botDialogGroups, botDialogs, conversationVariables, entryDialog, mainMenuDialog, responseDelayMilliseconds) {
        return {
            botDialogGroups: botDialogGroups,
            botDialogs: botDialogs,
            conversationVariables: conversationVariables,
            entryDialog: entryDialog,
            fullName: fullName,
            mainMenuDialog: mainMenuDialog,
            responseDelayMilliseconds: responseDelayMilliseconds
        }
    }

    static createBotDialogGroup(description, developerName, label) {
        return {
            description: description,
            developerName: developerName,
            label: label
        }
    }

    static createBotDialog(botDialogGroup, botSteps, description, developerName, label, mlIntent, mlIntentTrainingEnabled, showInFooterMenu) {
        return {
            botDialogGroup: botDialogGroup,
            botSteps: botSteps,
            description: description,
            developerName: developerName,
            label: label,
            mlIntent: mlIntent,
            mlIntentTrainingEnabled: mlIntentTrainingEnabled,
            showInFooterMenu: showInFooterMenu
        }
    }

    static createBotStep(booleanFilter, botInvocation, botMessages, botNavigation, botStepConditions, botSteps, botVariableOperation, conversationRecordLookup, conversationSystemMessage, conversationVariableType, type) {
        return {
            booleanFilter: booleanFilter,
            botInvocation: botInvocation,
            botMessages: botMessages,
            botNavigation: botNavigation,
            botStepConditions: botStepConditions,
            botSteps: botSteps,
            botVariableOperation: botVariableOperation,
            conversationRecordLookup: conversationRecordLookup,
            conversationSystemMessage: conversationSystemMessage,
            conversationVariableType: conversationVariableType,
            type: type
        }
    }

    static createBotInvocation(invocationActionName, invocationActionType, invocationMappings) {
        return {
            invocationActionName: invocationActionName,
            invocationActionType: invocationActionType,
            invocationMappings: invocationMappings
        }
    }

    static createBotInvocationMapping(parameterName, type, value, variableName, variableType) {
        return {
            parameterName: parameterName,
            type: type,
            value: value,
            variableName: variableName,
            variableType: variableType
        }
    }

    static createBotMessage(message) {
        return {
            message: message
        }
    }

    static createBotNavigation(botNavigationLinks, type) {
        return {
            botNavigationLinks: botNavigationLinks,
            type: type
        }
    }

    static createBotNavigationLink(label, targetBotDialog) {
        return {
            label: label,
            targetBotDialog: targetBotDialog
        }
    }

    static createBotStepCondition(leftOperandName, leftOperandType, operatorType, rightOperandValue) {
        return {
            leftOperandName: leftOperandName,
            leftOperandType: leftOperandType,
            operatorType: operatorType,
            rightOperandValue: rightOperandValue
        }
    }

    static createBotVariableOperation(botInvocation, botMessages, botQuickReplyOptions, botVariableOperands, invalidInputBotNavigation, quickReplyOptionTemplate, quickReplyType, quickReplyWidgetType, sourceVariableName, sourceVariableType, type) {
        return {
            botInvocation: botInvocation,
            botMessages: botMessages,
            botQuickReplyOptions: botQuickReplyOptions,
            botVariableOperands: botVariableOperands,
            invalidInputBotNavigation: invalidInputBotNavigation,
            quickReplyOptionTemplate: quickReplyOptionTemplate,
            quickReplyType: quickReplyType,
            quickReplyWidgetType: quickReplyWidgetType,
            sourceVariableName: sourceVariableName,
            sourceVariableType: sourceVariableType,
            type: type
        }
    }

    static createBotQuickReplyOption(literalValue) {
        return {
            literalValue: literalValue
        }
    }

    static createBotVariableOperand(disableAutoFill, sourceName, sourceType, sourceValue, targetName, targetType) {
        return {
            disableAutoFill: disableAutoFill,
            sourceName: sourceName,
            sourceType: sourceType,
            sourceValue: sourceValue,
            targetName: targetName,
            targetType: targetType
        }
    }

    static createConversationSystemMessage(systemMessageMappings, type) {
        return {
            systemMessageMappings: systemMessageMappings,
            type: type
        }
    }

    static createConversationSystemMessageMapping(mappingType, parameterType, variableName) {
        return {
            mappingType: mappingType,
            parameterType: parameterType,
            variableName: variableName
        }
    }

    static createConversationVariable(collectionType, dataType, developerName, label, SObjectType) {
        return {
            collectionType: collectionType,
            dataType: dataType,
            developerName: developerName,
            label: label,
            SObjectType: SObjectType
        }
    }

    static toXML(bot, compress) {
        let xmlLines = [];
        if (bot) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Bot xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (bot.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', bot.fullName));
                if (bot.label !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', bot.label));
                if (bot.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', bot.description));
                if (bot.botUser !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('botUser', bot.botUser));
                if (bot.botMlDomain) 
                    xmlLines = xmlLines.concat(BotUtils.getBotMlDomainXMLLines(bot.botMlDomain, 1));
                if (bot.contextVariables)
                    xmlLines = xmlLines.concat(BotUtils.getContextVariablesXMLLines(bot.contextVariables, 1));
                if (bot.botVersions) 
                    xmlLines = xmlLines.concat(BotUtils.getBotVersionsXMLLines(bot.botVersions, 1));
                xmlLines.push('</Bot>');
            } else {
                return AuraParser.toXML(bot);
            }
        }
        return xmlLines.join('\n');
    }

    static getBotMlDomainXMLLines(botMlDomain, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<botMlDomain>');
        if (botMlDomain.label !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', botMlDomain.label));
        if (botMlDomain.name !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', botMlDomain.name));
        if (botMlDomain.mlIntents !== undefined) {
            xmlLines = xmlLines.concat(BotUtils.getMLLIntentsXMLLines(botMlDomain.mlIntents, initIndent + 1));
        }
        if (botMlDomain.mlSlotClasses !== undefined) {
            xmlLines = xmlLines.concat(BotUtils.getSlotClassesXMLLines(botMlDomain.mlSlotClasses, initIndent + 1));
        }
        xmlLines.push(Utils.getTabs(initIndent) + '</botMlDomain>');
        return xmlLines;
    }

    static getMLLIntentsXMLLines(mlIntents, initIndent) {
        let xmlLines = [];
        let intents = Utils.forceArray(mlIntents);
        for (const intent of intents) {
            xmlLines.push(Utils.getTabs(initIndent) + '<mlIntents>');
            if (intent.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', intent.developerName));
            if (intent.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', intent.description));
            if (intent.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', intent.label));
            if (intent.mlIntentUtterances)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('mlIntentUtterances', intent.mlIntentUtterances, true, initIndent + 1));
            if (intent.relatedMlIntents)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('relatedMlIntents', intent.relatedMlIntents, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</mlIntents>');
        }
        return xmlLines;
    }

    static getSlotClassesXMLLines(mlSlotClasses, initIndent) {
        let xmlLines = [];
        let slots = Utils.forceArray(mlSlotClasses);
        for (const slot of slots) {
            xmlLines.push(Utils.getTabs(initIndent) + '<mlSlotClasses>');
            if (slot.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', slot.developerName));
            if (slot.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', slot.description));
            if (slot.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', slot.label));
            if (slot.extractionRegex !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('extractionRegex', slot.extractionRegex));
            if (slot.extractionType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('extractionType', slot.extractionType));
            if (slot.mlSlotClassValues) {
                let classValues = Utils.forceArray(slot.mlSlotClassValues);
                for (const classValue of classValues) {
                    xmlLines.push(Utils.getTabs(initIndent + 1) + '<mlSlotClassValues>');
                    if (classValue.value !== undefined)
                        xmlLines.push(Utils.getTabs(initIndent + 2) + Utils.getXMLTag('value', classValue.value));
                    if (classValue.synonymGroup !== undefined)
                        xmlLines = xmlLines.concat(Utils.getXMLBlock('synonymGroup', classValue.synonymGroup, true, initIndent + 2));
                    xmlLines.push(Utils.getTabs(initIndent + 1) + '</mlSlotClassValues>');
                }
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</mlSlotClasses>');
        }
        return xmlLines;
    }

    static getContextVariablesXMLLines(contextVariables, initIndent) {
        let xmlLines = [];
        let contextVars = Utils.forceArray(contextVariables);
        for (const contextVar of contextVars) {
            xmlLines.push(Utils.getTabs(initIndent) + '<contextVariables>');
            if (contextVar.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', contextVar.developerName));
            if (contextVar.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', contextVar.label));
            if (contextVar.SObjectType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('SObjectType', contextVar.SObjectType));
            if (contextVar.dataType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('dataType', contextVar.dataType));
            if (contextVar.contextVariableMappings !== undefined)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('contextVariableMappings', contextVar.contextVariableMappings, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</contextVariables>');
        }
        return xmlLines;
    }

    static getBotVersionsXMLLines(botVersions, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<botVersions>');
        if (botVersions.fullName !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', botVersions.fullName));
        if (botVersions.entryDialog !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('entryDialog', botVersions.entryDialog));
        if (botVersions.mainMenuDialog !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('mainMenuDialog', botVersions.mainMenuDialog));
        if (botVersions.responseDelayMilliseconds !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('responseDelayMilliseconds', botVersions.responseDelayMilliseconds));
        if (botVersions.botDialogGroups) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('botDialogGroups', botVersions.botDialogGroups, true, initIndent + 1));
        }
        if (botVersions.botDialogs)
            xmlLines = xmlLines.concat(BotUtils.getBotDialogsXMLLines(botVersions.botDialogs, initIndent + 1));
        if (botVersions.conversationVariables) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('conversationVariables', botVersions.conversationVariables, true, initIndent + 1));
        }
        xmlLines.push('\t</botVersions>');
        return xmlLines;
    }

    static getBotDialogsXMLLines(botDialogs, initIndent) {
        let xmlLines = [];
        let dialogs = Utils.forceArray(botDialogs);
        for (const botDialog of dialogs) {
            xmlLines.push(Utils.getTabs(initIndent) + '<botDialogs>');
            if (botDialog.developerName !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('developerName', botDialog.developerName));
            if (botDialog.label !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', botDialog.label));
            if (botDialog.description !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', botDialog.description));
            if (botDialog.botDialogGroup !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('botDialogGroup', botDialog.botDialogGroup));
            if (botDialog.mlIntent !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('mlIntent', botDialog.mlIntent));
            if (botDialog.mlIntentTrainingEnabled !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('mlIntentTrainingEnabled', botDialog.mlIntentTrainingEnabled));
            if (botDialog.showInFooterMenu !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showInFooterMenu', botDialog.showInFooterMenu));
            if (botDialog.botSteps) {
                xmlLines = xmlLines.concat(BotUtils.getBotStepXMLLines(botDialog.botSteps, initIndent + 1));
            }
            xmlLines.push(Utils.getTabs(initIndent) + '</botDialogs>');
        }
        return xmlLines;
    }

    static getBotStepXMLLines(botStepsForProcess, initIndent) {
        let xmlLines = [];
        let botSteps = Utils.forceArray(botStepsForProcess);
        for (const botStep of botSteps) {
            xmlLines.push(Utils.getTabs(initIndent) + '<botSteps>');
            if (botStep.booleanFilter !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', botStep.booleanFilter));
            if (botStep.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', botStep.type));
            if (botStep.conversationVariableType !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('conversationVariableType', botStep.conversationVariableType));
            if (botStep.conversationRecordLookup !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('conversationRecordLookup', botStep.conversationRecordLookup));
            if (botStep.botInvocation !== undefined)
                xmlLines = xmlLines.concat(BotUtils.getBotInvocationXMLLines(botStep.botInvocation, initIndent + 1));
            if (botStep.botMessages)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('botMessages', botStep.botMessages, true, initIndent + 1));
            if (botStep.botNavigation)
                xmlLines = xmlLines.concat(BotUtils.getBotNavigationXMLLines(botStep.botNavigation, initIndent + 1));
            if (botStep.botStepConditions) {
                xmlLines = xmlLines.concat(Utils.getXMLBlock('botStepConditions', botStep.botStepConditions, true, initIndent + 1));
            }
            if (botStep.botSteps)
                xmlLines = xmlLines.concat(BotUtils.getBotStepXMLLines(botStep.botSteps, initIndent + 1));
            if (botStep.botVariableOperation)
                xmlLines = xmlLines.concat(BotUtils.getBotVariableOperationXMLLines(botStep.botVariableOperation, initIndent + 1));
            if (botStep.conversationSystemMessage)
                xmlLines = xmlLines.concat(BotUtils.getConversationSystemMessageXMLLines(botStep.conversationSystemMessage, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</botSteps>');
        }
        return xmlLines;
    }

    static getBotInvocationXMLLines(botInvocation, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent + 1) + '<botInvocation>');
        if (botInvocation.invocationActionName !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 2) + Utils.getXMLTag('invocationActionName', botInvocation.invocationActionName));
        if (botInvocation.invocationActionType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 2) + Utils.getXMLTag('invocationActionType', botInvocation.invocationActionType));
        if (botInvocation.invocationMappings !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('invocationMappings', botInvocation.invocationMappings, true, initIndent + 2));
        }
        xmlLines.push(Utils.getTabs(initIndent + 1) + '</botInvocation>');
        return xmlLines;
    }

    static getBotNavigationXMLLines(botNavigation, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<botNavigation>');
        if (botNavigation.type !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', botNavigation.type));
        if (botNavigation.botNavigationLinks !== undefined)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('botNavigationLinks', botNavigation.botNavigationLinks, true, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</botNavigation>');
        return xmlLines;
    }

    static getBotVariableOperationXMLLines(botVariableOperation, initIndent) {
        let xmlLines = [];
        xmlLines.push(Utils.getTabs(initIndent) + '<botVariableOperation>');
        if (botVariableOperation.sourceVariableName !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sourceVariableName', botVariableOperation.sourceVariableName));
        if (botVariableOperation.sourceVariableType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sourceVariableType', botVariableOperation.sourceVariableType));
        if (botVariableOperation.type !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', botVariableOperation.type));
        if (botVariableOperation.quickReplyWidgetType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('quickReplyWidgetType', botVariableOperation.quickReplyWidgetType));
        if (botVariableOperation.quickReplyType !== undefined)
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('quickReplyType', botVariableOperation.quickReplyType));
        if (botVariableOperation.botInvocation !== undefined)
            xmlLines = xmlLines.concat(BotUtils.getBotInvocationXMLLines(botVariableOperation.botInvocation, initIndent + 1));
        if (botVariableOperation.botMessages)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('botMessages', botVariableOperation.botMessages, true, initIndent + 1));
        if (botVariableOperation.botQuickReplyOptions)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('botQuickReplyOptions', botVariableOperation.botQuickReplyOptions, true, initIndent + 1));
        if (botVariableOperation.botVariableOperands)
            xmlLines = xmlLines.concat(Utils.getXMLBlock('botVariableOperands', botVariableOperation.botVariableOperands, true, initIndent + 1));
        if (botVariableOperation.invalidInputBotNavigation)
            xmlLines = xmlLines.concat(BotUtils.getBotNavigationXMLLines(botVariableOperation.invalidInputBotNavigation, initIndent + 1));
        xmlLines.push(Utils.getTabs(initIndent) + '</botVariableOperation>');
        return xmlLines;
    }

    static getConversationSystemMessageXMLLines(conversationSystemMessage, initIndent) {
        let xmlLines = [];
        let messages = Utils.forceArray(conversationSystemMessage);
        for (const systemMessage of messages) {
            xmlLines.push(Utils.getTabs(initIndent) + '<conversationSystemMessage>');
            if (systemMessage.type !== undefined)
                xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', systemMessage.type));
            if (systemMessage.systemMessageMappings)
                xmlLines = xmlLines.concat(Utils.getXMLBlock('systemMessageMappings', systemMessage.systemMessageMappings, true, initIndent + 1));
            xmlLines.push(Utils.getTabs(initIndent) + '</conversationSystemMessage>');
        }
        return xmlLines;
    }
}
module.exports = BotUtils;