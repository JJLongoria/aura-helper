const Node = require('./node');

class ReferenceNode extends Node { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.referenceFile = undefined;
        this.referenceId = undefined;
    }

    setReferenceId(referenceId) { 
        this.referenceId = referenceId;
    }

    setReferenceFile(referenceFile) { 

    }
}
module.exports = ReferenceNode;