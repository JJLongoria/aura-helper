const Node = require('./node');

class FileNode extends Node { 

    constructor(id, name) { 
        super(id, name, undefined);
        this.nodeMap = {};
        this.parseErrors = [];
        this.system = false;
        this.docLink = undefined;
        this.deep = -1;
    }

    addParseError(error) { 
        this.parseErrors.push(error);
    }

    setDocLink(docLink) { 
        this.docLink = docLink;
    }

    getDocLink() { 
        this.docLink;
    }

    isSystem() { 
        return this.system;
    }

    setSystem(isSystem) { 
        this.system = isSystem;
    }

    setNodeMap(nodeMap) { 
        this.nodeMap = nodeMap;
    }

}
module.exports = FileNode;