const vscode = require('vscode');
const XMLEditor = require('./xmlEditor');
const MultiStepInput = require('./xmlEditor');
const Metadata = require('../metadata');
const Utils = require('../metadata/utils');
const { FIELD_SET } = require('../metadata/metadataTypes');

const ROOT_STEP = 1;
const LABEL_STEP = 2;
const DETAIL_STEP = 3;
const CATEGORIES_STEP = 4;
const RESULT_STEP = 5;

class CustomLabelsEditor extends XMLEditor {

    constructor(file) {
        super("Edit Custom Labels", ROOT_STEP, 3, file);
        this._selectedLabel = undefined;
        this._selectedField = undefined;
        this._finalStep = RESULT_STEP;
        this._labelsContent = Metadata.CustomLabelsUtils.createCustomLabels(this._xmlContent.CustomLabels);
        this._categories = getCategories(this._labelsContent);
        this._xmlMetadata = Metadata.CustomLabelsUtils.getXMLMetadata();
        this._oldLabelsContent = JSON.parse(JSON.stringify(this._labelsContent));
    }

    onCreateInputRequest() {
        let input;
        switch (this._step) {
            case ROOT_STEP:
                this._lastStep = this._step;
                return this.createRootInput();
            case LABEL_STEP:
                this._lastStep = this._step;
                return this.createLabelInput();
            case DETAIL_STEP:
                this._lastStep = this._step;
                return this.createDetailInput();
            case CATEGORIES_STEP:
                this._lastStep = this._step;
                return this.createCategoriesInput();
            case RESULT_STEP:
                return this.createResultInput();
        }
        return input;
    }

    createRootInput() {
        let input;
        if (this._labelsContent) {
            input = vscode.window.createQuickPick();
            input.title = this._title;
            input.step = ROOT_STEP;
            input.totalSteps = RESULT_STEP;
            input.placeholder = 'Choose an Element';
            let buttons = [MultiStepInput.getAddButton(), MultiStepInput.getAcceptButton()];
            input.buttons = buttons;
            let items = [];
            for (let xmlElement of this._labelsContent.labels) {
                let item = MultiStepInput.getItem(xmlElement.fullName, undefined, xmlElement.shortDescription, undefined);
                items.push(item);
            }
            input.items = items;
        }
        return input;
    }

    createLabelInput() {
        let input;
        if (this._labelsContent) {
            let items = [];
            input = vscode.window.createQuickPick();
            input.title = this._title + " - " + this._selectedLabel + ((this._isAddingMode) ? " (Add Mode)" : "");
            input.step = ROOT_STEP;
            input.totalSteps = RESULT_STEP;
            input.placeholder = 'Choose a field to edit';
            let element;
            let buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
            if (this._isAddingMode) {
                element = this._labelsContent.labels[this._labelsContent.labels.length - 1];
            } else {
                for (let label of this._labelsContent.labels) {
                    if (label.fullName === this._selectedLabel) {
                        element = label;
                        break;
                    }
                }
            }
            if (element) {
                for (let field of Object.keys(this._xmlMetadata.labels.xmlData.fields)) {
                    let fieldData = this._xmlMetadata.labels.xmlData.fields[field];
                    if (fieldData.editable || this._isAddingMode) {
                        let description = (element[field] !== undefined) ? "" + element[field] : element[field];
                        if (fieldData.datatype === 'enum') {
                            description = fieldData.getLabel(description) + ' - ' + description;
                        }
                        let item = MultiStepInput.getItem(field, undefined, description, undefined);
                        items.push(item);
                    }
                }
            }
            input.buttons = buttons;
            input.items = items;
        }
        return input;
    }

