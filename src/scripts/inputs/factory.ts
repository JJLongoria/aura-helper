import * as vscode from 'vscode';
import { Paths } from '../core/paths';

export class InputFactory {

    static createSingleSelectorInput(values: string[], placeholder: string, alwaysOnTop: boolean): Promise<unknown> {
        const items = [];
        for (const value of values) {
            items.push(InputFactory.createQuickPickItem(value, undefined, undefined, false));
        }
        return createQuickPick(items, placeholder, false, alwaysOnTop);
    }

    static createMultiSelectorInput(values: string[] | any[], placeholder: string, alwaysOnTop: boolean): Promise<unknown> {
        const items = [];
        for (const value of values) {
            if (typeof value === 'string') {
                items.push(InputFactory.createQuickPickItem(value));
            }
            else {
                if (value.type === 'boolean') {
                    items.push(InputFactory.createQuickPickItem(value.name, undefined, undefined, value.value));
                }
            }
        }
        return createQuickPick(items, placeholder, true, alwaysOnTop);
    }

    static createCompressSelector(alwaysOnTop: boolean): Promise<unknown> {
        let items = [
            InputFactory.createQuickPickItem('Yes'),
            InputFactory.createQuickPickItem('No'),
        ];
        return createQuickPick(items, 'Do you want to compress the file(s)?', false, alwaysOnTop);
    }

    static createIgnoreOptionsSelector(): Promise<unknown> {
        let items = [
            InputFactory.createQuickPickItem('Use Project Ignore File', undefined, 'Use .ahignore.json file on your project root'),
            InputFactory.createQuickPickItem('Use Custom Ignore File', undefined, 'Select custom ahignore file'),
        ];
        return createQuickPick(items);
    }

    static createIgnoreTypesSelector(typesToIgnore: string[]): Promise<unknown> {
        let items = [];
        for (let type of typesToIgnore) {
            items.push(InputFactory.createQuickPickItem(type, undefined, undefined, false));
        }
        let placeholder = 'Select types for ignore';
        return createQuickPick(items, placeholder, true);
    }

    static createCompareOptionSelector(): Promise<unknown> {
        let items = [
            InputFactory.createQuickPickItem('Compare Local and Org', undefined, 'Compare your local project with your auth org for get the differences'),
            InputFactory.createQuickPickItem('Compare Different Orgs', undefined, 'Compare two different orgs for get the differences')
        ];
        return createQuickPick(items);
    }

    static createAuthOrgsSelector(authsOrgs: any, isSource: boolean): Promise<unknown> {
        let items = [];
        for (let authOrg of authsOrgs) {
            if (authOrg.active) {
                items.push(InputFactory.createQuickPickItem('$(check) ' + authOrg.alias, authOrg.username, 'Project Auth Org'));
            } else {
                items.push(InputFactory.createQuickPickItem(authOrg.alias, authOrg.username));
            }
        }
        let placeholder = 'Select one Auth Org as Source to compare';
        if (!isSource) {
            placeholder = 'Select one Auth Org as Target to compare';
        }
        return createQuickPick(items, placeholder);
    }

    static createQuickPickItem(label: string, description?: string, detail?: string, picked?: boolean): vscode.QuickPickItem {
        return {
            description: description,
            detail: detail,
            label: label,
            picked: picked
        };
    }

    static createFileDialog(label: string, multipick: boolean, filters?: any, defaultUri?: string): Thenable<vscode.Uri[] | undefined> {
        return vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: multipick,
            canSelectFolders: false,
            openLabel: label,
            filters: filters,
            defaultUri: (defaultUri) ? Paths.toURI(defaultUri) : Paths.toURI(Paths.getProjectFolder())
        });
    }

    static createFolderDialog(label: string, multipick: boolean, filters?: any, defaultUri?: string): Thenable<vscode.Uri[] | undefined> {
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

function createQuickPick(items: vscode.QuickPickItem[], placeholder: string = 'Select an option', pickMany: boolean = false, alwaysOnTop: boolean = false): Promise<string> {
    const selectedItems: vscode.QuickPickItem[] = [];
    return new Promise((resolve) => {
        let input = vscode.window.createQuickPick();
        input.placeholder = placeholder;
        input.items = items;
        for (const item of items) {
            if (item.picked) {
                selectedItems.push(item);
            }
        }
        if (selectedItems.length > 0) {
            input.selectedItems = selectedItems;
        }
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
        input.onDidAccept(() => {
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