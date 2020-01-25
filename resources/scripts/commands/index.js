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
const help = require('./openHelpGUI');
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
const gotoFileMember = require('./gotoFileMember');
exports.gotoFileMember = gotoFileMember.run;
const compressXML = require('./compressXML');
exports.compressXML = compressXML.run;
const compressAllXML = require('./compressAllXML');
exports.compressAllXML = compressAllXML.run;
const openProfilePermSetGUI = require('./openProfilePermSetGUI');
exports.openProfilePermSetGUI = openProfilePermSetGUI.run;
const retrieveFullProfile = require('./retrieveFullProfile');
exports.retrieveFullProfile = retrieveFullProfile.run;
const packageGenerator = require('./openPackageGeneratorGUI');
exports.packageGenerator = packageGenerator.run;
const matchOrgWithLocal = require('./matchOrgWithLocal');
exports.matchOrgWithLocal = matchOrgWithLocal.run;
const openCustomLabelsGUI = require('./openCustomLabelsGUI');
exports.openCustomLabelsGUI = openCustomLabelsGUI.run;
const openCustomObjectsGUI = require('./openCustomObjectsGUI');
exports.openCustomObjectsGUI = openCustomObjectsGUI.run;
const createProjectDocumentation = require('./createProjectDocumentation');
exports.createProjectDocumentation = createProjectDocumentation.run;
