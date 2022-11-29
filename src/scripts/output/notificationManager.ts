import * as vscode from 'vscode';
import { CoreUtils } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
var statusBar: vscode.StatusBarItem;

export class NotificationManager {

    static showStatusBar(content: string): void {
        if (!statusBar) {
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        }
        statusBar.text = content;
        statusBar.show();
    }

    static hideStatusBar(): void {
        statusBar.text = '';
        statusBar.hide();
    }

    static showError(message: any): void {
        vscode.window.showErrorMessage(message);
    }

    static showCommandError(message: any): void {
        NotificationManager.showError('An error ocurred while processing command. Error: \n' + message);
    }

    static showConfirmDialog(message: string, onAccept: () => void, onCancel?: () => void, okText?: string, cancelText?: string): void {
        okText = okText || 'Ok';
        cancelText = cancelText || 'Cancel';
        vscode.window.showInformationMessage(message, okText, cancelText).then((selected) => {
            if (selected === okText && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

    static showInfo(message: string, onAccept?: () => void, okText?: string): void {
        okText = okText || 'Ok';
        if (!Utils.isNull(onAccept)) {
            vscode.window.showInformationMessage(message, { title: okText, isCloseAffordance: true }).then(selected => {
                if (selected?.title === okText && onAccept) {
                    onAccept.call(this);
                }
            });
        } else {
            vscode.window.showInformationMessage(message);
        }
    }

    static showWarning(message: string, onAccept?: () => void, onCancel?: () => void, okText?: string, cancelText?: string): void {
        let options: vscode.MessageItem[] = [];
        okText = okText || 'Ok';
        cancelText = cancelText || 'Cancel';
        if (!Utils.isNull(onAccept)) {
            options.push({
                title: okText,
                isCloseAffordance: true,
            });
        }
        if (!Utils.isNull(onCancel)) {
            options.push({
                title: cancelText,
                isCloseAffordance: true,
            });
        }
        vscode.window.showWarningMessage<vscode.MessageItem>(message, ...options).then((selected) => {
            if (selected?.title === okText && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

}