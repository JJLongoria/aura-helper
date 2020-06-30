const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const GUIEngine = require('../guiEngine');
const NotificationManager = require('../output/notificationManager');
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
            }
            if (selected === 'Spanish') {
                lang = 'es';
            }
            if (lang !== undefined) {
                let viewOptions = Engine.getViewOptions();
                viewOptions.title = '{!label.help_title}';
                viewOptions.showActionBar = false;
                viewOptions.lang = lang;
                view = Engine.createView(Routing.Help, viewOptions);
                let auraSnippets = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
                let jsSnippets = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
                let sldsSnippets = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));
                view.render(undefined, {
                    auraSnippets: auraSnippets,
                    jsSnippets: jsSnippets,
                    sldsSnippets: sldsSnippets
                });
            }
        });

    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}