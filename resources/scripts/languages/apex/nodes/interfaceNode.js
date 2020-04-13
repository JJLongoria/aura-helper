const DefinitionNode = require('./definitionNode');

class InterfaceNode extends DefinitionNode {

    constructor(id, name, startToken) {
        super(id, name, startToken);
    }
    
    setExtends(extendClass) { 
        this.extends = extendClass;
    }
}
module.exports = InterfaceNode;