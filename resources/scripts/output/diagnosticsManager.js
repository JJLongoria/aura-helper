const vscode = require('vscode');
const collections = {};

class DiagnosticsManager {

    static createCollection(context, collectionName){
        if(collections[collectionName]){
            collections[collectionName] = vscode.languages.createDiagnosticCollection(collectionName);
            context.subscriptions.push(context);
        }
    }

    static setDiagnostics(collectionName, uri, diagnostics){
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