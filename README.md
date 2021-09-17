# [**Configuration Guide**](#configuration-guidie)
For use Aura Helper with all its features, you must to install Aura Helper CLI. [Click here](https://github.com/JJLongoria/aura-helper-CLI) and follow the instructions. 

# [**Aura Helper Features**](#aura-helper-features)
Aura Helper is the **most complete extension** for work with salesforce. Can work with Salesfoce XML Metadata files, Apex and Lightning code and other powerfull commands and features. It contains numerous tools to increase productivity and facilitate code creation. Is undoubtedly one of the necessary applications for any **Salaesforce developer**. Go to [**Aura Helper Extension Documentation**](https://github.com/JJLongoria/aura-helper/wiki) to learn more about the extension and all features.

- [**Write code faster**](#intellisense-tools) with the Aura Helper IntelliSense. Code completion for Apex, lightning, javascript... (*User Classes, System Classes,Custom and Standard Objects, Methods, Fields, Picklist values, implement intefaces and extends classes automatically, Custom Labels, Aura attribute suggested values... and too much more*.)
- [**Apex Code formatter**](#apex-code-formatter) with *configurable options* from Aura Helper settings (spaces beetwen operators, max allowed blank lines, open curly brackets on new lines... and more options to format your code as you want). The first exclusive Apex code formatter for VSCode.
- More than [**200 snipets**](#intellisense-tools) for create Aura Components, SLDS components and more with less effort
- Create **package and destructive** files quickly with the powerfull [**Package Generator**](#version-control). Select metadata manually from your org or local project, or create the files from two **git branches, commits or tags differences**.
- [**Compare Metadata**](#version-control) between *local project and Auth org* or between *two different orgs* for get the differences.
- [**Repair Project Dependencies**](#version-control) to get less errors on deploy. Check your local metadata and repair files if is needed. Also you can only check errors. Support al metadata types to repair. 
- [**Compress XML Files**](#version-control) for make easy the *git conflict handling* and make work with git more faster.
- [**Edit XML Files easy without errors**](#version-control) from VSCode with the Aura Helper tools.
- **Modify Permissions** of any object with [**Modify Permissions**](#version-control) tool or modify directly the profiles, permission sets or muting permissions sets with the [**Permission Editor**](#version-control) tool. Modify permissions directly from VSCode without errors.
- Work with **special metadata** types like *Profiles, Permission Sets, Translations...* and download entire data from it without modify any other file
- [**Create documentation**](#documentation) for Aura components easy and faster based on a user defined template
- Create a [**entire Apex Classes navigable documentation**](#documentation) with only one command. Analize the entire code, extract data from comments using the user templates and create a full documentation in seconds.
- Create your own [**Apex comment template**](#intellisense-tools) for adding to apex code easy with autocompletion tools (type /** for create apex comments based on template). You can create your own tags and add datasources to replace tag with the data (for exameple, if create an @author tag with git username datasource, automatically add the git user to the @author tag value). The **best comment system** to Apex code.-
- [**Outline View**](#outline-view) to see the files structure like *Apex Classes Fields or Methods, Profiles or Permission Sets permissions...*. Work with Apex, Aura Componentes (Apps, Events and Components), Aura JavaScript and All Metadata XML files. Provide **more information** than the standard Apex Outline.
- To a **complete work of all commands** and have the **better experience** with Aura Helper you must [**Refresh the SObjects Index**](#intellisense-tools) at least one time (recommended make it periodically when any object change) or has the SObejcts on your local project. For this porpouse, you can choose to refresh SObjects Index at **VSCode Starts** for refresh it automatically and have the index updated (*Settings > AuraHeler > Metada > Refresh SObject Definitions On Start*).
- **And too much more tools** for make your work more easy and faster with less erros.

## [**IntelliSense Tools**](#intellisense-tools)
Aura Helper offers to the user multiple code autocomplete tools to facilitate coding, which can be activated or disabled from the extension settings. All Intellisense Tools are available to the next files: **Apex Code** (Classes and Triggers), **Aura Components**, **Apps** and **Events** and **Aura Javascript** Files.

Some of the functions are:
- Ability to **list** all *objects*, *custom* and *standard* available in the application.
- Support to suggest fields on **SQOL queries**, including related fields (without deep limit). Only need [Select from ObjectName] to suggest to you all ObjectName fields and related fields. Also support completion on String queries.
- **List** the *fields* of the objects, including information such as label, picklist values, length ...
- Show **all application classes**, including system classes (System, Database...).
- Autocomplete support for **Custom Labels**. It is necessary to have them downloaded in the project. 
- Obtain and list the variables and methods of all classes, including system classes.
- Ability to create **class and method comments** quickly through a user-defined template. You can define your own comment tags (symbol, tag name, tag keywords...) to a fully comment customization. Also you can choose tag datasources to replace it automatically from the selected datasource like git or salesforce data, file paths...
- Ability to list the above information concatenated (class.method (). Method ()...). 
- List all the **standard and custom lightning components** of any namespace (lightning, aura...)
- List attributes not included in calls to lightnig components, both custom and standard of any namespace
- Suggest the possible values ​​of the attributes of the elements of the lightning components, such as variants, sizes... 
- Ability to display the functions of the Apex, Javascript or Helper files in the files of any Lightning Bundle
- More than **200 code snippets** to facilitate the creation of lightning components. For more details see the <a href="#snippetsCollectionSection">Snippets</a> section on Aura 
- Autocomplete tools for **Picklist values**. Aura Helper list all available picklist values for each field object, and can select it for pick the value (Example: Account.picklistfield.picklistValue => \'picklistValue\')
- Autocomplete tools for **Record Type values**. Aura Helper list all available record type values (Name and Developer Name) for each field object, and can select it for pick the value (Example: Account.recordTypename => \'recordTypeName\')
- Added Support for **implement automatically** inherited methods from **interfaces** and **extended** classes (virtual and abstract methods)
- And much more

Examples: 

![Code Completion Example 1](https://i.imgur.com/wIQzHi3.gif)
![Code Completion Example 2](https://i.imgur.com/eiae45B.gif) 
![Code Completion Example 3](https://i.imgur.com/bXytdW5.gif) 
![Code Completion Example 4](https://i.imgur.com/TYP5IoY.gif)

## [**Outline View**](#outline-view)
Aura Helper implements a symbol provider to provide an **outline view** to all **XML Metadata files**, all **Apex Code** files and **Aura files** (Components, Apps, Events and Javascript files)

You can view all *methods*, *fields*, *constructors* or other Apex nodes into the outline view. See *Handlers*, *Events*, *Attributes* and other important data from your aura components or analize any *XML* File *tags* and *values*. Click on any node to go to it into the file.

## [**Apex Code Formatter**](#apex-code-formatter)
Due to the lack of code formatters exclusively for Apex and that official salesforce extensions do not implement it, Aura Helper has a tool to **format Apex code**. We just have to press <code>Alt + Shift + F</code>. Aura Helper's formatter allow to the user **configure the format style** on Aura Helper's Settings.

Examples:

![Apex Code Formatter Example 1](https://i.imgur.com/I4HruJ5.gif)

## [**Version Control and Metadata**](#version-control)
To facilitate working with **version control** applications such as Git, Aura Helper contains several tools to manage metadata files which simplify version control in Salesforce.

Some of the tools are:
- Possibility of **compressing the XML files** so that they occupy fewer lines and reorganize the content to facilitate its reading by the user
- **Graphical interface** to manage XML files more simply and without leaving VSCode like profiles, permission sets, custom labels...
- Possibility of **updating the files** that are created at runtime during the deployments depending on the content, such as profiles or permission sets, including all system information and without the need to update the other elements
- Ability to **check what elements exist in the environment and not locally**, to be able to eliminate them and match the environment with the local content
- If we want to perform metadata deployments or retrieves, we can use the **Package Generator** tool and the SFDX Deploy and Retrieve options. The **Package Generator** tool can list your stored metadata (on local and org) and allow to select them manally, or create the **package and destructive** files from **Git**, for better metadata control.
- **Repair or check dependencies errors** on your project according your local metadata.
- And much more

Examples: 

![Version Control and Metadata Example 1](https://i.imgur.com/L7kBr8L.gif)
![Version Control and Metadata Example 2](https://i.imgur.com/QxfiLqI.gif)
![Version Control and Metadata Example 3](https://i.imgur.com/4QSZUJX.gif)

## [**Documentation**](#documentation)
To facilitate the tedious documentation task, Aura Helper has tools to automatically generate or facilitate the work of documenting code

The main tools are:
- Ability to generate **comments of classes and Apex methods** following the structure of a **user-defined template**, so that it can be adapted the style of comments to that established in the project. You **can create your on tags** with your own *symbols*, *names* and *keywords* to configure your comments as you want or need. Also you can **choose to many datasources** to the created tag to replace automatically on the commets. For example, if define an @Author tag with "git username" as source on your template, automatically will be replaced on the code with the git data.
- Support to automatically **generate** all or almost all **documentation of the Lightning components** <code>(.auradoc)</code>. Using the Javascript comment scheme, and a user-defined template, almost all of the documentation can be generated **with a single click**.
- Command to generate **project documentation automatically** similar to salesforce official doc with navigable links on datatypes (both, custom and standard). To do this, it uses the classes stored locally together with the comments of methods, classes and variables that match the established template.. Added support for creating comments for class variables so that they can be analyzed later to generate documentation

Examples:

![Documentation Example 1](https://i.imgur.com/IPwVJHy.gif)
![Documentation Example 2](https://i.imgur.com/gMf4Feg.gif) 
![Documentation Example 3](https://i.imgur.com/SHmaVYH.gif) 
![Documentation Example 4](https://i.imgur.com/xpAVOFf.gif)

## [**And too much more**](#more)
Go to [**Aura Helper Extension Documentation**](https://github.com/JJLongoria/aura-helper/wiki) to learn more about the extension and all features.


# [**Aura Helper Framework**](#aura-helper-framework)
Aura Helper Extension is powered by the new **Aura Helper Framework**. This framework are stable, faster and the code are tested about 90-95%. The framework is created like a tool to all Salesforce Developers to create its own Salesfoce Application with nodeJS. To get more information about the framework [**Click Here**](https://github.com/JJLongoria/aura-helper-core).

# [**Contributions**](#contributions)

## [**Code**](#code):
- Juan Jose Longoria López - Kanko (juanjoselongoria@gmail.com)

## [**Logo Design**](#logo): 
- Isabel García Sánchez - Ib (igarciasanchez00@gmail.com).
- New Icons from [Microsoft](https://github.com/microsoft/vscode-icons)
