const vscode = require('vscode');
const XMLEditor = require('./xmlEditor');
const MultiStepInput = require('./xmlEditor');
const Config = require('../core/config');
const AppContext = require('../core/applicationContext');
const Metadata = require('../metadata');
const Utils = require('../metadata/utils');
const ProcessManager = require('../processes/processManager');

const ROOT_STEP = 1;
const PERMISSIONS_STEP = 2;
const ELEMENT_STEP = 3;
const SUB_ELEMENT_STEP = 4;
const RESULT_STEP = 5;

class PermissionEditor extends XMLEditor {

    constructor(title, file, metadata, isPermissionSet) {
        super(title, ROOT_STEP, 3, file);
        this._selectedCollection = undefined;
        this._selectedElement = undefined;
        this._selectedSubElement = undefined;
        this._metadata = metadata;
        this._finalStep = RESULT_STEP;
        this._isPermissionSet = isPermissionSet;
        if (this._isPermissionSet) {
            this._permissionsContent = Metadata.PermissionSetUtils.createPermissionSet(this._xmlContent.PermissionSet);
            this._xmlMetadata = Metadata.PermissionSetUtils.getXMLMetadata();
        } else {
            this._permissionsContent = Metadata.ProfileUtils.createProfile(this._xmlContent.Profile);
            this._xmlMetadata = Metadata.ProfileUtils.getXMLMetadata();
        }
        if (!this._isPermissionSet && Config.getConfig().metadata.mergeLocalDataPermissions)
            this._permissionsContent = Metadata.ProfileUtils.mergeProfileWithLocalData(this._permissionsContent, this._metadata);
        this._profileMetadata = extractMetadataFromProfile(this._permissionsContent, this._xmlMetadata);
        this._oldPermissionContent = JSON.parse(JSON.stringify(this._permissionsContent));
    }

    onCreateInputRequest() {
        let input;
        switch (this._step) {
            case ROOT_STEP:
                this._lastStep = this._step;
                return this.createRootInput();
            case PERMISSIONS_STEP:
                this._lastStep = this._step;
                return this.createPermissionsInput();
            case ELEMENT_STEP:
                this._lastStep = this._step;
                return this.createElementInput();
            case SUB_ELEMENT_STEP:
                this._lastStep = this._step;
                return this.createSubElementInput();
            case RESULT_STEP:
                return this.createResultInput();
        }
        return input;
    }

