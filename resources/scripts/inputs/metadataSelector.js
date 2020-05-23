const vscode = require('vscode');
const Metadata = require('../metadata');
const FileSystem = require('../fileSystem');

const TYPE_STEP = 1;
const OBJECT_STEP = 2;
const ITEM_STEP = 3;
const RESULT_STEP = 4;

class MetadataSelector {

    constructor(title, metadata) {
        this._title = title;
        this._metadata = metadata;
        this._step = TYPE_STEP;
        this._totalSteps = 4;
        this._currentIntput = undefined;
        this._selectedType = undefined;
        this._selectedObject = undefined;
        this._lastStep = undefined;
        this._onAcceptCallback = undefined;
        this._onCancelCallback = undefined;
        this._onDeleteCallback = undefined;
        this._allowDelete = false;
    }

    allowDelete(allow) {
        this._allowDelete = allow;
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

    setMetadata(metadata){
        this._metadata = metadata;
    }   

    reset() {
        this._step = 1;
        if (this._currentIntput)
            this._currentIntput.dispose();
        this.show();
    }

    show() {
        let input;
        try {
            switch (this._step) {
                case TYPE_STEP:
                    this._lastStep = this._step;
                    input = createMetadataTypeInput(this._metadata);
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
            input.onDidAccept(item => {
                this._step--;
                this.show();
            });
            input.onDidTriggerButton((item) => {
                if (item.tooltip === 'Ok') {
                    if (this._step === RESULT_STEP) {
                        if (this._onAcceptCallback) {
                            this._onAcceptCallback.call(this, this._metadata);
                            this._currentIntput.dispose();
                        }
                    } else {
                        this._step = RESULT_STEP;
                        this.show();
                    }
                } else if (item.tooltip === 'Delete') {
                    this._onDeleteCallback.call(this, this._metadata);
                } else {
                    if (this._step === RESULT_STEP)
                        this._step = this._lastStep;
                    else
                        this._step--;
                    this.show();
                }
            });
            input.onDidHide(() => {
                if (this._currentIntput)
                    this._currentIntput.dispose();
                if (this._onCancelCallback) {
                    this._onCancelCallback.call(this);
                }
            });
            input.onDidChangeSelection(items => {
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
            });
            if (this._currentIntput)
                this._currentIntput.dispose();
            this._currentIntput = input;
            this._currentIntput.show();
        } catch (error) {
            if (this._currentIntput)
                this._currentIntput.dispose();
            throw error;
        }
    }
}
module.exports = MetadataSelector;

function createMetadataTypeInput(types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = 'Metadata Types';
    input.step = TYPE_STEP;
    input.totalSteps = 4;
    input.placeholder = 'Choose an Element';
    let buttons = [];
    if (allowDelete)
        buttons.push(getDeleteButton());
    buttons.push(getOkButton());
    input.buttons = buttons;
    let items = [];
    Object.keys(types).forEach(function (type) {
        let nSelected = Metadata.Utils.countCheckedChilds(types[type]);
        let item = getItem(type, undefined, undefined, types[type].checked);
        items.push(item);
    });
    input.items = items;
    return input;
}

function createMetadataObjectInput(selectedType, types, allowDelete) {
    let input = vscode.window.createQuickPick();
    input.title = selectedType + ' Metadata Type Elements';
    input.step = OBJECT_STEP;
    input.totalSteps = 4;
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
        let item = getItem(objectKey, selectedType, undefined, checked);
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
    input.totalSteps = 4;
    input.placeholder = 'Select Elements';
    input.buttons = getButtons(allowDelete);
    let items = [];
    let selectedItems = [];
    let metadataObject = types[selectedType].childs[selectedObject];
    Object.keys(metadataObject.childs).forEach(function (itemKey) {
        let metadataItem = metadataObject.childs[itemKey];
        let item = getItem(itemKey, selectedType + ':' + selectedObject, undefined, metadataItem.checked);
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
    input.totalSteps = 4;
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
                            items.push(getItem(typeKey));
                            addedType = true;
                        }
                        if (!addedObject) {
                            items.push(getItem('\t' + objectKey));
                            addedObject = true;
                        }
                        items.push(getItem('\t\t' + itemKey));
                    }
                });
            } else {
                if (types[typeKey].childs[objectKey].checked) {
                    if (!addedType) {
                        items.push(getItem(typeKey));
                        addedType = true;
                    }
                    items.push(getItem('\t' + objectKey));
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
            getDeleteButton(),
            getOkButton()
        ];
    } else {
        return [
            vscode.QuickInputButtons.Back,
            getOkButton()
        ];
    }

}

function getDeleteButton() {
    return {
        tooltip: "Delete",
        iconPath: {
            light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/delete-black-18dp.svg')),
            dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/delete-white-18dp.svg')),
        }
    };
}

function getOkButton() {
    return {
        tooltip: "Ok",
        iconPath: {
            light: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/light/done_outline-black-18dp.svg')),
            dark: vscode.Uri.file(FileSystem.Paths.getAbsolutePath('./resources/images/dark/done_outline-white-18dp.svg')),
        }
    };
}

function getItem(label, description, detail, picked) {
    return {
        description: description,
        detail: detail,
        label: label,
        picked: picked
    }
}