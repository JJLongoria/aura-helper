const EventEmitter = require('events').EventEmitter;
const vscode = require('vscode');
const Paths = require('../core/paths');
const Factory = require('./factory');
const MetadataFactory = require('@ah/metadata-factory');
const CLIManager = require('@ah/cli-manager');
const Connection = require('@ah/connector');
const { NotificationMananger } = require('../output');
const Config = require('../core/config');

const EVENT = {
    ACCEPT: 'accept',
    CANCEL: 'cancel',
    DELETE: 'delete',
    VALIDATION: 'validation',
    REPORT: 'report',
    ERROR: 'error',
};

class MultiStepInput {

    constructor(title, initialStep, totalSteps) {
        this._title = title;
        this._initialStep = initialStep;
        this._step = initialStep;
        this._totalSteps = totalSteps;
        this._stepsBuffer = [];
        this._metadata = undefined;
        this._event = new EventEmitter();
    }

    static getDeleteButton() {
        return {
            tooltip: "Delete",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/trash.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/trash.svg'),
            }
        };
    }

    static getRemoveButton() {
        return {
            tooltip: "Remove",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/remove.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/remove.svg'),
            }
        };
    }

    static getAddButton() {
        return {
            tooltip: "Add",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/add.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/add.svg'),
            }
        };
    }

    static getAcceptButton() {
        return {
            tooltip: "Accept",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/pass.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/pass.svg'),
            }
        };
    }

    static getSelectAllButton() {
        return {
            tooltip: "Select All",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/checklist.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/checklist.svg'),
            }
        };
    }

    static getClearSelectionButton() {
        return {
            tooltip: "Clear Selection",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/clear-all.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/clear-all.svg'),
            }
        };
    }

    static getFetchButton() {
        return {
            tooltip: "Fetch",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/sync.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/sync.svg'),
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
        this._event.on(EVENT.ACCEPT, callback);
    }

    onCancel(callback) {
        this._event.on(EVENT.CANCEL, callback);
    }

    onError(callback) {
        this._event.on(EVENT.ERROR, callback);
    }

    onValidationError(callback) {
        this._event.on(EVENT.VALIDATION, callback);
    }

    onDelete(callback) {
        this._event.on(EVENT.DELETE, callback);
    }

    onReport(callback) {
        this._event.on(EVENT.REPORT, callback);
    }

    fireAcceptEvent(options, data) {
        this._event.emit(EVENT.ACCEPT, options, data);
    }

    fireCancelEvent() {
        this._event.emit(EVENT.CANCEL);
    }

    fireErrorEvent(message) {
        this._event.emit(EVENT.ERROR, message);

    }

    fireValidationEvent(message) {
        this._event.emit(EVENT.VALIDATION, message);
    }

    fireDeleteEvent(data) {
        this._event.emit(EVENT.DELETE, data);
    }

    fireReportEvent(message) {
        this._event.emit(EVENT.REPORT, message);
    }

    reset() {
        this._step = this._initialStep;
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

    truncate(value) {
        let maxLength = 255;
        let addToTruncate = ' [...]';
        if (value && value.length > maxLength) {
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
                this.fireErrorEvent('Has no data to show');
            } else {
                input.ignoreFocusOut = true;
                input.onDidAccept(item => {
                    if (!input.items) {
                        if (input.value && input.value.trim().length === 0)
                            input.value = undefined;
                        this.onValueSet(input.value);
                        this.backStep();
                    }
                    else {
                        this.onButtonPressed('Ok');
                    }
                });
                input.onDidTriggerButton((item) => {
                    if (item === vscode.QuickInputButtons.Back) {
                        this.onButtonPressed("back");
                        this.backStep();
                    } else {
                        this.onButtonPressed(item.tooltip);
                    }
                });
                input.onDidHide(() => {
                    if (this._currentInput)
                        this._currentInput.dispose();
                    this.fireCancelEvent();
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

    backStep(step) {
        if (step) {
            let stepTmp = this._stepsBuffer.pop();
            while (stepTmp != step) {
                stepTmp = this._stepsBuffer.pop();
            }
            this._step = stepTmp;
        }
        else {
            this._step = this._stepsBuffer.pop();
        }
        this.show();
    }

    nextStep(step) {
        this._stepsBuffer.push(this._step);
        this._step = step;
        this.show();
    }

    sameStep() {
        this._step = this._stepsBuffer[this._stepsBuffer.length - 1];
        this.show();
    }

    async loadMetadata(fromOrg, downloadAll, types) {
        setTimeout(() => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: 'Loading Metadata Types'
            }, (progress, cancelToken) => {
                return new Promise((resolve) => {
                    if (fromOrg) {
                        getOrgMetadata(downloadAll, progress, types).then((metadataTypes) => {
                            this._metadata = metadataTypes;
                            resolve();
                            this.show();
                        }).catch((error) => {
                            NotificationMananger.showError(error);
                            resolve();
                            this.show();
                        });
                    } else {
                        getLocalMetadata(types).then((metadataTypes) => {
                            this._metadata = metadataTypes;
                            resolve();
                            this.show();
                        }).catch((error) => {
                            NotificationMananger.showError(error);
                            resolve();
                            this.show();
                        });
                    }
                });
            });
        }, 10);
    }
}
module.exports = MultiStepInput;

function getLocalMetadata(types) {
    return new Promise(function (resolve, reject) {
        if (Config.useAuraHelperCLI()) {
            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
            cliManager.describeLocalMetadata(types).then((metadataTypes) => {
                resolve(metadataTypes);
            }).catch((error) => {
                reject(error);
            });
        } else {
            const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder());
            connection.listMetadataTypes().then((metadataDetails) => {
                const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                const result = {};
                const metadataTypes = MetadataFactory.createMetadataTypesFromFileSystem(folderMetadataMap, Paths.getProjectFolder());
                for(const key of Object.keys(metadataTypes)){
                    if(!types || types.includes(key))
                        result[key] = metadataTypes[key];
                }
                resolve(result);
            }).catch((error) => {
                reject(error);
            });

        }
    });
}

function getOrgMetadata(downloadAll, progressReport, types) {
    return new Promise(function (resolve, reject) {
        if (Config.useAuraHelperCLI()) {
            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
            cliManager.onProgress((status) => {
                if (status.result.increment != undefined && status.result.increment > -1) {
                    progressReport.report({
                        message: status.message,
                        increment: status.result.increment
                    });
                }
            });
            cliManager.describeOrgMetadata(downloadAll, types).then((metadataTypes) => {
                resolve(metadataTypes);
            }).catch((error) => {
                reject(error);
            });
        } else {
            const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder());
            connection.setMultiThread();
            connection.onAfterDownloadType((status) => {
                progressReport.report({
                    message: 'MetadataType: ' + status.entityType,
                    increment: status.increment
                });
            })
            connection.listMetadataTypes().then((metadataDetails) => {
                connection.describeMetadataTypes(metadataDetails, downloadAll).then((metadataTypes) => {
                    resolve(metadataTypes);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });

        }
    });
}