import * as vscode from 'vscode';
import { Paths } from '../core/paths';
import { Config } from '../core/config';
import { EventEmitter } from 'events';
import { NotificationManager } from '../output';
import { InputFactory } from './factory';
const MetadataFactory = require('@aurahelper/metadata-factory');
const CLIManager = require('@aurahelper/cli-manager');
const Connection = require('@aurahelper/connector');

const EVENT = {
    ACCEPT: 'accept',
    CANCEL: 'cancel',
    DELETE: 'delete',
    VALIDATION: 'validation',
    REPORT: 'report',
    ERROR: 'error',
};

export class MultiStepInput {

    _title: string;
    _initialStep?: number;
    _step?: number;
    _totalSteps: number;
    _stepsBuffer: number[];
    _metadata: any;
    _event: EventEmitter;
    _currentInput: any;

    constructor(title: string, initialStep: number, totalSteps: number) {
        this._title = title;
        this._initialStep = initialStep;
        this._step = initialStep;
        this._totalSteps = totalSteps;
        this._stepsBuffer = [];
        this._metadata = undefined;
        this._event = new EventEmitter();
    }

    static getDeleteButton(): vscode.QuickInputButton {
        return {
            tooltip: "Delete",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/trash.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/trash.svg'),
            }
        };
    }

    static getRemoveButton(): vscode.QuickInputButton {
        return {
            tooltip: "Remove",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/remove.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/remove.svg'),
            }
        };
    }

    static getAddButton(): vscode.QuickInputButton {
        return {
            tooltip: "Add",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/add.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/add.svg'),
            }
        };
    }

    static getAcceptButton(): vscode.QuickInputButton {
        return {
            tooltip: "Accept",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/pass.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/pass.svg'),
            }
        };
    }

    static getSelectAllButton(): vscode.QuickInputButton {
        return {
            tooltip: "Select All",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/checklist.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/checklist.svg'),
            }
        };
    }

    static getClearSelectionButton(): vscode.QuickInputButton {
        return {
            tooltip: "Clear Selection",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/clear-all.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/clear-all.svg'),
            }
        };
    }

    static getFetchButton(): vscode.QuickInputButton {
        return {
            tooltip: "Fetch",
            iconPath: {
                light: Paths.toURI(Paths.getImagesPath() + '/light/sync.svg'),
                dark: Paths.toURI(Paths.getImagesPath() + '/dark/sync.svg'),
            }
        };
    }

    static getBackButton(): vscode.QuickInputButton {
        return vscode.QuickInputButtons.Back;
    }

    static getItem(label: string, description: string, detail: string, picked: boolean): vscode.QuickPickItem {
        return InputFactory.createQuickPickItem(label, description, detail, picked);
    }

    onAccept(callback: (options: any, data: any) => void): void {
        this._event.on(EVENT.ACCEPT, callback);
    }

    onCancel(callback: () => void): void {
        this._event.on(EVENT.CANCEL, callback);
    }

    onError(callback: (messsage: string) => void): void {
        this._event.on(EVENT.ERROR, callback);
    }

    onValidationError(callback: (message: string) => void): void {
        this._event.on(EVENT.VALIDATION, callback);
    }

    onDelete(callback: (data: any) => void): void {
        this._event.on(EVENT.DELETE, callback);
    }

    onReport(callback: (message: string) => void): void {
        this._event.on(EVENT.REPORT, callback);
    }

    fireAcceptEvent(options: any, data: any): void {
        this._event.emit(EVENT.ACCEPT, options, data);
    }

    fireCancelEvent(): void {
        this._event.emit(EVENT.CANCEL);
    }

    fireErrorEvent(message: string): void {
        this._event.emit(EVENT.ERROR, message);

    }

    fireValidationEvent(message: string): void {
        this._event.emit(EVENT.VALIDATION, message);
    }

    fireDeleteEvent(data: any): void {
        this._event.emit(EVENT.DELETE, data);
    }

    fireReportEvent(message: string): void {
        this._event.emit(EVENT.REPORT, message);
    }

    reset(): void {
        this._step = this._initialStep;
        if (this._currentInput) {
            this._currentInput.dispose();
        }
        this.show();
    }

    onCreateInputRequest(): any {
        return undefined;
    }

    onButtonPressed(buttonName?: string): void {

    }

    onChangeSelection(items: any[]): void {

    }

    onChangeValue(value: string): void {

    }

    onValueSet(value: string): void {

    }

    truncate(value: string): string {
        let maxLength = 255;
        let addToTruncate = ' [...]';
        if (value && value.length > maxLength) {
            value = value.substring(0, maxLength - addToTruncate.length);
            value += addToTruncate;
        }
        return value;
    }

    getSelectedElements(items: vscode.QuickPickItem[]): string[] {
        let selectedItems: string[] = [];
        for (let item of items) {
            selectedItems.push(item.label);
        }
        return selectedItems;
    }

    show(): void {
        try {
            let input = this.onCreateInputRequest();
            if (!input) {
                this.fireErrorEvent('Has no data to show');
            } else {
                input.ignoreFocusOut = true;
                input.onDidAccept(() => {
                    if (!input.items) {
                        if (input.value && input.value.trim().length === 0) {
                            input.value = undefined;
                        }
                        this.onValueSet(input.value);
                        this.backStep();
                    }
                    else {
                        this.onButtonPressed('Ok');
                    }
                });
                input.onDidTriggerButton((item: vscode.QuickInputButton) => {
                    if (item === vscode.QuickInputButtons.Back) {
                        this.onButtonPressed("back");
                        this.backStep();
                    } else {
                        this.onButtonPressed(item.tooltip);
                    }
                });
                input.onDidHide(() => {
                    if (this._currentInput) {
                        this._currentInput.dispose();
                    }
                    this.fireCancelEvent();
                });
                if (input.onDidChangeSelection) {
                    input.onDidChangeSelection((items: vscode.QuickPickItem[]) => {
                        this.onChangeSelection(items);
                    });
                }
                input.onDidChangeValue((value: string) => {
                    this.onChangeValue(value);
                });
                if (this._currentInput) {
                    this._currentInput.dispose();
                }
                this._currentInput = input;
                this._currentInput.show();
            }
        } catch (error) {
            if (this._currentInput) {
                this._currentInput.dispose();
            }
            throw error;
        }
    }

    backStep(step?: number) {
        if (step) {
            let stepTmp = this._stepsBuffer.pop();
            while (stepTmp !== step) {
                stepTmp = this._stepsBuffer.pop();
            }
            this._step = stepTmp;
        }
        else {
            this._step = this._stepsBuffer.pop();
        }
        this.show();
    }

    nextStep(step: number): void {
        if (this._step !== undefined) {
            this._stepsBuffer.push(this._step);
        }
        this._step = step;
        this.show();
    }

    sameStep(): void {
        this._step = this._stepsBuffer[this._stepsBuffer.length - 1];
        this.show();
    }

    async loadMetadata(fromOrg: boolean, downloadAll: boolean, types: string[]) {
        setTimeout(() => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: 'Loading Metadata Types'
            }, (progress, cancelToken) => {
                return new Promise<void>((resolve) => {
                    if (fromOrg) {
                        getOrgMetadata(downloadAll, progress, types).then((metadataTypes) => {
                            this._metadata = metadataTypes;
                            resolve();
                            this.show();
                        }).catch((error) => {
                            this.fireErrorEvent(error.message);
                            NotificationManager.showError(error);
                            resolve();
                            this.backStep();
                        });
                    } else {
                        getLocalMetadata(types).then((metadataTypes) => {
                            this._metadata = metadataTypes;
                            resolve();
                            this.show();
                        }).catch((error) => {
                            this.fireErrorEvent(error.message);
                            resolve();
                            this.backStep();
                        });
                    }
                });
            });
        }, 10);
    }
}

