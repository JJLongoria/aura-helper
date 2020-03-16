const DefinitionNode = require('./definitionNode');

class SetAccesorNode extends DefinitionNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = SetAccesorNode;