const ReferenceNode = require('./referenceNode');

class DatatypeNode extends ReferenceNode { 
 
    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.datatypeText;
    }

    setDatatypeText(datatypeText) { 
        this.datatypeText = datatypeText;
    }
}
module.exports = DatatypeNode;