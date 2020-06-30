const vscode = require('vscode');
const MultiStepInput = require('./multiStepInput');
const Metadata = require('../metadata');

const TYPE_STEP = 1;
const OBJECT_STEP = 2;
const ITEM_STEP = 3;
const RESULT_STEP = 4;

class MetadataSelector extends MultiStepInput {

    constructor(title, metadata) {
        super(title, TYPE_STEP, 4);
        this._metadata = metadata;
        this._selectedType = undefined;
        this._selectedObject = undefined;
        this._allowDelete = false;
        this._finalStep = RESULT_STEP;
    }

    allowDelete(allow) {
        this._allowDelete = allow;
    }

    setMetadata(metadata) {
        this._metadata = metadata;
    }

    onCreateInputRequest() {
        let input;
        switch (this._step) {
            case TYPE_STEP:
                this._lastStep = this._step;
                input = createMetadataTypeInput(this._title, this._metadata);
                break;
            case OBJECT_STEP:
                this._lastStep = this._step;
                input = createMetadataObjectInput(this._selectedType, this._metadata);
                break;
            case ITEM_STEP:
                this._lastStep = this._step;
                input = createMetadataItemInput(this._selectedType, this._selectedObject, this._metadata);
                break;
            case RESULT_STEP:
                input = createResultInput(this._metadata, this._allowDelete);
                break;
        }
        return input;
    }

    onButtonPressed(buttonName) {
        if (buttonName === 'Accept') {
            if (this._step === RESULT_STEP) {
                if (this._onAcceptCallback) {
                    this._onAcceptCallback.call(this, this._metadata);
                }
                this._currentInput.dispose();
            } else {
                this._step = RESULT_STEP;
                this.show();
            }
        } else if (buttonName === 'Delete') {
            this._onDeleteCallback.call(this, this._metadata);
        } else if (buttonName === 'Select All') {
            if (this._step === TYPE_STEP) {
                changeCheckedState(this._metadata, undefined, true);
                this.show();
            } else if (this._step === OBJECT_STEP) {
                changeCheckedState(this._metadata, this._selectedType, true);
                this.show();
            }
        } else if (buttonName === 'Clear Selection') {
            if (this._step === TYPE_STEP) {
                changeCheckedState(this._metadata, undefined, false);
                this.show();
            } else if (this._step === OBJECT_STEP) {
                changeCheckedState(this._metadata, this._selectedType, false);
                this.show();
            }
        }
    }

    onChangeSelection(items) {
        let selectedType;
        let metadata;
        switch (this._step) {
            case TYPE_STEP:
                this._selectedType = items[0].label.split(')')[1].trim();
                this._step = OBJECT_STEP;
                this.show();
                break;
            case OBJECT_STEP:
                let withChilds = false;
                selectedType = this._selectedType;
                metadata = this._metadata;
                Object.keys(metadata[selectedType].childs).forEach(function (objectKey) {
                    if (!withChilds)
                        withChilds = Metadata.Utils.haveChilds(metadata[selectedType].childs[objectKey]);
                });
                if (!withChilds) {
                    let labels = [];
                    for (const item of items) {
                        labels.push(item.label);
                    }
                    metadata = this._metadata;
                    selectedType = this._selectedType;
                    Object.keys(metadata[selectedType].childs).forEach(function (objectKey) {
                        metadata[selectedType].childs[objectKey].checked = labels.includes(objectKey);
                    });
                    metadata[selectedType].checked = Metadata.Utils.isAllChecked(metadata[selectedType].childs);
                    this._metadata = metadata;
                } else {
                    if (items.length > 0)
                        this._selectedObject = items[0].label.split(')')[1].trim();
                    this._step = ITEM_STEP;
                    this.show();
                }
                break;
            case ITEM_STEP:
                let labels = [];
                for (const item of items) {
                    labels.push(item.label);
                }
                metadata = this._metadata;
                selectedType = this._selectedType;
                let selectedObject = this._selectedObject;
                Object.keys(metadata[selectedType].childs[selectedObject].childs).forEach(function (itemKey) {
                    metadata[selectedType].childs[selectedObject].childs[itemKey].checked = labels.includes(itemKey);
                });
                metadata[selectedType].childs[selectedObject].checked = Metadata.Utils.isAllChecked(metadata[selectedType].childs[selectedObject].childs);
                metadata[selectedType].checked = Metadata.Utils.isAllChecked(metadata[selectedType].childs);
                this._metadata = metadata;
                break;
            case RESULT_STEP:
                break;
        }
    }
}
module.exports = MetadataSelector;

function changeCheckedState(metadata, selectedType, state) {
    if (selectedType) {
        Object.keys(metadata[selectedType].childs).forEach(function (objectKey) {
            metadata[selectedType].childs[objectKey].checked = state;
            Object.keys(metadata[selectedType].childs[objectKey].childs).forEach(function (itemKey) {
                metadata[selectedType].childs[objectKey].childs[itemKey].checked = state;
            });
        });
    } else {
        Object.keys(metadata).forEach(function (typeKey) {
            metadata[typeKey].checked = state;
            Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                metadata[typeKey].childs[objectKey].checked = state;
                Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                    metadata[typeKey].childs[objectKey].childs[itemKey].checked = state;
                });
            });
        });
    }
}

