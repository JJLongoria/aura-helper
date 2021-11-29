import * as vscode from 'vscode';

const applicationContext: ApplicationContext = {
    context: {},
    componentsDetail: {},
    snippets: {
        javascript: {},
        slds: {},
        aura: {},
        lwc: {},
    },
    parserData: {
        sObjects: {},
        sObjectsData: {},
        userClasses: {},
        userClassesData: {},
        namespaceSummary: {},
        namespacesData: {},
        template: {},
        namespaces: [],
    },
    isAdvanceGUIAvailable: false,
    MIN_AH_CLI_VERSION: '3.0.2',
    gitData: {
        username: undefined,
        email: undefined,
        authorName: undefined,
        authorEmail: undefined,
        committerName: undefined,
        committerEmail: undefined,
        branch: undefined,
    },
    sfData: {
        username: undefined,
        serverInstance: undefined,
        namespace: undefined,
        orgAvailableVersions: undefined,
        availablePermissions: undefined,
    },
};

export {
    applicationContext
};

export interface Snippets {
    javascript: any;
    slds: any;
    aura: any;
    lwc: any;
}

export interface ParserData {
    sObjects: any;
    sObjectsData: any;
    userClasses: any;
    userClassesData: any;
    namespaceSummary: any;
    namespacesData: any;
    template: any
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