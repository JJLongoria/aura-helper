const context = {};
const componentsDetail = {};
const isAdvanceGUIAvailable = false;
const MIN_AH_CLI_VERSION = '3.0.0';
const snippets = {
    javascript: {},
    slds: {},
    aura: {},
    lwc: {}
}
const gitData = {
    username: '',
    email: '',
    authorName: '',
    authorEmail: '',
    committerName: '',
    committerEmail: '',
    branch: ''
};
const sfData = {
    username: '',
    serverInstance: '',
    namespace: '',
    orgAvailableVersions: [],
    availablePermissions: [],
};
const parserData = {
    sObjects: [],
    sObjectsData: {},
    userClasses: [],
    userClassesData: {}, 
    namespaceSummary: {},
    namespacesData: {},
    template: {},
    namespaces: [],
};

module.exports = {
    context,
    componentsDetail,
    snippets: snippets,
    parserData: parserData,
    isAdvanceGUIAvailable,
    MIN_AH_CLI_VERSION,
    gitData: gitData,
    sfData: sfData
}