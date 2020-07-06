const fileSystem = require('../fileSystem');
const languages = require('../languages');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const XMLParser = languages.XMLParser;

class ViewFactory { 

    static createViewData() { 
        return {
            template: undefined,
            style: undefined,
            controller: undefined,
            pageContent: undefined,
            pageStyle: undefined,
            pageController: undefined,
            actions: [],
            showActionBar: true
        }
    }

    static createView(viewData) { 
        let content = [];
        let templateContent = FileReader.readFileSync(viewData.template);
        let templateJSON = XMLParser.parseXML(templateContent);
        content = this.processObject('ah:page', templateJSON['ah:page']);
        return content.join('\n');
    }

    static processObject(objKey, viewContent) {
        let content = [];
        let attributes = ViewFactory.getAttributes(viewContent);
        if (objKey === 'ah:page') { 
            if (attributes['root'])
                content.push('<html>');
        }
        Object.keys(viewContent).forEach(function (key) { 
            let viewObj = viewContent[key];
            if (typeof viewObj === 'object') { 
                content = content.concat(ViewFactory.processObject(key, viewObj));
            }
        });
        if (objKey === 'ah:page') { 
            if (attributes['root'])
                content.push('</html>');
        }
        return content;
    }

    static getAttributes(object) { 
        let attributes;
        if (object['@attrs']) { 
            attributes = object['@attrs'];
        }
        return attributes;
    }

    static getIndent(indent) { 
        let tabs = [];
        for (let index = 0; index < indent; index++) {
            tabs.push('\t');
        }
        return tabs.join('');
    }

}
module.exports = ViewFactory;