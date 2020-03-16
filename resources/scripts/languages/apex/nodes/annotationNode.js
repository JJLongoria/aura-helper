const Node = require('./node');

class AnnotationNode extends Node {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.text = undefined;
    }

    setText(text) { 
        this.text = text;
    }

}
module.exports = AnnotationNode;