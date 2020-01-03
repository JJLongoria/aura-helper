const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class QueueUtils {

    static createQueue(queue) {
        let newQueue;
        if (queue) {
            newQueue = Utils.prepareXML(queue, QueueUtils.createQueue());
        } else {
            newQueue = {
                doesSendEmailToMembers: undefined,
                email: undefined,
                name: undefined,
                queueMembers: [],
                queueRoutingConfig: undefined,
                queueSobject: []
            };
        }
        return newQueue;
    }

    static createQueueMembers(publicGroups, roleAndSubordinates, roleAndSubordinatesInternal, roles, users) {
        return {
            publicGroups: Utils.forceArray(publicGroups),
            roleAndSubordinates: Utils.forceArray(roleAndSubordinates),
            roleAndSubordinatesInternal: Utils.forceArray(roleAndSubordinatesInternal),
            roles: Utils.forceArray(roles),
            users: Utils.forceArray(users)
        }
    }

    static createPublicGroups(publicGroup) {
        return {
            publicGroup: publicGroup
        }
    }

    static createRoleAndSubordinates(roleAndSubordinate) {
        return {
            roleAndSubordinate: roleAndSubordinate
        }
    }

    static createRoleAndSubordinatesInternal(roleAndSubordinateInternal) {
        return {
            roleAndSubordinateInternal: roleAndSubordinateInternal
        }
    }

    static createRoles(role) {
        return {
            role: role
        }
    }

    static createUsers(user) {
        return {
            user: user
        }
    }

    static createQueueSobject(sobjectType) {
        return {
            sobjectType: sobjectType
        }
    }

    static toXML(queue, compress) {
        let xmlLines = [];
        if (queue) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Queue xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (queue.name)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', queue.name));
                if (queue.email)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('email', queue.email));
                if (queue.doesSendEmailToMembers)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('doesSendEmailToMembers', queue.doesSendEmailToMembers));
                if (queue.queueRoutingConfig)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('queueRoutingConfig', queue.queueRoutingConfig));
                if (queue.queueSobject)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('queueSobject', queue.queueSobject, true, 1));
                if (queue.queueMembers)
                    xmlLines = xmlLines.concat(QueueUtils.getQueueMembersXMLLines(queue.queueMembers, 1));
                xmlLines.push('</Queue>');
            } else {
                return AuraParser.toXML(queue);
            }
        }
        return xmlLines.join('\n');
    }

    static getQueueMembersXMLLines(queueMembers, initIndent) {
        let xmlLines = [];
        for (const member of queueMembers) {
            
        }
        return xmlLines;
    }

}
module.exports = QueueUtils;