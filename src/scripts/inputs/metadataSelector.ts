import * as vscode from 'vscode';
import { Paths } from '../core/paths';
import { MultiStepInput } from './multiStepInput';
import { InputFactory } from './factory';
const GitManager = require('@aurahelper/git-manager');
const { MetadataUtils, Utils, StrUtils } = require('@aurahelper/core').CoreUtils;
const { PathUtils } = require('@aurahelper/core').FileSystem;

const INIT_OPTIONS_STEP = 1;
const TYPE_STEP = 2;
const OBJECT_STEP = 3;
const ITEM_STEP = 4;
const GIT_STEP = 5;
const GIT_SOURCE_TARGET_STEP = 6;
const GIT_SOURCE_TARGET_SELECTION_STEP = 7;
const PACKAGES_STEP = 8;
const PACKAGES_OPTIONS_STEP = 9;
const RESULT_STEP = 10;
const FINISH_OPTIONS_STEP = 11;

const LOCAL_ACTION = 'local';
const MIXED_ACTION = 'mixed';
const DOWNLOAD_ACTION = 'download';
const DOWNLOAD_ALL_ACTION = 'downloadAll';
const GIT_ACTION = 'git';
const PACKAGES_ACTION = 'packages';
const COMPRESS_ACTION = 'compress';
const DEPLOY_ACTION = 'deploy';
const DEPLOY_BEFORE_ACTION = 'deployBefore';
const DEPLOY_AFTER_ACTION = 'deployAfter';
const DESTRUCTIVE_ACTION = 'destrructive';
const IGNORE_ACTION = 'ignore';
const WILDCARDS_ACTION = 'wildcards';
const DELETE_ACTION = 'delete';
const CUSTOM_FOLDER_ACTION = 'customFolder';
const REPAIR_ACTION = 'repair';
const CHECK_ERRORS_ACTION = 'checkErrors';
const RETRIEVE_ACTION = 'retrieve';

export interface MetadataSelectorOption {
    title: string;
    description: string;
    action: string;
    dependency?: string[];
}

export class MetadataSelector extends MultiStepInput {

    _selectedType?: string;
    _selectedObject?: string;
    _allowDelete: boolean;
    _finalStep: number;
    _typesToDownload?: string[];
    _initOptions: MetadataSelectorOption[];
    _finishOptions: MetadataSelectorOption[];
    _selectedInitOptions: string[];
    _selectedFinishOptions: string[];
    _hasSelectedElements: boolean;
    _singleSelectionOptions: boolean;
    _gitSourceType?: string;
    _gitSource?: string;
    _gitTarget?: string;
    _isSourceSelection: boolean;
    _activeBranch?: string;
    _branches: any[];
    _tags: any[];
    _commits: any[];
    _loadGitData: boolean;
    _packageFiles: string[];
    _mergeOption?: string;

    constructor(title: string, typesToDownload?: string[]) {
        super(title, TYPE_STEP, RESULT_STEP);
        this._metadata = undefined;
        this._selectedType = undefined;
        this._selectedObject = undefined;
        this._allowDelete = false;
        this._finalStep = RESULT_STEP;
        this._typesToDownload = typesToDownload;
        this._initOptions = [];
        this._finishOptions = [];
        this._selectedInitOptions = [];
        this._selectedFinishOptions = [];
        this._hasSelectedElements = false;
        this._singleSelectionOptions = false;
        this._gitSourceType = undefined;
        this._gitSource = undefined;
        this._gitTarget = undefined;
        this._isSourceSelection = false;
        this._activeBranch = undefined;
        this._branches = [];
        this._tags = [];
        this._commits = [];
        this._loadGitData = true;
        this._packageFiles = [];
        this._mergeOption = undefined;
    }

    static getRetrieveAction(): string {
        return RETRIEVE_ACTION;
    }

    static getPackagesAction(): string {
        return PACKAGES_ACTION;
    }

