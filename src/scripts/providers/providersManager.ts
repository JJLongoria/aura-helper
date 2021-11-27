import * as providers from '.';

export class ProviderManager {

    static registerProviders(): void {
        providers.ApexCommentCompletionProvider.register();
        providers.ApexCompletionProvider.register();
        providers.AuraCompletionProvider.register();
        providers.JSAuraCompletionProvider.register();
        providers.ApexFormatterProvider.register();
        providers.DocumentSymbolProvider.register();
        providers.ApexHoverProvider.register();
    }

}