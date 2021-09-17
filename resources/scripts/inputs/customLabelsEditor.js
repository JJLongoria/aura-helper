const vscode = require('vscode');
const Config = require('../core/config');
const XMLEditor = require('./xmlEditor');
const MultiStepInput = require('./xmlEditor');
const XMLDefinitions = require('@ah/xml-definitions');
const { Utils } = require('@ah/core').CoreUtils;
const { MetadataTypes, DataTypes } = require('@ah/core').Values;
const { XMLUtils } = require('@ah/languages').XML;
const CustomLabelDefinition = XMLDefinitions.getDefinition(MetadataTypes.CUSTOM_LABELS, Config.getAPIVersion());

const ROOT_STEP = 1;
const DELETE_STEP = 2;
const LABEL_STEP = 3;
const DETAIL_STEP = 4;
const CATEGORIES_STEP = 5;
const RESULT_STEP = 6;
const OPTIONS_STEP = 7;

class CustomLabelsEditor extends XMLEditor {

    constructor(file) {
        super("Edit Custom Labels", ROOT_STEP, RESULT_STEP, file);
        this._selectedLabel = undefined;
        this._selectedField = undefined;
        this._labelsContent = XMLUtils.cleanXMLFile(CustomLabelDefinition, this._xmlContent[MetadataTypes.CUSTOM_LABELS]);
        this._categories = getCategories(this._labelsContent);
        this._xmlDefinition = CustomLabelDefinition;
        this._removedLabels = [];
        this._labelsToDelete = [];
        this._labelsToDeploy = [];
        this._oldLabelsContent = Utils.clone(this._labelsContent)
    }

    onCreateInputRequest() {
        let input;
        switch (this._step) {
            case ROOT_STEP:
                return this.createRootInput();
            case DELETE_STEP:
                return this.createDeleteInput();
            case LABEL_STEP:
                return this.createLabelInput();
            case DETAIL_STEP:
                return this.createDetailInput();
            case CATEGORIES_STEP:
                return this.createCategoriesInput();
            case RESULT_STEP:
                return this.createResultInput();
            case OPTIONS_STEP:
                return this.createOptionsInput();
        }
        return input;
    }

    createRootInput() {
        let input;
        if (this._labelsContent) {
            input = vscode.window.createQuickPick();
            input.title = this._title;
            input.placeholder = 'Click on "Add" to create label, "Delete" to delete labels from file, "Accept" to view and save changes';
            let items = [];
            for (let xmlElement of this._labelsContent.labels) {
                let item = MultiStepInput.getItem(xmlElement.fullName, undefined, xmlElement.shortDescription, undefined);
                items.push(item);
            }
            input.items = items;
            input.buttons = [MultiStepInput.getDeleteButton(), MultiStepInput.getAddButton(), MultiStepInput.getAcceptButton()];
        }
        return input;
    }

    createDeleteInput() {
        let input;
        if (this._labelsContent) {
            input = vscode.window.createQuickPick();
            input.title = this._title + ": Delete Custom Labels from file";
            input.canSelectMany = true;
            input.placeholder = 'Click on "Delete" to remove selected, "Ok" to save changes. "Back" to rollback';
            let items = [];
            for (let xmlElement of this._labelsContent.labels) {
                let item = MultiStepInput.getItem(xmlElement.fullName, undefined, xmlElement.shortDescription, undefined);
                items.push(item);
            }
            input.items = items;
            input.buttons = [MultiStepInput.getBackButton(), MultiStepInput.getDeleteButton()];
        }
        return input;
    }

