import * as vscode from 'vscode';

export interface BaseCommand {

    run(...args: any): void;
}

export interface ApexCommentTagKeyword {
    name: string;
    source?: string;
    message?: string;
}

export interface ApexCommentTagData {
    tagData: ApexCommentTag;
    tag: ApexCommentTag;
    tagName: string;
}

export interface ApexCommentTag {
    equalsTo?: string;
    symbol?: string;
    keywords?: ApexCommentTagKeyword[];
    template?: string;
    multiple?: boolean;
    anywhere?: boolean;
    source?: string;
}

export interface ApexCommentsObjectData {
    tags: string[];
    template: string[]
}

export interface ApexCommentsData {
    class: ApexCommentsObjectData;
    interface?: ApexCommentsObjectData;
    enum?: ApexCommentsObjectData;
    method: ApexCommentsObjectData;
    constructor?: ApexCommentsObjectData;
    variable: ApexCommentsObjectData;
    property?: ApexCommentsObjectData;
}

export interface ApexCommentTemplate {
    tagSymbol: string;
    tags: any;
    comments: {[key:string]: ApexCommentsObjectData};
}

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

export interface ParserData {
    sObjects: any;
    sObjectsData: { [key: string]: any };
    userClasses: any;
    userClassesData: { [key: string]: any };
    namespaceSummary: { [key: string]: any };
    namespacesData: { [key: string]: any };
    template?: ApexCommentTemplate
    namespaces: string[];
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
    gitData: GitData;
    sfData: SalesforceData;
}