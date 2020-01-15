const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const View = require('./view');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const ViewColumn = vscode.ViewColumn;
const Window = vscode.window;

class Engine {

    static getViewOptions() {
        return {
            lang: undefined,
            title: "No-Title",
            enableScripts: true,
            retainContextWhenHidden: true,
            showActionBar: true,
            actions: [],
            params: []
        }
    }

    static getViewParam(name, value) { 
        return {
            name: name,
            value: value
        }
    }

    static createButtonAction(id, text, classes, onClick) {
        return '<button id="' + id + '" class="' + classes.join(' ') + '" onclick="' + onClick + '">' + text + '</button>'
    }

    static createView(route, options) {
        if (options == undefined)
            options = Engine.getViewOptions();
        let mainPath = Paths.getResourcesPath() + route.path;
        let files = FileReader.readDirSync(mainPath);
        let style = '';
        let controller = '';
        let page = '';
        for (const file of files) {
            if (file.endsWith('.html')) {
                page = mainPath + '/' + file;
            } else if (file.endsWith('.css')) {
                style = mainPath + '/' + file;
            } else if (file.endsWith('.js')) {
                controller = mainPath + '/' + file;
            }
        }
        let panel = Window.createWebviewPanel(route.type, View.translate(options.title, options.lang), ViewColumn.One, {
            enableScripts: options.enableScripts,
            retainContextWhenHidden: options.retainContextWhenHidden,
        });
        return new View(panel, page, controller, style, options);
    }

};
module.exports = Engine;

