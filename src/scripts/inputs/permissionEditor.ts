import * as vscode from 'vscode';
import { Paths } from '../core/paths';
import { Config } from '../core/config';
import { XMLEditor } from './xmlEditor';
import { MultiStepInput } from './multiStepInput';
import { applicationContext } from '../core/applicationContext';
import { XML } from '@aurahelper/languages';
import { MetadataType, MetadataObject, MetadataItem, CoreUtils, MetadataTypes, Datatypes } from '@aurahelper/core';
import { SFConnector } from '@aurahelper/connector';
import { CLIManager } from '@aurahelper/cli-manager';
import { XMLDefinitions } from '@aurahelper/xml-definitions';
const MetadataUtils = CoreUtils.MetadataUtils;
const Utils = CoreUtils.Utils;
const XMLUtils = XML.XMLUtils;

const ROOT_STEP = 1;
const PERMISSIONS_STEP = 2;
const ADD_PERMISSION_STEP = 3;
const ADD_CHILD_PERMISSION_STEP = 4;
const SET_VALUES_STEP = 5;
const ELEMENT_STEP = 6;
const SUB_ELEMENT_STEP = 7;
const RESULT_STEP = 8;
const OPTIONS_STEP = 9;

export class PermissionEditor extends XMLEditor {

    _selectedCollection?: string;
    _selectedElement?: string;
    _selectedSubElement?: string;
    _selectedElements?: string[];
    _permissionType: string;
    _xmlDefinition: any;
    _permissionsContent: any;
    _profileMetadata: any;
    _oldPermissionContent: any;
    newElement: boolean;
    addedElements: any[];
    hasChanges: boolean;

    constructor(file: string) {
        super(undefined, ROOT_STEP, RESULT_STEP, file);
        this._selectedCollection = undefined;
        this._selectedElement = undefined;
        this._selectedSubElement = undefined;
        this._selectedElements = undefined;
        this._permissionType = Object.keys(this._xmlContent)[0];
        this._xmlDefinition = XMLDefinitions.getDefinition(this._permissionType, Config.getAPIVersion());
        this._permissionsContent = XMLUtils.cleanXMLFile(this._xmlDefinition, this._xmlContent[this._permissionType]);
        this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
        this._oldPermissionContent = Utils.clone(this._permissionsContent);
        this._title = 'Permission Editor: ';
        this.newElement = false;
        this.addedElements = [];
        this.hasChanges = false;
    }

