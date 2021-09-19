const vscode = require('vscode');
const { FileWriter, FileReader, PathUtils } = require('@aurahelper/core').FileSystem;
const { XMLParser } = require('@aurahelper/languages').XML;
const Config = require('../core/config');
const MultiStepInput = require('./multiStepInput');
const CLIManager = require('@aurahelper/cli-manager');
const XMLCompressor = require('@aurahelper/xml-compressor');
const Paths = require('../core/paths');
const OutputChannel = require('../output/outputChannnel');

class XMLEditor extends MultiStepInput {

    constructor(title, initialStep, totalSteps, file) {
        super(title, initialStep, totalSteps);
        this._file = file;
        this._fileName = getFileName(this._file);
        this._xmlContent = readFile(this._file);
        this._isAddingMode = false;
        this._xmlDefinition = undefined;
    }

    save(compress) {
        return new Promise((resolve, reject) => {
            if (compress) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Compressing XML File",
                    cancellable: true
                }, (progress, cancelToken) => {
                    return new Promise(progressResolve => {
                        const sortOrder = Config.getXMLSortOrder();
                        if (Config.useAuraHelperCLI()) {
                            FileWriter.createFileSync(this._file, XMLParser.toXML(this._xmlContent));
                            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                            cliManager.compress(this._file, sortOrder).then(() => {
                                OutputChannel.outputLine('XML file compressed successfully');
                                progressResolve();
                                resolve();
                            }).catch((error) => {
                                reject(error);
                            });
                        } else {
                            const compressor = new XMLCompressor();
                            compressor.setSortOrder(sortOrder).setXMLRoot(this._xmlContent)
                            FileWriter.createFileSync(this._file, compressor.getCompressedContentSync());
                            OutputChannel.outputLine('XML file compressed successfully');
                            progressResolve();
                            resolve();
                        }
                    });
                });
            } else {
                FileWriter.createFileSync(this._file, XMLParser.toXML(this._xmlContent));
                resolve();
            }
        });
    }
}
module.exports = XMLEditor;

function readFile(file) {
    return XMLParser.parseXML(FileReader.readFileSync(file), true);
}

function getFileName(file) {
    let fileName = PathUtils.getBasename(file);
    fileName = fileName.replace('-meta.xml', '');
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    return fileName;
}