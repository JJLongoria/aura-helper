const FileSystem = require('../fileSystem');
const XMLParser = require('../languages/xmlParser');

class XMLEditor {

    constructor(file){
        this.file = file;
        this.xmlContent = readFile(this.file);
    }

    save(){
        FileSystem.FileWriter.createFileSync(this.file, XMLParser.toXML(this.xmlContent));
    }

}
module.exports = XMLEditor;

function readFile(file){
    return XMLParser.parseXML(FileSystem.FileReader.readFileSync(file));
}