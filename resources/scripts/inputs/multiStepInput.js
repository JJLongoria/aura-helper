const vscode = require('vscode');
const FileSystem = require('../fileSystem');
const Factory = require('./factory');

class MultiStepOutput {

    constructor(title, initialStep, totalSteps) {
        this._title = title;
        this._step = initialStep;
        this._totalSteps = totalSteps;
        this._currentInput = undefined;
        this._onAcceptCallback = undefined;
        this._onCancelCallback = undefined;
        this._onDeleteCallback = undefined;
        this._onValidationErrorCallback = undefined;
        this._onReportCallback = undefined;
        this._onErrorCallback = undefined;
        this._lastStep = undefined;
        this._finalStep = undefined;
    }

    static getDeleteButton() {
        return {
            tooltip: "Delete",
            iconPath: {
                light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/delete-black-18dp.svg')),
                dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/delete-white-18dp.svg')),
            }
        };
    }

    static getAddButton() {
        return {
            tooltip: "Add",
            iconPath: {
                light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/add-black-18dp.svg')),
                dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/add-white-18dp.svg')),
            }
        };
    }

    static getAcceptButton() {
        return {
            tooltip: "Accept",
            iconPath: {
                light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/done_outline-black-18dp.svg')),
                dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/done_outline-white-18dp.svg')),
            }
        };
    }

    static getSelectAllButton() {
        return {
            tooltip: "Select All",
            iconPath: {
                light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/select_all-black-18dp.svg')),
                dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/select_all-white-18dp.svg')),
            }
        };
    }

    static getClearSelectionButton() {
        return {
            tooltip: "Clear Selection",
            iconPath: {
                light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/clear-black-18dp.svg')),
                dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/clear-white-18dp.svg')),
            }
        };
    }

    static getBackButton() {
        return vscode.QuickInputButtons.Back;
    }

    static getItem(label, description, detail, picked) {
        return Factory.createQuickPickItem(label, description, detail, picked);
    }

    onAccept(callback) {
        this._onAcceptCallback = callback;
    }

    onCancel(callback) {
        this._onCancelCallback = callback;
    }

    onDelete(callback) {
        this._onDeleteCallback = callback;
    }

    onError(callback) {
        this._onErrorCallback = callback;
    }

    reset() {
        this._step = 1;
        if (this._currentInput)
            this._currentInput.dispose();
        this.show();
    }

    onCreateInputRequest() {
        return undefined;
    }

    onButtonPressed(buttonName) {

    }

    onChangeSelection(items) {

    }

    onChangeValue(value) {

    }

    onValueSet(value) {

    }

    onValidationError(callback) {
        this._onValidationErrorCallback = callback;
    }

    onReport(callback) {
        this._onReportCallback = callback;
    }

    truncate(value){
        let maxLength = 255;
        let addToTruncate = ' [...]';
        if(value && value.length > maxLength){
            value = value.substring(0, maxLength - addToTruncate.length);
            value += addToTruncate;
        }
        return value;
    }

    getSelectedElements(items) {
        let selectedItems = [];
        for (let item of items) {
            selectedItems.push(item.label);
        }
        return selectedItems;
    }

    show() {
        try {
            let input = this.onCreateInputRequest();
            if (!input) {
                if (this._onErrorCallback)
                    this._onErrorCallback.call(this, 'Has no data to show');
            } else {
                input.ignoreFocusOut = true;
                input.onDidAccept(item => {
                    if (!input.items) {
                        if (input.value && input.value.trim().length === 0)
                            input.value = undefined;
                        this.onValueSet(input.value);
                    }
                    else
                        this.onButtonPressed('Ok');
                    this._step--;
                    this.show();
                });
                input.onDidTriggerButton((item) => {
                    if (item === vscode.QuickInputButtons.Back) {
                        this.onButtonPressed("back");
                        if (this._step === this._finalStep)
                            this._step = this._lastStep;
                        else
                            this._step--;
                        this.show();
                    } else {
                        this.onButtonPressed(item.tooltip);
                    }
                });
                input.onDidHide(() => {
                    if (this._currentInput)
                        this._currentInput.dispose();
                    if (this._onCancelCallback) {
                        this._onCancelCallback.call(this);
                    }
                });
                if (input.onDidChangeSelection)
                    input.onDidChangeSelection(items => {
                        this.onChangeSelection(items);
                    });
                input.onDidChangeValue(value => {
                    this.onChangeValue(value);
                });
                if (this._currentInput)
                    this._currentInput.dispose();
                this._currentInput = input;
                this._currentInput.show();
            }
        } catch (error) {
            if (this._currentInput)
                this._currentInput.dispose();
            throw error;
        }
    }

}
module.exports = MultiStepOutput;