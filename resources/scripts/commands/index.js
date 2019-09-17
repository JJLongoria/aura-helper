const addApexComment = require('./addApexComment');
exports.addApexComment = addApexComment.run;
const addJSFunction = require('./addJSFunction');
exports.addJSFunction = addJSFunction.run;
const addMethodBlock = require('./addMethodBlock');
exports.addMethodBlock = addMethodBlock.run;
const editApexCommentTemplate = require('./editApexCommentTemplate');
exports.editApexCommentTemplate = editApexCommentTemplate.run;
const editAuraDocumentationTemplate = require('./editAuraDocumentationTemplate');
exports.editAuraDocumentationTemplate = editAuraDocumentationTemplate.run;
const generateAuraDocumentation = require('./generateAuraDocumentation');
exports.generateAuraDocumentation = generateAuraDocumentation.run;
const help = require('./help');
exports.help = help.run;
const newAuraFile = require('./newAuraFile');
exports.newAuraFile = newAuraFile.run;
const refreshAllMetadataIndex = require('./refreshAllMetadataIndex');
exports.refreshAllMetadataIndex = refreshAllMetadataIndex.run;
const refreshObjectMetadataIndex = require('./refreshObjectMetadataIndex');
exports.refreshObjectMetadataIndex = refreshObjectMetadataIndex.run;
const apexCodeCompletion = require('./apexCodeCompletion');
exports.apexCodeCompletion = apexCodeCompletion.run;
const auraCodeCompletion = require('./auraCodeCompletion');
exports.auraCodeCompletion = auraCodeCompletion.run;
const initialization = require('./initialization');
exports.initialization = initialization.run;