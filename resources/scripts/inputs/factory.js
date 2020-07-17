const vscode = require('vscode');
const { Factory } = require('../metadata');

class InputFactory {

    static createCompressSelector() {
        return new Promise(async function (resolve) {
            let options = ['Yes', 'No'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Do you want to compress the file(s)?' });
            resolve(selectedOption);
        });
    }

    static createIgnoreOptionsSelector() {
        let items = [
            InputFactory.createQuickPickItem('Use Project Ignore File', undefined, 'Use .ahignore.json file on your project root'),
            InputFactory.createQuickPickItem('Use Custom Ignore File', undefined, 'Select custom ahignore file'),
        ];
        return createQuickPick(items);
    }

    static createIgnoreTypesSelector(typesToIgnore) {
        let items = [];
        for (let type of typesToIgnore) {
            items.push(InputFactory.createQuickPickItem(type, undefined, undefined, false));
        }
        let placeholder = 'Select types for ignore';
        return createQuickPick(items, placeholder, true);
    }

    static createRetrieveSpecialsSourceSelector() {
        let items = [
            InputFactory.createQuickPickItem('From Local', undefined, 'Retrieve Special types only with your local project metadata types'),
            InputFactory.createQuickPickItem('From Org', undefined, 'Retrieve Special types only with your Auth org metadata types'),
            InputFactory.createQuickPickItem('Mixed', undefined, 'Retrieve Special types from yout local project with data from org')
        ];
        return createQuickPick(items);
    }

    static createPackageSourcesSelector() {
        let items = [
            InputFactory.createQuickPickItem('From Local', undefined, 'Get Metadata Types from your local project for create the package'),
            InputFactory.createQuickPickItem('From Org', undefined, 'Get Metadata Types from your Auth Org for create the package')
        ];
        return createQuickPick(items);
    }

    static createPackageOptionSelector() {
        let items = [
            InputFactory.createQuickPickItem('For Deploy or Retrieve', undefined, 'Select metadata for create a package file for deploy or retrieve'),
            InputFactory.createQuickPickItem('For Delete', undefined, 'Select metadata from create a destructive file for delete')
        ];
        return createQuickPick(items);
    }

    static createPackageDeleteOrderSelector() {
        let items = [
            InputFactory.createQuickPickItem('Before Deploy', undefined, 'Create destructive package for delete before deploy'),
            InputFactory.createQuickPickItem('After Deploy', undefined, 'Create destructive package for delete after deploy')
        ];
        return createQuickPick(items);
    }

    static createIncludeOrgNamespaceSelector() {
        let items = [
            InputFactory.createQuickPickItem('Org Namespace', undefined, 'Include data only from the Org Namespace'),
            InputFactory.createQuickPickItem('All Namespaces', undefined, 'Include data from All Namespaces')
        ];
        return createQuickPick(items);
    }

    static createPackageExplicitSelector() {
        let items = [
            InputFactory.createQuickPickItem('Explicit', undefined, 'Include objects explicit on package file (recommended for retrieve)'),
            InputFactory.createQuickPickItem('Wildcards', undefined, 'Use wildcards on package when apply')
        ];
        return createQuickPick(items);
    }

    static createPackageSaveOnSelector() {
        let items = [
            InputFactory.createQuickPickItem('Manifest folder', undefined, 'Save package file on project\'s manifest folder'),
            InputFactory.createQuickPickItem('Select folder', undefined, 'Select a custom folder for save the package file')
        ];
        return createQuickPick(items);
    }

    static createRepairOptionSelector() {
        let items = [
            InputFactory.createQuickPickItem('Repair', undefined, 'Fix dependency errors automatically'),
            InputFactory.createQuickPickItem('Check Errors', undefined, 'Check for dependency errors in the project')
        ];
        return createQuickPick(items);
    }

    static createCompareOptioniSelector() {
        let items = [
            InputFactory.createQuickPickItem('Compare Local and Org', undefined, 'Compare your local project with your auth org for get the differences'),
            InputFactory.createQuickPickItem('Compare Different Orgs', undefined, 'Compare two different orgs for get the differences')
        ];
        return createQuickPick(items);
    }

    static createAuthOrgsSelector(authsOrgs, isSource) {
        let items = [];
        for (let authOrg of authsOrgs) {
            if (authOrg.active)
                items.push(InputFactory.createQuickPickItem('$(check) ' + authOrg.alias, authOrg.username, 'Project Auth Org'));
            else
                items.push(InputFactory.createQuickPickItem(authOrg.alias, authOrg.username));
        }
        let placeholder = 'Select one Auth Org as Source to compare';
        if (!isSource)
            placeholder = 'Select one Auth Org as Target to compare';
        return createQuickPick(items, placeholder);
    }

    static createQuickPickItem(label, description, detail, picked) {
        return {
            description: description,
            detail: detail,
            label: label,
            picked: picked
        }
    }

}
module.exports = InputFactory;

function createQuickPick(items, placeholder, pickMany, alwaysOnTop) {
    if (!placeholder)
        placeholder = 'Select an option';
    return new Promise((resolve) => {
        let input = vscode.window.createQuickPick();
        input.placeholder = placeholder;
        input.items = items;
        input.canSelectMany = pickMany;
        input.ignoreFocusOut = alwaysOnTop;
        input.onDidChangeSelection((items) => {
            if (!input.canSelectMany) {
                let labels = [];
                for (let item of items) {
                    labels.push(item.label);
                }
                input.dispose();
                resolve(labels.join(','));
            }
        });
        input.onDidAccept((item) => {
            if (input.canSelectMany) {
                let labels = [];
                if (input.selectedItems && input.selectedItems.length > 0) {
                    for (let item of input.selectedItems) {
                        labels.push(item.label);
                    }
                }
                resolve(labels.join(','));
            }
        });
        input.show();
    });
}