    static getIgnoreAction(): string {
        return IGNORE_ACTION;
    }

    static getGitAction(): string {
        return GIT_ACTION;
    }

    static getRepairAction(): string {
        return REPAIR_ACTION;
    }

    static getCheckErrorsAction(): string {
        return CHECK_ERRORS_ACTION;
    }

    static getLocalAction(): string {
        return LOCAL_ACTION;
    }

    static getMixedAction(): string {
        return MIXED_ACTION;
    }

    static getDownloadAction(): string {
        return DOWNLOAD_ACTION;
    }

    static getDownloadAllAction(): string {
        return DOWNLOAD_ALL_ACTION;
    }

    static getCompressAction(): string {
        return COMPRESS_ACTION;
    }

    static getWildcardsAction(): string {
        return WILDCARDS_ACTION;
    }

    static getDeployAction(): string {
        return DEPLOY_ACTION;
    }

    static getDestructiveAction(): string {
        return DESTRUCTIVE_ACTION;
    }

    static getDeployBeforeAction(): string {
        return DEPLOY_BEFORE_ACTION;
    }

    static getDeployAfterAction(): string {
        return DEPLOY_AFTER_ACTION;
    }

    static getCustomFolderAction(): string {
        return CUSTOM_FOLDER_ACTION;
    }

    static getDeleteAction(): string {
        return DELETE_ACTION;
    }

    setSingleSelectionOptions(singleSelectionOptions: boolean): MetadataSelector {
        this._singleSelectionOptions = singleSelectionOptions;
        return this;
    }

    allowDelete(allow: boolean): MetadataSelector {
        this._allowDelete = allow;
        return this;
    }

    setTypesToDownload(types: string[]): MetadataSelector {
        this._typesToDownload = types;
        return this;
    }

    setMetadata(metadata: any): MetadataSelector {
        this._metadata = metadata;
        return this;
    }

    addInitOption(title: string, description: string, action: string): MetadataSelector {
        this._initialStep = INIT_OPTIONS_STEP;
        this._step = INIT_OPTIONS_STEP;
        this._initOptions.push({
            title: title,
            description: description,
            action: action
        });
        return this;
    }

    addFinishOption(title: string, description: string, action: string, dependency?: string | string[]): MetadataSelector {
        this._finalStep = FINISH_OPTIONS_STEP;
        this._finishOptions.push({
            title: title,
            description: description,
            action: action,
            dependency: dependency ? Utils.forceArray(dependency) : undefined
        });
        return this;
    }

    onCreateInputRequest(): vscode.QuickInput | vscode.QuickPick<vscode.QuickPickItem> | undefined {
        let input: vscode.QuickInput | vscode.QuickPick<vscode.QuickPickItem> | undefined;
        switch (this._step) {
            case INIT_OPTIONS_STEP:
                input = createInitOptionsInput(this);
                break;
            case PACKAGES_STEP:
                input = createPackagesInput(this);
                break;
            case PACKAGES_OPTIONS_STEP:
                input = createPackagesOptionsInput(this);
                break;
            case GIT_STEP:
                input = createGITInput(this);
                break;
            case GIT_SOURCE_TARGET_STEP:
                input = createGITSourceTargetInput(this);
                break;
            case GIT_SOURCE_TARGET_SELECTION_STEP:
                input = createGITSourceTargetSelectionInput(this);
                break;
            case TYPE_STEP:
                input = createMetadataTypeInput(this);
                break;
            case OBJECT_STEP:
                input = createMetadataObjectInput(this);
                break;
            case ITEM_STEP:
                input = createMetadataItemInput(this);
                break;
            case RESULT_STEP:
                input = createResultInput(this);
                break;
            case FINISH_OPTIONS_STEP:
                input = createFinishOptionsInput(this);
                break;
        }
        return input;
    }

