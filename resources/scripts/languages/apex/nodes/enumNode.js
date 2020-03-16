const DefinitionNode = require('./definitionNode');

class EnumNode extends DefinitionNode {

    constructor(id, name, startToken) {
        super(id, name, startToken);
    }
}
module.exports = EnumNode;