    createLabelInput() {
        let input;
        if (this._labelsContent) {
            let items = [];
            input = vscode.window.createQuickPick();
            input.title = this._title + ": " + this._selectedLabel + ((this._isAddingMode) ? " (Add Mode)" : "");
            input.placeholder = 'Click on "Accept" to save, "Delete" to delete from file, "Back" to rollback changes.';
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
            if (element) {
                for (let field of Object.keys(this._xmlDefinition.labels.fields)) {
                    let fieldData = this._xmlDefinition.labels.fields[field];
                    if (fieldData.editable || this._isAddingMode) {
                        let description = (element[field] !== undefined) ? "" + element[field] : element[field];
                        if (fieldData.datatype === DataTypes.ENUM && !this._isAddingMode) {
                            description = fieldData.getLabel(description) + ' - ' + description;
                        }
                        let item = MultiStepInput.getItem(field, undefined, description, undefined);
                        items.push(item);
                    }
                }
            }

            input.buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
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
                let fieldData = this._xmlDefinition.labels.fields[this._selectedField];
                if (fieldData.datatype === 'string') {
                    if (fieldData.isCSV) {
                        buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAddButton()];
                        const items = [];
                        const selectedItems = [];
                        input = vscode.window.createQuickPick();
                        input.canSelectMany = true;
                        const fieldValue = (element[fieldData.key]) ? element[fieldData.key].split(',') : [];
                        for (let category of this._categories) {
                            let selected = fieldValue.includes(category);
                            let item = MultiStepInput.getItem(category, undefined, undefined, selected);
                            items.push(item);
                            if (selected)
                                selectedItems.push(item);
                        }
                        input.placeholder = 'Select ' + this._selectedField + '. Click on "Add" to add new ' + this._selectedField + '. Click on "OK" to save';
                        if (selectedItems.length > 0)
                            input.selectedItems = selectedItems;
                        input.items = items;
                    } else {
                        buttons = [MultiStepInput.getBackButton()];
                        input = vscode.window.createInputBox();
                        input.value = fieldData.transformValue(element[this._selectedField]);
                        input.placeholder = "Write a value for " + this._selectedField + " field";
                        input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
                    }
                } else if (fieldData.datatype === 'boolean') {
                    buttons = [MultiStepInput.getBackButton()];
                    const items = [];
                    input = vscode.window.createQuickPick();
                    input.placeholder = 'Select a value for ' + this._selectedField + " field";
                    items.push(MultiStepInput.getItem('true', undefined, undefined, element[this._selectedField]));
                    items.push(MultiStepInput.getItem('false', undefined, undefined, !element[this._selectedField]));
                    input.items = items;
                } else if (fieldData.datatype === 'enum') {
                    buttons = [MultiStepInput.getBackButton()];
                    const items = [];
                    input = vscode.window.createQuickPick();
                    input.placeholder = 'Select a value for ' + this._selectedField + " field";
                    for (let value of fieldData.values) {
                        items.push(MultiStepInput.getItem(value.label, undefined, value.value, element[this._selectedField] === value.value));
                    }
                    input.items = items;
                }
            }
            input.buttons = buttons;
            input.title = this._title + ": " + this._selectedLabel + ' -- ' + this._selectedField + ((this._isAddingMode) ? " (Add Mode)" : "");
        }
        return input;
    }

    createCategoriesInput() {
        let input;
        if (this._labelsContent) {
            input = vscode.window.createInputBox();
            input.placeholder = "Write a new category value";
            input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
            input.title = this._title + ": Adding new category value";
            input.buttons = [MultiStepInput.getBackButton()];
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
            for (let labelKey of Object.keys(oldLabelsMap)) {
                let label = labelsMap[labelKey];
                let oldLabel = oldLabelsMap[labelKey];
                if (!label) {
                    changes[labelKey] = {
                        oldLabel: oldLabel,
                        newLabel: undefined
                    };
                }
            }
            if (Object.keys(changes).length > 0) {
                let added = [];
                let deleted = [];
                let edited = [];
                added.push(MultiStepInput.getItem('$(add)  NEW CUSTOM LABELS'));
                deleted.push(MultiStepInput.getItem('$(trash)  DELETED CUSTOM LABELS'));
                edited.push(MultiStepInput.getItem('$(edit)  MODIFIED CUSTOM LABELS'));
                this._labelsToDeploy = [];
                this._labelsToDelete = [];
                for (let labelKey of Object.keys(changes)) {
                    let newLabel = changes[labelKey].newLabel;
                    let oldLabel = changes[labelKey].oldLabel;
                    if (!oldLabel) {
                        this._labelsToDeploy.push(newLabel);
                        added.push(MultiStepInput.getItem('\t$(add)  ' + labelKey));
                        for (let field of Object.keys(newLabel)) {
                            added.push(MultiStepInput.getItem("\t\t$(symbol-value)  " + field + ": " + ((newLabel[field] === undefined) ? "null" : newLabel[field])));
                        }
                    } else if (!newLabel) {
                        this._labelsToDelete.push(oldLabel);
                        deleted.push(MultiStepInput.getItem('\t$(trash)  ' + labelKey));
                        for (let field of Object.keys(oldLabel)) {
                            deleted.push(MultiStepInput.getItem("\t\t$(symbol-value)  " + field + ": " + ((oldLabel[field] === undefined) ? "null" : oldLabel[field])));
                        }
                    } else {
                        this._labelsToDeploy.push(newLabel);
                        edited.push(MultiStepInput.getItem('\t$(edit)  ' + labelKey));
                        for (let field of Object.keys(newLabel)) {
                            if (newLabel[field] !== oldLabel[field]) {
                                edited.push(MultiStepInput.getItem("\t\t$(symbol-value)  " + field + ": " + ((oldLabel[field] === undefined) ? "null" : oldLabel[field]) + " $(arrow-right) " + ((newLabel[field] === undefined) ? "null" : newLabel[field])));
                            }
                        }
                    }
                }
                if (added.length > 2) {
                    items = items.concat(added);
                    items.push(MultiStepInput.getItem(''));
                }
                if (edited.length > 2) {
                    items = items.concat(edited);
                    items.push(MultiStepInput.getItem(''));
                }
                if (deleted.length > 2) {
                    items = items.concat(deleted);
                    items.push(MultiStepInput.getItem(''));
                }
                input.placeholder = "Changes on Custom Labels. Click on \"Accept\" to save.";
            } else {
                input.placeholder = "Custom Labels has not any changes. Click on \"Accept\" to close";
            }
            input.items = items;
            input.title = this._title + ": Results Screen";
            input.buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
        }
        return input;
    }

    createOptionsInput() {
        let input;
        if (this._labelsContent) {
            const items = [];
            input = vscode.window.createQuickPick();
            input.placeholder = 'Choose the options before save the file, like compress file';
            input.title = this._title + ": Choose options before save";
            input.canSelectMany = true;
            items.push(MultiStepInput.getItem('Compress', undefined, 'Compress XML File with Aura Helper Format', undefined));
            if (this._labelsToDeploy && this._labelsToDeploy.length > 0) {
                items.push(MultiStepInput.getItem('Deploy to Org', undefined, 'Labels are created or modified. Want to deploy to the Auth Org?', undefined));
            }
            if (this._labelsToDelete && this._labelsToDelete.length > 0) {
                items.push(MultiStepInput.getItem('Delete from Org', undefined, 'Labels are deleted from the file. Want delete from the Auth Org?', undefined));
            }
            input.items = items;
            input.buttons = [MultiStepInput.getBackButton()];
        }
        return input;
    }

    onButtonPressed(buttonName) {
        if (buttonName === 'back') {
            if (this._step === DELETE_STEP) {
                if (this._removedLabels && this._removedLabels.length > 0) {
                    for (const labelData of this._removedLabels) {
                        this._labelsContent.labels.splice(labelData.index, 0, labelData.label)
                    }
                    this._removedLabels = [];
                }
            } else if (this._step === LABEL_STEP) {
                if (this._isAddingMode) {
                    this._isAddingMode = false;
                    this._labelsContent.labels.pop();
                } else {
                    let index = 0;
                    for (let label of this._labelsContent.labels) {
                        if (label.fullName === this._selectedLabel)
                            break;
                        index++;
                    }
                    for (let label of this._oldLabelsContent.labels) {
                        if (label.fullName === this._selectedLabel) {
                            this._labelsContent.labels[index] = Utils.clone(label);
                            break;
                        }
                    }
                    this._isAddingMode = false;
                }
            } else if (this._step === DETAIL_STEP) {
                let element;
                let fieldData = this._xmlDefinition.labels.fields[this._selectedField];
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
            }
        } else if (buttonName === 'Add') {
            if (this._step === ROOT_STEP) {
                let dataToAdd = {};
                for (let field of Object.keys(this._xmlDefinition.labels.fields)) {
                    let fieldData = this._xmlDefinition.labels.fields[field];
                    dataToAdd[field] = (fieldData.default === '{!value}') ? undefined : fieldData.default;
                }
                this._labelsContent.labels.push(dataToAdd);
                this._isAddingMode = true;
                this.nextStep(LABEL_STEP);
            } else if (this._step === DETAIL_STEP) {
                this.nextStep(CATEGORIES_STEP);
            }
        } else if (buttonName === 'Accept') {
            if (this._step === ROOT_STEP) {
                this.nextStep(RESULT_STEP);
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
                    let fieldData = this._xmlDefinition.labels.fields[field];
                    let error = fieldData.validate(element[field], field);
                    if (error) {
                        if (!validationMessage)
                            validationMessage = error;
                        else
                            validationMessage += "; " + error;
                    }
                }
                if (!validationMessage) {
                    this._isAddingMode = false;
                    this.backStep(ROOT_STEP);
                } else {
                    this.fireValidationEvent(validationMessage);
                }
            } else if (this._step === RESULT_STEP) {
                if (this._labelsToDelete.length > 0 || this._labelsToDeploy.length > 0)
                    this.nextStep(OPTIONS_STEP)
                else {
                    const options = {
                        compress: false,
                        deploy: false,
                        delete: false,
                        hasChanges: false,
                    };
                    const data = {
                        labelsToDelete: undefined,
                        labelsToDeploy: undefined
                    };
                    this.fireAcceptEvent(options, data);
                    this._currentInput.dispose();
                }
            }
        } else if (buttonName === 'Ok') {
            if (this._step === OPTIONS_STEP) {
                const selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
                const options = {
                    compress: selectedItems.includes('Compress'),
                    deploy: selectedItems.includes('Deploy to Org'),
                    delete: selectedItems.includes('Delete from Org'),
                    hasChanges: this._labelsToDelete.length > 0 || this._labelsToDeploy.length > 0
                };
                const data = {
                    labelsToDelete: this._labelsToDelete,
                    labelsToDeploy: this._labelsToDeploy
                };
                if (options.hasChanges) {
                    this.save(options.compress).then(() => {
                        this.fireAcceptEvent(options, data);
                        this._currentInput.dispose();
                    }).catch((error) => {
                        this.fireErrorEvent(error.message);
                    });
                } else {
                    this.fireAcceptEvent(options, data);
                    this._currentInput.dispose();
                }
            } else if (this._step !== DELETE_STEP) {
                let fieldData = this._xmlDefinition.labels.fields[this._selectedField];
                let selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
                if (this._isAddingMode) {
                    this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = fieldData.transformValue(selectedItems.join(','));
                } else {
                    for (let label of this._labelsContent.labels) {
                        if (label.fullName === this._selectedLabel) {
                            label[this._selectedField] = fieldData.transformValue(selectedItems.join(','));
                            break;
                        }
                    }
                }
                this.backStep();
            }
        } else if (buttonName === 'Delete') {
            if (this._step === ROOT_STEP) {
                this.nextStep(DELETE_STEP);
            } else if (this._step === DELETE_STEP) {
                if (this._currentInput.selectedItems && this._currentInput.selectedItems.length > 0) {
                    const labelsToKeep = [];
                    const selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
                    let index = 0;
                    for (const label of this._labelsContent.labels) {
                        if (selectedItems.includes(label.fullName)) {
                            this._removedLabels.push({
                                index: index,
                                label: label
                            })
                        } else {
                            labelsToKeep.push(label);
                        }
                        index++;
                    }
                    if (this._removedLabels.length > 0) {
                        this._labelsContent.labels = labelsToKeep;
                        this.show();
                    }
                }
            }
        }
    }

    onValueSet(value) {
        if (this._step === DETAIL_STEP) {
            let fieldData = this._xmlDefinition.labels.fields[this._selectedField];
            if (this._isAddingMode) {
                this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = fieldData.transformValue(value);
            } else {
                for (let label of this._labelsContent.labels) {
                    if (label.fullName === this._selectedLabel) {
                        label[this._selectedField] = fieldData.transformValue(value);
                        break;
                    }
                }
            }
            let error = fieldData.validate(value, this._selectedField);
            if (error) {
                this.fireValidationEvent(error);
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
                this.nextStep(LABEL_STEP);
                break;
            case LABEL_STEP:
                this._selectedField = selectedItems[0];
                this.nextStep(DETAIL_STEP);
                break;
            case DETAIL_STEP:
                let fieldData = this._xmlDefinition.labels.fields[this._selectedField];
                if (fieldData.datatype === 'enum') {
                    let selectedItems = this.getSelectedElements(items);
                    if (this._isAddingMode) {
                        this._labelsContent.labels[this._labelsContent.labels.length - 1][this._selectedField] = fieldData.transformValue(fieldData.getValue(selectedItems[0]));
                    } else {
                        for (let label of this._labelsContent.labels) {
                            if (label.fullName === this._selectedLabel) {
                                label[this._selectedField] = fieldData.transformValue(fieldData.getValue(selectedItems[0]));
                                break;
                            }
                        }
                    }
                    this.backStep();
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
                split = split.trim();
                if (!categories.includes[split])
                    categories.push(split);
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