    onCreateInputRequest(): vscode.QuickInput | vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        switch (this._step) {
            case ROOT_STEP:
                return this.createRootInput();
            case PERMISSIONS_STEP:
                return this.createPermissionsInput();
            case ADD_PERMISSION_STEP:
                return this.createAddPermissionInput();
            case ADD_CHILD_PERMISSION_STEP:
                return this.createAddChildPermissionInput();
            case SET_VALUES_STEP:
                return this.createSetValuesInput();
            case ELEMENT_STEP:
                return this.createElementInput();
            case SUB_ELEMENT_STEP:
                return this.createSubElementInput();
            case RESULT_STEP:
                return this.createResultInput();
            case OPTIONS_STEP:
                return this.createOptionsInput();
        }
        return input;
    }

    createRootInput(): vscode.QuickPick<vscode.QuickPickItem> | undefined {
        if (!this._metadata) {
            let input = vscode.window.createQuickPick();
            input.busy = true;
            input.title = this._title + ': Getting Metadata Types';
            input.placeholder = 'Loading Metadata Types from Local Project';
            this.loadMetadata();
            return input;
        } else {
            let input: vscode.QuickPick<vscode.QuickPickItem> | undefined;
            if (this._permissionsContent) {
                input = vscode.window.createQuickPick();
                input.title = this._title;
                input.placeholder = 'Choose an Element to edit permissions';
                input.buttons = [MultiStepInput.getAcceptButton()];
                let items = [];
                for (let elementKey of Object.keys(this._xmlDefinition)) {
                    let elementData = this._xmlDefinition[elementKey];
                    if (elementData.editable) {
                        if ((elementKey === "description" && this._permissionsContent["custom"]) || elementKey !== "description") {
                            let item = MultiStepInput.getItem(elementData.label, undefined, undefined, undefined);
                            items.push(item);
                        }
                    }
                }
                input.items = items;
            }
            return input;
        }
    }

    createPermissionsInput(): vscode.QuickInput | vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        if (this._permissionsContent) {
            let buttons = [MultiStepInput.getBackButton()];
            const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
            const items: vscode.QuickPickItem[] = [];
            const selectedItems: vscode.QuickPickItem[] = [];
            if (fieldDefinition.datatype === Datatypes.STRING) {
                input = vscode.window.createInputBox();
                input.value = (this._permissionsContent[fieldDefinition.key]) ? this._permissionsContent[fieldDefinition.key] : '';
                input.placeholder = 'Write a ' + fieldDefinition.label + ' for ' + this._permissionType + " " + this._fileName;
                input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
            } else if (fieldDefinition.datatype === Datatypes.ARRAY) {
                const fieldKey = fieldDefinition.fieldKey;
                const sortOrder = fieldDefinition.sortOrder;
                const separator = !Utils.isArray(fieldKey) ? fieldDefinition.fields[fieldKey].separator : undefined;
                input = vscode.window.createQuickPick();
                if (this._permissionsContent[fieldDefinition.key]) {
                    if (Utils.isArray(fieldKey)) {
                        const metadataType = fieldDefinition.fields[sortOrder[1]].metadataType;
                        if (metadataType) {
                            input.placeholder = 'Select an Element to edit permissions';
                            if (this._metadata && this._metadata[metadataType] && MetadataUtils.haveChilds(this._metadata[metadataType])) {
                                for (let objKey of Object.keys(this._metadata[metadataType].childs)) {
                                    let item = MultiStepInput.getItem(objKey, undefined, undefined, undefined);
                                    items.push(item);
                                }
                            } else {
                                let sorted = Object.keys(this._profileMetadata[fieldDefinition.key]).sort();
                                for (let obj of sorted) {
                                    let item = MultiStepInput.getItem(obj, undefined, undefined, undefined);
                                    items.push(item);
                                }
                            }
                        } else {
                            input.placeholder = 'Select a field to edit. Click "Add" to add new elements.';
                            buttons.push(MultiStepInput.getAddButton());
                            for (let fieldValue of XMLUtils.forceArray(this._permissionsContent[fieldDefinition.key])) {
                                let description;
                                for (const field of Object.keys(fieldDefinition.fields)) {
                                    if (!fieldKey.includes(field)) {
                                        description = fieldValue[field];
                                    }
                                }
                                items.push(MultiStepInput.getItem(getValue(fieldValue, fieldKey), undefined, description, undefined));
                            }
                        }
                    } else if (separator) {
                        input.placeholder = 'Select an Element to edit permissions. Click "Add" to add new elements';
                        buttons.push(MultiStepInput.getAddButton());
                        let sorted = Object.keys(this._profileMetadata[fieldDefinition.key]).sort();
                        for (let obj of sorted) {
                            items.push(MultiStepInput.getItem(obj, undefined, undefined, undefined));
                        }
                    } else {
                        input.placeholder = 'Select a field to edit. Click "Add" to add new elements';
                        buttons.push(MultiStepInput.getAddButton());
                        for (let fieldValue of XMLUtils.forceArray(this._permissionsContent[fieldDefinition.key])) {
                            let item: vscode.QuickPickItem | undefined;
                            let selected = false;
                            let editableFields = getEditableFields(fieldDefinition);
                            if (editableFields.length === 1) {
                                let fieldData = fieldDefinition.fields[editableFields[0]];
                                if (fieldData.datatype === Datatypes.BOOLEAN) {
                                    input.canSelectMany = true;
                                    item = MultiStepInput.getItem(fieldValue[fieldKey], undefined, undefined, fieldValue[editableFields[0]]);
                                    selected = fieldValue[editableFields[0]];
                                } else if (fieldData.datatype === Datatypes.ENUM) {
                                    let description = fieldDefinition.fields[editableFields[0]].getLabel(fieldValue[editableFields[0]]);
                                    item = MultiStepInput.getItem(fieldValue[fieldKey], undefined, description, undefined);
                                }
                            } else {
                                let description = getDescription(fieldValue, fieldDefinition, false);
                                let itemName;
                                if (Array.isArray(fieldKey)) {
                                    for (let field of fieldKey) {
                                        if (!itemName) {
                                            itemName = fieldValue[field];
                                        }
                                        else {
                                            itemName += ' - ' + fieldValue[field];
                                        }
                                    }
                                } else {
                                    itemName = fieldValue[fieldKey];
                                }
                                item = MultiStepInput.getItem(itemName, undefined, description, undefined);
                            }
                            if (selected && item) {
                                selectedItems.push(item);
                            }
                            if (item) {
                                items.push(item);
                            }
                        }
                    }
                    input.items = items;
                    if (selectedItems.length > 0) {
                        input.selectedItems = selectedItems;
                    }
                }
            } else {
                input = vscode.window.createQuickPick();
                input.placeholder = 'Select an Element to edit permissions.';
                for (let field of Object.keys(fieldDefinition.fields)) {
                    const subFieldDefinition = fieldDefinition.fields[field];
                    if (subFieldDefinition.datatype === Datatypes.ENUM) {
                        let item = MultiStepInput.getItem(fieldDefinition.fields[field].label, undefined, fieldDefinition.fields[field].getLabel(this._permissionsContent[fieldDefinition.key][field]), undefined);
                        items.push(item);
                    }
                }
                input.items = items;
            }
            input.title = this._title + ' - ' + this._fileName + ":\n Edit " + fieldDefinition.label;
            input.buttons = buttons;
        }
        return input;
    }

    createAddPermissionInput(): vscode.QuickPick<vscode.QuickPickItem> {
        let buttons = [MultiStepInput.getBackButton()];
        const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
        let items = [];
        let input = vscode.window.createQuickPick();
        if (fieldDefinition.datatype === Datatypes.ARRAY) {
            const fieldKey = fieldDefinition.fieldKey;
            const sortOrder = fieldDefinition.sortOrder;
            const separator = !Utils.isArray(fieldKey) ? fieldDefinition.fields[sortOrder[0]].separator : undefined;
            if (Utils.isArray(fieldKey)) {
                buttons.push(MultiStepInput.getAcceptButton());
                input.placeholder = 'Select field to set a value. Click "Accept" to save changes, "Back" to rollback';
                for (let field of Object.keys(fieldDefinition.fields)) {
                    items.push(MultiStepInput.getItem(fieldDefinition.fields[field].label, undefined, this._permissionsContent[fieldDefinition.key][this._permissionsContent[fieldDefinition.key].length - 1][field], undefined));
                }
            } else {
                const metadataType = fieldDefinition.fields[fieldKey].metadataType;
                if (fieldDefinition.key === 'userPermissions') {
                    let notAddedPermissions: string[] | undefined = [];
                    if (!this._permissionsContent[fieldDefinition.key]) {
                        notAddedPermissions = applicationContext.sfData.availablePermissions;
                    }
                    else {
                        let permissionsOnProfile = [];
                        for (let xmlElement of this._permissionsContent[fieldDefinition.key]) {
                            permissionsOnProfile.push(xmlElement[fieldKey]);
                        }
                        if (applicationContext.sfData.availablePermissions) {
                            for (let permission of applicationContext.sfData.availablePermissions) {
                                if (!permissionsOnProfile.includes(permission)) {
                                    notAddedPermissions.push(permission);
                                }
                            }
                        }
                        for (let permission of notAddedPermissions) {
                            let item = MultiStepInput.getItem(permission, undefined, undefined, undefined);
                            items.push(item);
                        }
                    }
                } else if (metadataType) {
                    const differences = getTypeDifferences(this._metadata, this._profileMetadata, fieldDefinition.key, this._xmlDefinition);
                    let sorted = Object.keys(differences[metadataType].childs).sort();
                    let editableFields = getEditableFields(fieldDefinition);
                    for (let objectKey of sorted) {
                        let item = MultiStepInput.getItem(objectKey, undefined, undefined, undefined);
                        items.push(item);
                    }
                    if (editableFields.length === 1) {
                        input.placeholder = 'The selected elements will be set ' + editableFields[0].key + ' field to true';
                    }
                }
                if (!separator) {
                    input.canSelectMany = true;
                }
            }
            input.items = items;
            input.title = this._fileName + ":\n Adding new " + fieldDefinition.label + "(s) to the " + this._permissionType;
            input.buttons = buttons;
        }
        return input;
    }

    createAddChildPermissionInput(): vscode.QuickPick<vscode.QuickPickItem> {
        let buttons = [MultiStepInput.getBackButton()];
        const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
        let items = [];
        let input = vscode.window.createQuickPick();
        if (fieldDefinition.datatype === Datatypes.ARRAY && this._selectedElement) {
            const sortOrder = fieldDefinition.sortOrder;
            const metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
            if (metadataType) {
                const differences = getTypeDifferences(this._metadata, this._profileMetadata, fieldDefinition.key, this._xmlDefinition);
                for (let objectKey of Object.keys(differences[metadataType].childs[this._selectedElement].childs)) {
                    let item = MultiStepInput.getItem(objectKey, undefined, undefined, undefined);
                    items.push(item);
                }
            }
            input.canSelectMany = true;
            input.items = items;
            input.title = this._fileName + ":\n Adding new " + fieldDefinition.label + "(s) to the " + this._permissionType;
            input.buttons = buttons;
        }
        return input;
    }

    createSetValuesInput(): vscode.QuickInput | vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let buttons = [MultiStepInput.getBackButton()];
        const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
        const fieldKey = fieldDefinition.fieldKey;
        const sortOrder = fieldDefinition.sortOrder;
        const editableFields = getEditableFields(fieldDefinition);
        let input;
        if (Utils.isArray(fieldKey)) {
            input = vscode.window.createInputBox();
            if (!this.newElement) {
                let index = 0;
                const subFieldDefinition = getFieldDefinitionByLabel(this._selectedSubElement, fieldDefinition.fields);
                for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                    const value = getValue(fieldValue, fieldKey);
                    if (value === this._selectedElement) {
                        break;
                    }
                    index++;
                }
                input.value = (this._permissionsContent[fieldDefinition.key] && this._permissionsContent[fieldDefinition.key][index][subFieldDefinition.key]) ? this._permissionsContent[fieldDefinition.key][index][subFieldDefinition.key] : '';
            }
            input.placeholder = 'Write a value for ' + this._selectedSubElement;
            input.prompt = "Press Enter to set the value (DON'T PRESS 'Escape' to back)";
        } else if (fieldDefinition.fields[editableFields[0]].datatype === Datatypes.ENUM) {
            let items = [];
            input = vscode.window.createQuickPick();
            const subFieldDefinition = fieldDefinition.fields[editableFields[0]];
            for (let enumValue of subFieldDefinition.values) {
                let item = MultiStepInput.getItem(enumValue.label, undefined, undefined, undefined);
                items.push(item);
            }
            input.items = items;
            input.placeholder = 'Select a value to set.';
            input.title = this._fileName + ":\n Adding new " + fieldDefinition.label + "(s) to the " + this._permissionType;
        } else {
            let items = [];
            let selectedItems = [];
            input = vscode.window.createQuickPick();
            input.placeholder = 'Select the values to set.';
            let element;
            if (fieldDefinition.datatype !== Datatypes.OBJECT) {
                const separator = fieldDefinition.fields[sortOrder[0]].separator;
                if (this._selectedElements?.length === 1) {
                    let value = (separator) ? this._selectedElement + separator + this._selectedElements[0] : this._selectedElements[0];
                    for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                        if (fieldValue[fieldDefinition.fieldKey] === value) {
                            element = fieldValue;
                            break;
                        }
                    }
                }
            }
            for (const field of Object.keys(fieldDefinition.fields)) {
                if (!fieldDefinition.fields[field].editable) {
                    continue;
                }
                let item = MultiStepInput.getItem(field, undefined, undefined, element && element[field]);
                items.push(item);
                if (element && element[field]) {
                    selectedItems.push(item);
                }
            }
            input.canSelectMany = true;
            input.items = items;
            if (selectedItems.length > 0) {
                input.selectedItems = selectedItems;
            }
            input.title = this._fileName + ":\n Adding new " + fieldDefinition.label + "(s) to the " + this._permissionType;
        }
        input.buttons = buttons;
        return input;
    }

    createElementInput(): vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        if (this._permissionsContent) {
            const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
            const buttons = [MultiStepInput.getBackButton()];
            if (this._permissionsContent[fieldDefinition.key]) {
                input = vscode.window.createQuickPick();
                const items = [];
                const fieldKey = fieldDefinition.fieldKey;
                const sortOrder = fieldDefinition.sortOrder;
                let metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
                if (Utils.isArray(fieldKey)) {
                    metadataType = fieldDefinition.fields[sortOrder[1]].metadataType;
                    let element;
                    if (fieldDefinition.datatype === Datatypes.ARRAY) {
                        for (let xmlElement of this._permissionsContent[fieldDefinition.key]) {
                            if (!metadataType) {
                                let value = getValue(xmlElement, fieldKey);
                                if (value === this._selectedElement) {
                                    element = xmlElement;
                                    break;
                                }
                            }

                        }
                    }
                    if (element || metadataType) {
                        if (metadataType) {
                            input.placeholder = 'Select an element to edit permissions.';
                            //buttons.push(MultiStepInput.getAcceptButton());
                            if (this._metadata && this._selectedElement && this._metadata[metadataType] && MetadataUtils.haveChilds(this._metadata[metadataType])) {
                                let child = {
                                    xmlElement: undefined,
                                };
                                if (this._profileMetadata[fieldDefinition.key] && this._profileMetadata[fieldDefinition.key][this._selectedElement] && this._profileMetadata[fieldDefinition.key][this._selectedElement].childs) {
                                    child = this._profileMetadata[fieldDefinition.key][this._selectedElement].childs["Master"];
                                }
                                let description;
                                if (child && child.xmlElement) {
                                    let xmlElement = child.xmlElement;
                                    description = getValue(xmlElement, fieldKey[0], true);
                                } else {
                                    description = '-- Not Assignment --';
                                }
                                items.push(MultiStepInput.getItem("Master", undefined, description, undefined));
                                for (let itemKey of Object.keys(this._metadata[metadataType].childs[this._selectedElement].childs)) {
                                    description = undefined;
                                    let child = {
                                        xmlElement: undefined,
                                    };
                                    if (this._profileMetadata[fieldDefinition.key] && this._profileMetadata[fieldDefinition.key][this._selectedElement] && this._profileMetadata[fieldDefinition.key][this._selectedElement].childs) {
                                        child = this._profileMetadata[fieldDefinition.key][this._selectedElement].childs[itemKey];
                                    }
                                    if (child && child.xmlElement) {
                                        let xmlElement = child.xmlElement;
                                        description = getValue(xmlElement, fieldKey[0], true);
                                    } else {
                                        description = '-- Not Assignment --';
                                    }
                                    let item = MultiStepInput.getItem(itemKey, undefined, description, undefined);
                                    items.push(item);
                                }
                            } else if (this._selectedElement) {
                                input.placeholder = 'Select an element to edit permissions.';
                                let sorted = Object.keys(this._profileMetadata[fieldDefinition.key][this._selectedElement].childs).sort();
                                for (let obj of sorted) {
                                    let child = this._profileMetadata[fieldDefinition.key][this._selectedElement].childs[obj];
                                    let xmlElement = child.xmlElement;
                                    let description = getDescription(xmlElement, fieldDefinition, true);
                                    let item = MultiStepInput.getItem(obj, undefined, description, undefined);
                                    items.push(item);
                                }
                            }
                        } else {
                            input.placeholder = 'Select field to set a value. Click "Accept" to save changes, "Delete" to delete the element, "Back" to rollback';
                            buttons.push(MultiStepInput.getDeleteButton());
                            buttons.push(MultiStepInput.getAcceptButton());
                            for (const field of Object.keys(fieldDefinition.fields)) {
                                items.push(MultiStepInput.getItem(fieldDefinition.fields[field].label, undefined, element[field], undefined));
                            }
                        }
                    }
                } else if (fieldDefinition.datatype === Datatypes.OBJECT) {
                    input.placeholder = 'Select a value to set';
                    const subfieldDefinition = getFieldDefinitionByLabel(this._selectedElement, fieldDefinition.fields);
                    if (subfieldDefinition.datatype === 'enum') {
                        for (let enumValue of subfieldDefinition.values) {
                            let item = MultiStepInput.getItem(enumValue.label, undefined, undefined, undefined);
                            items.push(item);
                        }
                    }
                } else if (this._selectedElement) {
                    buttons.push(MultiStepInput.getAddButton());
                    //buttons.push(MultiStepInput.getAcceptButton());
                    input.placeholder = 'Select an element to edit permissions';
                    let sorted = Object.keys(this._profileMetadata[fieldDefinition.key][this._selectedElement].childs).sort();
                    for (let key of sorted) {
                        let child = this._profileMetadata[fieldDefinition.key][this._selectedElement].childs[key];
                        let xmlElement = child.xmlElement;
                        let description;
                        description = getDescription(xmlElement, fieldDefinition, false);
                        let item = MultiStepInput.getItem(child.name, undefined, description, undefined);
                        items.push(item);
                    }
                }
                input.title = this._fileName + ":\n Edit " + fieldDefinition.label + " - " + this._selectedElement;
                input.items = items;
                input.buttons = buttons;
            }
        }
        return input;
    }

    createSubElementInput(): vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        if (this._permissionsContent) {
            const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
            if (this._permissionsContent[fieldDefinition.key] && this._selectedElement) {
                const items: vscode.QuickPickItem[] = [];
                const selectedItems: vscode.QuickPickItem[] = [];
                const fieldKey = fieldDefinition.fieldKey;
                if (Array.isArray(fieldKey)) {
                    const metadataType = fieldDefinition.fields[fieldKey[0]].metadataType;
                    input = vscode.window.createQuickPick();
                    input.placeholder = 'Select a value to set';
                    let sorted = Object.keys(this._metadata[metadataType].childs[this._selectedElement].childs).sort();
                    if (this._selectedSubElement !== 'Master') {
                        items.push(MultiStepInput.getItem('-- Not Assignment --', undefined, undefined, undefined));
                    }
                    for (let key of sorted) {
                        let item = MultiStepInput.getItem(key, undefined, undefined, undefined);
                        items.push(item);
                    }
                    input.items = items;
                    if (selectedItems.length > 0) {
                        input.selectedItems = selectedItems;
                    }
                    input.title = this._fileName + ":\n Edit " + fieldDefinition.label + " - " + this._selectedElement + fieldDefinition.fields[fieldKey[1]].separator + this._selectedSubElement;
                    const buttons = [MultiStepInput.getBackButton()];
                    input.buttons = buttons;
                }
            }
        }
        return input;
    }

    createResultInput(): vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        if (this._permissionsContent) {
            input = vscode.window.createQuickPick();
            const permissionsMap = transformPermissionContentToMap(this._permissionsContent, this._xmlDefinition);
            const oldPermissionsMap = transformPermissionContentToMap(this._oldPermissionContent, this._xmlDefinition);
            const changes: any = {};
            const items: vscode.QuickPickItem[] = [];
            for (let collectionKey of Object.keys(permissionsMap)) {
                const fieldDefinition = this._xmlDefinition[collectionKey];
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
                } else {
                    if (fieldDefinition.datatype === Datatypes.OBJECT) {
                        for (let field of Object.keys(fieldDefinition.fields)) {
                            if (collection[field] !== oldCollection[field]) {
                                if (!changes[collectionKey]) {
                                    changes[collectionKey] = {
                                        name: collectionKey,
                                        elements: {}
                                    };
                                }
                                changes[collectionKey].elements[field] = {
                                    oldElement: oldCollection[field],
                                    newElement: collection[field],
                                };
                            }
                        }
                    } else {
                        if (collection !== oldCollection) {
                            if (!changes[collectionKey]) {
                                changes[collectionKey] = {
                                    name: collectionKey,
                                    oldElement: oldCollection,
                                    newElement: collection
                                };
                            }
                        }
                    }
                }
            }
            if (Object.keys(changes).length > 0) {
                for (let collectionKey of Object.keys(changes)) {
                    const fieldDefinition = this._xmlDefinition[collectionKey];
                    let collectionData = this._xmlDefinition[collectionKey];
                    if (changes[collectionKey].elements) {
                        items.push(MultiStepInput.getItem('$(symbol-field)  ' + collectionData.label));
                        if (fieldDefinition.datatype === Datatypes.OBJECT) {
                            for (let field of Object.keys(fieldDefinition.fields)) {
                                if (changes[collectionKey].elements[field]) {
                                    let newElement = changes[collectionKey].elements[field].newElement;
                                    let oldElement = changes[collectionKey].elements[field].oldElement;
                                    items.push(MultiStepInput.getItem("\t$(symbol-value)  " + field + ": " + ((oldElement === undefined) ? "null" : oldElement) + " $(arrow-right) " + ((newElement === undefined) ? "null" : newElement)));
                                }
                            }
                        } else {
                            for (let xmlElementKey of Object.keys(changes[collectionKey].elements)) {
                                let newElement = changes[collectionKey].elements[xmlElementKey].newElement;
                                let oldElement = changes[collectionKey].elements[xmlElementKey].oldElement;
                                if (!oldElement) {
                                    items.push(MultiStepInput.getItem("\t$(add)  " + xmlElementKey));
                                    for (let field of Object.keys(newElement)) {
                                        items.push(MultiStepInput.getItem("\t\t$(symbol-value)  " + field + ": " + ((newElement[field] === undefined) ? "null" : newElement[field])));
                                    }
                                } else {
                                    items.push(MultiStepInput.getItem("\t$(edit)  " + xmlElementKey));
                                    for (let field of Object.keys(newElement)) {
                                        if (newElement[field] !== oldElement[field]) {
                                            items.push(MultiStepInput.getItem("\t\t$(symbol-value)  " + field + ": " + ((oldElement[field] === undefined) ? "null" : oldElement[field]) + " $(arrow-right) " + ((newElement[field] === undefined) ? "null" : newElement[field])));
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        let newElement = changes[collectionKey].newElement;
                        let oldElement = changes[collectionKey].oldElement;
                        items.push(MultiStepInput.getItem("$(symbol-field)  " + collectionKey + ": " + ((oldElement === undefined) ? "null" : oldElement) + " $(arrow-right) " + ((newElement === undefined) ? "null" : newElement)));
                    }
                }
                this.hasChanges = true;
                input.placeholder = "Changes on " + this._fileName + " " + this._permissionType;
            } else {
                input.placeholder = "The " + this._permissionType + " " + this._fileName + " has not any changes";
            }
            input.items = items;
            let buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
            input.title = this._title;
            input.buttons = buttons;
        }
        return input;
    }

    createOptionsInput(): vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input;
        if (this._permissionsContent) {
            const items = [];
            input = vscode.window.createQuickPick();
            input.placeholder = 'Choose the options before save the file, like compress file';
            input.title = this._title + ": Choose options before save";
            input.canSelectMany = true;
            items.push(MultiStepInput.getItem('Compress', undefined, 'Compress XML File with Aura Helper Format', undefined));
            if (this.hasChanges) {
                items.push(MultiStepInput.getItem('Deploy to Org', undefined, this._fileName + ' ' + this._permissionType + ' are modified. Want to deploy to the Auth Org?', undefined));
            }
            input.items = items;
            input.buttons = [MultiStepInput.getBackButton()];
        }
        return input;
    }

    onChangeSelection(items: vscode.QuickPickItem[]) {
        let fieldDefinition: any = {};
        let fieldKey;
        let selectedItems = this.getSelectedElements(items);
        let editableFields = [];
        let sortOrder;
        let metadataType;
        let separator;
        switch (this._step) {
            case ROOT_STEP:
                this._selectedCollection = selectedItems[0];
                this.nextStep(PERMISSIONS_STEP);
                break;
            case PERMISSIONS_STEP:
                fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                fieldKey = fieldDefinition.fieldKey;
                sortOrder = fieldDefinition.sortOrder;
                editableFields = getEditableFields(fieldDefinition);
                let notUniqueFields = getNotUniqueFields(fieldDefinition);
                metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
                if (editableFields.length > 1 || Array.isArray(fieldKey)) {
                    this._selectedElement = selectedItems[0];
                    this._selectedElements = selectedItems;
                    const hasChilds = this._profileMetadata[fieldDefinition.key] && this._profileMetadata[fieldDefinition.key][this._selectedElement] && Utils.hasKeys(this._profileMetadata[fieldDefinition.key][this._selectedElement].childs);
                    if (fieldDefinition.key === 'applicationVisibilities' || (!hasChilds && metadataType && notUniqueFields.length === editableFields.length)) {
                        this.nextStep(SET_VALUES_STEP);
                    } else {
                        this.nextStep(ELEMENT_STEP);
                    }
                } else if (fieldDefinition.fields[editableFields[0]].datatype === Datatypes.ENUM) {
                    this._selectedElement = selectedItems[0];
                    this._selectedElements = selectedItems;
                    this.nextStep(SET_VALUES_STEP);
                }
                break;
            case ADD_PERMISSION_STEP:
                fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                editableFields = getEditableFields(fieldDefinition);
                fieldKey = fieldDefinition.fieldKey;
                sortOrder = fieldDefinition.sortOrder;
                metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
                separator = !Utils.isArray(fieldKey) ? fieldDefinition.fields[sortOrder[0]].separator : undefined;
                if (editableFields.length > 1 && !this._currentInput.canSelectMany) {
                    this._selectedSubElement = selectedItems[0];
                    if (!separator) {
                        this.nextStep(SET_VALUES_STEP);
                    } else {
                        this._selectedElement = selectedItems[0];
                        const differences = getTypeDifferences(this._metadata, this._profileMetadata, fieldDefinition.key, this._xmlDefinition);
                        if (differences[metadataType].childs && Utils.hasKeys(differences[metadataType].childs[this._selectedElement].childs)) {
                            this.nextStep(ADD_CHILD_PERMISSION_STEP);
                        } else {
                            this.fireReportEvent("Not new " + metadataType + " found on " + this._selectedElement + " to add to this " + this._permissionType);
                        }
                    }
                }
                break;
            case SET_VALUES_STEP:
                fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                editableFields = getEditableFields(fieldDefinition);
                fieldKey = fieldDefinition.fieldKey;
                sortOrder = fieldDefinition.sortOrder;
                metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
                separator = !Utils.isArray(fieldKey) ? fieldDefinition.fields[sortOrder[0]].separator : undefined;
                const subFieldDefinition = fieldDefinition.fields[editableFields[0]];
                if (subFieldDefinition.datatype === Datatypes.ENUM) {
                    if (this._selectedElements && this._selectedElements.length > 1) {
                        for (const selectedElement of this._selectedElements) {
                            let dataToAdd: any = {};
                            for (let field of Object.keys(fieldDefinition.fields)) {
                                let fieldData = fieldDefinition.fields[field];
                                dataToAdd[field] = (fieldData.default === '{!value}') ? selectedElement : subFieldDefinition.getValue(selectedItems[0]);
                            }
                            this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                        }
                        Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                        this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                        this.backStep(PERMISSIONS_STEP);
                    } else {
                        let element;
                        let index = 0;
                        for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                            if (fieldValue[fieldKey] === this._selectedElement) {
                                element = fieldValue;
                                this._permissionsContent[fieldDefinition.key][index][editableFields[0]] = subFieldDefinition.getValue(selectedItems[0]);
                                break;
                            }
                            index++;
                        }
                        if (!element && this._selectedElements) {
                            let dataToAdd: any = {};
                            for (let field of Object.keys(fieldDefinition.fields)) {
                                let fieldData = fieldDefinition.fields[field];
                                dataToAdd[field] = (fieldData.default === '{!value}') ? this._selectedElements[0] : subFieldDefinition.getValue(selectedItems[0]);
                            }
                            this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                        }
                        Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                        this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                        this.backStep();
                    }
                }
                break;
            case ELEMENT_STEP:
                fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                fieldKey = fieldDefinition.fieldKey;
                sortOrder = fieldDefinition.sortOrder;
                editableFields = getEditableFields(fieldDefinition);
                if (Utils.isArray(fieldKey)) {
                    metadataType = fieldDefinition.fields[sortOrder[1]].metadataType;
                    if (metadataType) {
                        this._selectedSubElement = selectedItems[0];
                        this.nextStep(SUB_ELEMENT_STEP);
                    } else {
                        this.newElement = false;
                        this._selectedSubElement = selectedItems[0];
                        this.nextStep(SET_VALUES_STEP);
                    }
                } else if (fieldDefinition.datatype === Datatypes.OBJECT) {
                    const subfieldDefinition = getFieldDefinitionByLabel(this._selectedElement, fieldDefinition.fields);
                    let value: string | undefined = selectedItems[0];
                    if (value === '-- None --') {
                        value = undefined;
                        delete this._permissionsContent[fieldDefinition.key][subfieldDefinition.key];
                    } else {
                        if (!this._permissionsContent[fieldDefinition.key]) {
                            this._permissionsContent[fieldDefinition.key] = {};
                        }
                        this._permissionsContent[fieldDefinition.key][subfieldDefinition.key] = subfieldDefinition.getValue(value);
                    }
                    this.backStep();
                } else {
                    this._selectedSubElement = selectedItems[0];
                    this._selectedElements = selectedItems;
                    this.nextStep(SET_VALUES_STEP);
                }
                break;
            case SUB_ELEMENT_STEP:
                fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                editableFields = getEditableFields(fieldDefinition);
                fieldKey = fieldDefinition.fieldKey;
                sortOrder = fieldDefinition.sortOrder;
                if (Utils.isArray(fieldKey)) {
                    let rtField = fieldDefinition.fields[sortOrder[1]];
                    let mainFieldData = fieldDefinition.fields[fieldKey[0]];
                    let element;
                    let indexToRemove = 0;
                    for (let xmlElement of this._permissionsContent[fieldDefinition.key]) {
                        if (this._selectedSubElement === 'Master') {
                            if (xmlElement[fieldKey[0]].startsWith(this._selectedElement + mainFieldData.separator) && !xmlElement[sortOrder[1]]) {
                                element = xmlElement;
                                xmlElement[fieldKey[0]] = this._selectedElement + mainFieldData.separator + selectedItems[0];
                                break;
                            }
                        } else {
                            if (xmlElement[sortOrder[1]] === this._selectedElement + rtField.separator + this._selectedSubElement) {
                                element = xmlElement;
                                if (selectedItems[0] === '-- Not Assignment --') {
                                    break;
                                } else {
                                    xmlElement[fieldKey[0]] = this._selectedElement + mainFieldData.separator + selectedItems[0];
                                }
                                break;
                            }
                        }
                        indexToRemove++;
                    }
                    if (element && selectedItems[0] === '-- Not Assignment --') {
                        this._permissionsContent[fieldDefinition.key].splice(indexToRemove, 1);
                    } else if (!element && selectedItems[0] !== '-- Not Assignment --') {
                        let dataToAdd: any = {};
                        dataToAdd[fieldKey[0]] = this._selectedElement + mainFieldData.separator + selectedItems[0];
                        if (this._selectedSubElement !== 'Master') {
                            dataToAdd[fieldKey[1]] = this._selectedElement + rtField.separator + this._selectedSubElement;
                            this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                        }
                        this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                        Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                    }
                    this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                }
                this.backStep();
                break;
        }
    }

    async onButtonPressed(buttonName: string) {
        if (buttonName === 'back') {
            if (this._step === ADD_PERMISSION_STEP) {
                const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                const fieldKey = fieldDefinition.fieldKey;
                if (this.newElement) {
                    this.newElement = false;
                    if (Utils.isArray(fieldKey)) {
                        this._permissionsContent[fieldDefinition.key].pop();
                    }
                }
            } else if (this._step === ELEMENT_STEP) {
                const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                const fieldKey = fieldDefinition.fieldKey;
                if (Utils.isArray(fieldKey)) {
                    let index = 0;
                    for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                        const value = getValue(fieldValue, fieldKey);
                        if (value === this._selectedElement) {
                            this._permissionsContent[fieldDefinition.key][index] = Utils.clone(this._oldPermissionContent[fieldDefinition.key][index]);
                            break;
                        }
                        index++;
                    }
                }
            }
        } else if (buttonName === 'Accept') {
            if (this._step === ROOT_STEP) {
                this.nextStep(RESULT_STEP);
            } else if (this._step === RESULT_STEP) {
                this.nextStep(OPTIONS_STEP);
            } else {
                const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                const fieldKey = fieldDefinition.fieldKey;
                if (Utils.isArray(fieldKey)) {
                    let element;
                    if (this.newElement) {
                        element = this._permissionsContent[fieldDefinition.key][this._permissionsContent[fieldDefinition.key].length - 1];
                    } else {
                        let index = 0;
                        for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                            const value = getValue(fieldValue, fieldKey);
                            if (value === this._selectedElement) {
                                element = fieldValue;
                                break;
                            }
                            index++;
                        }
                    }
                    let validationError = undefined;
                    for (let field of Object.keys(fieldDefinition.fields)) {
                        let fieldData = fieldDefinition.fields[field];
                        let error = fieldData.validate(element[field]);
                        if (error) {
                            if (!validationError) {
                                validationError = error;
                            } else {
                                validationError += '; ' + error;
                            }
                        }
                    }
                    if (!validationError) {
                        if (element.description === '-- None --') {
                            this._permissionsContent[fieldDefinition.key][this._permissionsContent[fieldDefinition.key].length - 1].description = undefined;
                        }
                        // Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                        this.backStep();
                    } else {
                        this.fireValidationEvent(validationError);
                    }
                }
            }
        } else if (buttonName === 'Delete') {
            if (this._step === ELEMENT_STEP) {
                const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                const fieldKey = fieldDefinition.fieldKey;
                if (Utils.isArray(fieldKey)) {
                    let index = 0;
                    for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                        const value = getValue(fieldValue, fieldKey);
                        if (value === this._selectedElement) {
                            break;
                        }
                        index++;
                    }
                    this._permissionsContent[fieldDefinition.key].splice(index, 1);
                    this.backStep();
                }
            }
        } else if (buttonName === 'Ok') {
            let fieldDefinition: any = {};
            let fieldKeys = [];
            let editableFields = [];
            let uniqueFields = [];
            let fieldKey;
            let sortOrder;
            let separator;
            const selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
            switch (this._step) {
                case OPTIONS_STEP:
                    this._xmlContent[this._permissionType] = this._permissionsContent;
                    const options = {
                        compress: selectedItems.includes('Compress'),
                        deploy: selectedItems.includes('Deploy to Org'),
                        hasChanges: this.hasChanges
                    };
                    const data = {
                        file: this._fileName,
                        type: this._permissionType
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
                    break;
                case PERMISSIONS_STEP:
                    fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                    fieldKeys = Object.keys(fieldDefinition.fields);
                    fieldKey = fieldDefinition.fieldKey;
                    editableFields = getEditableFields(fieldDefinition);
                    if (selectedItems.length === 0) {
                        this.backStep();
                    } else if (editableFields.length === 1) {
                        for (let i = 0; i < this._permissionsContent[fieldDefinition.key].length; i++) {
                            this._permissionsContent[fieldDefinition.key][i][editableFields[0]] = selectedItems.includes(this._permissionsContent[fieldDefinition.key][i][fieldKey]);
                        }
                        Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                        this.backStep();
                    } else {
                        this._selectedElements = selectedItems;
                        this.nextStep(SET_VALUES_STEP);
                    }
                    break;
                case ADD_PERMISSION_STEP:
                    fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                    fieldKeys = Object.keys(fieldDefinition.fields);
                    editableFields = getEditableFields(fieldDefinition);
                    let notUnique = getNotUniqueFields(fieldDefinition);
                    if (selectedItems.length === 0) {
                        this.backStep();
                    } else if (editableFields.length === 1 || selectedItems.length > 1) {
                        if ((editableFields.length === 1 || editableFields.length !== notUnique.length) && fieldDefinition.fields[editableFields[0]].datatype !== Datatypes.ENUM) {
                            for (let selectedItem of selectedItems) {
                                let dataToAdd: any = {};
                                for (let field of fieldKeys) {
                                    let fieldData = fieldDefinition.fields[field];
                                    dataToAdd[field] = (fieldData.default === '{!value}') ? selectedItem : fieldData.default;
                                }
                                this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                            }
                            Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                            this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                            this.backStep();
                        } else {
                            this._selectedElements = selectedItems;
                            this.nextStep(SET_VALUES_STEP);
                        }
                    } else {
                        this._selectedElements = selectedItems;
                        this.nextStep(SET_VALUES_STEP);
                    }
                    break;
                case ADD_CHILD_PERMISSION_STEP:
                    fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                    fieldKeys = Object.keys(fieldDefinition.fields);
                    editableFields = getEditableFields(fieldDefinition);
                    let notUniqueFields = getNotUniqueFields(fieldDefinition);
                    sortOrder = fieldDefinition.sortOrder;
                    separator = !Utils.isArray(fieldKey) ? fieldDefinition.fields[sortOrder[0]].separator : undefined;
                    if (selectedItems.length === 0) {
                        this.backStep();
                    } else {
                        if (notUniqueFields.length !== editableFields.length && selectedItems.length > 1) {
                            for (let selectedItem of selectedItems) {
                                let dataToAdd: any = {};
                                for (let field of fieldKeys) {
                                    let fieldData = fieldDefinition.fields[field];
                                    dataToAdd[field] = (fieldData.default === '{!value}') ? (this._selectedElement + separator + selectedItem) : fieldData.default;
                                }
                                this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                            }
                            Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                            this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                            this.backStep();
                        } else {
                            this._selectedElements = selectedItems;
                            this.nextStep(SET_VALUES_STEP);
                        }
                    }
                    break;
                case SET_VALUES_STEP:
                    fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
                    fieldKeys = Object.keys(fieldDefinition.fields);
                    fieldKey = fieldDefinition.fieldKey;
                    editableFields = getEditableFields(fieldDefinition);
                    sortOrder = fieldDefinition.sortOrder;
                    separator = fieldDefinition.fields[sortOrder[0]].separator;
                    let element;
                    if (this._selectedElements && this._selectedElements.length === 1) {
                        for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                            let value = (separator) ? this._selectedElement + separator + this._selectedElements[0] : this._selectedElements[0];
                            if (fieldValue[fieldDefinition.fieldKey] === value) {
                                for (let field of editableFields) {
                                    const subfieldDefinition = fieldDefinition.fields[field];
                                    let value = selectedItems.includes(field);
                                    if (fieldValue[field] !== value) {
                                        if (subfieldDefinition.unique && subfieldDefinition.editable) {
                                            uniqueFields.push({ field: field, value: value, datatype: subfieldDefinition.datatype });
                                        }
                                    }
                                    fieldValue[field] = value;
                                }
                                element = fieldValue;
                                break;
                            }
                        }
                    }
                    if (!element && this._selectedElements) {
                        for (let selectedElement of this._selectedElements) {
                            let dataToAdd: any = {};
                            for (let field of fieldKeys) {
                                let value = (separator) ? this._selectedElement + separator + selectedElement : selectedElement;
                                const subfieldDefinition = fieldDefinition.fields[field];
                                dataToAdd[field] = (subfieldDefinition.default === '{!value}') ? value : selectedItems.includes(field);
                                if (subfieldDefinition.unique && subfieldDefinition.editable) {
                                    uniqueFields.push({ field: field, value: dataToAdd[field], datatype: subfieldDefinition.datatype });
                                }
                            }
                            this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                            let checkedNow = getCheckedItems(selectedItems, this._currentInput.items);
                            const uncheckedNow = getUncheckedItems(selectedItems, this._currentInput.items);
                            if (checkedNow.length === 0 && uncheckedNow.length === 0) {
                                checkedNow = selectedItems;
                            }
                            Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                            MetadataUtils.handleUniqueFields(this._permissionsContent, fieldDefinition, uniqueFields, separator ? this._selectedElement : selectedElement, separator ? selectedElement : undefined);
                            MetadataUtils.handleControlledFields(this._permissionsContent, fieldDefinition, checkedNow, separator ? this._selectedElement : selectedElement, separator ? selectedElement : undefined);
                            MetadataUtils.handleControlledFields(this._permissionsContent, fieldDefinition, uncheckedNow, separator ? this._selectedElement : selectedElement, separator ? selectedElement : undefined);
                        }
                        this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                        this.backStep(PERMISSIONS_STEP);
                    } else if (this._selectedElements) {
                        let checkedNow = getCheckedItems(selectedItems, this._currentInput.items);
                        const uncheckedNow = getUncheckedItems(selectedItems, this._currentInput.items);
                        if (checkedNow.length === 0 && uncheckedNow.length === 0) {
                            checkedNow = selectedItems;
                        }
                        Utils.sort(this._permissionsContent[fieldDefinition.key], fieldDefinition.sortOrder);
                        MetadataUtils.handleControlledFields(this._permissionsContent, fieldDefinition, checkedNow, separator ? this._selectedElement : this._selectedElements[0], separator ? this._selectedElements[0] : undefined);
                        MetadataUtils.handleControlledFields(this._permissionsContent, fieldDefinition, uncheckedNow, separator ? this._selectedElement : this._selectedElements[0], separator ? this._selectedElements[0] : undefined);
                        MetadataUtils.handleUniqueFields(this._permissionsContent, fieldDefinition, uniqueFields, separator ? this._selectedElement : this._selectedElements[0], separator ? this._selectedElements[0] : undefined);
                        this._profileMetadata = extractMetadataFromFile(this._permissionsContent, this._xmlDefinition);
                        if (separator) {
                            this.backStep();
                        } else {
                            this.backStep(PERMISSIONS_STEP);
                        }
                    }
                    break;
                default:
                    break;
            }
        } else if (buttonName === 'Add') {
            const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
            const fieldKey = fieldDefinition.fieldKey;
            const sortOrder = fieldDefinition.sortOrder;
            let fieldKeys = Object.keys(fieldDefinition.fields);
            const metadataType = fieldDefinition.fields[sortOrder[0]].metadataType;
            switch (this._step) {
                case PERMISSIONS_STEP:
                    if (metadataType || Utils.isArray(fieldKey)) {
                        if (metadataType && this._metadata[metadataType]) {
                            const differences = getTypeDifferences(this._metadata, this._profileMetadata, fieldDefinition.key, this._xmlDefinition);
                            if (differences[metadataType]) {
                                this.nextStep(ADD_PERMISSION_STEP);
                            } else {
                                this.fireReportEvent("Not new " + metadataType + " found to add to this " + this._permissionType);
                            }
                        } else if (Array.isArray(fieldKey)) {
                            this.newElement = true;
                            let dataToAdd: any = {};
                            for (let field of fieldKeys) {
                                let fieldData = fieldDefinition.fields[field];
                                dataToAdd[field] = (fieldData.default === '{!value}') ? '-- None --' : fieldData.default;
                            }
                            this._permissionsContent[fieldDefinition.key].push(dataToAdd);
                            this.nextStep(ADD_PERMISSION_STEP);
                        } else {
                            this.fireReportEvent('Not found ' + metadataType + " metadata on your local project");
                        }
                    } else if (fieldDefinition.key === "userPermissions") {
                        if (!applicationContext.sfData.availablePermissions || applicationContext.sfData.availablePermissions.length === 0) {
                            this._currentInput.busy = true;
                            this._currentInput.enabled = false;
                            try {
                                applicationContext.sfData.availablePermissions = await loadUserPermissions();
                            } catch (error) {
                                this.fireErrorEvent("An error  ocurred while loading user permissions: " + error);
                            }
                            this._currentInput.busy = false;
                            this._currentInput.enabled = true;
                        }
                        let notAddedPermissions = [];
                        if (applicationContext.sfData.availablePermissions && applicationContext.sfData.availablePermissions.length > 0) {
                            let permissionsOnProfile = [];
                            for (let xmlElement of this._permissionsContent[fieldDefinition.key]) {
                                permissionsOnProfile.push(xmlElement[fieldKey]);
                            }
                            for (let permission of applicationContext.sfData.availablePermissions) {
                                if (!permissionsOnProfile.includes(permission)) {
                                    notAddedPermissions.push(permission);
                                }
                            }
                            if (notAddedPermissions.length === 0) {
                                this.fireReportEvent("Not new User Permissions found for add to this " + this._permissionType);
                            } else {
                                this.nextStep(ADD_PERMISSION_STEP);
                            }
                        } else {
                            this.fireReportEvent("Not new User Permissions found for add to this " + this._permissionType);
                        }
                    }
                    break;
                case ELEMENT_STEP:
                    if (metadataType) {
                        const differences = getTypeDifferences(this._metadata, this._profileMetadata, fieldDefinition.key, this._xmlDefinition);
                        if (this._selectedElement && differences[metadataType] && Utils.hasKeys(differences[metadataType].childs) && differences[metadataType].childs[this._selectedElement] && Utils.hasKeys(differences[metadataType].childs[this._selectedElement].childs)) {
                            this._selectedElements = [this._selectedElement];
                            this.nextStep(ADD_CHILD_PERMISSION_STEP);
                        } else {
                            this.fireReportEvent("Not new " + metadataType + " found on " + this._selectedElement + " to add to this " + this._permissionType);
                        }
                    }
                    break;
            }
        }
    }

    onChangeValue(_value: string) {

    }

    onValueSet(value: string) {
        const fieldDefinition = getFieldDefinitionByLabel(this._selectedCollection, this._xmlDefinition);
        switch (this._step) {
            case PERMISSIONS_STEP:
                if (this._permissionsContent) {
                    if (fieldDefinition.key === 'description' && value && value.length > 255) {
                        this._currentInput.validationMessage = "Description to long. Remove at least " + (value.length - 255) + " characters";
                        return;
                    }
                    this._permissionsContent[fieldDefinition.key] = value;
                }
                break;
            case SET_VALUES_STEP:
                const fieldKey = fieldDefinition.fieldKey;
                if (Utils.isArray(fieldKey)) {
                    const subFieldDefinition = getFieldDefinitionByLabel(this._selectedSubElement, fieldDefinition.fields);
                    if (this.newElement) {
                        this._permissionsContent[fieldDefinition.key][this._permissionsContent[fieldDefinition.key].length - 1][subFieldDefinition.key] = value;
                    } else {
                        let index = 0;
                        for (const fieldValue of this._permissionsContent[fieldDefinition.key]) {
                            const processedValue = getValue(fieldValue, fieldKey);
                            if (processedValue === this._selectedElement) {
                                this._permissionsContent[fieldDefinition.key][index][subFieldDefinition.key] = value;
                                if (fieldKey.includes(subFieldDefinition.key)) {
                                    this._selectedElement = getValue(this._permissionsContent[fieldDefinition.key][index], fieldKey);
                                }
                                break;
                            }
                            index++;
                        }
                    }
                } else {

                }
                break;
            case ELEMENT_STEP:
                if (this._permissionsContent && this._selectedElement) {
                    if (fieldDefinition.key === 'loginIpRanges') {
                        let fieldData = fieldDefinition.fields[this._selectedElement];
                        let error = fieldData.validate(value);
                        if (error) {
                            this.fireValidationEvent(error);
                        }
                        this._permissionsContent[fieldDefinition.key][this._permissionsContent[fieldDefinition.key].length - 1][this._selectedElement] = value;
                    }
                }
                break;
            case SUB_ELEMENT_STEP:
                if (this._permissionsContent && this._selectedSubElement) {
                    if (fieldDefinition.key === 'loginIpRanges') {
                        let fieldData = fieldDefinition.fields[this._selectedSubElement];
                        let error = fieldData.validate(value);
                        if (error) {
                            this.fireValidationEvent(error);
                        }
                    }
                    for (let xmlElement of this._permissionsContent[fieldDefinition.key]) {
                        let fieldKeyValue = getValue(xmlElement, fieldDefinition.fieldKey);
                        if (fieldKeyValue === this._selectedElement) {
                            xmlElement[this._selectedSubElement] = value;
                            this._selectedElement = getValue(xmlElement, fieldDefinition.fieldKey);
                            break;
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

}

function transformPermissionContentToMap(permissionContent: any, xmlMetadata: any): any {
    const permissionsContentMap: any = {};
    for (const collectionKey of Object.keys(permissionContent)) {
        const collection = permissionContent[collectionKey];
        const collectionData = xmlMetadata[collectionKey];
        if (collectionData && collectionData.editable) {
            const fieldKey = collectionData.fieldKey;
            const sortOrder = collectionData.fieldKey;
            if (collectionData.datatype === Datatypes.ARRAY) {
                for (let xmlElement of collection) {
                    if (!permissionsContentMap[collectionKey]) {
                        permissionsContentMap[collectionKey] = {
                            name: collectionKey,
                            elements: {},
                        };
                    }
                    let value;
                    if (Utils.isArray(fieldKey) && collectionData.fields[fieldKey[0]].metadataType === MetadataTypes.LAYOUT) {
                        if (xmlElement[sortOrder[1]]) {
                            value = getValue(xmlElement, fieldKey);
                        } else {
                            value = 'Master';
                        }
                    } else {
                        value = getValue(xmlElement, fieldKey);
                    }
                    permissionsContentMap[collectionKey].elements[value] = xmlElement;
                }
            } else {
                permissionsContentMap[collectionKey] = collection;
            }
        }
    }
    return permissionsContentMap;
}

function getFieldDefinitionByLabel(label?: string, xmlMetadata?: any): any {
    const dataToReturn: any = {};
    for (const elementKey of Object.keys(xmlMetadata)) {
        const elementData = xmlMetadata[elementKey];
        if (elementData.label === label) {
            return elementData;
        }
    }
    return dataToReturn;
}

function getUncheckedItems(selectedItems: string[], items: vscode.QuickPickItem[]): string[] {
    let unchecked = [];
    for (let item of items) {
        if (!selectedItems.includes(item.label) && item.picked) {
            unchecked.push(item.label);
        }
    }
    return unchecked;
}

function getCheckedItems(selectedItems: string[], items: vscode.QuickPickItem[]): string[] {
    let checked = [];
    for (let item of items) {
        if (selectedItems.includes(item.label) && !item.picked) {
            checked.push(item.label);
        }
    }
    return checked;
}

function getValue(xmlElement: any, fieldKey: string, useArrow?: boolean): string {
    let value;
    if (Utils.isArray(fieldKey)) {
        for (let field of fieldKey) {
            if (xmlElement[field]) {
                if (!value) {
                    value = xmlElement[field];
                }
                else {
                    value += ((useArrow) ? ' $(arrow-right) ' : ' - ') + xmlElement[field];
                }
            }
        }
    } else {
        value = xmlElement[fieldKey];
    }
    return value;
}

function getDescription(xmlElement: any, elementData: any, useMainField: boolean): string {
    let description: string = '';
    if (!useMainField) {
        for (const fieldName of Object.keys(elementData.fields)) {
            let fieldKey = elementData.fieldKey;
            let isDistinct = false;
            if (Array.isArray(fieldKey)) {
                let nDistincts = 0;
                for (let field of fieldKey) {
                    if (fieldName !== field) {
                        nDistincts++;
                    }
                }
                isDistinct = nDistincts === fieldKey.length;
            } else {
                isDistinct = fieldName !== fieldKey;
            }
            if (isDistinct) {
                if (xmlElement[fieldName]) {
                    let value = fieldName;
                    if (Array.isArray(fieldKey)) {
                        value = xmlElement[fieldName];
                    }
                    if (!description) {
                        description = value;
                    } else {
                        description += " - " + value;
                    }
                }
            }
        }
    } else {
        if (!description) {
            let fieldKey = elementData.fieldKey;
            description = getValue(xmlElement, fieldKey);
        }
    }
    return description;
}

function extractMetadataFromFile(profile: any, xmlMetadata: any): any {
    const profileMetadata: any = {};
    for (const collection of Object.keys(profile)) {
        const collectionData = xmlMetadata[collection];
        if (!collectionData || collectionData.datatype !== Datatypes.ARRAY) {
            continue;
        }
        const mainFieldKey = Utils.isArray(collectionData.fieldKey) ? collectionData.fieldKey[0] : collectionData.fieldKey;
        const mainFieldData = collectionData.fields[mainFieldKey];
        if (!profileMetadata[collection]) {
            profileMetadata[collection] = {};
        }
        const fieldValue = XMLUtils.forceArray(profile[collection]);
        for (const xmlElement of fieldValue) {
            if (mainFieldData && mainFieldData.separator) {
                let xmlField = mainFieldKey;
                let separator = mainFieldData.separator;
                if (collectionData.fields[mainFieldKey].metadataType === MetadataTypes.LAYOUT) {
                    xmlField = collectionData.fieldKey[1];
                    separator = collectionData.fields[collectionData.fieldKey[1]].separator;
                }
                let splits;
                let obj;
                let item;
                if (xmlElement[xmlField]) {
                    splits = xmlElement[xmlField].split(separator);
                    obj = splits[0];
                    if (xmlElement.layout && xmlElement.layout.indexOf('CaseClose') !== -1) {
                        obj = 'CaseClose';
                    }
                    item = splits[1];
                } else {
                    splits = xmlElement[mainFieldKey].split(mainFieldData.separator);
                    obj = splits[0];
                    item = 'Master';
                }
                if (!profileMetadata[collection][obj]) {
                    profileMetadata[collection][obj] = {
                        name: obj,
                        childs: {},
                        xmlElement: undefined,
                    };
                }
                profileMetadata[collection][obj].childs[item] = {
                    name: item,
                    xmlElement: xmlElement,
                };
            } else {
                let item = xmlElement[mainFieldKey];
                profileMetadata[collection][item] = {
                    name: item,
                    childs: {},
                    xmlElement: xmlElement,
                };
            }
        }
    }
    return profileMetadata;
}

function getEditableFields(elementData: any): any[] {
    const fields: string[] = [];
    for (const field of Object.keys(elementData.fields)) {
        if (elementData.fields[field].editable) {
            fields.push(field);
        }
    }
    return fields;
}

function getNotUniqueFields(elementData: any): any[] {
    const fields: string[] = [];
    for (const field of Object.keys(elementData.fields)) {
        if (!elementData.fields[field].unique) {
            fields.push(field);
        }
    }
    return fields;
}

function loadUserPermissions() {
    return new Promise<string[]>(async (resolve, reject) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Loading all available User Permissions from Org',
            cancellable: true,
        }, (_progress, cancelToken) => {
            return new Promise<void>((progressResolve) => {
                const alias = Config.getOrgAlias();
                if (!alias) {
                    reject(new Error('Not connected to an Org. Please authorize and connect to and org and try later.'));
                    return;
                }
                if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.useAuraHelperSFDX(applicationContext.ahPluginInstalled);
                    cancelToken.onCancellationRequested(() => {
                        cliManager.abortProcess();
                    });
                    cliManager.loadUserPermissions().then((permissions: string[]) => {
                        resolve(permissions);
                        progressResolve();
                    }).catch((error: Error) => {
                        reject(error);
                        progressResolve();
                    });
                } else {
                    const connection = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        connection.abortConnection();
                    });
                    connection.loadUserPermissions(Paths.getTemporalFolder()).then((permissions: string[]) => {
                        resolve(permissions);
                        progressResolve();
                    }).catch((error: Error) => {
                        reject(error);
                        progressResolve();
                    });
                }
            });
        });
    });
}

