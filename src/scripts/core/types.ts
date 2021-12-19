import { ApexFormatterConfig, ParserData } from '@aurahelper/core';
import * as vscode from 'vscode';

export interface ProviderActivationInfo {
    activation: string;
    activationTokens: ActivationToken[];
    startColumn: number;
    lastToken: any;
    twoLastToken: any;
    nextToken: any;
    twoNextToken: any;
    tokens?: any[];
}

export interface ActivationToken {
    activation: string,
    startToken: any,
    endToken: any,
    lastToken?: any,
    twoLastToken?: any,
    nextToken?: any,
    twoNextToken?: any,
    isQuery?: boolean,
    active?: boolean,
}

export interface ActivationType {
    type: string;
    name: string;
    params?: string[];
}

export interface NodeInfo {
    node: any,
    lastNode?: any,
    method?: any,
    methodVar?: any,
    classVar?: any,
    sObject?: any,
    label?: any,
    labels?: any,
    sObjectField?: any,
    sObjectFieldName?: string,
    namespace?: string
}

export interface Snippets {
    javascript: any;
    slds: any;
    aura: any;
    lwc: any;
}

export interface GitData {
    username?: string;
    email?: string;
    authorName?: string;
    authorEmail?: string;
    committerName?: string;
    committerEmail?: string;
    branch?: string;
}

export interface SalesforceData {
    username?: string;
    serverInstance?: string;
    namespace?: string;
    orgAvailableVersions?: any[];
    availablePermissions?: string[];
}

export interface ApplicationContext {
    context: vscode.ExtensionContext | any;
    componentsDetail: any;
    snippets: Snippets;
    parserData: ParserData;
    isAdvanceGUIAvailable: boolean;
    MIN_AH_CLI_VERSION: string;
    MIN_AH_SFDX_VERSION: string;
    ahPluginInstalled: boolean;
    gitData: GitData;
    sfData: SalesforceData;
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

export interface ConfigData {
    api: APIConfig;
    documentation: DocumentationConfig;
    intelliSense?: IntellisenseConfig;
    autoCompletion?: IntellisenseConfig;
    metadata: MetadataConfig;
    apexFormat: ApexFormatterConfig;
}