    createDetailInput() {
        let input;
        if (this._labelsContent) {
            let element;
            let buttons = [];
            if (this._isAddingMode) {
                element = this._labelsContent.labels[this._labelsContent.labels.length - 1];
            } else {
                for (let label of this._labelsContent.labels) {
                    if (label.fullName === this._selectedLabel) {
                        element = label;
                        break;
                    }
                }
            }
            if (element) {
                let fieldData = this._xmlMetadata.labels.xmlData.fields[this._selectedField];
                if (fieldData.datatype === 'string') {
                    if (this._selectedField === 'categories') {
                        buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAddButton()];
                        let items = [];
                        let selectedItems = [];
                        input = vscode.window.createQuickPick();
                        input.canSelectMany = true;
                        let labelCategories = (element.categories) ? element.categories.split(',') : [];
                        for (let category of this._categories) {
                            let selected = labelCategories.includes(category);
                            let item = MultiStepInput.getItem(category, undefined, undefined, selected);
                            items.push(item);
                            if (selected)
                                selectedItems.push(item);
                        }
                        input.placeholder = "Select label categories for " + this._selectedField + " field or add a new value";
                        if (selectedItems.length > 0)
                            input.selectedItems = selectedItems;
                        input.items = items;
                    } else {
                        buttons = [MultiStepInput.getBackButton()];
                        input = vscode.window.createInputBox();
                        input.value = element[this._selectedField];
                        input.placeholder = "Write a value for " + this._selectedField + " field";
                        input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
                    }
                } else if (fieldData.datatype === 'boolean') {
                    buttons = [MultiStepInput.getBackButton()];
                    let items = [];
                    input = vscode.window.createQuickPick();
                    input.placeholder = 'Select a value for ' + this._selectedField + " field";
                    items.push(MultiStepInput.getItem('true', undefined, undefined, undefined));
                    items.push(MultiStepInput.getItem('false', undefined, undefined, undefined));
                    input.items = items;
                } else if (fieldData.datatype === 'enum') {
                    buttons = [MultiStepInput.getBackButton()];
                    let items = [];
                    input = vscode.window.createQuickPick();
                    input.placeholder = 'Select a value for ' + this._selectedField + " field";
                    for (let value of fieldData.values) {
                        items.push(MultiStepInput.getItem(value.label, undefined, value.value, undefined));
                    }
                    input.items = items;
                }
            }
            input.buttons = buttons;
            input.title = this._title + " - " + this._selectedLabel + ' -- ' + this._selectedField + ((this._isAddingMode) ? " (Add Mode)" : "");
            input.step = ROOT_STEP;
            input.totalSteps = RESULT_STEP;
        }
        return input;
    }

    createCategoriesInput() {
        let input;
        if (this._labelsContent) {
            let buttons = [MultiStepInput.getBackButton()];
            input = vscode.window.createInputBox();
            input.placeholder = "Write a new category value";
            input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
            input.title = this._title + " - Adding new category value";
            input.buttons = buttons;
        }
        return input;
    }

    createResultInput() {
        let input;
        if (this._labelsContent) {
            input = vscode.window.createQuickPick();
            let labelsMap = transformLabelsToMap(this._labelsContent);
            let oldLabelsMap = transformLabelsToMap(this._oldLabelsContent);
            let changes = {};
            let items = [];
            for (let labelKey of Object.keys(labelsMap)) {
                let label = labelsMap[labelKey];
                let oldLabel = oldLabelsMap[labelKey];
                if (!oldLabel) {
                    changes[labelKey] = {
                        oldLabel: undefined,
                        newLabel: label
                    };
                } else {
                    for (let field of Object.keys(label)) {
                        if (label[field] !== oldLabel[field]) {
                            changes[labelKey] = {
                                oldLabel: oldLabel,
                                newLabel: label
                            };
                            break;
                        }
                    }
                }
            }
            if (Object.keys(changes).length > 0) {
                for (let labelKey of Object.keys(changes)) {
                    let newLabel = changes[labelKey].newLabel;
                    let oldLabel = changes[labelKey].oldLabel;
                    if (!oldLabel) {
                        items.push(MultiStepInput.getItem(labelKey + " (New)"));
                        for (let field of Object.keys(newLabel)) {
                            items.push(MultiStepInput.getItem("\tField " + field + ": " + ((newLabel[field] === undefined) ? "null" : newLabel[field])));
                        }
                    } else {
                        items.push(MultiStepInput.getItem(labelKey + " (Modified)"));
                        for (let field of Object.keys(newLabel)) {
                            if (newLabel[field] !== oldLabel[field]) {
                                items.push(MultiStepInput.getItem("\t\tField " + field + ": From " + ((oldLabel[field] === undefined) ? "null" : oldLabel[field]) + " to " + ((newLabel[field] === undefined) ? "null" : newLabel[field])));
                            }
                        }
                    }
                }
                input.placeholder = "Changes on Custom  Labels";
            } else {
                input.placeholder = "Custom Labels has not any changes";
            }
            input.items = items;
            input.step = RESULT_STEP;
            input.totalSteps = RESULT_STEP;
            let buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
            input.title = this._title;
            input.buttons = buttons;
        }
        return input;
    }

    onButtonPressed(buttonName) {
        if (buttonName === 'back') {
            if (this._step === LABEL_STEP) {
                if (this._isAddingMode) {
                    this._isAddingMode = false;
                    this._labelsContent.labels.pop();
                } else {
                    let element;
                    for (let label of this._labelsContent.labels) {
                        if (label.fullName === this._selectedLabel) {
                            element = label;
                            break;
                        }
                    }
                    let validationMessage = undefined;
                    for (let field of Object.keys(element)) {
                        let fieldData = this._xmlMetadata.labels.xmlData.fields[field];
                        let error = fieldData.validate(element[field], this._labelsContent);
                        if (error) {
                            if (!validationMessage)
                                validationMessage = error;
                            else
                                validationMessage += "; " + error;
                        }
                    }
                    if (!validationMessage) {
                        this._step--;
                        this._isAddingMode = false;
                        this.show();
                    } else {
                        this._step++;
                        if (this._onValidationErrorCallback)
                            this._onValidationErrorCallback.call(this, validationMessage);
                    }
                }
            } else if (this._step === DETAIL_STEP) {
                let element;
                let fieldData = this._xmlMetadata.labels.xmlData.fields[this._selectedField];
                if (this._isAddingMode) {
                    element = this._labelsContent.labels[this._labelsContent.labels.length - 1];
                } else {
                    for (let label of this._labelsContent.labels) {
                        if (label.fullName === this._selectedLabel) {
                            element = label;
                            break;
                        }
                    }
                }
                if (element) {
                    let error = fieldData.validate(element[this._selectedField], this._labelsContent);
                    if (error) {
                        this._step++;
                        if (this._onValidationErrorCallback)
                            this._onValidationErrorCallback.call(this, error);
                    }
                }
            }
        } else if (buttonName === 'Add') {
            if (this._step === ROOT_STEP) {
                let dataToAdd = {};
                for (let field of Object.keys(this._xmlMetadata.labels.xmlData.fields)) {
                    let fieldData = this._xmlMetadata.labels.xmlData.fields[field];
                    dataToAdd[field] = (fieldData.default === '{!value}') ? undefined : fieldData.default;
                }
                this._labelsContent.labels.push(dataToAdd);
                this._isAddingMode = true;
                this._step++;
                this.show();
            } else if (this._step === DETAIL_STEP) {
                this._step++;
                this.show();
            }
        } else if (buttonName === 'Accept') {
            if (this._step === ROOT_STEP) {
                this._step = RESULT_STEP;
                this.show();
            } else if (this._step === LABEL_STEP) {
                let element;
                if (this._isAddingMode) {
                    element = this._labelsContent.labels[this._labelsContent.labels.length - 1];
                } else {
                    for (let label of this._labelsContent.labels) {
                        if (label.fullName === this._selectedLabel) {
                            element = label;
                            break;
                        }
                    }
                }
                let validationMessage = undefined;
                for (let field of Object.keys(element)) {
                    let fieldData = this._xmlMetadata.labels.xmlData.fields[field];
                    let error = fieldData.validate(element[field], this._labelsContent);
                    if (error) {
                        if (!validationMessage)
                            validationMessage = error;
                        else
                            validationMessage += "; " + error;
                    }
                }
                if (!validationMessage) {
                    this._step--;
                    this._isAddingMode = false;
                    this.show();
                } else {
                    if (this._onValidationErrorCallback)
                        this._onValidationErrorCallback.call(this, validationMessage);
                }
            } else if (this._step === RESULT_STEP) {
                this._xmlContent.CustomLabels = this._labelsContent;
                this.save();
                this._onAcceptCallback.call(this);
                this._currentInput.dispose();
            }
        } else if (buttonName === 'Ok') {
            let selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
            if (this._isAddingMode) {
                this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = selectedItems.join(',');
            } else {
                for (let label of this._labelsContent.labels) {
                    if (label.fullName === this._selectedLabel) {
                        label[this._selectedField] = selectedItems.join(',');
                        break;
                    }
                }
            }
        }
    }

    onValueSet(value) {
        if (this._step === DETAIL_STEP) {
            let fieldData = this._xmlMetadata.labels.xmlData.fields[this._selectedField];
            if (this._isAddingMode) {
                this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = value;
            } else {
                for (let label of this._labelsContent.labels) {
                    if (label.fullName === this._selectedLabel) {
                        label[this._selectedField] = value;
                        break;
                    }
                }
            }
            let error = fieldData.validate(value, this._labelsContent);
            if (error) {
                this._step++;
                if (this._onValidationErrorCallback)
                    this._onValidationErrorCallback.call(this, error);
            }
        } else if (this._step === CATEGORIES_STEP) {
            if (value && !this._categories.includes(value))
                this._categories.push(value);
        }
    }

    onChangeSelection(items) {
        let selectedItems = this.getSelectedElements(items);
        switch (this._step) {
            case ROOT_STEP:
                if (!this._isAddingMode) {
                    this._selectedLabel = selectedItems[0];
                }
                this._step++;
                this.show();
                break;
            case LABEL_STEP:
                this._selectedField = selectedItems[0];
                this._step++;
                this.show();
                break;
            case DETAIL_STEP:
                let fieldData = this._xmlMetadata.labels.xmlData.fields[this._selectedField];
                if (fieldData.datatype === 'enum') {
                    let selectedItems = this.getSelectedElements(items);
                    if (this._isAddingMode) {
                        this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = fieldData.getValue(selectedItems[0]);
                    } else {
                        for (let label of this._labelsContent.labels) {
                            if (label.fullName === this._selectedLabel) {
                                label[this._selectedField] = fieldData.getValue(selectedItems[0]);
                                break;
                            }
                        }
                    }
                    this._step--;
                    this.show();
                }
                break;
            case RESULT_STEP:
                break;
        }
    }

}
module.exports = CustomLabelsEditor;

function getCategories(labelsContent) {
    let categories = [];
    for (let label of labelsContent.labels) {
        if (label.categories) {
            let splits = label.categories.split(',');
            for (let split of splits) {
                if (!categories.includes[split])
                    categories.push(split.trim());
            }
        }
    }
    categories.sort();
    return categories;
}

function transformLabelsToMap(labelsContent) {
    let labelsMap = {};
    for (let label of labelsContent.labels) {
        labelsMap[label.fullName] = label;
    }
    return labelsMap;
}