
const DefinitionNode = require('./definitionNode');

class ClassNode extends DefinitionNode {

    constructor(id, name, startToken) {
        super(id, name, startToken);
        this.sharingModifier;
        this.implements;
        this.extends;
    }
    
    setSharingModifier(sharingModifier) {
        this.sharingModifier = sharingModifier;
    }

    setImplements(interfaces) { 
        this.implements = interfaces;
    }

    setExtends(extendClass) { 
        this.extends = extendClass;
    }
}
module.exports = ClassNode;