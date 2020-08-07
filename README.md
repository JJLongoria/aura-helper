# Configuration Guide
For use Aura Helper with all its features, you must to install Aura Helper CLI. [Click here](https://github.com/JJLongoria/aura-helper-CLI) and follow the instructions. 

# Aura Helper Features
Extension to work with Salesforce, Apex and Lightning. It contains numerous tools to increase productivity and facilitate code creation.

From code autocomplete tools, to an advanced graphical interface that allows you to perform more powerful tasks, through formatting Apex code or offering views for file structure. Aura Helper is the **most complete extension** for work with salesforce, is undoubtedly one of the necessary applications for any Salaesforce developer.

- **Write code faster** with the complete code suggestion tools that Aura Helper provide. Code completion for Apex, lightning, javascript... (*User Classes, System Classes,Custom and Standard Objects, Methods, Fields, Picklist values, implement intefaces and extends classes automatically, Custom Labels, Aura attribute suggested values... and too much more*.)
- **Apex Code formatter** with *configurable options* from Aura Helper settings (spaces beetwen operators, max allowed blank lines, open curly brackets on new lines... and more options to format your code as you want)
- More than **100 snipets** for create Aura Components with less effort
- Create **package and destructive** files quickly with the powerfull **Package Generator**. Select metadata manually or create the files from two **git branches, commits or tags differences**.
- **Compare Metadata** between *local  project and Auth org* or between *two different orgs* for get the differences.
- **Repair Project Dependencies** for get less errors on deploy. Check your local metadata and repair files if is needed. Also you can only check errors. 
- **Compress XML Files** for make easy the *git conflict handling* and make work more with git more faster.
- **Edit XML Files easy without errors** from VSCode with the Aura Helper tools.
- Work with **special metadata** types like *Profiles, Permission Sets, Translations...*
- **Create documentation** for Aura components easy and faster based on a user defined template
- Create a **entire Apex Classes navigable documentation** with only one command
- Create your own **Apex comment template** for adding to apex code easy with autocompletion tools (type /** for create apex comments based on template)
- **Views** for see the files structure like *Apex Classes Fields or Methods, Profiles or Permission Sets permissions...*
- An **Advance Graphic User Interface** for make powerfull task provide a graphic interface for edit metadata files. Also have powerfull interface tools with standard VSCode interface for use less resources.
- For a complete work of all commands and have the better experience with Aura Helper you must **Refresh the SObjects Index** at least one time (recommended make it periodically when any object change). For this porpouse, you can choose to refresh SObjects Index at **VSCode Starts** for refresh it automatically and have the index updated (*Settings > AuraHeler > Metada > Refresh SObject Definitions On Start*).
- And too much more tools for make your work more easy and faster with less erros.

## Code Completion Tools
Aura Helper offers the user multiple code autocomplete tools to facilitate coding, which can be activated or disabled from the extension settings.

Some of the functions are:
- Ability to list all objects, custom and standard available in the application. It works in the Apex classes
- List the fields of the objects, including information such as label, picklist values, length ... It works in both Apex classes and Lightning components
- Show all application classes, including system classes (System, Database...). It works in the Apex classes
- Autocomplete support for Custom Labels. It is necessary to have them downloaded in the project. Work in Apex, Lightning and Javascript
- Obtain and list the variables and methods of all classes, including system classes. It works in the Apex classes
- Ability to create class and method comments quickly through a user-defined template
- Ability to list the above information concatenated (class.method (). Method ()...). It works in both Apex classes and Lightning components
- List all the standard and custom lightning components of any namespace (lightning, aura...)
- List attributes not included in calls to lightnig components, both custom and standard of any namespace
- Suggest the possible values ​​of the attributes of the elements of the lightning components, such as variants, sizes... 
- Ability to display the functions of the Apex, Javascript or Helper files in the files of any Lightning Bundle
- Support to facilitate the construction of queries showing the fields of the object indicated in the "from" clause
- More than 100 code snippets to facilitate the creation of lightning components. For more details see the <a href="#snippetsCollectionSection">Snippets</a> section on Aura 
- Autocomplete tools for Picklist values. Aura Helper list all available picklist values for each field object, and can select it for pick the value (Example: Account.picklistfield.picklistValue => \'picklistValue\')
- Added Support for implement automatically inherited methods from interfaces and extended classes (virtual and abstract methods)

Examples: 

![Code Completion Example 1](https://i.imgur.com/wIQzHi3.gif)
![Code Completion Example 2](https://i.imgur.com/eiae45B.gif) 
![Code Completion Example 3](https://i.imgur.com/bXytdW5.gif) 
![Code Completion Example 4](https://i.imgur.com/TYP5IoY.gif)

## Advance Graphic User Interface
Another of the main features that Aura Helper implements, is the support of an advanced graphical interface to implement more powerful features that facilitate the maintenance of metadata or serve as support for other tasks.

Through the graphical interface, Aura Helper provides a tool to create <code>package.xml</code> files quickly, both of the local metadata, and of all the metadata of the organization.

Another feature implemented through the interface is the ability to manage metadata files as if it were Salesforce. Add similar validations and behavior, taking into account the context and possibilities offered by VSCode.

You can enable or disable advance GUI from Aura Helper Settings, by default is disabled.

The currently available Views are:
- View to view and edit profiles
- View to view and edit permission sets
- Package Generator.
- View to view, create and edit Custom Labels
- Help

Examples: 

![Advance Graphic User Interface Example 1](https://i.imgur.com/9QdVz4m.gif)
![Advance Graphic User Interface Example 2](https://i.imgur.com/10IL1eI.gif) 
![Advance Graphic User Interface Example 3](https://i.imgur.com/K74Swpa.gif) 

## Apex Code Formatter
Due to the lack of code formatters exclusively for Apex and that official salesforce extensions do not implement it, Aura Helper has a tool to format Apex code. We just have to press <code>Alt + Shift + F</code>. Aura Helper's formatter allow to the user configure the format style on Aura Helper's Settings.

Examples:

![Apex Code Formatter Example 1](https://i.imgur.com/I4HruJ5.gif)

## Version Control and Metadata
To facilitate working with version control applications such as Git, Aura Helper contains several tools to manage metadata files which simplify version control in Salesforce.

Some of the tools are:
- Possibility of compressing the XML files so that they occupy fewer lines and reorganize the content to facilitate its reading by the user
- Graphical interface to manage files more simply and without leaving VSCode
- Possibility of updating the files that are created at runtime during the deployments depending on the content, such as profiles or permission sets, including all system information and without the need to update the other elements
- Ability to check what elements exist in the environment and not locally, to be able to eliminate them and match the environment with the local content
- If we want to perform metadata deployments or retrieves, we can use the Package Generator tools and the SFDX Deploy and Retrieve options. The Package Generator tool can list your stored metadata (on local and org) and allow to select them manally, from other package or from Git, for better metadata control (See the Package Generator Section).
- Repair your project dependencies according your local metadata.

Examples: 

![Version Control and Metadata Example 1](https://i.imgur.com/L7kBr8L.gif)
![Version Control and Metadata Example 2](https://i.imgur.com/QxfiLqI.gif)
![Version Control and Metadata Example 3](https://i.imgur.com/4QSZUJX.gif)

## Documentation
To facilitate the tedious documentation task, Aura Helper has tools to automatically generate or facilitate the work of documenting code

The main tools are:
- Ability to generate comments of classes and Apex methods following the structure of a user-defined template, so that it can be adapted the style of comments to that established in the project.
- Support to automatically generate all or almost all documentation of the Lightning components <code>(.auradoc)</code>. Using the Javascript comment scheme, and a user-defined template, almost all of the documentation can be generated with a single click
- Command to generate project documentation automatically similar to salesforce official doc with navigable links on datatypes (both, custom and standard). To do this, it uses the classes stored locally together with the comments of methods, classes and variables that match the established template.. Added support for creating comments for class variables so that they can be analyzed later to generate documentation

Examples:

![Documentation Example 1](https://i.imgur.com/IPwVJHy.gif)
![Documentation Example 2](https://i.imgur.com/gMf4Feg.gif) 
![Documentation Example 3](https://i.imgur.com/SHmaVYH.gif) 
![Documentation Example 4](https://i.imgur.com/xpAVOFf.gif)

## Help
Aura Helper includes a navigable help to learn more about all the features contained in the extension and thus make better use and be more productive Command -> AuraHelper: Help

Help are available in English and Spanish.

Examples:

![Help 1](https://i.imgur.com/sPqmwS6.gif)



<!-- 
## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**-->
