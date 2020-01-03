const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class Territory2ModelUtils {

    static createTerritory2Model(territory2Model) {
        let newTerritory2Model;
        if (territory2Model) {
            newTerritory2Model = Utils.prepareXML(territory2Model, Territory2ModelUtils.createTerritory2Model());
        } else {
            newTerritory2Model = {
                customFields: [],
                description: undefined,
                fullName: undefined,
                name: undefined,
            };
        }
        return newTerritory2Model;
    }

    static createFieldValue(name, value) {
        return {
            name: name,
            value: value
        }
    }

    static toXML(territory2Model, compress) {
        let xmlLines = [];
        if (territory2Model) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<Territory2Model xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">');
                if (territory2Model.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', territory2Model.fullName));
                if (territory2Model.name !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('name', territory2Model.name));
                if (territory2Model.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', territory2Model.description));
                if (territory2Model.customFields !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customFields', territory2Model.customFields, true, 1));
                xmlLines.push('</Territory2Model>');
            } else {
                return AuraParser.toXML(territory2Model);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = Territory2ModelUtils;