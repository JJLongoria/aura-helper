const vscode = require('vscode');

class MarkDownStringBuilder {
    
    constructor(){
        this._markdown = new vscode.MarkdownString('', true);
        this._markdown.isTrusted = true;
    }

    appendMarkdownSeparator(){
        this._markdown.appendMarkdown('---\n\n');
        return this;
    }

    appendMarkdownH4(text){
        this._markdown.appendMarkdown('#### ' + text + '\n\n');
        return this;
    }

    appendText(text){
        this._markdown.appendText(text);
        return this;
    }

    appendMarkdown(text){
        this._markdown.appendMarkdown(text);
        return this;
    }

    appendApexCodeBlock(text){
        this._markdown.appendCodeblock(text + '\n', 'apex');
        return this;
    }

    appendJSCodeBlock(text){
        this._markdown.appendCodeblock(text + '\n', 'javascript');
        return this;
    }

    appendHTMLCodeBlock(text){
        this._markdown.appendCodeblock(text + '\n', 'html');
        return this;
    }

    build(){
        this.appendMarkdownSeparator();
        this.appendMarkdown('\n\n### Powered by Aura Helper');
        return this._markdown;
    }

}
module.exports = MarkDownStringBuilder;