const DefinitionNode = require('./definitionNode');

class InitializerNode extends DefinitionNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = InitializerNode;