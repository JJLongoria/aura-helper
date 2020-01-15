const vscode = require('vscode');
const Logger = require('../main/logger');
const StrUtils = require('../utils/strUtils');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Config = require('../main/config');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const AuraParser = languages.AuraParser;

class View {

    constructor(panel, page, controller, style, options) {
        this.panel = panel;
        this.page = page;
        this.controller = controller;
        this.style = style;
        this.options = options;
        this.content = '';
    }

    footer() {
        let lines = [];
        lines.push('<div class="w3-bottom w3-border-top">');
        lines.push('<div class="w3-bar footer w3-center w3-padding-16">');
        lines.push('{!actions}');
        lines.push('</div>');
        lines.push('</div>');
        return lines.join('\n');
    }

    loadContent() {
        let templateContent = FileReader.readFileSync(Paths.getResourcesPath() + '/gui/template/page.html');
        let mainStyleContent = FileReader.readFileSync(Paths.getResourcesPath() + '/gui/template/style.css');
        let pageContent = FileReader.readFileSync(this.page);
        let controllerContent = (this.controller !== undefined && this.controller.length > 0) ? FileReader.readFileSync(this.controller) : '';
        if (this.options.params !== undefined && this.options.params.length > 0) {
            for (const param of this.options.params) {
                controllerContent = StrUtils.replace(controllerContent, '\'{!' + param.name + '}\'', param.value);
            }
        }
        let styleContent = (this.style !== undefined && this.style.length > 0) ? FileReader.readFileSync(this.style) : '';
        this.content = StrUtils.replace(templateContent, '.style {}', mainStyleContent);
        this.content = StrUtils.replace(this.content, '.pageStyle {}', styleContent);
        this.content = StrUtils.replace(this.content, '{!pageContent}', pageContent);
        this.content = StrUtils.replace(this.content, 'function controller();', controllerContent);
        this.content = StrUtils.replace(this.content, '{!title}', this.options.title);
        if (this.options.showActionBar) {
            let actions = '';
            if (this.options.actions && this.options.actions.length > 0) {
                actions = this.options.actions.join('\n');
            }
            let footer = StrUtils.replace(this.footer(), '{!actions}', actions)
            this.content = StrUtils.replace(this.content, '{!footer}', footer);
        } else {
            this.content = StrUtils.replace(this.content, '{!footer}', '');
        }
    }

    static translate(content, language) {
        if (!language)
            language = 'en';
        if (language === 'English')
            language = 'en';
        if (language === 'Spanish')
            language = 'es';
        language = language + '.json';
        let languageFolder = Paths.getResourcesPath() + '/gui/languages';
        let languages = FileReader.readDirSync(languageFolder);
        let languageFile;
        for (const lang of languages) {
            if (language === lang)
                languageFile = lang;
        }
        let languageContent = JSON.parse(FileReader.readFileSync(languageFolder + '/' + languageFile));
        Object.keys(languageContent).forEach(function (labelKey) {
            let label = '{!label.' + labelKey + '}';
            let labelContent = languageContent[labelKey];
            labelContent = StrUtils.replace(labelContent, "'", "\\'");
            if (content.indexOf(label) !== -1)
                content = StrUtils.replace(content, label, labelContent);
        });
        return content;
    }

    render(callback) {
        this.loadContent();
        this.content = View.translate(this.content, ((this.options.lang && this.options.lang.length > 0) ? this.options.lang : Config.getConfig().defaultGUILanguage));
        let thisPanel = this.panel;
        thisPanel.webview.html = this.content;
        setTimeout(() => {
            callback.call(this, function (model, extraData) {
                thisPanel.webview.postMessage({ command: "open", model: model, extraData: extraData });
            });
        }, 1500);

    }

    onReceiveMessage(onReceiveMessage) {
        this.panel.webview.onDidReceiveMessage(
            message => {
                if (onReceiveMessage)
                    onReceiveMessage(message);
            },
            undefined,
            []
        );
    }

    postMessage(message) {
        this.panel.webview.postMessage(message);
    }

    close() {
        this.panel.dispose();
    }

}
module.exports = View;