function createMetadataTypeInput(title, types, allowDelete) {
    let input;
    if (!types || Object.keys(types).length == 0)
        return input;
    input = vscode.window.createQuickPick();
    input.title = title;
    input.step = TYPE_STEP;
    input.totalSteps = RESULT_STEP;
    input.placeholder = 'Choose an Element';
    let buttons = [];
    if (allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    let items = [];
    let allChecked = true;
    Object.keys(types).forEach(function (type) {
        let childsData = Metadata.Utils.getChildsData(types[type]);
        let description = '';
        if (childsData.selectedItems !== -1) {
            description += 'Objects: ' + childsData.selectedItems + ' / ' + childsData.totalItems;
        }
        if (childsData.selectedSubItems !== -1) {
            description += ' -- Items: ' + childsData.selectedSubItems + ' / ' + childsData.totalSubItems;
        }
        let icon;
        if(childsData.totalSubItems > 0 && childsData.selectedItems === childsData.totalItems && childsData.selectedSubItems === childsData.totalSubItems){
            icon = '$(verified)  ';
        } else if(childsData.totalSubItems === 0 && childsData.selectedItems === childsData.totalItems){
            icon = '$(verified)  ';
        } else if(childsData.selectedItems > 0 || childsData.selectedSubItems > 0){
            icon = '$(check)  ';
            allChecked = false;
        } else if(childsData.selectedItems === -1 && childsData.selectedSubItems === -1){
            icon = '$(dash)  ';
        } else {
            icon = '$(dash)  ';
            allChecked = false;
        }
        let label = icon + type;
        let item = MultiStepInput.getItem(label, description, undefined, types[type].checked);
        items.push(item);
    });
    buttons.push(MultiStepInput.getClearSelectionButton());
    if (!allChecked)
        buttons.push(MultiStepInput.getSelectAllButton());
    buttons.push(MultiStepInput.getAcceptButton());
    input.buttons = buttons;
    input.items = items;
    return input;
}

function createMetadataObjectInput(selectedType, types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = selectedType + ' Metadata Type Elements';
    input.step = OBJECT_STEP;
    input.totalSteps = RESULT_STEP;
    let buttons = [vscode.QuickInputButtons.Back];
    if (allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    let items = [];
    let metadataType = types[selectedType];
    let selectedItems = [];
    let canPickMany = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        if (Metadata.Utils.haveChilds(metadataObject))
            canPickMany = false;
    });
    let allChecked = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        let description = '';
        let label = objectKey;
        if (!canPickMany) {
            let childsData = Metadata.Utils.getChildsData(metadataObject);
            if (childsData.selectedItems !== -1) {
                description += 'Items: ' + childsData.selectedItems + ' / ' + childsData.totalItems;
            }
            let icon;
            if(childsData.selectedItems === childsData.totalItems){
                icon = '$(verified)  ';
            } else if(childsData.selectedItems > 0){
                allChecked = false;
                icon = '$(check)  ';
            } else {
                allChecked = false;
                icon = '$(dash)  ';
            }
            label = icon + objectKey;
        }
        let checked = (canPickMany) ? metadataObject.checked : undefined;
        let item = MultiStepInput.getItem(label, description, undefined, checked);
        items.push(item);
        if (checked)
            selectedItems.push(item);
    });
    input.canSelectMany = canPickMany;
    if (input.canSelectMany)
        input.placeholder = 'Select Elements';
    else {
        buttons.push(MultiStepInput.getClearSelectionButton());
        if(!allChecked){
            buttons.push(MultiStepInput.getSelectAllButton());
        }
        input.placeholder = 'Choose an Element';
    }
    buttons.push(MultiStepInput.getAcceptButton());
    input.buttons = buttons;
    input.items = items;
    if (selectedItems.length > 0)
        input.selectedItems = selectedItems;
    return input;
}

function createMetadataItemInput(selectedType, selectedObject, types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = 'Elements from ' + selectedObject + ' (' + selectedType + ')';
    input.step = TYPE_STEP;
    input.totalSteps = RESULT_STEP;
    input.placeholder = 'Select Elements';
    let buttons = [vscode.QuickInputButtons.Back];
    if (allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    buttons.push(MultiStepInput.getAcceptButton());
    let items = [];
    let selectedItems = [];
    let metadataObject = types[selectedType].childs[selectedObject];
    Object.keys(metadataObject.childs).forEach(function (itemKey) {
        let metadataItem = metadataObject.childs[itemKey];
        let item = MultiStepInput.getItem(itemKey, selectedType + ':' + selectedObject, undefined, metadataItem.checked);
        items.push(item);
        if (metadataItem.checked)
            selectedItems.push(item);
    });
    input.canSelectMany = true;
    input.items = items;
    if (selectedItems.length > 0)
        input.selectedItems = selectedItems;
    input.buttons = buttons;
    return input;
}

function createResultInput(types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = 'Selected Elements';
    input.step = RESULT_STEP;
    input.totalSteps = RESULT_STEP;
    input.placeholder = 'Showing a summary of the selected elements';
    let buttons = [vscode.QuickInputButtons.Back];
    if (allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    buttons.push(MultiStepInput.getAcceptButton());
    let items = [];
    Object.keys(types).forEach(function (typeKey) {
        let addedType = false;
        Object.keys(types[typeKey].childs).forEach(function (objectKey) {
            let addedObject = false;
            if (Metadata.Utils.haveChilds(types[typeKey].childs[objectKey])) {
                Object.keys(types[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                    if (types[typeKey].childs[objectKey].childs[itemKey].checked) {
                        if (!addedType) {
                            items.push(MultiStepInput.getItem(typeKey));
                            addedType = true;
                        }
                        if (!addedObject) {
                            items.push(MultiStepInput.getItem('\t' + objectKey));
                            addedObject = true;
                        }
                        items.push(MultiStepInput.getItem('\t\t' + itemKey));
                    }
                });
            } else {
                if (types[typeKey].childs[objectKey].checked) {
                    if (!addedType) {
                        items.push(MultiStepInput.getItem(typeKey));
                        addedType = true;
                    }
                    items.push(MultiStepInput.getItem('\t' + objectKey));
                }
            }
        });

    });
    input.items = items;
    input.buttons = buttons;
    return input;
}

