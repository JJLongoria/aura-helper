const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const window = vscode.window;
const ViewColumn = vscode.ViewColumn;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;

exports.run = function() {
    try {
        openHelp(function (help) {
            const panel = window.createWebviewPanel('Help', 'Help for Aura Helper', ViewColumn.One, { enableScripts: true });
            panel.webview.html = help;
        });
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

async function openHelp(callback) {
    let help = createHelp();
    callback.call(this, help);
}

function createHelp() {
    let help = FileReader.readFileSync(Paths.getHelpPath());
    let auraNS = {};
    let jsNS = {};
    let sldsNS = {};
    let auraSnippets = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
    let jsSnippets = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
    let sldsSnippets = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));
    Object.keys(auraSnippets).forEach(function (key) {
        let snippet = auraSnippets[key];
        if (auraNS[getSnippetNS(snippet)] === undefined)
            auraNS[getSnippetNS(snippet)] = [];
        auraNS[getSnippetNS(snippet)].push({ snippetName: key, snippet: snippet });
    });
    Object.keys(sldsSnippets).forEach(function (key) {
        let snippet = sldsSnippets[key];
        if (sldsNS[getSnippetNS(snippet)] === undefined)
            sldsNS[getSnippetNS(snippet)] = [];
        sldsNS[getSnippetNS(snippet)].push({ snippetName: key, snippet: snippet });
    });
    Object.keys(jsSnippets).forEach(function (key) {
        let snippet = jsSnippets[key];
        if (jsNS[getSnippetNS(snippet)] === undefined)
            jsNS[getSnippetNS(snippet)] = [];
        jsNS[getSnippetNS(snippet)].push({ snippetName: key, snippet: snippet });
    });
    let snippetMenuContent = [
        "<a href=\"#auraSnippetsCollection\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('auraSnippets')\">Component Snippets</a>",
        "\t\t\t\t\t<div id=\"auraSnippets\" class=\"w3-hide w3-margin-left\">"
    ];
    let snippetSectionContent = [
        "<p>Aura Helper provides to you to muchs code snippets for make your work easy. The following list are the total snippets of Aura Helper</p>",
        "\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"auraSnippetsCollection\">",
        "\t\t\t\t\t\t\t\t<h4><b>Component Snippets</b></h4>"
    ];
    Object.keys(auraNS).forEach(function (key) {
        let snippets = auraNS[key];
        snippetMenuContent.push("\t\t\t\t\t\t<a href=\"#aura_" + key + "\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('aura_" + key + "_snippets')\">" + getNamespaceName(key) + " Snippets</a>");
        snippetMenuContent.push("\t\t\t\t\t\t\t<div id=\"aura_" + key + "_snippets\" class=\"w3-hide w3-margin-left\">");

        snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"aura_" + key + "\">");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>" + getNamespaceName(key) + " Snippets</b></h4>");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<div class=\"w3-container\">");
        for (const snippet of snippets) {
            //logger.logJSON('snippet', snippet);
            snippetMenuContent.push("\t\t\t\t\t\t\t\t<a href=\"#" + snippet.snippet.prefix + "\" class=\"w3-bar-item w3-button w3-small\">" + snippet.snippetName + "</a>");

            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t<div class=\"w3-container darkGrey w3-margin-left\" id=\"" + snippet.snippet.prefix + "\">");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<h5>" + snippet.snippetName + "</h5>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>" + snippet.snippet.description.replace("[", "<a href=\"").replace("]", "\"><br/>Documentation</a>") + "<p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>- Code Completion: <code>" + snippet.snippet.prefix + "</code><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p><b>Body:</b><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t<code class=\"darkGrey codeColor\">");
            for (let bodyLine of snippet.snippet.body) {
                let line = bodyLine.replace(new RegExp(/</, 'g'), "&lt;").replace(new RegExp(/</, 'g'), "&gt;").replace(new RegExp(/\\/, 'g'), "").replace(new RegExp(/!/, 'g'), "").replace(new RegExp(/{/, 'g'), "").replace(new RegExp(/}/, 'g'), "").replace(new RegExp(/\$/, 'g'), "").replace(new RegExp(/[0-9]:/, 'g'), "");
                snippetSectionContent.push(line);
            }
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t</code>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t</pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t</div>");
        }
        snippetMenuContent.push("\t\t\t\t\t\t\t</div>");

        snippetSectionContent.push("\t\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
    });
    snippetMenuContent.push("\t\t\t\t\t</div>");

    snippetMenuContent.push("\t\t\t\t<a href=\"#SLDSSnippetsCollection\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('sldsSnippets')\">SLDS Snippets</a>");
    snippetMenuContent.push("\t\t\t\t\t<div id=\"sldsSnippets\" class=\"w3-hide w3-margin-left\">");

    snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
    snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"SLDSSnippetsCollection\">");
    snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>SLDS Snippets</b></h4>");
    Object.keys(sldsNS).forEach(function (key) {
        let snippets = sldsNS[key];
        snippetMenuContent.push("\t\t\t\t\t\t<a href=\"#slds_" + key + "\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('slds_" + key + "_snippets')\">" + getNamespaceName(key) + " Snippets</a>");
        snippetMenuContent.push("\t\t\t\t\t\t\t<div id=\"slds_" + key + "_snippets\" class=\"w3-hide w3-margin-left\">");

        snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"slds_" + key + "\">");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>" + getNamespaceName(key) + " Snippets</b></h4>");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<div class=\"w3-container\">");
        for (const snippet of snippets) {
            snippetMenuContent.push("\t\t\t\t\t\t\t\t<a href=\"#" + snippet.snippet.prefix + "\" class=\"w3-bar-item w3-button w3-small\">" + snippet.snippetName + "</a>");

            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t<div class=\"w3-container darkGrey w3-margin-left\" id=\"" + snippet.snippet.prefix + "\">");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<h5>" + snippet.snippetName + "</h5>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>" + snippet.snippet.description.replace("[", "<a href=\"").replace("]", "\"><br/>Documentation</a>") + "<p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>- Code Completion: <code>" + snippet.snippet.prefix + "</code><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p><b>Body:</b><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t<code class=\"darkGrey codeColor\">");
            for (let bodyLine of snippet.snippet.body) {
                let line = bodyLine.replace(new RegExp(/</, 'g'), "&lt;").replace(new RegExp(/</, 'g'), "&gt;").replace(new RegExp(/\\/, 'g'), "").replace(new RegExp(/!/, 'g'), "").replace(new RegExp(/{/, 'g'), "").replace(new RegExp(/}/, 'g'), "").replace(new RegExp(/\$/, 'g'), "").replace(new RegExp(/[0-9]:/, 'g'), "");
                snippetSectionContent.push(line);
            }
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t</code>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t</pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t</div>");
        }
        snippetMenuContent.push("\t\t\t\t\t\t\t</div>");

        snippetSectionContent.push("\t\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
    });
    snippetMenuContent.push("\t\t\t\t\t</div>");

    snippetMenuContent.push("\t\t\t\t<a href=\"#JSSnippetsCollection\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('jsSnippets')\">JavaScript Snippets</a>");
    snippetMenuContent.push("\t\t\t\t\t<div id=\"jsSnippets\" class=\"w3-hide w3-margin-left\">");

    snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
    snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"JSSnippetsCollection\">");
    snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>JavaScript Snippets</b></h4>");
    Object.keys(jsNS).forEach(function (key) {
        let snippets = jsNS[key];
        snippetMenuContent.push("\t\t\t\t\t\t<a href=\"#js_" + key + "\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey w3-small\" onclick=\"openCloseAccordion('js_" + key + "_snippets')\">" + getNamespaceName(key) + " Snippets</a>");
        snippetMenuContent.push("\t\t\t\t\t\t\t<div id=\"js_" + key + "_snippets\" class=\"w3-hide w3-margin-left\">");

        snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"js_" + key + "\">");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>" + getNamespaceName(key) + " Snippets</b></h4>");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<div class=\"w3-container\">");
        for (const snippet of snippets) {
            snippetMenuContent.push("\t\t\t\t\t\t\t\t<a href=\"#" + snippet.snippet.prefix + "\" class=\"w3-bar-item w3-button w3-small\">" + snippet.snippetName + "</a>");

            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t<div class=\"w3-container darkGrey w3-margin-left\" id=\"" + snippet.snippet.prefix + "\">");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<h5>" + snippet.snippetName + "</h5>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>" + snippet.snippet.description + "<p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>- Code Completion: <code>" + snippet.snippet.prefix + "</code><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p><b>Body:</b><p>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t<code class=\"darkGrey codeColor\">");
            let func = false;
            let lineNumber = 0;
            for (let bodyLine of snippet.snippet.body) {
                let line = bodyLine.replace(new RegExp(/</, 'g'), "&lt;").replace(new RegExp(/</, 'g'), "&gt;").replace(new RegExp(/\\/, 'g'), "").replace(new RegExp(/!/, 'g'), "").replace(new RegExp(/{/, 'g'), "").replace(new RegExp(/}/, 'g'), "").replace(new RegExp(/\$/, 'g'), "").replace(new RegExp(/[0-9]:/, 'g'), "").replace(new RegExp(/[0-9]/, 'g'), "");
                if (line.indexOf('function') !== -1) {
                    line = line.replace(')', '){');
                    func = true;
                }
                else if (line.indexOf(',') !== -1 && func && lineNumber === snippet.snippet.body.length - 1)
                    line = line.replace(',', '},');
                snippetSectionContent.push(line);
                lineNumber++;
            }
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t</code>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t</pre>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t\t</div>");
        }
        snippetMenuContent.push("\t\t\t\t\t\t\t</div>");

        snippetSectionContent.push("\t\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<br/>");
    });
    snippetMenuContent.push("\t\t\t\t\t</div>");
    snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
    help = help.replace('{!snippetsCollectionMenu}', snippetMenuContent.join('\n'));
    help = help.replace('{!snippetsCollection}', snippetSectionContent.join('\n'));
    return help;
}

function getSnippetNS(snippet) {
    if (typeof snippet.prefix === "string") {
        let prefixSplit = snippet.prefix.split('.');
        return prefixSplit[0];
    }
    else {
        let prefixSplit = snippet.prefix[0].split('.');
        return prefixSplit[0];
    }
}

function getNamespaceName(ns) {
    if (ns === 'ltn')
        return 'Lightning';
    if (ns === 'aura')
        return 'Aura';
    if (ns === 'ltng')
        return 'Ltng';
    if (ns === 'force')
        return 'Force';
    if (ns === 'forceChatter')
        return 'Force Chatter';
    if (ns === 'forceCommunity')
        return 'Force Community';
    if (ns === 'ltnCommunity')
        return 'Lightning Community';
    if (ns === 'ltnSnapin')
        return 'Lightning Snapin';
    if (ns === 'ui')
        return 'UI';
    if (ns === 'slds')
        return 'SLDS';
    return ns;
}