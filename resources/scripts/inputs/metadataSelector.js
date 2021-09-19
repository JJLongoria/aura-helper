const vscode = require('vscode');
const MultiStepInput = require('./multiStepInput');
const InputFactory = require('./factory');
const GitManager = require('@aurahelper/git-manager');
const { MetadataUtils, Utils, StrUtils } = require('@aurahelper/core').CoreUtils;
const Paths = require('../core/paths');
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

class MetadataSelector extends MultiStepInput {

    constructor(title, typesToDownload) {
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
        this._isSourceSelection = undefined;
        this._activeBranch = undefined;
        this._branches = [];
        this._tags = [];
        this._commits = [];
        this._loadGitData = true;
        this._packageFiles = [];
        this._mergeOption = undefined;
    }

    static getPackagesAction() {
        return PACKAGES_ACTION;
    }

    static getIgnoreAction() {
        return IGNORE_ACTION;
    }

    static getGitAction() {
        return GIT_ACTION;
    }

    static getRepairAction() {
        return REPAIR_ACTION;
    }

    static getCheckErrorsAction() {
        return CHECK_ERRORS_ACTION;
    }

    static getLocalAction() {
        return LOCAL_ACTION;
    }

    static getMixedAction() {
        return MIXED_ACTION;
    }

    static getDownloadAction() {
        return DOWNLOAD_ACTION;
    }

    static getDownloadAllAction() {
        return DOWNLOAD_ALL_ACTION;
    }

    static getCompressAction() {
        return COMPRESS_ACTION;
    }

    static getWildcardsAction() {
        return WILDCARDS_ACTION;
    }

    static getDeployAction() {
        return DEPLOY_ACTION;
    }

    static getDestructiveAction() {
        return DESTRUCTIVE_ACTION;
    }

    static getDeployBeforeAction() {
        return DEPLOY_BEFORE_ACTION;
    }

    static getDeployAfterAction() {
        return DEPLOY_AFTER_ACTION;
    }

    static getCustomFolderAction() {
        return CUSTOM_FOLDER_ACTION;
    }

    static getDeleteAction() {
        return DELETE_ACTION;
    }

    setSingleSelectionOptions(singleSelectionOptions) {
        this._singleSelectionOptions = singleSelectionOptions;
        return this;
    }

    allowDelete(allow) {
        this._allowDelete = allow;
        return this;
    }

    setTypesToDownload(types) {
        this._typesToDownload = types;
        return this;
    }

    setMetadata(metadata) {
        this._metadata = metadata;
        return this;
    }

    addInitOption(title, description, action) {
        this._initialStep = INIT_OPTIONS_STEP;
        this._step = INIT_OPTIONS_STEP;
        this._initOptions.push({
            title: title,
            description: description,
            action: action
        });
    }

    addFinishOption(title, description, action, dependency) {
        this._finalStep = FINISH_OPTIONS_STEP;
        this._finishOptions.push({
            title: title,
            description: description,
            action: action,
            dependency: dependency ? Utils.forceArray(dependency) : undefined
        });
    }