    async onButtonPressed(buttonName) {
        if (buttonName === 'back') {
            if (this._step === PERMISSIONS_STEP) {
                if (this._isAddingMode) {
                    this._step++;
                    this._isAddingMode = false;
                    let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                    let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
                    if (Array.isArray(fieldKey)) {
                        this._permissionsContent[elementData.key].pop();
                    }
                }
            }
        } else if (buttonName === 'Accept') {
            if (this._step === ROOT_STEP) {
                this._step = RESULT_STEP;
                this.show();
            } else if (this._step === RESULT_STEP) {
                if (this._isPermissionSet)
                    this._xmlContent.PermissionSet = this._permissionsContent;
                else
                    this._xmlContent.Profile = this._permissionsContent;
                this.save();
                if(this._onAcceptCallback)
                    this._onAcceptCallback.call(this);
                this._currentInput.dispose();
            } else {
                let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                if (elementData.key === 'loginIpRanges') {
                    let element = this._permissionsContent[elementData.key][this._permissionsContent[elementData.key].length - 1];
                    let validationError = undefined;
                    for (let field of Object.keys(elementData.xmlData.fields)) {
                        let fieldData = elementData.xmlData.fields[field];
                        let error = fieldData.validate(element[field]);
                        if (error) {
                            if (!validationError)
                                validationError = error;
                            else
                                validationError += '; ' + error;
                        }
                    }
                    if (!validationError) {
                        if (element.description === '-- None --')
                            this._permissionsContent[elementData.key][this._permissionsContent[elementData.key].length - 1].description = undefined;
                        Metadata.Utils.sort(this._permissionsContent[elementData.key], elementData.xmlData.sortOrder);
                        this._isAddingMode = false;
                        this.show();
                    } else {
                        if (this._onValidationErrorCallback)
                            this._onValidationErrorCallback.call(this, validationError);
                    }
                }
            }
        } else if (buttonName === 'Ok') {
            let elementData = {};
            let fieldKeys = [];
            let fieldKeysWithoutMain = [];
            let selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
            let items = [];
            switch (this._step) {
                case PERMISSIONS_STEP:
                    elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                    fieldKeys = Object.keys(elementData.xmlData.fields);
                    fieldKeysWithoutMain = getFieldKeysWithoutKey(elementData);
                    if (this._isAddingMode) {
                        this._isAddingMode = false;
                        this._step++;
                        for (let selectedItem of selectedItems) {
                            let dataToAdd = {};
                            for (let field of fieldKeys) {
                                let fieldData = elementData.xmlData.fields[field];
                                dataToAdd[field] = (fieldData.default == '{!value}') ? selectedItem : fieldData.default;
                            }
                            this._permissionsContent[elementData.key].push(dataToAdd);
                        }
                        Metadata.Utils.sort(this._permissionsContent[elementData.key], elementData.xmlData.sortOrder);
                        this._profileMetadata = extractMetadataFromProfile(this._permissionsContent, this._xmlMetadata);
                    } else if (fieldKeys.length === 2) {
                        let fieldData = elementData.xmlData.fields[fieldKeysWithoutMain[0]];
                        if (fieldData.datatype === 'boolean') {
                            for (let xmlElement of this._permissionsContent[elementData.key]) {
                                xmlElement[fieldKeysWithoutMain[0]] = selectedItems.includes(xmlElement[elementData.xmlData.fieldKey]);
                            }
                        }
                    }
                    break;
                case ELEMENT_STEP:
                    elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                    fieldKeys = Object.keys(elementData.xmlData.fields);
                    if (elementData.datatype === 'array') {
                        if (this._isAddingMode) {
                            this._isAddingMode = false;
                            this._step++;
                            for (let selectedItem of selectedItems) {
                                let dataToAdd = {};
                                for (let field of fieldKeys) {
                                    let fieldData = elementData.xmlData.fields[field];
                                    if (fieldData.separator) {
                                        dataToAdd[field] = (fieldData.default == '{!value}') ? this._selectedElement + fieldData.separator + selectedItem : fieldData.default;
                                    } else {
                                        dataToAdd[field] = (fieldData.default == '{!value}') ? selectedItem : fieldData.default;
                                    }
                                }
                                this._permissionsContent[elementData.key].push(dataToAdd);
                            }
                            Metadata.Utils.sort(this._permissionsContent[elementData.key], elementData.xmlData.sortOrder);
                            this._profileMetadata = extractMetadataFromProfile(this._permissionsContent, this._xmlMetadata);
                        } else {
                            let uniqueFields = [];
                            for (let xmlElement of this._permissionsContent[elementData.key]) {
                                if (xmlElement[elementData.xmlData.fieldKey] === this._selectedElement) {
                                    for (let fieldKey of fieldKeys) {
                                        let fieldData = elementData.xmlData.fields[fieldKey];
                                        if (fieldData.editable) {
                                            if (fieldData.datatype === 'boolean') {
                                                if (fieldData.unique && selectedItems.includes(fieldKey))
                                                    uniqueFields.push({
                                                        field: fieldKey,
                                                        datatype: "boolean",
                                                        value: true,
                                                    });
                                                xmlElement[fieldKey] = selectedItems.includes(fieldKey);
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                            let checkedNow = getCheckedItems(selectedItems, this._currentInput.items);
                            let uncheckedNow = getUncheckedItems(selectedItems, this._currentInput.items);
                            if (checkedNow.length === 0 && uncheckedNow.length === 0)
                                checkedNow = selectedItems;
                            handleUniqueFields(uniqueFields, elementData, this._permissionsContent, this._selectedElement);
                            handleControlledFields(checkedNow, elementData, this._permissionsContent, this._selectedElement);
                            handleControlledFields(uncheckedNow, elementData, this._permissionsContent, this._selectedElement);
                        }
                    }
                    break;
                case SUB_ELEMENT_STEP:
                    elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                    fieldKeys = Object.keys(elementData.xmlData.fields);
                    let uniqueFields = [];
                    for (let xmlElement of this._permissionsContent[elementData.key]) {
                        if (xmlElement[elementData.xmlData.fieldKey] === this._selectedElement + elementData.xmlData.fields[elementData.xmlData.fieldKey].separator + this._selectedSubElement) {
                            for (let fieldKey of fieldKeys) {
                                let fieldData = elementData.xmlData.fields[fieldKey];
                                if (fieldData.editable) {
                                    if (fieldData.datatype === 'boolean') {
                                        if (fieldData.unique && selectedItems.includes(fieldKey))
                                            uniqueFields.push({
                                                field: fieldKey,
                                                datatype: "boolean",
                                                value: true,
                                            });
                                        xmlElement[fieldKey] = selectedItems.includes(fieldKey);
                                    }
                                }
                            }
                            break;
                        }
                    }
                    let checkedNow = getCheckedItems(selectedItems, this._currentInput.items);
                    let uncheckedNow = getUncheckedItems(selectedItems, this._currentInput.items);
                    if (checkedNow.length === 0 && uncheckedNow.length === 0)
                        checkedNow = selectedItems;
                    handleUniqueFields(uniqueFields, elementData, this._permissionsContent, this._selectedElement, this._selectedSubElement);
                    handleControlledFields(checkedNow, elementData, this._permissionsContent, this._selectedElement, this._selectedSubElement);
                    handleControlledFields(uncheckedNow, elementData, this._permissionsContent, this._selectedElement, this._selectedSubElement);
                    break;
                default:
                    break;
            }
        } else if (buttonName === 'Add') {
            let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
            let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
            let fieldKeys = Object.keys(elementData.xmlData.fields);
            switch (this._step) {
                case PERMISSIONS_STEP:
                case ELEMENT_STEP:
                    if (elementData.metadataType || Array.isArray(fieldKey)) {
                        if (this._metadata[elementData.metadataType]) {
                            this._isAddingMode = true;
                            this.show();
                        } else if (Array.isArray(fieldKey)) {
                            let dataToAdd = {};
                            for (let field of fieldKeys) {
                                let fieldData = elementData.xmlData.fields[field];
                                dataToAdd[field] = (fieldData.default === '{!value}') ? '-- None --' : fieldData.default;
                            }
                            this._permissionsContent[elementData.key].push(dataToAdd);
                            this._isAddingMode = true;
                            this.show();
                        } else {
                            if (this._onReportCallback)
                                this._onReportCallback.call(this, 'Not found ' + elementData.metadataType + " metadata on your local project");
                        }
                    } else if (elementData.key === "userPermissions") {
                        this._currentInput.busy = true;
                        this._currentInput.enabled = false;
                        if (!AppContext.availablePermissions || AppContext.availablePermissions.length === 0) {
                            try {
                                AppContext.availablePermissions = await loadUserPermissions();
                                this._isAddingMode = true;
                                this._currentInput.busy = false;
                                this._currentInput.enabled = true;
                                this.show();
                            } catch (error) {
                                if (this._onErrorCallback)
                                    this._onErrorCallback.call(this, "An error  ocurred while loading user permissions: " + error);
                            }

                        } else {
                            this._currentInput.busy = false;
                            this._currentInput.enabled = true;
                            this._isAddingMode = true;
                            this.show();
                        }
                    }
                    break;
                case ELEMENT_STEP:
                    break;
                case SUB_ELEMENT_STEP:
                    break;
            }
        }
    }

    onChangeValue(value) {

    }

    onValueSet(value) {
        let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
        switch (this._step) {
            case PERMISSIONS_STEP:
                if (this._permissionsContent) {
                    if (elementData.key === 'description' && value && value.length > 255) {
                        this._currentInput.validationMessage = "Description to long. Remove at least " + (value.length - 255) + " characters";
                        return;
                    }
                    this._permissionsContent[elementData.key] = value;
                }
                break;
            case ELEMENT_STEP:
                if (this._permissionsContent) {
                    if (elementData.key === 'loginIpRanges') {
                        let fieldData = elementData.xmlData.fields[this._selectedElement];
                        let error = fieldData.validate(value);
                        if (error) {
                            this._step++;
                            if (this._onValidationErrorCallback)
                                this._onValidationErrorCallback.call(this, error);
                        }
                        this._permissionsContent[elementData.key][this._permissionsContent[elementData.key].length - 1][this._selectedElement] = value;
                    }
                }
                break;
            case SUB_ELEMENT_STEP:
                if (this._permissionsContent) {
                    if (elementData.key === 'loginIpRanges') {
                        let fieldData = elementData.xmlData.fields[this._selectedSubElement];
                        let error = fieldData.validate(value);
                        if (error) {
                            this._step++;
                            if (this._onValidationErrorCallback)
                                this._onValidationErrorCallback.call(this, error);
                        }
                    }
                    for (let xmlElement of this._permissionsContent[elementData.key]) {
                        let fieldKeyValue = getValue(xmlElement, getFieldKey(elementData.xmlData.fieldKey));
                        if (fieldKeyValue === this._selectedElement) {
                            xmlElement[this._selectedSubElement] = value;
                            this._selectedElement = getValue(xmlElement, getFieldKey(elementData.xmlData.fieldKey));
                            break;
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    onChangeSelection(items) {
        let elementData = {};
        let fieldKeys = [];
        let selectedItems = this.getSelectedElements(items);
        let fieldKeysWithoutMain = [];
        switch (this._step) {
            case ROOT_STEP:
                this._selectedCollection = items[0].label;
                this._step = PERMISSIONS_STEP;
                this.show();
                break;
            case PERMISSIONS_STEP:
                elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                fieldKeys = Object.keys(elementData.xmlData.fields);
                fieldKeysWithoutMain = getFieldKeysWithoutKey(elementData);
                if (this._isAddingMode && !this._currentInput.canSelectMany) {
                    this._selectedElement = selectedItems[0];
                    this._step = ELEMENT_STEP;
                    this.show();
                } else if (!this._isAddingMode) {
                    if (fieldKeys.length === 2) {
                        let fieldData = elementData.xmlData.fields[fieldKeysWithoutMain[0]];
                        if (fieldData.datatype !== 'boolean' || elementData.metadataType === Metadata.MetadataTypes.CUSTOM_FIELDS || elementData.metadataType === Metadata.MetadataTypes.RECORD_TYPE) {
                            this._selectedElement = selectedItems[0];
                            this._step = ELEMENT_STEP;
                            this.show();
                        }
                    } else if (fieldKeys.length > 2) {
                        this._selectedElement = selectedItems[0];
                        this._step = ELEMENT_STEP;
                        this.show();
                    }
                }
                break;
            case ELEMENT_STEP:
                elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                fieldKeys = Object.keys(elementData.xmlData.fields);
                fieldKeysWithoutMain = getFieldKeysWithoutKey(elementData);
                if (this._isAddingMode) {

                } else {
                    if (fieldKeys.length === 2 || !elementData.xmlData.fieldKey) {
                        let field = fieldKeysWithoutMain[0];
                        if (!elementData.xmlData.fieldKey)
                            field = this._selectedElement;
                        let fieldData = elementData.xmlData.fields[field];
                        if (fieldData.datatype === 'enum') {
                            if (elementData.datatype === 'array') {
                                for (let xmlElement of this._permissionsContent[elementData.key]) {
                                    if (xmlElement[elementData.xmlData.fieldKey] === this._selectedElement) {
                                        xmlElement[field] = elementData.xmlData.fields[field].getValue(selectedItems[0]);
                                        break;
                                    }
                                }
                            } else {
                                let value = elementData.xmlData.fields[field].getValue(selectedItems[0]);
                                let validationMessage;
                                if (field.indexOf('Start') !== -1) {
                                    let endField = field.replace('Start', 'End');
                                    let endFieldData = elementData.xmlData.fields[endField];
                                    let endValue = this._permissionsContent[elementData.key][endField];
                                    if (endValue && endValue < value) {
                                        validationMessage = 'Wrong Start Time value (' + fieldData.getLabel(value) + ') for ' + field + ' field. Start time must be earlier than end time (End Time: ' + endFieldData.getLabel(endValue) + ')';
                                    } else if (!endValue || !value) {
                                        this._permissionsContent[elementData.key][endField] = value;
                                    }
                                } else if (field.indexOf('End') !== -1) {
                                    let startField = field.replace('End', 'Start');
                                    let startFieldData = elementData.xmlData.fields[startField];
                                    let startValue = this._permissionsContent[elementData.key][startField]
                                    if (startValue && startValue > value) {
                                        validationMessage = 'Wrong End Time value (' + fieldData.getLabel(value) + ') for ' + field + ' field. Start time must be earlier than end time (Start Time: ' + startFieldData.getLabel(startValue) + ')';
                                    } else if (!startValue || !value) {
                                        this._permissionsContent[elementData.key][startField] = value;
                                    }
                                }
                                if (!validationMessage) {
                                    this._permissionsContent[elementData.key][field] = value;
                                }
                                else if (this._onValidationErrorCallback)
                                    this._onValidationErrorCallback.call(this, validationMessage);
                            }
                        } else if (elementData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                            this._selectedSubElement = selectedItems[0];
                            this._step = SUB_ELEMENT_STEP;
                            this.show();
                        }
                    } else {
                        let allTextFields = true;
                        for (let field of fieldKeys) {
                            allTextFields = elementData.xmlData.fields[field].datatype === 'string';
                            if (!allTextFields)
                                break;
                        }
                        if (elementData.metadataType === Metadata.MetadataTypes.CUSTOM_FIELDS || elementData.metadataType === Metadata.MetadataTypes.RECORD_TYPE || allTextFields) {
                            this._selectedSubElement = selectedItems[0];
                            this._step = SUB_ELEMENT_STEP;
                            this.show();
                        }
                    }
                }
                break;
            case SUB_ELEMENT_STEP:
                elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
                fieldKeys = Object.keys(elementData.xmlData.fields);
                fieldKeysWithoutMain = getFieldKeysWithoutKey(elementData);
                if (elementData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                    let rtField = elementData.xmlData.fields[fieldKeysWithoutMain[0]];
                    let mainFieldData = elementData.xmlData.fields[elementData.xmlData.fieldKey];
                    let element;
                    for (let xmlElement of this._permissionsContent[elementData.key]) {
                        let selectedItem = this._selectedElement + mainFieldData.separator + selectedItems[0];
                        if (this._selectedSubElement === 'Master') {
                            if (xmlElement[elementData.xmlData.fieldKey].startsWith(this._selectedElement + elementData.xmlData.fields[elementData.xmlData.fieldKey].separator) && !xmlElement[fieldKeysWithoutMain[0]]) {
                                element = xmlElement;
                                xmlElement[elementData.xmlData.fieldKey] = this._selectedElement + mainFieldData.separator + selectedItems[0];
                                break;
                            }
                        } else {
                            if (xmlElement[fieldKeysWithoutMain[0]] === this._selectedElement + rtField.separator + this._selectedSubElement) {
                                element = xmlElement;
                                xmlElement[elementData.xmlData.fieldKey] = this._selectedElement + mainFieldData.separator + selectedItems[0];
                                break;
                            }
                        }
                    }
                    if (!element) {
                        if (this._selectedSubElement === 'Master')
                            this._permissionsContent[elementData.key].push(elementData.create(this._selectedElement + mainFieldData.separator + selectedItems[0]));
                        else
                            this._permissionsContent[elementData.key].push(elementData.create(this._selectedElement + mainFieldData.separator + selectedItems[0], this._selectedElement + rtField.separator + this._selectedSubElement));
                        Metadata.Utils.sort(this._permissionsContent[elementData.key], elementData.xmlData.sortOrder);
                    }
                    this._profileMetadata = extractMetadataFromProfile(this._permissionsContent, this._xmlMetadata);
                }
                break;
        }
    }

    createRootInput() {
        let input;
        if (this._permissionsContent) {
            let lastVersion = Config.getLastVersion();
            let orgVersion = parseInt(Config.getOrgVersion());
            input = vscode.window.createQuickPick();
            input.title = this._title;
            input.step = ROOT_STEP;
            input.totalSteps = RESULT_STEP;
            input.placeholder = 'Choose an Element';
            let buttons = [];
            buttons.push(MultiStepInput.getAcceptButton());
            input.buttons = buttons;
            let items = [];
            for (let elementKey of Object.keys(this._xmlMetadata)) {
                let elementData = this._xmlMetadata[elementKey];
                if (elementData.editable) {
                    if ((elementKey === "description" && this._permissionsContent["custom"]) || elementKey !== "description") {
                        if (Metadata.Utils.availableOnVersion(elementData, lastVersion, orgVersion)) {
                            let item = MultiStepInput.getItem(elementData.label, undefined, undefined, undefined);
                            items.push(item);
                        }
                    }
                }
            }
            input.items = items;
        }
        return input;
    }

    createPermissionsInput() {
        let input;
        if (this._permissionsContent) {
            let buttons;
            let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
            let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
            if (elementData.datatype === 'string') {
                input = vscode.window.createInputBox();
                input.value = (this._permissionsContent[elementData.key]) ? this._permissionsContent[elementData.key] : '';
                input.placeholder = 'Write a ' + elementData.label + ' for ' + ((this._isPermissionSet) ? "Permission Set" : "Profile") + " " + this._fileName;
                input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
                buttons = [MultiStepInput.getBackButton()];
            } else {
                input = vscode.window.createQuickPick();
                let items = [];
                let selectedItems = [];
                buttons = [MultiStepInput.getBackButton()];
                if (!this._isAddingMode)
                    buttons.push(MultiStepInput.getAddButton());
                if (elementData.datatype === 'array') {
                    if (this._permissionsContent[elementData.key]) {
                        if (elementData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                            buttons = [MultiStepInput.getBackButton()];
                            if (this._metadata && this._metadata[Metadata.MetadataTypes.RECORD_TYPE] && Metadata.Utils.haveChilds(this._metadata[Metadata.MetadataTypes.RECORD_TYPE])) {
                                for (let objKey of Object.keys(this._metadata[Metadata.MetadataTypes.RECORD_TYPE].childs)) {
                                    let item = MultiStepInput.getItem(objKey, undefined, undefined, undefined);
                                    items.push(item);
                                }
                            } else {
                                let sorted = Object.keys(this._profileMetadata[elementData.key]).sort();
                                for (let obj of sorted) {
                                    let item = MultiStepInput.getItem(obj, undefined, undefined, undefined);
                                    items.push(item);
                                }
                            }
                        } else if (elementData.metadataType === Metadata.MetadataTypes.CUSTOM_FIELDS || elementData.metadataType === Metadata.MetadataTypes.RECORD_TYPE) {
                            if (this._isAddingMode) {
                                let differences = getTypeDifferences(this._metadata, this._profileMetadata, elementData.key, this._xmlMetadata);
                                if (differences[elementData.metadataType]) {
                                    let sorted = Object.keys(differences[elementData.metadataType].childs).sort();
                                    for (let objectKey of sorted) {
                                        let item = MultiStepInput.getItem(objectKey, undefined, undefined, undefined);
                                        items.push(item);
                                    }
                                } else {
                                    if (this._onReportCallback)
                                        this._onReportCallback.call(this, "Not new " + elementData.metadataType + " found for add to this " + ((this._isPermissionSet) ? "Permission Set" : "Profile"));
                                    this._isAddingMode = false;
                                }
                            }
                            if (!this._isAddingMode) {
                                let sorted = Object.keys(this._profileMetadata[elementData.key]).sort();
                                for (let obj of sorted) {
                                    let item = MultiStepInput.getItem(obj, undefined, undefined, undefined);
                                    items.push(item);
                                }
                            }
                        } else {
                            if (this._isAddingMode) {
                                if (elementData.key === 'userPermissions') {
                                    let notAddedPermissions = [];
                                    if (!this._permissionsContent[elementData.key])
                                        notAddedPermissions = AppContext.availablePermissions;
                                    else {
                                        let permissionsOnProfile = [];
                                        for (let xmlElement of this._permissionsContent[elementData.key]) {
                                            permissionsOnProfile.push(xmlElement[elementData.xmlData.fieldKey]);
                                        }
                                        for (let permission of AppContext.availablePermissions) {
                                            if (!permissionsOnProfile.includes(permission))
                                                notAddedPermissions.push(permission);
                                        }
                                        if (notAddedPermissions.length > 0) {
                                            input.canSelectMany = true;
                                            for (let permission of notAddedPermissions) {
                                                let item = MultiStepInput.getItem(permission, undefined, undefined, undefined);
                                                items.push(item);
                                            }
                                        } else {
                                            this._isAddingMode = false;
                                            if (this._onReportCallback)
                                                this._onReportCallback.call(this, "Not new User Permissions found for add to this " + ((this._isPermissionSet) ? "Permission Set" : "Profile"));
                                        }
                                    }
                                } else if (Array.isArray(fieldKey)) {
                                    buttons.push(MultiStepInput.getAcceptButton());
                                    let element = this._permissionsContent[elementData.key][this._permissionsContent[elementData.key].length - 1];
                                    for (let field of Object.keys(elementData.xmlData.fields)) {
                                        let description;
                                        if (element)
                                            description = element[field];
                                        let item = MultiStepInput.getItem(field, undefined, description, undefined);
                                        items.push(item);
                                    }
                                } else {
                                    let differences = getTypeDifferences(this._metadata, this._profileMetadata, elementData.key, this._xmlMetadata);
                                    if (differences[elementData.metadataType]) {
                                        input.canSelectMany = true;
                                        let sorted = Object.keys(differences[elementData.metadataType].childs).sort();
                                        for (let objectKey of sorted) {
                                            let item = MultiStepInput.getItem(objectKey, undefined, undefined, undefined);
                                            items.push(item);
                                        }
                                    } else {
                                        if (this._onReportCallback)
                                            this._onReportCallback.call(this, "Not new " + elementData.metadataType + " found for add to this " + ((this._isPermissionSet) ? "Permission Set" : "Profile"));
                                        this._isAddingMode = false;
                                    }
                                }
                            }
                            if (!this._isAddingMode) {
                                for (let xmlElement of this._permissionsContent[elementData.key]) {
                                    let item;
                                    let selected = false;
                                    let fieldKeys = Object.keys(elementData.xmlData.fields);
                                    let fieldKeysWithMain = getFieldKeysWithoutKey(elementData);
                                    if (fieldKeys.length === 2) {
                                        let fieldData = elementData.xmlData.fields[fieldKeysWithMain[0]];
                                        if (fieldData.datatype === 'boolean') {
                                            input.canSelectMany = true;
                                            item = MultiStepInput.getItem(xmlElement[elementData.xmlData.fieldKey], undefined, undefined, xmlElement[fieldKeysWithMain[0]]);
                                            selected = xmlElement[fieldKeysWithMain[0]];
                                        } else if (fieldData.datatype === 'enum') {
                                            let description = elementData.xmlData.fields[fieldKeysWithMain[0]].getLabel(xmlElement[fieldKeysWithMain[0]]);
                                            item = MultiStepInput.getItem(xmlElement[elementData.xmlData.fieldKey], undefined, description, undefined);
                                        }
                                    } else {
                                        let description = getDescription(xmlElement, elementData, false);
                                        let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
                                        let itemName;
                                        if (Array.isArray(fieldKey)) {
                                            for (let field of fieldKey) {
                                                if (!itemName)
                                                    itemName = xmlElement[field];
                                                else
                                                    itemName += ' - ' + xmlElement[field];
                                            }
                                        } else {
                                            itemName = xmlElement[fieldKey];
                                        }
                                        item = MultiStepInput.getItem(itemName, undefined, description, undefined);
                                    }
                                    if (selected)
                                        selectedItems.push(item);
                                    if (item)
                                        items.push(item);
                                }
                            }
                        }
                    }
                } else {
                    buttons = [MultiStepInput.getBackButton()];
                    if (!elementData.xmlData.fieldKey) {
                        for (let field of Object.keys(elementData.xmlData.fields)) {
                            let item = MultiStepInput.getItem(field, undefined, elementData.xmlData.fields[field].getLabel(this._permissionsContent[elementData.key][field]), undefined);
                            items.push(item);
                        }
                    }
                }
                input.items = items;
                if (selectedItems.length > 0)
                    input.selectedItems = selectedItems;
                input.placeholder = 'Choose an Element';
            }
            input.title = this._fileName + ":\n Edit " + elementData.label + ((this._isAddingMode) ? " (Add Mode)" : "");
            input.step = PERMISSIONS_STEP;
            input.totalSteps = RESULT_STEP;
            input.buttons = buttons;
        }
        return input;
    }

    createElementInput() {
        let input;
        if (this._permissionsContent) {
            let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
            let buttons = [MultiStepInput.getBackButton()];
            if (elementData.xmlData.fieldKey !== undefined)
                buttons.push(MultiStepInput.getAddButton());
            if (this._permissionsContent[elementData.key]) {
                let items = [];
                let selectedItems = [];
                let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
                if (!fieldKey || Array.isArray(fieldKey) || !elementData.xmlData.fields[fieldKey].separator) {
                    if (this._isAddingMode) {
                        if (Array.isArray(fieldKey)) {
                            let element = this._permissionsContent[elementData.key][this._permissionsContent[elementData.key].length - 1];
                            input = vscode.window.createInputBox();
                            if (element) {
                                input.value = (element[this._selectedElement]) ? element[this._selectedElement] : '';
                                input.title = this._fileName + ":\n Edit " + elementData.label + " - " + this._selectedElement + ((this._isAddingMode) ? " (Add Mode)" : "");
                                input.placeholder = 'Write a value for ' + this._selectedElement;
                            }
                            input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
                        }
                    } else {
                        input = vscode.window.createQuickPick();
                        let element;
                        if (elementData.datatype === 'array') {
                            for (let xmlElement of this._permissionsContent[elementData.key]) {
                                let value = getValue(xmlElement, fieldKey);
                                if (value === this._selectedElement) {
                                    element = xmlElement;
                                    break;
                                }
                            }
                        }
                        if (element || !fieldKey) {
                            let fieldKeys = Object.keys(elementData.xmlData.fields);
                            let fieldKeysWithMain = getFieldKeysWithoutKey(elementData);
                            if (fieldKeys.length === 2 || !fieldKey) {
                                let field = fieldKeysWithMain[0];
                                if (!fieldKey)
                                    field = this._selectedElement;
                                let fieldData = elementData.xmlData.fields[field];
                                if (fieldData.datatype === 'enum') {
                                    buttons = [MultiStepInput.getBackButton()];
                                    for (let enumValue of fieldData.values) {
                                        let item = MultiStepInput.getItem(enumValue.label, undefined, undefined, undefined);
                                        items.push(item);
                                    }
                                }
                            } else {
                                input.canSelectMany = false;
                                if (!Array.isArray(fieldKey)) {
                                    input.canSelectMany = true;
                                }
                                for (let field of fieldKeys) {
                                    let fieldata = elementData.xmlData.fields[field];
                                    if (fieldata.editable) {
                                        let selected = element[field] && !Array.isArray(fieldKey);
                                        let description;
                                        if (Array.isArray(fieldKey))
                                            description = element[field];
                                        let item = MultiStepInput.getItem(field, undefined, description, selected);
                                        items.push(item);
                                        if (!Array.isArray(fieldKey) && selected)
                                            selectedItems.push(item);
                                    }
                                }
                            }
                        }
                        input.items = items;
                        if (selectedItems.length > 0)
                            input.selectedItems = selectedItems;
                        input.placeholder = 'Choose an Element';
                        input.title = this._fileName + ":\n Edit " + elementData.label + " - " + this._selectedElement + ((this._isAddingMode) ? " (Add Mode)" : "");
                    }
                } else {
                    input = vscode.window.createQuickPick();
                    if (this._isAddingMode) {
                        let differences = getTypeDifferences(this._metadata, this._profileMetadata, elementData.key, this._xmlMetadata);
                        if (differences && differences[elementData.metadataType] && differences[elementData.metadataType].childs && differences[elementData.metadataType].childs[this._selectedElement]) {
                            input.canSelectMany = true;
                            let sorted = Object.keys(differences[elementData.metadataType].childs[this._selectedElement].childs).sort();
                            for (let itemKey of sorted) {
                                let item = MultiStepInput.getItem(itemKey, undefined, undefined, undefined);
                                items.push(item);
                            }
                        } else {
                            if (this._onReportCallback)
                                this._onReportCallback.call(this, "Not new " + elementData.metadataType + " found for add to this " + ((this._isPermissionSet) ? "Permission Set" : "Profile"));
                            this._isAddingMode = false;
                        }
                    }
                    if (!this._isAddingMode) {
                        if (elementData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                            buttons = [MultiStepInput.getBackButton()];
                            if (this._metadata && this._metadata[Metadata.MetadataTypes.RECORD_TYPE] && Metadata.Utils.haveChilds(this._metadata[Metadata.MetadataTypes.RECORD_TYPE])) {
                                let child = {
                                    xmlElement: undefined,
                                };
                                if (this._profileMetadata[elementData.key] && this._profileMetadata[elementData.key][this._selectedElement] && this._profileMetadata[elementData.key][this._selectedElement].childs)
                                    child = this._profileMetadata[elementData.key][this._selectedElement].childs["Master"];
                                let description;
                                if (child && child.xmlElement) {
                                    let xmlElement = child.xmlElement;
                                    description = getDescription(xmlElement, elementData, true);
                                } else {
                                    description = '-- Not Assignment --';
                                }
                                items.push(MultiStepInput.getItem("Master", undefined, description, undefined));
                                for (let itemKey of Object.keys(this._metadata[Metadata.MetadataTypes.RECORD_TYPE].childs[this._selectedElement].childs)) {
                                    description = undefined;
                                    let child = {
                                        xmlElement: undefined,
                                    };
                                    if (this._profileMetadata[elementData.key] && this._profileMetadata[elementData.key][this._selectedElement] && this._profileMetadata[elementData.key][this._selectedElement].childs)
                                        child = this._profileMetadata[elementData.key][this._selectedElement].childs[itemKey];
                                    if (child && child.xmlElement) {
                                        let xmlElement = child.xmlElement;
                                        description = getDescription(xmlElement, elementData, true);
                                    } else {
                                        description = '-- Not Assignment --';
                                    }
                                    let item = MultiStepInput.getItem(itemKey, undefined, description, undefined);
                                    items.push(item);
                                }
                            } else {
                                let sorted = Object.keys(this._profileMetadata[elementData.key][this._selectedElement].childs).sort();
                                for (let obj of sorted) {
                                    let child = this._profileMetadata[elementData.key][this._selectedElement].childs[obj];
                                    let xmlElement = child.xmlElement;
                                    let description = getDescription(xmlElement, elementData, true);
                                    let item = MultiStepInput.getItem(obj, undefined, description, undefined);
                                    items.push(item);
                                }
                            }
                        } else {
                            let sorted = Object.keys(this._profileMetadata[elementData.key][this._selectedElement].childs).sort();
                            for (let key of sorted) {
                                let child = this._profileMetadata[elementData.key][this._selectedElement].childs[key];
                                let xmlElement = child.xmlElement;
                                let description;
                                if (elementData.metadataType == Metadata.MetadataTypes.CUSTOM_FIELDS || elementData.metadataType == Metadata.MetadataTypes.RECORD_TYPE) {
                                    description = getDescription(xmlElement, elementData, false);
                                } else if (elementData.metadataType == Metadata.MetadataTypes.LAYOUT) {
                                    description = getDescription(xmlElement, elementData, true);
                                    if (!description)
                                        description = '-- Not Assignment --';
                                }
                                let item = MultiStepInput.getItem(child.name, undefined, description, undefined);
                                items.push(item);
                            }
                        }
                    }
                    input.items = items;
                    if (selectedItems.length > 0)
                        input.selectedItems = selectedItems;
                    input.placeholder = 'Choose an Element';
                    input.title = this._fileName + ":\n Edit " + elementData.label + " - " + this._selectedElement + ((this._isAddingMode) ? " (Add Mode)" : "");
                }
                input.step = ELEMENT_STEP;
                input.totalSteps = RESULT_STEP;
                if (this._isAddingMode)
                    buttons = [MultiStepInput.getBackButton()];
                input.buttons = buttons;
            }
        }
        return input;
    }

    createSubElementInput() {
        let input;
        if (this._permissionsContent) {
            let elementData = getXMLElementDataByLabel(this._selectedCollection, this._xmlMetadata);
            if (this._permissionsContent[elementData.key]) {
                let items = [];
                let selectedItems = [];
                let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
                let element;
                if (!Array.isArray(fieldKey) && elementData.xmlData.fields[fieldKey].separator) {
                    input = vscode.window.createQuickPick();
                    let fieldKeys = Object.keys(elementData.xmlData.fields);
                    for (let xmlElement of this._permissionsContent[elementData.key]) {
                        if (xmlElement[fieldKey] === this._selectedElement + elementData.xmlData.fields[fieldKey].separator + this._selectedSubElement) {
                            element = xmlElement;
                            break;
                        }
                    }
                    if (element) {
                        input.canSelectMany = true;
                        for (let field of fieldKeys) {
                            let fieldata = elementData.xmlData.fields[field];
                            if (fieldata.editable && fieldata.datatype === 'boolean') {
                                let selected = element[field];
                                let item = MultiStepInput.getItem(field, undefined, undefined, selected);
                                items.push(item);
                                if (selected)
                                    selectedItems.push(item);
                            }
                        }
                    } else if (elementData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                        let sorted = Object.keys(this._metadata[elementData.metadataType].childs[this._selectedElement].childs).sort();
                        for (let key of sorted) {
                            let item = MultiStepInput.getItem(key, undefined, undefined, undefined);
                            items.push(item);
                        }
                    }
                    input.items = items;
                    if (selectedItems.length > 0)
                        input.selectedItems = selectedItems;
                    input.title = this._fileName + ":\n Edit " + elementData.label + " - " + this._selectedElement + elementData.xmlData.fields[elementData.xmlData.fieldKey].separator + this._selectedSubElement + ((this._isAddingMode) ? " (Add Mode)" : "");
                    input.placeholder = 'Choose an Element';
                } else {
                    if (fieldKey) {
                        for (let xmlElement of this._permissionsContent[elementData.key]) {
                            let value = getValue(xmlElement, fieldKey);
                            if (value === this._selectedElement) {
                                element = xmlElement;
                                break;
                            }
                        }
                        input = vscode.window.createInputBox();
                        if (element) {
                            input.value = (element[this._selectedSubElement]) ? element[this._selectedSubElement] : '';
                            input.title = this._fileName + ":\n Edit " + elementData.label + " - " + this._selectedElement + ' -- ' + this._selectedSubElement + ((this._isAddingMode) ? " (Add Mode)" : "");
                            input.placeholder = 'Write a value for ' + this._selectedSubElement;
                        }
                        input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
                    }
                }
                input.step = SUB_ELEMENT_STEP;
                input.totalSteps = RESULT_STEP;
                let buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAddButton()];
                input.buttons = buttons;
            }
        }
        return input;
    }

    createResultInput() {
        let input;
        if (this._permissionsContent) {
            input = vscode.window.createQuickPick();
            let permissionsMap = transformPermissionContentToMap(this._permissionsContent, this._xmlMetadata);
            let oldPermissionsMap = transformPermissionContentToMap(this._oldPermissionContent, this._xmlMetadata);
            let changes = {};
            let items = [];
            for (let collectionKey of Object.keys(permissionsMap)) {
                let collection = permissionsMap[collectionKey];
                let oldCollection = oldPermissionsMap[collectionKey];
                if (collection.elements) {
                    for (let elementKey of Object.keys(collection.elements)) {
                        let xmlElement = collection.elements[elementKey];
                        let oldXmlElement = (oldCollection) ? oldCollection.elements[elementKey] : undefined;
                        if (!oldXmlElement) {
                            if (!changes[collectionKey]) {
                                changes[collectionKey] = {
                                    name: collectionKey,
                                    elements: {}
                                };
                            }
                            changes[collectionKey].elements[elementKey] = {
                                oldElement: undefined,
                                newElement: xmlElement,
                            };
                        } else {
                            for (let field of Object.keys(xmlElement)) {
                                if (xmlElement[field] !== oldXmlElement[field]) {
                                    if (!changes[collectionKey]) {
                                        changes[collectionKey] = {
                                            name: collectionKey,
                                            elements: {}
                                        };
                                    }
                                    changes[collectionKey].elements[elementKey] = {
                                        oldElement: oldXmlElement,
                                        newElement: xmlElement,
                                    };
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(changes).length > 0) {
                for (let collectionKey of Object.keys(changes)) {
                    let collectionData = this._xmlMetadata[collectionKey];
                    items.push(MultiStepInput.getItem(collectionData.label));
                    for (let xmlElementKey of Object.keys(changes[collectionKey].elements)) {
                        let newElement = changes[collectionKey].elements[xmlElementKey].newElement;
                        let oldElement = changes[collectionKey].elements[xmlElementKey].oldElement;
                        if (!oldElement) {
                            items.push(MultiStepInput.getItem("\t" + xmlElementKey + " (New)"));
                            for (let field of Object.keys(newElement)) {
                                items.push(MultiStepInput.getItem("\t\tField " + field + ": " + ((newElement[field] === undefined) ? "null" : newElement[field])));
                            }
                        } else {
                            items.push(MultiStepInput.getItem("\t" + xmlElementKey + " (Modified)"));
                            for (let field of Object.keys(newElement)) {
                                if (newElement[field] !== oldElement[field]) {
                                    items.push(MultiStepInput.getItem("\t\tField " + field + ": From " + ((oldElement[field] === undefined) ? "null" : oldElement[field]) + " to " + ((newElement[field] === undefined) ? "null" : newElement[field])));
                                }
                            }
                        }
                    }
                }
                input.placeholder = "Changes on " + this._fileName + " " + ((this._isPermissionSet) ? "Permission Set" : "Profile");
            } else {
                input.placeholder = "The " + ((this._isPermissionSet) ? "Permission Set" : "Profile") + " " + this._fileName + " has not any changes";
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
}
module.exports = PermissionEditor;

function transformPermissionContentToMap(permissionContent, xmlMetadata) {
    let permissionsContentMap = {};
    Object.keys(permissionContent).forEach(function (collectionKey) {
        let collection = permissionContent[collectionKey];
        let collectionData = xmlMetadata[collectionKey];
        if (collectionData.editable && collectionData.xmlData) {
            let fieldKey = getFieldKey(collectionData.xmlData.fieldKey);
            let fieldKeysWithoutMain = getFieldKeysWithoutKey(collectionData);
            if (collectionData.datatype === 'array') {
                for (let xmlElement of collection) {
                    if (!permissionsContentMap[collectionKey])
                        permissionsContentMap[collectionKey] = {
                            name: collectionKey,
                            elements: {},
                        };
                    let value;
                    if (collectionData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                        if (xmlElement[fieldKeysWithoutMain[0]])
                            value = getValue(xmlElement, fieldKeysWithoutMain);
                        else
                            value = 'Master';
                    } else
                        value = getValue(xmlElement, fieldKey);
                    permissionsContentMap[collectionKey].elements[value] = xmlElement;
                }
            } else {
                permissionsContentMap[collectionKey] = collection;
            }
        }
    });
    return permissionsContentMap;
}

function getXMLElementDataByLabel(label, xmlMetadata) {
    let dataToReturnn;
    Object.keys(xmlMetadata).forEach(function (elementKey) {
        let elementData = xmlMetadata[elementKey];
        if (elementData.label === label)
            dataToReturnn = elementData;
    });
    return dataToReturnn;
}

function getFieldKey(fieldKey) {
    if (fieldKey && fieldKey.indexOf('+') !== -1)
        return fieldKey.split('+');
    return fieldKey;
}

function getUncheckedItems(selectedItems, items) {
    let unchecked = [];
    for (let item of items) {
        if (!selectedItems.includes(item.label) && item.picked)
            unchecked.push(item.label);
    }
    return unchecked;
}

function getCheckedItems(selectedItems, items) {
    let checked = [];
    for (let item of items) {
        if (selectedItems.includes(item.label) && !item.picked)
            checked.push(item.label);
    }
    return checked;
}

function getValue(xmlElement, fieldKey) {
    let value;
    if (Array.isArray(fieldKey)) {
        for (let field of fieldKey) {
            if (!value)
                value = xmlElement[field];
            else
                value += ' - ' + xmlElement[field];
        }
    } else {
        value = xmlElement[fieldKey];
    }
    return value;
}

function getDescription(xmlElement, elementData, useMainField) {
    let description;
    if (!useMainField) {
        Object.keys(elementData.xmlData.fields).forEach(function (fieldName) {
            let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
            let isDistinct = false;
            if (Array.isArray(fieldKey)) {
                let nDistincts = 0;
                for (let field of fieldKey) {
                    if (fieldName !== field) {
                        nDistincts++;
                    }
                }
                isDistinct = nDistincts == fieldKey.length;
            } else {
                isDistinct = fieldName !== fieldKey;
            }
            if (isDistinct) {
                if (xmlElement[fieldName]) {
                    let value = fieldName;
                    if (Array.isArray(fieldKey))
                        value = xmlElement[fieldName];
                    if (!description)
                        description = value;
                    else
                        description += " - " + value;
                }
            }
        });
    } else {
        if (!description) {
            let fieldKey = getFieldKey(elementData.xmlData.fieldKey);
            description = getValue(xmlElement, fieldKey);
        }
    }
    return description;
}

function extractMetadataFromProfile(profile, xmlMetadata) {
    let profileMetadata = {};
    Object.keys(profile).forEach(function (collection) {
        let collectionData = xmlMetadata[collection];
        if (collectionData) {
            if (collectionData.datatype === 'array') {
                let mainFieldData = collectionData.xmlData.fields[collectionData.xmlData.fieldKey];
                let fieldKeys = Object.keys(collectionData.xmlData.fields);
                let fieldKeysWithoutMain = getFieldKeysWithoutKey(collectionData);
                if (!profileMetadata[collection])
                    profileMetadata[collection] = {};
                for (let xmlElement of profile[collection]) {
                    if (mainFieldData && mainFieldData.separator) {
                        let xmlField = collectionData.xmlData.fieldKey;
                        let separator = mainFieldData.separator;
                        if (collectionData.metadataType === Metadata.MetadataTypes.LAYOUT) {
                            xmlField = fieldKeysWithoutMain[0];
                            separator = collectionData.xmlData.fields[fieldKeysWithoutMain[0]].separator;
                        }
                        let splits;
                        let obj;
                        let item;
                        if (xmlElement[xmlField]) {
                            splits = xmlElement[xmlField].split(separator);
                            obj = splits[0];
                            if (xmlElement.layout && xmlElement.layout.indexOf('CaseClose') !== -1)
                                obj = 'CaseClose';
                            item = splits[1];
                        } else {
                            splits = xmlElement[collectionData.xmlData.fieldKey].split(mainFieldData.separator);
                            obj = splits[0];
                            item = 'Master';
                        }
                        if (!profileMetadata[collection][obj])
                            profileMetadata[collection][obj] = {
                                name: obj,
                                childs: {},
                                xmlElement: undefined,
                            };
                        profileMetadata[collection][obj].childs[item] = {
                            name: item,
                            xmlElement: xmlElement,
                        };
                    } else {
                        let item = xmlElement[collectionData.xmlData.fieldKey];
                        profileMetadata[collection][item] = {
                            name: item,
                            childs: undefined,
                            xmlElement: xmlElement,
                        };
                    }
                }
            }
        }
    });
    return profileMetadata;
}

function getFieldKeysWithoutKey(elementData) {
    let fields = [];
    Object.keys(elementData.xmlData.fields).forEach(function (field) {
        if (field !== elementData.xmlData.fieldKey)
            fields.push(field);
    });
    return fields;
}

function loadUserPermissions() {
    return new Promise(async function (resolve, reject) {
        let version = Config.getOrgVersion();
        let out = await ProcessManager.auraHelperLoadPermissions({ version: version }, true);
        if (out) {
            if (out.stdOut) {
                let response = JSON.parse(out.stdOut);
                if (response.status === 0) {
                    resolve(response.result.data);
                } else {
                    reject(response.result.message);
                }
            } else {
                reject(out.stdErr);
            }
        } else {
            reject("Unknown error ocurred");
        }
    });
}

function canPickMany(elementData) {
    let fieldsWithoutKey = getFieldKeysWithoutKey(elementData);
    let allBoolean = true;
    for (let field of fieldsWithoutKey) {
        if (elementData.xmlData.fields[field].datatype !== 'boolean') {
            allBoolean = false;
            break;
        }
    }
    return allBoolean;
}

function handleUniqueFields(uniqueFields, elementData, profileContent, selectedElement, selectedSubElement) {
    if (uniqueFields.length > 0) {
        for (let xmlElement of profileContent[elementData.key]) {
            if (!selectedSubElement && xmlElement[elementData.xmlData.fieldKey] !== selectedElement) {
                for (let uniqueField of uniqueFields) {
                    if (xmlElement[uniqueField.field] === uniqueField.value) {
                        if (uniqueField.datatype === 'boolean') {
                            xmlElement[uniqueField.field] = !uniqueField.value;
                        } else {
                            // throw Error
                        }
                    }
                }
            } else if (selectedSubElement && xmlElement[elementData.xmlData.fieldKey] !== selectedElement + elementData.xmlData.fields[elementData.xmlData.fieldKey].separator + this._selectedSubElement) {
                for (let uniqueField of uniqueFields) {
                    if (xmlElement[uniqueField.field] === uniqueField.value) {
                        if (uniqueField.datatype === 'boolean') {
                            xmlElement[uniqueField.field] = !uniqueField.value;
                        } else {
                            // throw Error
                        }
                    }
                }
            }
        }
    }
}

function handleControlledFields(items, elementData, profileContent, selectedElement, selectedSubElement) {
    for (let selectedItem of items) {
        if (elementData.xmlData.fields[selectedItem] && elementData.xmlData.fields[selectedItem].controlledFields && elementData.xmlData.fields[selectedItem].controlledFields.length > 0) {
            for (let xmlElement of profileContent[elementData.key]) {
                if (!selectedSubElement) {
                    if (xmlElement[elementData.xmlData.fieldKey] === selectedElement) {
                        for (let controlledField of elementData.xmlData.fields[selectedItem].controlledFields) {
                            if (xmlElement[controlledField.field] !== undefined && xmlElement[selectedItem] === controlledField.valueToCompare) {
                                xmlElement[controlledField.field] = controlledField.valueToSet;
                            }
                        }
                        break;
                    }
                } else {
                    if (xmlElement[elementData.xmlData.fieldKey] === selectedElement + elementData.xmlData.fields[elementData.xmlData.fieldKey].separator + selectedSubElement) {
                        for (let controlledField of elementData.xmlData.fields[selectedItem].controlledFields) {
                            if (xmlElement[controlledField.field] !== undefined && xmlElement[selectedItem] === controlledField.valueToCompare) {
                                xmlElement[controlledField.field] = controlledField.valueToSet;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
}

function getTypeDifferences(metadata, metadataFromProfile, collectionName, xmlMetadata) {
    let differences = {};
    let collectionWithType = metadataFromProfile[collectionName];
    let collectionData = xmlMetadata[collectionName];
    if (collectionWithType && collectionData.metadataType) {
        let type = collectionData.metadataType;
        if (metadata[type] && Metadata.Utils.haveChilds(metadata[type])) {
            Object.keys(metadata[type].childs).forEach(function (objKey) {
                let objData = AppContext.sObjects[objKey.toLowerCase()];
                if (!collectionWithType[objKey]) {
                    if (!differences[type])
                        differences[type] = Metadata.Factory.createMetadataType(type, false);
                    if (type === Metadata.MetadataTypes.CUSTOM_FIELDS && Metadata.Utils.haveChilds(metadata[type].childs[objKey])) {
                        Object.keys(metadata[type].childs[objKey].childs).forEach(function (itemKey) {
                            let fData;
                            if (objData && objData.fields)
                                fData = objData.fields[itemKey];
                            if (!fData || fData.nillable) {
                                if (!differences[type].childs[objKey])
                                    differences[type].childs[objKey] = Metadata.Factory.createMetadataObject(objKey, false);
                                differences[type].childs[objKey].childs[itemKey] = Metadata.Factory.createMetadataItem(itemKey, false);
                            }
                        });
                    } else if (collectionName === 'customSettingAccesses' && objData && objData.customSetting) {
                        differences[type].childs[objKey] = metadata[type].childs[objKey];
                    } else if (collectionName !== 'customSettingAccesses') {
                        differences[type].childs[objKey] = metadata[type].childs[objKey];
                    }
                } else {
                    if (collectionWithType[objKey].childs && Metadata.Utils.haveChilds(metadata[type].childs[objKey])) {
                        Object.keys(metadata[type].childs[objKey].childs).forEach(function (itemKey) {
                            let nullable = true;
                            if (type === Metadata.MetadataTypes.CUSTOM_FIELDS) {
                                let fData;
                                if (objData && objData.fields)
                                    fData = objData.fields[itemKey];
                                nullable = !fData || fData.nillable;
                            }
                            if (!collectionWithType[objKey].childs[itemKey] && nullable) {
                                if (!differences[type])
                                    differences[type] = Metadata.Factory.createMetadataType(type, false);
                                if (!differences[type].childs[objKey])
                                    differences[type].childs[objKey] = Metadata.Factory.createMetadataObject(objKey, false);
                                differences[type].childs[objKey].childs[itemKey] = Metadata.Factory.createMetadataItem(itemKey, false);
                            }
                        });
                    }
                }
            });
        }
        if (type === Metadata.MetadataTypes.TAB && metadata[Metadata.MetadataTypes.CUSTOM_OBJECT] && Metadata.Utils.haveChilds(metadata[Metadata.MetadataTypes.CUSTOM_OBJECT])) {
            Object.keys(metadata[Metadata.MetadataTypes.CUSTOM_OBJECT].childs).forEach(function (objKey) {
                if (objKey.indexOf('__') === -1) {
                    let standardTabName = 'standard-' + objKey;
                    if (!collectionWithType[standardTabName]) {
                        if (!differences[type])
                            differences[type] = Metadata.Factory.createMetadataType(type, false);
                        differences[type].childs[standardTabName] = metadata[type].childs[standardTabName];
                    }
                }
            });
        }
    }
    return differences;
}