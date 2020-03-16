
const DefinitionNode = require('./definitionNode');

class PropertyDeclarationNode extends DefinitionNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.nodeId = id;
        this.transient = false;
        this.final = false;
        this.getAccesor = undefined;
        this.setAccesor = undefined;
    }

    setGetAccessor(getNode) { 
        this.getAccesor = getNode;
    }

    setSetAccessor(setNode) { 
        this.setAccesor = setNode;
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
module.exports = PropertyDeclarationNode;