    onButtonPressed(buttonName: string): void {
        if (buttonName === 'Accept') {
            if (this._step === RESULT_STEP || this._step === GIT_SOURCE_TARGET_STEP) {
                if (showFinishOptions(this)) {
                    this.nextStep(FINISH_OPTIONS_STEP);
                } else {
                    const options: any = {};
                    for (const option of this._initOptions) {
                        options[option.action] = this._selectedInitOptions.includes(option.title);
                    }
                    this.fireAcceptEvent(options, this._metadata);
                    this._currentInput.dispose();
                }
            } else if (this._step === PACKAGES_STEP) {
                this.nextStep(PACKAGES_OPTIONS_STEP);
            } else {
                this.nextStep(RESULT_STEP);
            }
        } else if (buttonName === 'Delete') {
            this.fireDeleteEvent(this._metadata);
        } else if (buttonName === 'Fetch') {
            setTimeout(() => {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    cancellable: false,
                    title: 'Fetching Data from Remote repository'
                }, () => {
                    return new Promise<void>((resolve) => {
                        fetchGitData(this).then(() => {
                            this._loadGitData = false;
                            resolve();
                            this.show();
                        }).catch((error) => {
                            this._loadGitData = false;
                            this.fireErrorEvent(error);
                            resolve();
                        });
                    });
                });
            }, 10);
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
        } else if (buttonName === 'Ok') {
            if (this._step === INIT_OPTIONS_STEP) {
                this._selectedInitOptions = this.getSelectedElements(this._currentInput.selectedItems);
                const options: any = {};
                for (const option of this._initOptions) {
                    options[option.action] = this._selectedInitOptions.includes(option.title);
                }
                if (!this._selectedInitOptions || this._selectedInitOptions.length === 0) {
                    options[LOCAL_ACTION] = true;
                    this._selectedInitOptions = ['Download From Local'];
                }
                if (options[GIT_ACTION] && !options[DOWNLOAD_ACTION]) {
                    this.nextStep(GIT_STEP);
                } else if (options[PACKAGES_ACTION] && !options[GIT_ACTION] && !options[DOWNLOAD_ACTION]) {
                    this.nextStep(PACKAGES_STEP);
                } else {
                    this.nextStep(TYPE_STEP);
                }
            } else if (this._step === FINISH_OPTIONS_STEP) {
                this._selectedFinishOptions = this.getSelectedElements(this._currentInput.selectedItems);
                const options: any = {};
                for (const option of this._initOptions) {
                    options[option.action] = this._selectedInitOptions.includes(option.title);
                }
                for (const option of this._finishOptions) {
                    options[option.action] = this._selectedFinishOptions.includes(option.title);
                }
                if (options[GIT_ACTION] && !options[DOWNLOAD_ACTION]) {
                    this.fireAcceptEvent(options, {
                        source: this._gitSource,
                        activeBranch: this._activeBranch,
                        target: this._gitTarget,
                        type: this._gitSourceType
                    });
                } else if (options[PACKAGES_ACTION] && !options[GIT_ACTION] && !options[DOWNLOAD_ACTION]) {
                    this.fireAcceptEvent(options, {
                        files: this._packageFiles,
                        mergeOption: this._mergeOption
                    });
                } else {
                    this.fireAcceptEvent(options, this._metadata);
                }
                this._currentInput.dispose();
            } else {
                this.backStep();
            }
        }
    }

    onChangeSelection(items: vscode.QuickPickItem[]): void {
        const selectedItems = this.getSelectedElements(this._currentInput.selectedItems);
        switch (this._step) {
            case TYPE_STEP:
                this._selectedType = selectedItems[0].split(')')[1].trim();
                this.nextStep(OBJECT_STEP);
                break;
            case GIT_STEP:
                this._gitSourceType = selectedItems[0].split(')')[1].trim();
                this.nextStep(GIT_SOURCE_TARGET_STEP);
                break;
            case GIT_SOURCE_TARGET_STEP:
                const selection = selectedItems[0].split(')')[1].trim();
                if (StrUtils.contains(selection, 'Source')) {
                    this._isSourceSelection = true;
                } else {
                    this._isSourceSelection = false;
                }
                this.nextStep(GIT_SOURCE_TARGET_SELECTION_STEP);
                break;
            case GIT_SOURCE_TARGET_SELECTION_STEP:
                if (this._isSourceSelection) {
                    this._gitSource = selectedItems[0].split(')')[1].trim();
                } else {
                    this._gitTarget = selectedItems[0].split(')')[1].trim();
                }
                this.backStep();
                break;
            case PACKAGES_OPTIONS_STEP:
                this._mergeOption = selectedItems[0];
                this.nextStep(FINISH_OPTIONS_STEP);
                break;
            case OBJECT_STEP:
                let withChilds = false;
                if (this._selectedType) {
                    Object.keys(this._metadata[this._selectedType].childs).forEach((objectKey: string) => {
                        if (!withChilds && this._selectedType) {
                            withChilds = MetadataUtils.haveChilds(this._metadata[this._selectedType].childs[objectKey]);
                        }
                    });
                }
                if (!withChilds && this._selectedType) {
                    Object.keys(this._metadata[this._selectedType].childs).forEach((objectKey: string) => {
                        if (this._selectedType) {
                            this._metadata[this._selectedType].childs[objectKey].checked = selectedItems.includes(objectKey);
                        }
                    });
                    this._metadata[this._selectedType].checked = MetadataUtils.isAllChecked(this._metadata[this._selectedType].childs);
                } else {
                    if (items.length > 0) {
                        this._selectedObject = items[0].label.split(')')[1].trim();
                    }
                    this.nextStep(ITEM_STEP);
                }
                break;
            case ITEM_STEP:
                if (this._selectedType && this._selectedObject) {
                    Object.keys(this._metadata[this._selectedType].childs[this._selectedObject].childs).forEach((itemKey: string) => {
                        if (this._selectedType && this._selectedObject) {
                            this._metadata[this._selectedType].childs[this._selectedObject].childs[itemKey].checked = selectedItems.includes(itemKey);
                        }
                    });
                    this._metadata[this._selectedType].childs[this._selectedObject].checked = MetadataUtils.isAllChecked(this._metadata[this._selectedType].childs[this._selectedObject].childs);
                    this._metadata[this._selectedType].checked = MetadataUtils.isAllChecked(this._metadata[this._selectedType].childs);
                }
                break;
            case INIT_OPTIONS_STEP:
                if (this._singleSelectionOptions) {
                    this._selectedInitOptions = this.getSelectedElements(items);
                    this.nextStep(TYPE_STEP);
                }
                break;
            case RESULT_STEP:
                break;
        }
    }
}

