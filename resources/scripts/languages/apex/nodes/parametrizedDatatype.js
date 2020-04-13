const DatatypeNode = require('./datatypeNode');

class ParametrizedDatatypeNode extends DatatypeNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.keyDatatype = undefined;
        this.valueDatatype = undefined;
    }

    setKeyDatatype(keyDatatype) {
        this.keyDatatype = keyDatatype;
    }

    setValueDatatype(valueDatatype) {
        this.valueDatatype = valueDatatype;
    }
}
module.exports = ParametrizedDatatypeNode;