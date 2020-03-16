const DefinitionNode = require('./definitionNode');

class StaticConstructorNode extends DefinitionNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = StaticConstructorNode;