const languages = require('../languages');
const snippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const window = vscode.window;
const Range = vscode.Range;
const SnippetString = vscode.SnippetString;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter= fileSystem.FileWriter;
const ApexParser = languages.ApexParser;

exports.run = function(position, type, data) {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isApexClass(editor.document.uri.fsPath))
            processApexCodeCompletion(position, type, editor);
        else
            window.showErrorMessage('The selected file is not an Apex Class File');
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function processApexCodeCompletion(position, type, editor) {
    if(type === "comment")
        processCommentCompletion(position, editor);
}

function processCommentCompletion(position, editor){
    let lineNum;
	if (position !== undefined) {
		lineNum = position.line + 1;
	}
	else {
		lineNum = editor.selection.active.line + 1;
	}
	var methodOrClassLine = editor.document.lineAt(lineNum);
	if (!methodOrClassLine.isEmptyOrWhitespace) {
		let endLoop = false;
		let content = "";
		while (!endLoop) {
			if (methodOrClassLine.text.indexOf("{") === -1 && methodOrClassLine.text.indexOf(";") === -1) {
				content += methodOrClassLine.text + "\n";
			} else if(methodOrClassLine.text.indexOf("}") !== -1){
                endLoop = true;
            } else {
				content += methodOrClassLine.text + "\n";
				endLoop = true;
			}
			lineNum++;
			methodOrClassLine = editor.document.lineAt(lineNum);
		}
        const apexClassOrMethod = ApexParser.parseForComment(content);
        let templateContent;
        if(FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            templateContent = FileReader.readFileSync(Paths.getApexCommentUserTemplatePath());
        if(templateContent){
			const apexComment = snippetUtils.getApexComment(apexClassOrMethod, JSON.parse(templateContent));
            FileWriter.replaceEditorContent(editor, new Range(position.line, countStartWhitespaces(editor.document.lineAt(position.line).text), position.line, editor.document.lineAt(position.line).text.length), '');
			editor.insertSnippet(new SnippetString(`${apexComment}`), position);
        } else{
            window.showErrorMessage("Apex Comment Template does not exists. Run Edit Apex Comment Template command for create it");
        }
	}
}

function countStartWhitespaces(str) {
    let number = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ' ')
            number++;
        else
            break;
    }
    return number;
}