const vscode = require('vscode');

class InputFactory {

    static createCompressSelector() {
        return new Promise(async function (resolve) {
            let options = ['Yes', 'No'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Do you want to compress the file(s)?' });
            resolve(selectedOption);
        });
    }

    static createRetrieveSpecialsSourceSelector(){
        return new Promise(async function (resolve) {
            let options = ['From Local (Include Only Data from Local)', 'From Org (Include All Data from Org)', 'Mixed (Include Data from Local and Org)'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select source for get types to download' });
            resolve(selectedOption);
        });
    }

    static createPackageSourcesSelector() {
        return new Promise(async function (resolve) {
            let options = ['From Local', 'From Org'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select source for get types metadata for create package' });
            resolve(selectedOption);
        });
    }

    static createPackageOptionSelector() {
        return new Promise(async function (resolve) {
            let options = ['For Deploy or Retrieve', 'For Delete'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select if create package for deploy or delete metadata' });
            resolve(selectedOption);
        });
    }

    static createPackageDeleteOrderSelector() {
        return new Promise(async function (resolve) {
            let options = ['Before Deploy', 'After Deploy'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select if delete metadata before or after deploy changes' });
            resolve(selectedOption);
        });
    }

    static createIncludeOrgNamespaceSelector() {
        return new Promise(async function (resolve) {
            let options = ['Yes', 'No'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Include data only from Org Namespace' });
            resolve(selectedOption);
        });
    }

    static createPackageExplicitSelector() {
        return new Promise(async function (resolve) {
            let options = ['Yes', 'No'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Include object explicit on package (recommended for retrieve) or use wildcards when apply' });
            resolve(selectedOption);
        });
    }

    static createPackageSaveOnSelector() {
        return new Promise(async function (resolve) {
            let options = ['Manifest folder', 'Select folder'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Save package on manifest folder or select other folder' });
            resolve(selectedOption);
        });
    }

    static createRepairOptionSelector() {
        return new Promise(async function (resolve) {
            let options = ['Repair', 'Check Errors'];
            let selectedOption = await vscode.window.showQuickPick(options, { placeHolder: 'Select repair automatically or only check errors' });
            resolve(selectedOption);
        });
    }

}
module.exports = InputFactory;