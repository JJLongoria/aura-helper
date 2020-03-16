const DefinitionNode = require('./definitionNode');

class GetAccesorNode extends DefinitionNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = GetAccesorNode;