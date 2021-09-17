const vscode = require('vscode');
const Paths = require('../core/paths');

class InputFactory {

    static createSingleSelectorInput(values, placeholder, alwaysOnTop) {
        const items = [];
        for (const value of values) {
            items.push(InputFactory.createQuickPickItem(value, undefined, undefined, false));
        }
        return createQuickPick(items, placeholder, false, alwaysOnTop);
    }

    static createMultiSelectorInput(values, placeholder, alwaysOnTop) {
        const items = [];
        for (const value of values) {
            if (typeof value === 'string')
                items.push(InputFactory.createQuickPickItem(value));
            else {
                if (value.type === 'boolean') {
                    items.push(InputFactory.createQuickPickItem(value.name, undefined, undefined, value.value));
                }
            }
        }
        return createQuickPick(items, placeholder, true, alwaysOnTop);
    }

    static createCompressSelector(alwaysOnTop) {
        let items = [
            InputFactory.createQuickPickItem('Yes'),
            InputFactory.createQuickPickItem('No'),
        ];
        return createQuickPick(items, 'Do you want to compress the file(s)?', false, alwaysOnTop);
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

    static createCompareOptionSelector() {
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

    static createFileDialog(label, multipick, filters, defaultUri){
        return vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: multipick,
            canSelectFolders: false,
            openLabel: label,
            filters: filters,
            defaultUri: (defaultUri) ? Paths.toURI(defaultUri) : Paths.toURI(Paths.getProjectFolder())
        });
    }

    static createFolderDialog(label, multipick, filters, defaultUri){
        return vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectMany: multipick,
            canSelectFolders: true,
            openLabel: label,
            filters: filters,
            defaultUri: (defaultUri) ? Paths.toURI(defaultUri) : Paths.toURI(Paths.getProjectFolder())
        });
    }

}
module.exports = InputFactory;

function createQuickPick(items, placeholder, pickMany, alwaysOnTop) {
    if (!placeholder)
        placeholder = 'Select an option';
    const selectedItems = [];
    return new Promise((resolve) => {
        let input = vscode.window.createQuickPick();
        input.placeholder = placeholder;
        input.items = items;
        for (const item of items) {
            if (item.picked)
                selectedItems.push(item);
        }
        if (selectedItems.length > 0)
            input.selectedItems = selectedItems;
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