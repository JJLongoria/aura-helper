import * as vscode from 'vscode';
import { Paths } from '../core/paths';
import { Config } from '../core/config';
import { MultiStepInput } from './multiStepInput';
import { OutputChannel } from '../output/outputChannnel';
const { FileWriter, FileReader, PathUtils } = require('@aurahelper/core').FileSystem;
const { XMLParser } = require('@aurahelper/languages').XML;
const CLIManager = require('@aurahelper/cli-manager');
const XMLCompressor = require('@aurahelper/xml-compressor');

export class XMLEditor extends MultiStepInput {

    _file: string;
    _fileName: string;
    _xmlContent: string;
    _isAddingMode: boolean;
    _xmlDefinition: any;

    constructor(title: string, initialStep: number, totalSteps: number, file: string) {
        super(title, initialStep, totalSteps);
        this._file = file;
        this._fileName = getFileName(this._file);
        this._xmlContent = readFile(this._file);
        this._isAddingMode = false;
        this._xmlDefinition = undefined;
    }

    save(compress: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (compress) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Compressing XML File",
                    cancellable: true
                }, (progress: vscode.Progress<any>, cancelToken: vscode.CancellationToken) => {
                    return new Promise<void>(progressResolve => {
                        const sortOrder = Config.getXMLSortOrder();
                        if (Config.useAuraHelperCLI()) {
                            FileWriter.createFileSync(this._file, XMLParser.toXML(this._xmlContent));
                            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                            cliManager.compress(this._file, sortOrder).then(() => {
                                OutputChannel.outputLine('XML file compressed successfully');
                                progressResolve();
                                resolve();
                            }).catch((error: Error) => {
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

function readFile(file: string) {
    return XMLParser.parseXML(FileReader.readFileSync(file), true);
}

function getFileName(file: string) {
    let fileName = PathUtils.getBasename(file);
    fileName = fileName.replace('-meta.xml', '');
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    return fileName;
}