    onCreateInputRequest() {
        let input;
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

    onButtonPressed(buttonName) {
        if (buttonName === 'Accept') {
            if (this._step === RESULT_STEP || this._step === GIT_SOURCE_TARGET_STEP) {
                if (showFinishOptions(this))
                    this.nextStep(FINISH_OPTIONS_STEP);
                else {
                    const options = {};
                    for (const option of this._initOptions) {
                        options[option.action] = this._selectedInitOptions.includes(option.title);
                    }
                    this.fireAcceptEvent(options, this._metadata)
                    this._currentInput.dispose();
                }
            } else if (this._step === PACKAGES_STEP) {
                this.nextStep(PACKAGES_OPTIONS_STEP);
            } else {
                this.nextStep(RESULT_STEP);
            }
        } else if (buttonName === 'Delete') {
            this.fireDeleteEvent(this._metadata)
        } else if (buttonName === 'Fetch') {
            setTimeout(() => {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    cancellable: false,
                    title: 'Fetching Data from Remote repository'
                }, (progress, cancelToken) => {
                    return new Promise((resolve) => {
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
                const options = {};
                for (const option of this._initOptions) {
                    options[option.action] = this._selectedInitOptions.includes(option.title);
                }
                if (options[GIT_ACTION] && !options[DOWNLOAD_ACTION])
                    this.nextStep(GIT_STEP);
                else if (options[PACKAGES_ACTION] && !options[GIT_ACTION] && !options[DOWNLOAD_ACTION])
                    this.nextStep(PACKAGES_STEP);
                else
                    this.nextStep(TYPE_STEP);
            } else if (this._step === FINISH_OPTIONS_STEP) {
                this._selectedFinishOptions = this.getSelectedElements(this._currentInput.selectedItems);
                const options = {};
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
                    })
                } else if (options[PACKAGES_ACTION] && !options[GIT_ACTION] && !options[DOWNLOAD_ACTION]) {
                    this.fireAcceptEvent(options, {
                        files: this._packageFiles,
                        mergeOption: this._mergeOption
                    })
                } else {
                    this.fireAcceptEvent(options, this._metadata);
                }
                this._currentInput.dispose();
            } else {
                this.backStep();
            }
        }
    }

    onChangeSelection(items) {
        let selectedType;
        let metadata;
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
                if (StrUtils.contains(selection, 'Source'))
                    this._isSourceSelection = true;
                else
                    this._isSourceSelection = false;
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
                selectedType = this._selectedType;
                metadata = this._metadata;
                Object.keys(metadata[selectedType].childs).forEach(function (objectKey) {
                    if (!withChilds)
                        withChilds = MetadataUtils.haveChilds(metadata[selectedType].childs[objectKey]);
                });
                if (!withChilds) {
                    metadata = this._metadata;
                    selectedType = this._selectedType;
                    Object.keys(metadata[selectedType].childs).forEach(function (objectKey) {
                        metadata[selectedType].childs[objectKey].checked = selectedItems.includes(objectKey);
                    });
                    metadata[selectedType].checked = MetadataUtils.isAllChecked(metadata[selectedType].childs);
                    this._metadata = metadata;
                } else {
                    if (items.length > 0)
                        this._selectedObject = items[0].label.split(')')[1].trim();
                    this.nextStep(ITEM_STEP);
                }
                break;
            case ITEM_STEP:
                metadata = this._metadata;
                selectedType = this._selectedType;
                let selectedObject = this._selectedObject;
                Object.keys(metadata[selectedType].childs[selectedObject].childs).forEach(function (itemKey) {
                    metadata[selectedType].childs[selectedObject].childs[itemKey].checked = selectedItems.includes(itemKey);
                });
                metadata[selectedType].childs[selectedObject].checked = MetadataUtils.isAllChecked(metadata[selectedType].childs[selectedObject].childs);
                metadata[selectedType].checked = MetadataUtils.isAllChecked(metadata[selectedType].childs);
                this._metadata = metadata;
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

function createMetadataTypeInput(selector) {
    if (!selector._metadata) {
        const options = {};
        for (const option of selector._initOptions) {
            options[option.action] = selector._selectedInitOptions.includes(option.title);
        }
        const fromOrg = options[DOWNLOAD_ACTION];
        let input = vscode.window.createQuickPick();
        input.busy = true;
        input.title = selector._title + ': Getting Metadata Types';
        input.placeholder = 'Loading Metadata Types from ' + ((fromOrg) ? 'Auth Org' : 'Local Project');
        selector.loadMetadata(options[DOWNLOAD_ACTION], options[DOWNLOAD_ALL_ACTION], selector._typesToDownload);
        return input;
    } else {
        let input;
        if (!selector._metadata || !Utils.hasKeys(selector._metadata))
            return input;
        input = vscode.window.createQuickPick();
        input.title = selector._title + ': Metadata Types';
        input.placeholder = 'Choose an Element';
        let buttons = [];
        if (selector._allowDelete)
            buttons.push(MultiStepInput.getDeleteButton());
        let items = [];
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
        if (!allChecked)
            buttons.push(MultiStepInput.getSelectAllButton());
        buttons.push(MultiStepInput.getAcceptButton());
        input.buttons = buttons;
        input.items = items;
        return input;
    }
}

function createGITInput(selector) {
    if (selector._loadGitData) {
        let input = vscode.window.createQuickPick();
        input.busy = true;
        input.title = selector._title + ': Loading GIT Data';
        input.placeholder = 'Loading GIT Data';
        setTimeout(() => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: 'Loading GIT Data'
            }, (progress, cancelToken) => {
                return new Promise((resolve) => {
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
        let input = vscode.window.createQuickPick();
        input.title = selector._title + ': Select GIT Datasource';
        input.placeholder = 'Choose to create package from Branch, Commit or Tag differences. Only show options with data. If not see tags, commits or branches options, Click on "Fetch"';
        let items = [];
        if (selector._branches.length > 0)
            items.push(MetadataSelector.getItem('$(git-merge) Branch', undefined, 'Compare two branches to create the deploy files from differences'));
        if (selector._commits.length > 0)
            items.push(MetadataSelector.getItem('$(git-commit) Commit', undefined, 'Compare two commits to create the deploy files from differences'));
        if (selector._tags.length > 0)
            items.push(MetadataSelector.getItem('$(tag) Tag', undefined, 'Compare two tags to create the deploy files from differences'));
        if (selector._branches.length == 0 && selector._commits.length == 0 && selector._tags.length == 0) {
            input.placeholder = 'Not found commits, branches or tags into repository. Click on "Fetch" to update repository with remote data';
        }
        input.items = items;
        input.buttons = [MetadataSelector.getBackButton(), MetadataSelector.getFetchButton()];
        return input;
    }
}

function createGITSourceTargetInput(selector) {
    let items = [];
    let input = vscode.window.createQuickPick();
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

function createGITSourceTargetSelectionInput(selector) {
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': Select GIT Source and Target';
    input.placeholder = 'Select ' + selector._gitSourceType + ' as ' + ((!selector._gitSource) ? 'Source' : 'Target') + ' to create the deploy files. If not see all data, click on "Fetch" to update repository data';
    let items = [];
    if (selector._gitSourceType === 'Branch') {
        for (const branch of selector._branches) {
            if (branch.active)
                selector._activeBranch = branch.name;
            if (selector._isSourceSelection && selector._gitTarget === branch.name)
                continue;
            if (!selector._isSourceSelection && selector._gitSource === branch.name)
                continue;
            items.push(MetadataSelector.getItem('$(git-merge)   ' + branch.name, undefined, branch.active ? 'Active Branch' : undefined));
        }
    } else if (selector._gitSourceType === 'Commit') {
        for (const commit of selector._commits) {
            if (selector._isSourceSelection && selector._gitTarget === commit.pointer)
                continue;
            if (!selector._isSourceSelection && selector._gitSource === commit.pointer)
                continue;
            items.push(MetadataSelector.getItem('$(git-commit)   ' + commit.pointer, commit.date.dateStr, commit.title));
        }
    } else {
        for (const tag of selector._tags) {
            if (selector._isSourceSelection && selector._gitTarget === tag.name)
                continue;
            if (!selector._isSourceSelection && selector._gitSource === tag.name)
                continue;
            items.push(MetadataSelector.getItem('$(tag)   ' + tag.name, undefined, tag.description));
        }
    }
    input.items = items;
    const buttons = [MetadataSelector.getBackButton()];
    buttons.push(MetadataSelector.getFetchButton());
    input.buttons = buttons;
    return input;
}

function createMetadataObjectInput(selector) {
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': ' + selector._selectedType + ' Metadata Type Elements';
    let buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    let items = [];
    let metadataType = selector._metadata[selector._selectedType];
    let selectedItems = [];
    let canPickMany = true;
    Object.keys(metadataType.childs).forEach(function (objectKey) {
        let metadataObject = metadataType.childs[objectKey];
        if (MetadataUtils.haveChilds(metadataObject))
            canPickMany = false;
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
        if (checked)
            selectedItems.push(item);
    });
    input.canSelectMany = canPickMany;
    if (input.canSelectMany)
        input.placeholder = 'Select Elements';
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
    if (selectedItems.length > 0)
        input.selectedItems = selectedItems;
    return input;
}

function createMetadataItemInput(selector) {
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': Elements from ' + selector._selectedObject + ' (' + selector._selectedType + ')';
    input.placeholder = 'Select Elements';
    let buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    buttons.push(MultiStepInput.getAcceptButton());
    let items = [];
    let selectedItems = [];
    let metadataObject = selector._metadata[selector._selectedType].childs[selector._selectedObject];
    Object.keys(metadataObject.childs).forEach(function (itemKey) {
        let metadataItem = metadataObject.childs[itemKey];
        let item = MultiStepInput.getItem(itemKey, selector._selectedType + ':' + selector._selectedObject, undefined, metadataItem.checked);
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

function createPackagesInput(selector) {
    if (selector._packageFiles.length === 0) {
        let input = vscode.window.createQuickPick();
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
        let items = [];
        let input = vscode.window.createQuickPick();
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

function createPackagesOptionsInput(selector) {
    let items = [];
    let input = vscode.window.createQuickPick();
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

function createResultInput(selector) {
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': Selected Elements';
    input.placeholder = 'Showing a summary of the selected elements';
    let buttons = [vscode.QuickInputButtons.Back];
    if (selector._allowDelete)
        buttons.push(MultiStepInput.getDeleteButton());
    buttons.push(MultiStepInput.getAcceptButton());
    let items = [];
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

function createInitOptionsInput(selector) {
    selector._loadGitData = true;
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': Data Source Options';
    input.placeholder = 'Select the Metadata Type\'s data source.';
    let items = [];
    for (const option of selector._initOptions) {
        items.push(MetadataSelector.getItem(option.title, undefined, option.description));
    }
    if (!selector._singleSelectionOptions)
        input.canSelectMany = true;
    input.items = items;
    return input;
}

function createFinishOptionsInput(selector) {
    let input = vscode.window.createQuickPick();
    input.title = selector._title + ': Create File Options';
    input.placeholder = 'Select the options to create the Package or Destructive file';
    let items = [];
    for (const option of selector._finishOptions) {
        if (!option.dependency || hasDependency(selector._selectedInitOptions, option.dependency))
            items.push(MetadataSelector.getItem(option.title, undefined, option.description));
    }
    input.canSelectMany = true;
    input.items = items;
    return input;
}

function hasDependency(initOptions, dependencies) {
    for (const dependency of dependencies) {
        if (initOptions.includes(dependency))
            return true;
    }
    return false;
}

function showFinishOptions(selector) {
    const options = {};
    for (const option of selector._initOptions) {
        options[option.action] = selector._selectedInitOptions.includes(option.title);
    }
    if ((selector._hasSelectedElements && selector._finishOptions.length > 0) || (options[GIT_ACTION] && !options[DOWNLOAD_ACTION])) {
        for (const option of selector._finishOptions) {
            if (!option.dependency || hasDependency(selector._selectedInitOptions, option.dependency))
                return true;
        }
        return false;
    } else {
        return false;
    }
}

function fetchGitData(selector) {
    return new Promise(async (resolve, reject) => {
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

function loadGitData(selector) {
    return new Promise(async (resolve, reject) => {
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

