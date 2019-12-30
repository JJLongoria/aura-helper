const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class AppMenuUtils { 

    static createAppMenu(appMenu) { 
        let newAppMenu;
        if (appMenu) {
            newAppMenu = Utils.prepareXML(appMenu, AppMenuUtils.createAppMenu());
        } else { 
            newAppMenu = {
                appMenuItems: [],
            };
        }
        return newAppMenu;
    }

    static createAppMenuItem(name, type) { 
        return {
            name: name,
            type: type
        }
    }

    static toXML(appMenu, compress) { 
        let xmlLines = [];
        if (appMenu) { 
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<AppMenu xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (appMenu.appMenuItems && appMenu.appMenuItems.length > 0) { 
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('appMenuItems', appMenu.appMenuItems, true, 1));
                }
                xmlLines.push('</AppMenu>');
            } else { 
                return AuraParser.toXML(appMenu);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = AppMenuUtils;