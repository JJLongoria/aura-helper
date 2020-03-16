
const DefinitionNode = require('./definitionNode');

class ClassNode extends DefinitionNode { 

    constructor(id, name, startToken) { 
        super(id, name);
        this.nodeId = id;
        this.transient = false;
        this.final = false;
    }

    setDatatype(datatype) { 
        this.datatype = datatype;
    }

    getDatatype() { 
        return this.datatype;
    }

    setTransient(isTransient) { 
        this.transient = isTransient;
    }

    setFinal(final) { 
        this.final = final;
    }


}
module.exports = ClassNode;