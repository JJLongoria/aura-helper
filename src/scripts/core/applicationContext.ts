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
        sObjects: {},
        sObjectsData: {},
        userClasses: {},
        userClassesData: {},
        namespaceSummary: {},
        namespacesData: {},
        template: undefined,
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

