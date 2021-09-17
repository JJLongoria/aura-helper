const vscode = require('vscode');
const providers = require('.');
const applicationContext = require('../core/applicationContext');

class ProviderManager {

    static registerProviders() {
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.apexCommentProvider, '*'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', providers.apexCompletionProvider, '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex-anon', providers.apexCompletionProvider, '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('xml', providers.auraCompletionProvider, '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', providers.auraCompletionProvider, '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', providers.javascriptCompletionProvider, '.'));
        applicationContext.context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('apex', providers.apexFormatterProvider));
        applicationContext.context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('apex-anon', providers.apexFormatterProvider));
        providers.DocumentSymbolProvider.register();
    }

}
module.exports = ProviderManager;