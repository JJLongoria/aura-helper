import * as vscode from 'vscode';
const context: vscode.ExtensionContext | any = {};
const componentsDetail: any = {};
const isAdvanceGUIAvailable: boolean = false;
const MIN_AH_CLI_VERSION: string = '3.0.2';
const snippets: any = {
    javascript: {},
    slds: {},
    aura: {},
    lwc: {}
};
const gitData: any = {
    username: '',
    email: '',
    authorName: '',
    authorEmail: '',
    committerName: '',
    committerEmail: '',
    branch: ''
};
const sfData: any = {
    username: '',
    serverInstance: '',
    namespace: '',
    orgAvailableVersions: [],
    availablePermissions: [],
};
const parserData: any = {
    sObjects: [],
    sObjectsData: {},
    userClasses: [],
    userClassesData: {}, 
    namespaceSummary: {},
    namespacesData: {},
    template: {},
    namespaces: [],
};

export = {
    context,
    componentsDetail,
    snippets: snippets,
    parserData: parserData,
    isAdvanceGUIAvailable,
    MIN_AH_CLI_VERSION,
    gitData: gitData,
    sfData: sfData
};