const Node = require('./node');

class DefinitionNode extends Node { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.annotation = undefined;
        this.accessModifier = 'private';
        this.definitionModifier = undefined;
        this.commentNode = undefined;
        this.signature = undefined;
        this.static = undefined;
        this.simplifiedSignature = undefined;
        this.namespace = undefined;
        this.declaredVariables = [];
    }


    addDeclaredVariable(declaredVariable) { 
        this.declaredVariables.push(declaredVariable);
    }

    setNamespace(namespace) { 
        this.namespace = namespace;
    }

    getNamespace() { 
        return this.namespace;
    }

    setSimplifiedSignature(simplifiedSignature) { 
        this.simplifiedSignature = simplifiedSignature;
    }

    getSimplifiedSignature() { 
        return this.simplifiedSignature;
    }

    setSignature(signature) { 
        this.signature = signature;
    }

    getsignature() {
        return this.signature;
    }

    setCommentNode(commentNode) { 
        this.commentNode = commentNode;
    }

    setStatic(isStatic) { 
        this.static = isStatic;
    }

    setAccessModifier(accessModifier) {
        this.accessModifier = accessModifier;
    }

    getAccessModifier() { 
        return this.accessModifier;
    }

    getDefinitionModifier() {
        return this.definitionModifier;
    }

    getStatic() { 
        return this.static;
    }

    setDefinitionModifier(definitionModifier) { 
        this.definitionModifier = definitionModifier;
    }

    setAnnotation(annotation){ 
        this.annotation = annotation;        
    }

}
module.exports = DefinitionNode;