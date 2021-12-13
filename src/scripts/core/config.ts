import * as vscode from 'vscode';
import { Paths } from './paths';
import { applicationContext } from './applicationContext';
import { ConfigData } from './types';
import { CoreUtils } from '@aurahelper/core';
import { XMLCompressor } from '@aurahelper/xml-compressor';
const ProjectUtils = CoreUtils.ProjectUtils;
const XML_SORT_ORDER = XMLCompressor.getSortOrderValues();
const SORT_ORDER_CONFIG_VALUES_MAP: any = {};
SORT_ORDER_CONFIG_VALUES_MAP["Simple XML Elements First"] = XML_SORT_ORDER.SIMPLE_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Complex XML Elements First"] = XML_SORT_ORDER.COMPLEX_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Asc"] = XML_SORT_ORDER.ALPHABET_ASC;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Desc"] = XML_SORT_ORDER.ALPHABET_DESC;

export class Config {

    static getTabSize(): number {
        const tabSize = vscode.window.activeTextEditor!.options.tabSize;
        if(tabSize){
            return Number(tabSize);
        }
        return 4;
    }

    static insertSpaces(): boolean{
        const insertSpaces =  vscode.window.activeTextEditor!.options.insertSpaces;
        if(insertSpaces === true || insertSpaces === 'true'){
            return true;
        }
        return false;
    }

    static getConfig(): ConfigData {
        const config: any = vscode.workspace.getConfiguration('aurahelper');
        const configData: ConfigData = config;
        return configData;
    }

    static useAuraHelperCLI(): boolean {
        return Config.getConfig().api.useAuraHelperCLI;
    }

    static getExecutionContext(): string {
        return Config.useAuraHelperCLI() ? 'Aura Helper CLI' : 'VSCode';
    }

    static getXMLSortOrder(): string {
        return SORT_ORDER_CONFIG_VALUES_MAP[Config.getConfig().metadata.xmlSortOrder];
    }

    static getAPIVersion(): string {
        if (Config.getConfig().metadata.useCustomAPIVersion) {
            return ProjectUtils.getApiAsString(Config.getConfig().metadata.customAPIVersion);
        }
        return ProjectUtils.getProjectConfig(Paths.getProjectFolder())!.sourceApiVersion;
    }

    static getNamespace(): string {
        return applicationContext.sfData.namespace || ProjectUtils.getOrgNamespace(Paths.getProjectFolder());
    }

    static getOrgAlias(): string {
        return ProjectUtils.getOrgAlias(Paths.getProjectFolder()) || '';
    }
}
