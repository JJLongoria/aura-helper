function contains(source, target){
    return source.indexOf(target) != -1;
}

function containsIgnoreCase(source, target){
    return source.toLowerCase().indexOf(target.toLowerCase()) != -1;
}

module.exports = {
    contains,
    containsIgnoreCase
}