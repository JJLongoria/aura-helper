const FileSystem = require('../fileSystem');
const XMLParser = require('../languages/xmlParser');
const MultiStepInput = require('./multiStepInput');

class XMLEditor extends MultiStepInput {

    constructor(title, initialStep, totalSteps, file){
        super(title, initialStep, totalSteps);
        this._file = file;
        this._fileName = getFileName(this._file);
        this._xmlContent = readFile(this._file);
        this._isAddingMode = false;
        this._xmlMetadata = undefined;
    }

    save(){
        FileSystem.FileWriter.createFileSync(this._file, XMLParser.toXML(this._xmlContent));
    }
}
module.exports = XMLEditor;

function readFile(file){
    return XMLParser.parseXML(FileSystem.FileReader.readFileSync(file));
}

function getFileName(file){
    let fileName = FileSystem.Paths.getBasename(file);
    fileName = fileName.replace('-meta.xml', '');
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    return fileName;
}