function changeCheckedState(metadata: any, selectedType?: string, state?: boolean): void {
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

function createMetadataTypeInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> | undefined {
    if (!selector._metadata) {
        const options: any = {};
        for (const option of selector._initOptions) {
            options[option.action] = selector._selectedInitOptions.includes(option.title);
        }
        const fromOrg = options[DOWNLOAD_ACTION];
        const input = vscode.window.createQuickPick();
        input.busy = true;
        input.title = selector._title + ': Getting Metadata Types';
        input.placeholder = 'Loading Metadata Types from ' + ((fromOrg) ? 'Auth Org' : 'Local Project');
        selector.loadMetadata(options[DOWNLOAD_ACTION], options[DOWNLOAD_ALL_ACTION], selector._typesToDownload);
        return input;
    } else {
        let input;
        if (!selector._metadata || !Utils.hasKeys(selector._metadata)) {
            return input;
        }
        input = vscode.window.createQuickPick();
        input.title = selector._title + ': Metadata Types';
        input.placeholder = 'Choose an Element';
        const buttons = [];
        if (selector._allowDelete) {
            buttons.push(MultiStepInput.getDeleteButton());
        }
        const items: vscode.QuickPickItem[] = [];
        let allChecked = true;
        Object.keys(selector._metadata).forEach(function (type) {
            let childsData = MetadataUtils.getChildsData(selector._metadata[type]);
            let description = '';
            if (childsData.selectedItems !== -1) {
                description += 'Objects: ' + childsData.selectedItems + ' / ' + childsData.totalItems;
            }
            if (childsData.selectedSubItems !== -1) {
                description += ' -- Items: ' + childsData.selectedSubItems + ' / ' + childsData.totalSubItems;
            }
            let icon;
            if (childsData.totalSubItems > 0 && childsData.selectedItems === childsData.totalItems && childsData.selectedSubItems === childsData.totalSubItems) {
                icon = '$(verified)  ';
            } else if (childsData.totalSubItems === 0 && childsData.selectedItems === childsData.totalItems) {
                icon = '$(verified)  ';
            } else if (childsData.selectedItems > 0 || childsData.selectedSubItems > 0) {
                icon = '$(check)  ';
                allChecked = false;
            } else if (childsData.selectedItems === -1 && childsData.selectedSubItems === -1) {
                icon = '$(dash)  ';
            } else {
                icon = '$(dash)  ';
                allChecked = false;
            }
            let label = icon + type;
            let item = MultiStepInput.getItem(label, description, undefined, selector._metadata[type].checked);
            items.push(item);
        });
        buttons.push(MultiStepInput.getClearSelectionButton());
        if (!allChecked) {
            buttons.push(MultiStepInput.getSelectAllButton());
        }
        buttons.push(MultiStepInput.getAcceptButton());
        input.buttons = buttons;
        input.items = items;
        return input;
    }
}

function createGITInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    if (selector._loadGitData) {
        const input = vscode.window.createQuickPick();
        input.busy = true;
        input.title = selector._title + ': Loading GIT Data';
        input.placeholder = 'Loading GIT Data';
        setTimeout(() => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: 'Loading GIT Data'
            }, () => {
                return new Promise<void>((resolve) => {
                    loadGitData(selector).then(() => {
                        selector._loadGitData = false;
                        resolve();
                        selector.show();
                    }).catch((error) => {
                        selector._loadGitData = false;
                        selector.fireErrorEvent(error);
                        resolve();
                    });
                });
            });
        }, 10);
        return input;
    } else {
        const input = vscode.window.createQuickPick();
        input.title = selector._title + ': Select GIT Datasource';
        input.placeholder = 'Choose to create package from Branch, Commit or Tag differences. Only show options with data. If not see tags, commits or branches options, Click on "Fetch"';
        const items: vscode.QuickPickItem[] = [];
        if (selector._branches.length > 0) {
            items.push(MetadataSelector.getItem('$(git-merge) Branch', undefined, 'Compare two branches to create the deploy files from differences'));
        }
        if (selector._commits.length > 0) {
            items.push(MetadataSelector.getItem('$(git-commit) Commit', undefined, 'Compare two commits to create the deploy files from differences'));
        }
        if (selector._tags.length > 0) {
            items.push(MetadataSelector.getItem('$(tag) Tag', undefined, 'Compare two tags to create the deploy files from differences'));
        }
        if (selector._branches.length === 0 && selector._commits.length === 0 && selector._tags.length === 0) {
            input.placeholder = 'Not found commits, branches or tags into repository. Click on "Fetch" to update repository with remote data';
        }
        input.items = items;
        input.buttons = [MetadataSelector.getBackButton(), MetadataSelector.getFetchButton()];
        return input;
    }
}

function createGITSourceTargetInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    const items: vscode.QuickPickItem[] = [];
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Select GIT Source and Target';
    input.placeholder = 'Source must be the "old" code to compare and Target the "new" code to get differences.';
    let icon = '';
    if (selector._gitSourceType === 'Branch') {
        icon = '$(git-merge)';
    } else if (selector._gitSourceType === 'Commit') {
        icon = '$(git-commit)';
    } else {
        icon = '$(tag)';
    }
    items.push(MetadataSelector.getItem(icon + '   Source', undefined, selector._gitSource));
    items.push(MetadataSelector.getItem(icon + '   Target', undefined, selector._gitTarget));
    input.items = items;
    const buttons = [MetadataSelector.getBackButton()];
    if (selector._gitSource && selector._gitTarget) {
        buttons.push(MetadataSelector.getAcceptButton());
    }
    input.buttons = buttons;
    return input;
}

function createGITSourceTargetSelectionInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Select GIT Source and Target';
    input.placeholder = 'Select ' + selector._gitSourceType + ' as ' + ((!selector._gitSource) ? 'Source' : 'Target') + ' to create the deploy files. If not see all data, click on "Fetch" to update repository data';
    const items: vscode.QuickPickItem[] = [];
    if (selector._gitSourceType === 'Branch') {
        for (const branch of selector._branches) {
            if (branch.active) {
                selector._activeBranch = branch.name;
            }
            if ((selector._isSourceSelection && selector._gitTarget === branch.name) || (!selector._isSourceSelection && selector._gitSource === branch.name)) {
                continue;
            }
            items.push(MetadataSelector.getItem('$(git-merge)   ' + branch.name, undefined, branch.active ? 'Active Branch' : undefined));
        }
    } else if (selector._gitSourceType === 'Commit') {
        for (const commit of selector._commits) {
            if ((selector._isSourceSelection && selector._gitTarget === commit.pointer) || (!selector._isSourceSelection && selector._gitSource === commit.pointer)) {
                continue;
            }
            items.push(MetadataSelector.getItem('$(git-commit)   ' + commit.pointer, commit.date.dateStr, commit.title));
        }
    } else {
        for (const tag of selector._tags) {
            if ((selector._isSourceSelection && selector._gitTarget === tag.name) || (!selector._isSourceSelection && selector._gitSource === tag.name)) {
                continue;
            }
            items.push(MetadataSelector.getItem('$(tag)   ' + tag.name, undefined, tag.description));
        }
    }
    input.items = items;
    const buttons = [MetadataSelector.getBackButton()];
    buttons.push(MetadataSelector.getFetchButton());
    input.buttons = buttons;
    return input;
}

function createMetadataObjectInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> | undefined {
    if (!selector._selectedType) {
        return undefined;
    }
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': ' + selector._selectedType + ' Metadata Type Elements';
    const buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete) {
        buttons.push(MultiStepInput.getDeleteButton());
    }
    const items: vscode.QuickPickItem[] = [];
    const metadataType = selector._metadata[selector._selectedType];
    const selectedItems: vscode.QuickPickItem[] = [];
    let canPickMany = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        if (MetadataUtils.haveChilds(metadataObject)) {
            canPickMany = false;
        }
    });
    let allChecked = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        let description = '';
        let label = objectKey;
        if (!canPickMany) {
            let childsData = MetadataUtils.getChildsData(metadataObject);
            if (childsData.selectedItems !== -1) {
                description += 'Items: ' + childsData.selectedItems + ' / ' + childsData.totalItems;
            }
            let icon;
            if (childsData.selectedItems === childsData.totalItems) {
                icon = '$(verified)  ';
            } else if (childsData.selectedItems > 0) {
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
        if (checked) {
            selectedItems.push(item);
        }
    });
    input.canSelectMany = canPickMany;
    if (input.canSelectMany) {
        input.placeholder = 'Select Elements';
    }
    else {
        buttons.push(MultiStepInput.getClearSelectionButton());
        if (!allChecked) {
            buttons.push(MultiStepInput.getSelectAllButton());
        }
        input.placeholder = 'Choose an Element';
    }
    buttons.push(MultiStepInput.getAcceptButton());
    input.buttons = buttons;
    input.items = items;
    if (selectedItems.length > 0) {
        input.selectedItems = selectedItems;
    }
    return input;
}

function createMetadataItemInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> | undefined {
    if (!selector._selectedType || !selector._selectedObject) {
        return undefined;
    }
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Elements from ' + selector._selectedObject + ' (' + selector._selectedType + ')';
    input.placeholder = 'Select Elements';
    const buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete) {
        buttons.push(MultiStepInput.getDeleteButton());
    }
    buttons.push(MultiStepInput.getAcceptButton());
    const items: vscode.QuickPickItem[] = [];
    const selectedItems: vscode.QuickPickItem[] = [];
    const metadataObject = selector._metadata[selector._selectedType].childs[selector._selectedObject];
    Object.keys(metadataObject.childs).forEach(function (itemKey) {
        const metadataItem = metadataObject.childs[itemKey];
        const item = MultiStepInput.getItem(itemKey, selector._selectedType + ':' + selector._selectedObject, undefined, metadataItem.checked);
        items.push(item);
        if (metadataItem.checked) {
            selectedItems.push(item);
        }
    });
    input.canSelectMany = true;
    input.items = items;
    if (selectedItems.length > 0) {
        input.selectedItems = selectedItems;
    }
    input.buttons = buttons;
    return input;
}

function createPackagesInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    if (selector._packageFiles.length === 0) {
        const input = vscode.window.createQuickPick();
        input.busy = true;
        input.title = selector._title + ': Select Files';
        input.placeholder = 'Select Package and Destructive XML Files to merge';
        setTimeout(async () => {
            let uris = await InputFactory.createFileDialog('Select Package and Destructive XML files', true, { 'XML files': ['xml'] });
            if (uris && uris.length > 0) {
                for (const uri of uris) {
                    selector._packageFiles.push(uri.fsPath);
                }
                selector.show();
            } else {
                selector.backStep();
            }
        }, 10);
        return input;
    } else {
        const items: vscode.QuickPickItem[] = [];
        const input = vscode.window.createQuickPick();
        input.title = selector._title + ': Selected Files';
        input.placeholder = 'The selected files will be merged. Click on "Accept" to select merge options';
        for (const file of selector._packageFiles) {
            const fileName = PathUtils.getBasename(file, 'xml');
            items.push(MultiStepInput.getItem('$(file)  ' + fileName, undefined, file));
        }
        input.buttons = [MultiStepInput.getBackButton(), MultiStepInput.getAcceptButton()];
        input.items = items;
        return input;
    }
}

function createPackagesOptionsInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    const items: vscode.QuickPickItem[] = [];
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Merge Options';
    input.placeholder = 'Select an option to merge the selected files';
    items.push(MultiStepInput.getItem('Merge By Type', undefined, 'Merge all files by type. All packages into one package, and the same to destructive files'));
    items.push(MultiStepInput.getItem('Merge Full Packages', undefined, 'Merge all files into one Package XML File'));
    items.push(MultiStepInput.getItem('Merge Full Destructive Before', undefined, 'Merge all files into one Destructive Changes File before deploy'));
    items.push(MultiStepInput.getItem('Merge Full Destructive After', undefined, 'Merge all files into one Destructive Changes File after deploy'));
    input.buttons = [MultiStepInput.getBackButton()];
    input.items = items;
    return input;
}

function createResultInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Selected Elements';
    input.placeholder = 'Showing a summary of the selected elements';
    const buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete) {
        buttons.push(MultiStepInput.getDeleteButton());
    }
    buttons.push(MultiStepInput.getAcceptButton());
    const items: vscode.QuickPickItem[] = [];
    selector._hasSelectedElements = false;
    Object.keys(selector._metadata).forEach(function (typeKey) {
        let addedType = false;
        Object.keys(selector._metadata[typeKey].childs).forEach(function (objectKey) {
            let addedObject = false;
            if (MetadataUtils.haveChilds(selector._metadata[typeKey].childs[objectKey])) {
                Object.keys(selector._metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                    if (selector._metadata[typeKey].childs[objectKey].childs[itemKey].checked) {
                        selector._hasSelectedElements = true;
                        if (!addedType) {
                            items.push(MultiStepInput.getItem('$(symbol-constant)  ' + typeKey));
                            addedType = true;
                        }
                        if (!addedObject) {
                            items.push(MultiStepInput.getItem('\t$(symbol-enum)  ' + objectKey));
                            addedObject = true;
                        }
                        items.push(MultiStepInput.getItem('\t\t$(symbol-enum-member)  ' + itemKey));
                    }
                });
            } else {
                if (selector._metadata[typeKey].childs[objectKey].checked) {
                    selector._hasSelectedElements = true;
                    if (!addedType) {
                        items.push(MultiStepInput.getItem('$(symbol-constant)  ' + typeKey));
                        addedType = true;
                    }
                    items.push(MultiStepInput.getItem('\t$(symbol-enum-member)  ' + objectKey));
                }
            }
        });

    });
    input.items = items;
    input.buttons = buttons;
    return input;
}

function createInitOptionsInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    selector._loadGitData = true;
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Data Source Options';
    input.placeholder = 'Select the Metadata Type\'s data source.';
    const items: vscode.QuickPickItem[] = [];
    for (const option of selector._initOptions) {
        items.push(MetadataSelector.getItem(option.title, undefined, option.description));
    }
    if (!selector._singleSelectionOptions) {
        input.canSelectMany = true;
    }
    input.items = items;
    return input;
}

function createFinishOptionsInput(selector: MetadataSelector): vscode.QuickPick<vscode.QuickPickItem> {
    const input = vscode.window.createQuickPick();
    input.title = selector._title + ': Create File Options';
    input.placeholder = 'Select the options to create the Package or Destructive file';
    const items: vscode.QuickPickItem[] = [];
    for (const option of selector._finishOptions) {
        if (!option.dependency || hasDependency(selector._selectedInitOptions, option.dependency)) {
            items.push(MetadataSelector.getItem(option.title, undefined, option.description));
        }
    }
    input.canSelectMany = true;
    input.items = items;
    return input;
}

function hasDependency(initOptions: string[], dependencies: string[]): boolean {
    for (const dependency of dependencies) {
        if (initOptions.includes(dependency)) {
            return true;
        }
    }
    return false;
}

function showFinishOptions(selector: MetadataSelector) {
    const options: any = {};
    for (const option of selector._initOptions) {
        options[option.action] = selector._selectedInitOptions.includes(option.title);
    }
    if ((selector._hasSelectedElements && selector._finishOptions.length > 0) || (options[GIT_ACTION] && !options[DOWNLOAD_ACTION])) {
        for (const option of selector._finishOptions) {
            if (!option.dependency || hasDependency(selector._selectedInitOptions, option.dependency)) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
}

function fetchGitData(selector: MetadataSelector): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            selector._currentInput.busy = true;
            selector._currentInput.enabled = false;
            const gitManager = new GitManager(Paths.getProjectFolder());
            await gitManager.fetch();
            await loadGitData(selector);
            selector._currentInput.busy = false;
            selector._currentInput.enabled = true;
            resolve();
        } catch (error) {
            selector._currentInput.busy = false;
            selector._currentInput.enabled = true;
            reject(error);
        }

    });
}

function loadGitData(selector: MetadataSelector): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const gitManager = new GitManager(Paths.getProjectFolder());
            selector._branches = await gitManager.getBranches();
            selector._commits = await gitManager.getCommits();
            selector._tags = await gitManager.getTags('-committerdate');
            resolve();
        } catch (error) {
            reject(error);
        }

    });
}

