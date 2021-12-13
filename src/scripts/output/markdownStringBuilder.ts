import * as vscode from 'vscode';

export class MarkDownStringBuilder {

    _markdown: vscode.MarkdownString;


    constructor() {
        this._markdown = new vscode.MarkdownString('', true);
        this._markdown.isTrusted = true;
    }

    hasContent(): boolean {
        return this._markdown.value !== undefined && this._markdown.value.length > 0;
    }

    appendMarkdownSeparator(): MarkDownStringBuilder {
        this._markdown.appendMarkdown('---\n   ');
        return this;
    }

    appendMarkdownH4(text: string): MarkDownStringBuilder {
        this._markdown.appendMarkdown('#### ' + text + '\n\n');
        return this;
    }

    appendText(text: string): MarkDownStringBuilder {
        this._markdown.appendText(text);
        return this;
    }

    appendMarkdown(text: string): MarkDownStringBuilder {
        this._markdown.appendMarkdown(text);
        return this;
    }

    appendApexCodeBlock(text: string): MarkDownStringBuilder {
        this._markdown.appendCodeblock(text + '\n', 'apex');
        return this;
    }

    appendJSCodeBlock(text: string): MarkDownStringBuilder {
        this._markdown.appendCodeblock(text + '\n', 'javascript');
        return this;
    }

    appendHTMLCodeBlock(text: string): MarkDownStringBuilder {
        this._markdown.appendCodeblock(text + '\n', 'html');
        return this;
    }

    build(withoutSeparator?: boolean): vscode.MarkdownString {
        if (!withoutSeparator) {
            this.appendMarkdownSeparator();
            this.appendMarkdown('**Powered by Aura Helper**');
        } else {
            this.appendMarkdown('**Powered by Aura Helper**');
        }
        return this._markdown;
    }

}