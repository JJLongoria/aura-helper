const Logger = require('../main/logger');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const metadata = require('../metadata');
const AuraParser = languages.AuraParser;
const window = vscode.window;
const Range = vscode.Range;
const ProgressLocation = vscode.ProgressLocation;
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const MetadataCompressor = metadata.MetadataCompressor;

exports.run = function (uri) {
    try {
        let folderPath = Paths.getMetadataRootFolder();
        if (uri) {
            folderPath = uri.fsPath;
        }
        Logger.output("Compressing All XML files");
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Compressing All XML Files",
            cancellable: false
        }, (progress, token) => {
            return new Promise(async resolve => {
                setTimeout(() => {
                    FileReader.getAllFiles(folderPath, function (error, result) {
                        let xmlFiles = [];
                        if (!error) {
                            for (let file of result) {
                                if (file.endsWith('.xml'))
                                    xmlFiles.push(file);
                            }
                            for (const file of xmlFiles) {
                                try {
                                    let content = MetadataCompressor.compress(file);
                                    if (content) {
                                        Logger.output("Compressing files: " + file);
                                        FileWriter.createFileSync(file, content);
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                            resolve();
                        } else {
                            window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                            resolve();
                        }
                    });
                }, 100);
            });
        });

    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}