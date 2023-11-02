import { ApplicationContext } from '../core/types';

export const applicationContext: ApplicationContext = {
    context: {},
    componentsDetail: {},
    snippets: {
        javascript: {},
        slds: {},
        aura: {},
        lwc: {},
    },
    parserData: {
        sObjects: [],
        sObjectsData: {},
        userClasses: [],
        userClassesData: {},
        namespaceSummary: {},
        namespacesData: {},
        template: undefined,
        namespaces: [],
    },
    isAdvanceGUIAvailable: false,
    ahSFDXPluginInstalled: false,
    ahSFPluginInstalled: false,
    MIN_AH_CLI_VERSION: '4.0.3',
    MIN_AH_SFDX_VERSION: '1.0.1',
    MIN_AH_SF_VERSION: '1.0.0',
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

