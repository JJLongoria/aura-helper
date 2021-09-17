const vscode = require('vscode');
const { CoreUtils } = require('@ah/core');
const XMLCompressor = require('@ah/xml-compressor');
const ProjectUtils = CoreUtils.ProjectUtils;
const Paths = require('../core/paths');
const appContext = require('./applicationContext');
const XML_SORT_ORDER = XMLCompressor.getSortOrderValues();
const SORT_ORDER_CONFIG_VALUES_MAP = {};
SORT_ORDER_CONFIG_VALUES_MAP["Simple XML Elements First"] = XML_SORT_ORDER.SIMPLE_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Complex XML Elements First"] = XML_SORT_ORDER.COMPLEX_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Asc"] = XML_SORT_ORDER.ALPHABET_ASC;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Desc"] = XML_SORT_ORDER.ALPHABET_DESC;

class Config {

    static getConfig() {
        return vscode.workspace.getConfiguration('aurahelper');
    }

    static useAuraHelperCLI(){
        return Config.getConfig().api.useAuraHelperCLI;
    }

    static getExecutionContext(){
        return Config.useAuraHelperCLI() ? 'Aura Helper CLI' :'VSCode';
    }

    static getXMLSortOrder(){
        return SORT_ORDER_CONFIG_VALUES_MAP[Config.getConfig().metadata.XmlSortOrder];
    }

    static getAPIVersion() {
        if (Config.getConfig().metadata.useCustomAPIVersion) {
            return ProjectUtils.getApiAsString(Config.getConfig().metadata.CustomAPIVersion);
        }
        return ProjectUtils.getProjectConfig(Paths.getProjectFolder()).sourceApiVersion;
    }

    static getNamespace(){
        return ProjectUtils.getOrgNamespace(Paths.getProjectFolder());
    }

    static getOrgAlias(){
        return ProjectUtils.getOrgAlias(Paths.getProjectFolder());
    }
}
module.exports = Config;