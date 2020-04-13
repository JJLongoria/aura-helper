const DefinitionNode = require('./definitionNode');

class ConstructorNode extends DefinitionNode{ 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.override = false;
        this.params = [];
    }

    addParam(param) { 
        this.params.push(param);
    }

    setOverride(isOverride) { 
        this.override = isOverride;
    }
}
module.exports = ConstructorNode;