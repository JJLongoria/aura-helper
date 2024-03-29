import * as vscode from 'vscode';
import { applicationContext } from '../core/applicationContext';
import { CoreUtils } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
const collections: any = {};

export class DiagnosticsManager {

    static createCollection(collectionName: string): void {
        collections[collectionName] = vscode.languages.createDiagnosticCollection(collectionName);
        applicationContext.context.subscriptions.push(collections[collectionName]);
    }

    static setDiagnostics(collectionName: string, uri: vscode.Uri, diagnostics: vscode.Diagnostic[]): void {
        if (Utils.isNull(collections[collectionName])) {
            DiagnosticsManager.createCollection(collectionName);
        }
        if (collections[collectionName]) {
            collections[collectionName].set(uri, diagnostics);
        }
    }

    static clearDiagnostic(collectionName: string): void {
        if (!Utils.isNull(collections[collectionName])) {
            collections[collectionName].clear();
        }
    }

    static clearDiagnostics(): void {
        Object.keys(collections).forEach(function (collKey) {
            collections[collKey].clear();
        });
    }

}