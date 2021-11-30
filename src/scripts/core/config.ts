import * as vscode from 'vscode';
import { Paths } from './paths';
import { applicationContext } from './applicationContext';
const { CoreUtils } = require('@aurahelper/core');
const XMLCompressor = require('@aurahelper/xml-compressor');
const ProjectUtils = CoreUtils.ProjectUtils;
const XML_SORT_ORDER = XMLCompressor.getSortOrderValues();
const SORT_ORDER_CONFIG_VALUES_MAP: any = {};
SORT_ORDER_CONFIG_VALUES_MAP["Simple XML Elements First"] = XML_SORT_ORDER.SIMPLE_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Complex XML Elements First"] = XML_SORT_ORDER.COMPLEX_FIRST;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Asc"] = XML_SORT_ORDER.ALPHABET_ASC;
SORT_ORDER_CONFIG_VALUES_MAP["Alphabet Desc"] = XML_SORT_ORDER.ALPHABET_DESC;

export class Config {

    static getTabSize(): string | number | undefined {
        return vscode.window.activeTextEditor!.options.tabSize;
    }

    static insertSpaces(): boolean | string | undefined {
        return vscode.window.activeTextEditor!.options.insertSpaces;
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
        return ProjectUtils.getProjectConfig(Paths.getProjectFolder()).sourceApiVersion;
    }

    static getNamespace(): string {
        return applicationContext.sfData.namespace || ProjectUtils.getOrgNamespace(Paths.getProjectFolder());
    }

    static getOrgAlias(): string {
        return ProjectUtils.getOrgAlias(Paths.getProjectFolder());
    }
}

export interface APIConfig {
    useAuraHelperCLI: boolean;
}

export interface DocumentationConfig {
    useStandardJavaComments: boolean;
}

export interface IntellisenseConfig {
    enableHoverInformation: boolean;
    activeAttributeSuggest: boolean;
    activeControllerFunctionsSuggest: boolean;
    activeHelperFunctionsSuggest: boolean;
    activeControllerMethodsSuggest: boolean;
    activeComponentSuggest: boolean;
    activeComponentCallSuggest: boolean;
    activeCustomComponentCallSuggest: boolean;
    activeApexCommentSuggestion: boolean;
    activeSObjectSuggestion: boolean;
    activeSobjectFieldsSuggestion: boolean;
    activeQuerySuggestion: boolean;
    activeApexSuggestion: boolean;
}

export interface AutoCompletionConfig {
    activeAttributeSuggest: boolean;
    activeControllerFunctionsSuggest: boolean;
    activeHelperFunctionsSuggest: boolean;
    activeControllerMethodsSuggest: boolean;
    activeComponentSuggest: boolean;
    activeComponentCallSuggest: boolean;
    activeCustomComponentCallSuggest: boolean;
    activeApexCommentSuggestion: boolean;
    activeSObjectSuggestion: boolean;
    activeSobjectFieldsSuggestion: boolean;
    activeQuerySuggestion: boolean;
    activeApexSuggestion: boolean;
}

export interface MetadataConfig {
    refreshSObjectDefinitionsOnStart: boolean;
    useCustomAPIVersion: boolean;
    customAPIVersion: number;
    groupGlobalQuickActions: boolean;
    xmlSortOrder: string;
}

export interface ApexFormatterConfig {
    punctuation: ApexFormatterPunctuationConfig;
    operator: ApexFormatterOperatorConfig;
    classMembers: ApexFormatterMembersConfig;
    comment: ApexFormatterCommentConfig;
    query: ApexFormatterQueryConfig;
}

export interface ApexFormatterPunctuationConfig {
    maxBlankLines: number;
    openCurlyBracketOnNewLine: boolean;
    addNewLineAfterCloseCurlyBracket: boolean;
    addWhitespaceAfterCloseCurlyBracket: boolean;
    addWhitespaceBeforeOpenCurlyBracket: boolean;
    addWhitespaceBeforeOpenGuardParenthesis: boolean;
    addWhitespaceAfterOpenGuardParenthesis: boolean;
    addWhitespaceBeforeCloseGuardParenthesis: boolean;
    addWhiteSpaceAfterComma: boolean;
    addWhitespaceBeforeOpenTriggerEvents: boolean;
}

export interface ApexFormatterOperatorConfig {
    addWhitespaceBeforeOperator: boolean;
    addWhitespaceAfterOperator: boolean;
    addWhitespaceAfterOpenParenthesisOperator: boolean;
    addWhitespaceBeforeCloseParenthesisOperator: boolean;
}

export interface ApexFormatterMembersConfig {
    newLinesBetweenCodeBlockMembers: number;
    newLinesBetweenGetterAndSetterAccessor: number;
    singleLineProperties: boolean;
    newLinesBetweenClassFields: number;
}

export interface ApexFormatterCommentConfig {
    holdBeforeWhitespacesOnLineComment: boolean;
    holdAfterWhitespacesOnLineComment: boolean;
    newLinesBewteenComments: number;
}

export interface ApexFormatterQueryConfig {
    oneClausePerLine: boolean;
    oneProjectionFieldPerLine: boolean;
    maxProjectionFieldPerLine: number;
}

export interface ConfigData {
    api: APIConfig;
    documentation: DocumentationConfig;
    intelliSense?: IntellisenseConfig;
    autoCompletion?: IntellisenseConfig;
    metadata: MetadataConfig;
    apexFormat: ApexFormatterConfig;

}