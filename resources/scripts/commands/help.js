const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const GUIEngine = require('../guiEngine');
const window = vscode.window;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
exports.run = function () {
    try {
        window.showQuickPick(["English", "Spanish"]).then((selected) => {
            let lang = undefined;
            let title = '';
            if (selected === 'English') {
                lang = 'en';
                title = "Aura Helper's Help"
            }
            if (selected === 'Spanish') {
                lang = 'es';
                title = "Ayuda de Aura Helper"
            }
            if (lang !== undefined) {
                let viewOptions = Engine.getViewOptions();
                viewOptions.title = title;
                viewOptions.showActionBar = false;
                viewOptions.lang = lang;
                viewOptions.params.push(Engine.getViewParam('lang', '"' + lang + '"'));
                view = Engine.createView(Routing.Help, viewOptions);
                view.render(function (resolve) {
                    let auraSnippets = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
                    let jsSnippets = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
                    let sldsSnippets = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));

                    resolve(undefined, {
                        auraSnippets: auraSnippets,
                        jsSnippets: jsSnippets,
                        sldsSnippets: sldsSnippets
                    });
                });
            }
        });

    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}