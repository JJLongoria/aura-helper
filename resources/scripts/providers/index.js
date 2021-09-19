const apexCompletionProvider = require('./apexCompletionProvider');
exports.apexCompletionProvider = apexCompletionProvider.provider;
const auraCompletionProvider = require('./auraCompletionProvider');
exports.auraCompletionProvider = auraCompletionProvider.provider;
const javascriptCompletionProvider = require('./javascriptCompletionProvider');
exports.javascriptCompletionProvider = javascriptCompletionProvider.provider;
const apexCommentProvider = require('./apexCommentProvider');
exports.apexCommentProvider = apexCommentProvider.provider;
const apexFormatterProvider = require('./apexFormatterProvider');
exports.apexFormatterProvider = apexFormatterProvider.provider;
exports.DocumentSymbolProvider = require('./documentSymbolProvider');
exports.ApexHoverProvider = require('./apexHoverProvider');
