const vscode = require('vscode');
const AppContext = require('../core/applicationContext');
const collections = {};

class DiagnosticsManager {

    static createCollection(collectionName){
        collections[collectionName] = vscode.languages.createDiagnosticCollection(collectionName);
        AppContext.context.subscriptions.push(collections[collectionName]);
    }

    static setDiagnostics(collectionName, uri, diagnostics){
        if(!collections[collectionName])
            DiagnosticsManager.createCollection(collectionName);
        if(collections[collectionName]){
            collections[collectionName].set(uri, diagnostics);
        }
    }

    static clearDiagnostic(collectionName){
        if(collections[collectionName])
            collections[collectionName].clear();
    }

    static clearDiagnostics(){
        Object.keys(collections).forEach(function(collKey){
            collections[collKey].clear();
        });
    }

}
module.exports = DiagnosticsManager;