function getLocalMetadata(types: string[]) {
    return new Promise(function (resolve, reject) {
        if (!Config.getOrgAlias()) {
            reject(new Error('Not connected to an Org. Please authorize and connect to and org and try later.'));
        }
        if (Config.useAuraHelperCLI()) {
            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
            cliManager.describeLocalMetadata(types).then((metadataTypes: any[]) => {
                resolve(metadataTypes);
            }).catch((error: Error) => {
                reject(error);
            });
        } else {
            const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
            connection.listMetadataTypes().then((metadataDetails: any[]) => {
                const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                const result: any = {};
                const metadataTypes = MetadataFactory.createMetadataTypesFromFileSystem(folderMetadataMap, Paths.getProjectFolder(), Config.getConfig().metadata.groupGlobalQuickActions);
                for (const key of Object.keys(metadataTypes)) {
                    if (!types || types.includes(key)){
                        result[key] = metadataTypes[key];
                    }
                }
                resolve(result);
            }).catch((error: Error) => {
                reject(error);
            });

        }
    });
}

function getOrgMetadata(downloadAll: boolean, progressReport: any, types: string[]) {
    return new Promise(function (resolve, reject) {
        if (Config.useAuraHelperCLI()) {
            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
            cliManager.onProgress((status: any) => {
                if (status.result.increment !== undefined && status.result.increment > -1) {
                    progressReport.report({
                        message: status.message,
                        increment: status.result.increment
                    });
                }
            });
            cliManager.describeOrgMetadata(downloadAll, types, Config.getConfig().metadata.groupGlobalQuickActions).then((metadataTypes: any[]) => {
                resolve(metadataTypes);
            }).catch((error: Error) => {
                reject(error);
                console.log(error);
            });
        } else {
            const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
            connection.setMultiThread();
            connection.onAfterDownloadType((status: any) => {
                progressReport.report({
                    message: 'MetadataType: ' + status.entityType,
                    increment: status.increment
                });
            })
            connection.listMetadataTypes().then((metadataDetails: any[]) => {
                connection.describeMetadataTypes(metadataDetails, downloadAll, Config.getConfig().metadata.groupGlobalQuickActions).then((metadataTypes: any[]) => {
                    resolve(metadataTypes);
                }).catch((error: Error) => {
                    reject(error);
                    console.log(error);
                });
            }).catch((error: Error) => {
                console.log(error);
                reject(error);
            });

        }
    });
}