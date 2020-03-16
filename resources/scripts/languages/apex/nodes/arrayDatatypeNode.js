const DatatypeNode = require('./datatypeNode');

class ArrayDatatypeNode extends DatatypeNode { 
 
    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = ArrayDatatypeNode;