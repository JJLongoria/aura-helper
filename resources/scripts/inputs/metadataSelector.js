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
                    this._currentInput.dispose();
                }
            } else {
                this._step = RESULT_STEP;
                this.show();
            }
        } else if (buttonName === 'Delete') {
            this._onDeleteCallback.call(this, this._metadata);
        }
    }

    onChangeSelection(items) {
        let selectedType;
        let metadata;
        switch (this._step) {
            case TYPE_STEP:
                this._selectedType = items[0].label;
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
                    if(items.length > 0)
                        this._selectedObject = items[0].label;
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
    buttons.push(MultiStepInput.getAcceptButton());
    input.buttons = buttons;
    let items = [];
    Object.keys(types).forEach(function (type) {
        let nSelected = Metadata.Utils.countCheckedChilds(types[type]);
        let item = MultiStepInput.getItem(type, undefined, undefined, types[type].checked);
        items.push(item);
    });
    input.items = items;
    return input;
}

function createMetadataObjectInput(selectedType, types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = selectedType + ' Metadata Type Elements';
    input.step = OBJECT_STEP;
    input.totalSteps = RESULT_STEP;
    input.buttons = getButtons(allowDelete);
    let items = [];
    let metadataType = types[selectedType];
    let selectedItems = [];
    let canPickMany = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        if (Metadata.Utils.haveChilds(metadataObject))
            canPickMany = false;
    });
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        let checked = (canPickMany) ? metadataObject.checked : undefined;
        let item = MultiStepInput.getItem(objectKey, selectedType, undefined, checked);
        items.push(item);
        if (checked)
            selectedItems.push(item);
    });
    input.canSelectMany = canPickMany;
    if (input.canSelectMany)
        input.placeholder = 'Select Elements';
    else
        input.placeholder = 'Choose an Element';
    input.items = items;
    input.selectedItems = selectedItems;
    return input;
}

function createMetadataItemInput(selectedType, selectedObject, types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = 'Elements from ' + selectedObject + ' (' + selectedType + ')';
    input.step = TYPE_STEP;
    input.totalSteps = RESULT_STEP;
    input.placeholder = 'Select Elements';
    input.buttons = getButtons(allowDelete);
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
    input.selectedItems = selectedItems;
    return input;
}

function createResultInput(types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = 'Selected Elements';
    input.step = RESULT_STEP;
    input.totalSteps = RESULT_STEP;
    input.placeholder = 'Showing a summary of the selected elements';
    input.buttons = getButtons(allowDelete);
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
    return input;
}

function getButtons(allowDelete) {
    if (allowDelete) {
        return [
            vscode.QuickInputButtons.Back,
            MultiStepInput.getDeleteButton(),
            MultiStepInput.getAcceptButton()
        ];
    } else {
        return [
            vscode.QuickInputButtons.Back,
            MultiStepInput.getAcceptButton()
        ];
    }

}

