const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

class KeywordListUtils {

    static createKeywordList(keywordList) {
        let newKeywordList;
        if (keywordList) {
            newKeywordList = Utils.prepareXML(keywordList, KeywordListUtils.createKeywordList());
        } else {
            newKeywordList = {
                description: undefined,
                fullName: undefined,
                keywords: [],
                masterLabel: undefined
            };
        }
        return newKeywordList;
    }

    static createKeyword(keyword) {
        return {
            keyword: keyword
        }
    }

    static toXML(keywordList, compress) {
        let xmlLines = [];
        if (keywordList) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<KeywordList xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (keywordList.fullName !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', keywordList.fullName));
                if (keywordList.description !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', keywordList.description));
                if (keywordList.masterLabel !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', keywordList.masterLabel));
                if (keywordList.keywords !== undefined)
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('keywords', keywordList.keywords, true, 1));
                xmlLines.push('</KeywordList>');
            } else {
                return AuraParser.toXML(keywordList);
            }
        }
        return xmlLines.join('\n');
    }

}
module.exports = KeywordListUtils;