function getTypeDifferences(metadata: any, metadataFromProfile: any, collectionName: string, xmlDefinition: any): any {
    const differences: any = {};
    const collectionWithType = metadataFromProfile[collectionName];
    const fieldDefinition = xmlDefinition[collectionName];
    const metadataType = fieldDefinition.fields[fieldDefinition.fieldKey].metadataType;
    if (collectionWithType && metadataType) {
        if (metadata[metadataType] && MetadataUtils.haveChilds(metadata[metadataType])) {
            for (const objKey of Object.keys(metadata[metadataType].childs)) {
                const objData = applicationContext.parserData.sObjectsData[objKey.toLowerCase()];
                if (!collectionWithType[objKey]) {
                    if (!differences[metadataType]) {
                        differences[metadataType] = new MetadataType(metadataType, false);
                    }
                    if (metadataType === MetadataTypes.CUSTOM_FIELD && MetadataUtils.haveChilds(metadata[metadataType].childs[objKey])) {
                        for (const itemKey of Object.keys(metadata[metadataType].childs[objKey].childs)) {
                            let fData;
                            if (objData && objData.fields) {
                                fData = objData.fields[itemKey];
                            }
                            if (!fData || fData.nillable) {
                                if (!differences[metadataType].childs[objKey]) {
                                    differences[metadataType].childs[objKey] = new MetadataObject(objKey, false);
                                }
                                differences[metadataType].childs[objKey].childs[itemKey] = new MetadataItem(itemKey, false);
                            }
                        }
                    } else if (collectionName === 'customSettingAccesses' && objData && objData.customSetting) {
                        differences[metadataType].childs[objKey] = metadata[metadataType].childs[objKey];
                    } else if (collectionName !== 'customSettingAccesses') {
                        differences[metadataType].childs[objKey] = metadata[metadataType].childs[objKey];
                    }
                } else {
                    if (collectionWithType[objKey].childs && MetadataUtils.haveChilds(metadata[metadataType].childs[objKey])) {
                        for (const itemKey of Object.keys(metadata[metadataType].childs[objKey].childs)) {
                            let nullable = true;
                            if (metadataType === MetadataTypes.CUSTOM_FIELD) {
                                let fData;
                                if (objData && objData.fields) {
                                    fData = objData.fields[itemKey];
                                }
                                nullable = !fData || fData.nillable;
                            }
                            if (!collectionWithType[objKey].childs[itemKey] && nullable) {
                                if (!differences[metadataType]) {
                                    differences[metadataType] = new MetadataType(metadataType, false);
                                }
                                if (!differences[metadataType].childs[objKey]) {
                                    differences[metadataType].childs[objKey] = new MetadataObject(objKey, false);
                                }
                                differences[metadataType].childs[objKey].childs[itemKey] = new MetadataItem(itemKey, false);
                            }
                        }
                    }
                }
            }
        }
        if (metadataType === MetadataTypes.CUSTOM_TAB && metadata[MetadataTypes.CUSTOM_OBJECT] && MetadataUtils.haveChilds(metadata[MetadataTypes.CUSTOM_OBJECT])) {
            for (const objKey of Object.keys(metadata[MetadataTypes.CUSTOM_OBJECT].childs)) {
                if (objKey.indexOf('__') === -1) {
                    let standardTabName = 'standard-' + objKey;
                    if (!collectionWithType[standardTabName]) {
                        if (!differences[metadataType]) {
                            differences[metadataType] = new MetadataType(metadataType, false);
                        }
                        differences[metadataType].childs[standardTabName] = new MetadataObject(standardTabName, false);
                    }
                }
            }
        }
    }
    return differences;
}