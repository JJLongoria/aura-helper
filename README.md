# [**Aura Helper**](#aura-helper)

Aura Helper is the [**most complete extension**](#aura-helper) to work with salesforce. Aura Helper provide the [**best IntelliSense suggestions**](#intellisense) and code completion options to Apex and Aura code of any Salesfoce extension (including Official Salesforce extensions). Can work with [**Salesfoce XML Metadata**](#version-control-and-metadata) files and edit some files with **graphic interface to minimize errors**. Has the first exclusive [**Apex Formatter**](#apex-code-formatter) with configurable options to format your code as you like. Can work with [**GIT and detect changes**](#version-control-and-metadata) for create packages files (and destructive too). Create a complete [**Apex and Aura documentation**](#documentation) with a few clicks. and to much more.

 Aura Helper contains several tools to increase productivity, facilitate code creation and make more easy work with Salesfoce. Is undoubtedly one of the necessary applications for any [**Salaesforce developer**](https://www.salesforce.com). Aura Helper is developed by Salesforce developer to Salesforce developers and has all you need as developer to work with Salesforce from VSCode.

 Go to [**Aura Helper Extension Documentation**](https://github.com/JJLongoria/aura-helper/wiki) to learn more about the extension and all features.

---

## ***Table of Contents***

- ### [**Configuration Guide**](#configuration-guide)<br/>
- ### [**Aura Helper Features**](#aura-helper-features)
  - #### [**IntelliSense**](#intellisense)
    - [**Apex Code IntelliSense**](#apex-code-intellisense)
    - [**Aura Components IntelliSense**](#aura-components-intellisense)
    - [**Aura JavaScript IntelliSense**](#aura-javascript-intellisense)
  - #### [**Code Format**](#code-format)
    - [**Apex Code Formatter**](#apex-code-formatter)
    - [**Compress XML Files**](#compress-xml-files)
  - #### [**Metadata Files**](#metadata-files)
    - [**Repair Dependencies**](#repair-dependencies)
    - [**Ignore Metadata**](#ignore-metadata)
    - [**Package Generator**](#package-generator-metadata)
    - [**Custom Labels Editor**](#custom-labels-editor)
    - [**Create Aura files**](#create-aura-files)
    - [**Compare Metadata**](#compare-metadata)
    - [**Retrieve Special Types**](#retrieve-special-types)
  - #### [**Manage Permissions**](#salesforce-permissions)
    - [**Permission Editor**](#permission-editor)
    - [**Modify Permissions**](#modify-permissions)
  - #### [**Version Control**](#version-control)
    - [**Packages from GIT**](#packages-from-git)
    - [**Merge Packages Files**](#merge-packages-files)
    - [**Other Tools**](#other-tools)
  - #### [**Outline View**](#outline-view)
    - [**Apex Code Outline**](#apex-code-outline)
    - [**Aura Componets Outline**](#aura-components-outline)
    - [**Aura JavaScript Outline**](#aura-javascript-outline)
    - [**Metadata XML Files**](#metadata-xml-files)
  - #### [**Documentation**](#documentation)
    - [**Apex Comments**](#apex-comments)
    - [**Apex Documentation**](#apex-documentation)
    - [**Aura Documentation**](#aura-documentation)
  - #### [**And too much more**](#and-too-much-more)<br/><br/>


- ### [**Aura Helper Framework**](#aura-helper-framework)<br/>
- ### [**Contributions**](#contributions)

---

# [**Configuration Guide**](#configuration-guidie)
For use Aura Helper with all its features, you must to install Aura Helper CLI. [Click here](https://github.com/JJLongoria/aura-helper-CLI) and follow the instructions. 

# [**Aura Helper Features**](#aura-helper-features)
Aura Helper has too many features to make work easy and faster to all Salesforce Developers.

- [**Write code faster**](#intellisense) with the Aura Helper IntelliSense tools. Code completion for Apex, lightning, javascript... (*User Classes, System Classes,Custom and Standard Objects, Methods, Fields, Picklist values, implement intefaces and extends classes automatically, Custom Labels, Aura attribute suggested values... and too much more*.)
- [**Apex Code formatter**](#apex-code-formatter) with *configurable options* from Aura Helper settings (spaces beetwen operators, max allowed blank lines, open curly brackets on new lines... and more options to format your code as you want). The first exclusive Apex code formatter for VSCode.
- More than [**200 snipets**](#intellisense) for create Aura Components, SLDS components and more with less effort
- Create **package and destructive** files quickly with the powerful [**Package Generator**](#version-control). Select metadata manually from your org or local project, or create the files from two **git branches, commits or tags differences**.
- [**Compare Metadata**](#metadata-files) between *local project and Auth org* or between *two different orgs* for get the differences.
- [**Repair Project Dependencies**](#metadata-files) to get less errors on deploy. Check your local metadata and repair files if is needed. Also you can only check errors. Support al metadata types to repair. 
- [**Compress XML Files**](#compress-xml-files) for make easy the *git conflict handling* and make work with git more faster.
- [**Edit XML Files easy without errors**](#metadata-files) from VSCode with the Aura Helper tools.
- **Modify Permissions** of any object with [**Modify Permissions**](#modify-permissions) tool or modify directly the profiles, permission sets or muting permissions sets with the [**Permission Editor**](#permission-editor) tool. Modify permissions directly from VSCode without errors.
- Work with **special metadata** types like *Profiles, Permission Sets, Translations...* and download entire data from it without modify any other file
- [**Create documentation**](#documentation) for Aura components easy and faster based on a user defined template
- Create a [**entire Apex Classes navigable documentation**](#documentation) with only one command. Analize the entire code, extract data from comments using the user templates and create a full documentation in seconds.
- Create your own [**Apex comment template**](#apex-comments) for adding to apex code easy with autocompletion tools (type /** for create apex comments based on template). You can create your own tags and add datasources to replace tag with the data (for exameple, if create an @author tag with git username datasource, automatically add the git user to the @author tag value). The **best comment system** to Apex code.-
- [**Outline View**](#outline-view) to see the files structure like *Apex Classes Fields or Methods, Profiles or Permission Sets permissions...*. Work with Apex, Aura Componentes (Apps, Events and Components), Aura JavaScript and All Metadata XML files. Provide **more information** than the standard Apex Outline.
- To a **complete work of all commands** and have the **better experience** with Aura Helper you must [**Refresh the SObjects Index**](#intellisense) at least one time (recommended make it periodically when any object change) or has the SObejcts on your local project. For this porpouse, you can choose to refresh SObjects Index at **VSCode Starts** for refresh it automatically and have the index updated (*Settings > AuraHeler > Metada > Refresh SObject Definitions On Start*).
- **And too much more tools** for make your work more easy and faster with less erros.

# [**IntelliSense**](#intellisense)
Aura Helper implements the best [**IntelliSense**](#intellisense) system for Salesforce development. Aura Helper support and provide [**IntelliSense**](#intellisense) to [**Apex Code**](#aura-code-intellisense) (Classes and Triggers), [**Aura Components**](#aura-components-intellisense) (Componetns, Apps and Events) and [**Aura JavaScript**](#aura-javascript-intellisense) files (Controller.js and Helper.js). Like all IntelliSense options, press `Ctrl + Space` to show all code suggestions.


## [**Apex Code IntelliSense**](#aura-code-intellisense)

Aura Helper can provide to many IntelliSense options to support Apex Coding. Like Salesforce with Apex code, **Apex IntelliSense ignore letter case** to show recomendations. For example, Label. or label. or LaBeL. will be the same and provide the same result.

<details>
<summary style="font-size:large; font-weight: bold">Previews</summary>

|  |  |
| :--- | :---: |
| ![Apex IntelliSense Example 1](https://media.giphy.com/media/nzTG0wvrq2nxoWUYCF/giphy.gif) | ![Apex IntelliSense Example 2](https://media.giphy.com/media/ljmaqbM0hwtCgluZDf/giphy.gif)
| ![Apex IntelliSense Example 3](https://media.giphy.com/media/vs9QvOG1HseQSWXFRy/giphy.gif)| ![Apex IntelliSense Example 4](https://media.giphy.com/media/69YFIQUn7rPiLQrWNo/giphy.gif)
| ![Apex IntelliSense Example 5](https://media.giphy.com/media/Tx64mUkkS26EXzD8ul/giphy.gif)| ![Apex IntelliSense Example 6](https://media.giphy.com/media/XqXTMxCBd2dnIP8oB2/giphy.gif)
| ![Apex IntelliSense Example 7](https://media.giphy.com/media/DnKvudT2kRIsZRHsPc/giphy.gif)| ![Apex IntelliSense Example 8](https://media.giphy.com/media/mOZvNJtl84kJnzDtWr/giphy.gif)
| ![Apex IntelliSense Example 9](https://media.giphy.com/media/gNb8ZFFUVvmgdDMIkQ/giphy.gif)

</details>

  <br/>

  - List all available **classes**, **Enums**, **Interfaces**..., including **Apex Namespaces** and **System classes** with descriptions, documentation links and to much more info. Only need to press `Ctrl + Space`

  - List all available **methods**, **class fields** and all **class members** from the active class. Only need to press `Ctrl + Space`

  - List all **methods**, **class fields,**, **inner classes** and other **class members** from All **System Classes and Namespaces** (more than 1000 classes). Only need to press `Ctrl + Space`

  - List all **class members**, **methods** or **fields** from any **variable** or **method** of any type including System Classes and Namespaces (Without deep limit). Example: You can do `MyClass.method1().otherMethod().stringMethod()...` or `variable.otherVariable.method().otherMethod()...`And in every step, you can show all available options.

  - Implements Automatically all extended methods or implement interfaces with two simple commands: **AuraHelper: Implement Extended Methods** and **AuraHelper: Implement Interfaces**. When run this commands, Aura Helper will be parse the file to extract implements information and automatically put the missing methods from parents.

  - Provide **SOQL IntelliSense** options to complete projection query fields (including Lookup fields) and support to list and show to pick all fields from Lookup relationships (without deep limit). Only need detect the `SELECT` and `FROM` clauses to provide completions. *Also work String queries.* Only need to press `Ctrl + Space` into a query.

  - Provide more and better **on hover information** with the same IntelliSense descriptions style, including documentation links or links to the Salesforce Setup among others.

  - List all available **Custom Labels** into your project (need to download to the local project). Write `label.` to show all available labels.

  - Create **Customized Apex comments** based on a *user defined template* to addapt comments to any project. You can create your own tags with datasources to replace data automatically. See the [**Apex Comment**](#apex-comments) section on documentation to learn more about it. Only need type `/*` Over every method, class or field to put the comments.

  - List all available **SObjects** stored in your org (need to execute *Refresh All SObjects Index* command) or list all available SObjects into your local project. Only need to press `Ctrl + Space` 

  - List all **fields from an SObject** if you write the API Name (And all field related information). Example: Write `Account.` to show all Account fields.

  - List all available **Record Types from a SObject** (Name and DeveloperName) and can *replace it to the String value* Example: `Account.yourRecordTypeName` will be transform to `'yourRecordTypeName'`. Aura Helper can detect if the suggetion is on a String to put or not the quottes symbol (')

  - List all **picklist values from a SObject field** to *replace it with the picklist value* Example: `Account.picklistField__c.picklistValue` will be transform to `'picklistValue'`. Aura Helper can detect if the suggetion is on a String to put or not the quottes symbol (')


<br/>

## [**Aura Components IntelliSense**](#aura-components-intellisense)
To work with Aura components (Components, Apps and Events), Aura Helper provide to many Intellisense options:

<details>
<summary style="font-size:large; font-weight: bold">Previews</summary>

|  |  |
| :--- | :---: |
| ![Aura IntelliSense Example 1](https://media.giphy.com/media/oJiYT1YGKucndfNwUa/giphy.gif) | ![Aura IntelliSense Example 2](https://media.giphy.com/media/tx7FRgt8ZRQlPY7XLe/giphy.gif)
| ![Aura IntelliSense Example 3](https://media.giphy.com/media/KA3tmfr9xCuKTrr1hP/giphy.gif)| ![Aura IntelliSense Example 4](https://media.giphy.com/media/iVkJlp8S0wsIBeB0wH/giphy.gif)
| ![Aura IntelliSense Example 5](https://media.giphy.com/media/tuTAHGI5IxlDxxOlpC/giphy.gif)| ![Aura IntelliSense Example 6](https://media.giphy.com/media/vDOqLuB9H1MvT5Z47u/giphy.gif)
| ![Aura IntelliSense Example 7](https://media.giphy.com/media/cJVyfb95dOBahPnuJO/giphy.gif)| ![Aura IntelliSense Example 8](https://media.giphy.com/media/tNz4dQmjTczWYsaOHd/giphy.gif)
| ![Aura IntelliSense Example 9](https://media.giphy.com/media/hRn5ciyM7uOwzromzL/giphy.gif)

</details>

  <br/>

  - List all your **Aura Components, Events and Apps**. Only need to write `c:` and press `Ctrl + Space` to show and select any Component. Aura Helper can detect automatically if stast with \< or end with \> to complete it automatically. Example: If you write `c:` and select one component, Aura Helper will be write `<c:myComponent >`, but if you write `<c:`, Aura Helper will be write `<c:myComponent >` and the same in any case.

  - List **All component Aura Attributes**, incluiding *inherited attributes from parent components*. Only need to write `v.` to show all. If you select one attribute, Aura Helper can detect if is called between `{! }` symbols or any symbol is missing to wirte it. Example: If write `{!v.}` and select one attribute, Aura Helper will be write `{!v.attributeName}`, but if you write `v.` and select one, Aura Helper write `{!v.attributeName}` and the same if only write `{v.` and select any attribute.

  - List **All Controller Functions**, including *inherited functions from parent components*. Only need to write `c.` to show all. If you select one function, Aura Helper can detect if is called between `{! }` symbols or any symbol is missing to wirte it. Example: If write `{!c.}` and select one function, Aura Helper will be write `{!c.functionName}`, but if you write `c.` and select one, Aura Helper write `{!c.functionName}` and the same if only write `{c.` and select any function.

  - List all **Aura Components Attributes** (*when use the components*) to create components quickly. Only need to press `Ctrl + Space` between \<\> open tag symbols to show all available attributes. Example: If you press `Ctrl + Space` on the component call `<c:myComponent >` you can show all attributes from `<c:myComponent >`. Work with custom and System Defined Aura Components.

  - List **All Availabble Values** for a component attribute attribute (*when use the components*) to create components quickly. Aura Helper detect the Attribute type and automatically suggest the best (or available) values. Only need to press `Ctrl + Space` between quottes (") symbol on attribute value.. Example:  If you press `Ctrl + Space` on the component call attribute value (between "") `<c:myComponent oneAttribute="">` you can show all suggested values to the attribute according the attribute Datatype. Work with custom and System Defined Aura components.

  - List all available **classes**, **Enums**, **Interfaces**..., including **Apex Namespaces** and **System classes** with descriptions, documentation links and to much more info. Only need to press `Ctrl + Space`

  - List all **methods**, **class fields,**, **inner classes** and other **class members** from All **System Classes and Namespaces** (more than 1000 classes). Only need to press `Ctrl + Space`

  - List all available **Custom Labels** into your project (need to download to the local project). Write `label.` to show all available labels. When select one label, Aura Helper automatically will be put the Custom Labels format on Aura files. (Example: if select `Label.thisIsOneLabel` Aura Helper type `{!$Label.c.thisIsOneLabel}` or `{!$Label.yourNamespace.thisIsOneLabel}` if has a Namespace active in your org)

  - Provide **SOQL IntelliSense** options to complete projection query fields (including Lookup fields) and support to list and show to pick all fields from Lookup relationships (without deep limit). Only need detect the `SELECT` and `FROM` clauses to provide completions. *Also work String queries.* Only need to press `Ctrl + Space` into a query.

  - List all available **SObjects** stored in your org (need to execute *Refresh All SObjects Index* command) or list all available SObjects into your local project. Only need to press `Ctrl + Space` 

  - List all **fields from an SObject** if you write the API Name (And all field related information). Example: Write `Account.` to show all Account fields.

 - List all available **Record Types from a SObject** (Name and DeveloperName) and can *replace it to the String value* Example: `Account.yourRecordTypeName` will be transform to `'yourRecordTypeName'`.

  - List all **picklist values from a SObject field** to *replace it with the picklist value* Example: `Account.picklistField__c.picklistValue` will be transform to `'picklistValue'`.
  
  - **Hundreds of Snippets** (with variants) to create *System components* quickly. Has several prefix to active the snippets, depending of the Component Namespace, use `ltn.` to show all Ligtning Namespace components, `aura.` to show all Aura Namespace components... Also has SLDS components snippets with `slds.` activation. Show [**Snippets**](Snippets) page to learn more about it and show all available snippets.

<br/>

## [**Aura JavaScript IntelliSense**](#aura-javascript-intellisense)
Aura Helper also implements IntelliSense to JavaSript Aura Files to provide a complete Aura IntelliSense system.

<details>
<summary style="font-size:large; font-weight: bold">Previews</summary>

|  |  |
| :--- | :---: |
| ![JS IntelliSense Example 1](https://media.giphy.com/media/ep9bKDmhbRItaVtO9k/giphy.gif) | ![JS IntelliSense Example 2](https://media.giphy.com/media/MPNNtxarKPX47aI4hA/giphy.gif)
| ![JS IntelliSense Example 3](https://media.giphy.com/media/cTOFp7ccQol8Ow43Fd/giphy.gif)| ![JS IntelliSense Example 4](https://media.giphy.com/media/R7tzUxqZq58sli9kKE/giphy.gif)
| ![JS IntelliSense Example 5](https://media.giphy.com/media/dZeK4N7Ej5Y3W4xGnS/giphy.gif)| ![JS IntelliSense Example 6](https://media.giphy.com/media/RJqBkW8QiJI7Txih6G/giphy.gif)
| ![JS IntelliSense Example 7](https://media.giphy.com/media/yQuUdy4Oh0NfeQPeMN/giphy.gif)| ![JS IntelliSense Example 8](https://media.giphy.com/media/iM1aznbVUBTwFOa5WI/giphy.gif)

</details>

<br/>

  - List **All component Aura Attributes**, incluiding *inherited attributes from parent components*. Only need to write `v.` to show all. If you select one attribute, Aura Helper can detect if is called from String to complete with quottes symbol('). For example. If you write `v.` and select one attribute Aura Helper will be write `v.yourAttribute` or `'v.yourAttribute'`.
   
  - List **All Apex Controller Methods**, including *inherited method from parent components*. Only need to write `c.` to show all. If you select one function, Aura Helper can detect if is called from String to complete with quottes symbol('). For example. If you write `c.` and select one attribute Aura Helper will be write `c.myMethod` or `'c.myMethod'`.

  - Complete **Apex Classes Method Params Object** automatically. When you write `c.` and list all Apex Controller Functions, you will see some elements like `c.myMethod.params`. If you select one of this, Aura Helper will bne write the Javascript object with all fields and comments with the datatype. Aura Helper can detect where is called to complete the body according the use case.

  - List all **Helper file Functions**, including *inherited functions from parent components*. Only need to write `helper.` to show all.

  - List all available **classes**, **Enums**, **Interfaces**..., including **Apex Namespaces** and **System classes** with descriptions, documentation links and to much more info. Only need to press `Ctrl + Space`

  - List all **methods**, **class fields,**, **inner classes** and other **class members** from All **System Classes and Namespaces** (more than 1000 classes). Only need to press `Ctrl + Space`

  - List all available **Custom Labels** into your project (need to download to the local project). Write `label.` to show all available labels. When select one label, Aura Helper automatically will be put the Custom Labels format on Aura JavaScript files. (Example: if select `Label.thisIsOneLabel` Aura Helper type `$A.get('$Label.c.thisIsOneLabel')` or `$A.get('$Label.yourNamespace.thisIsOneLabel')` if has a Namespace active in your org)
  
  - Provide **SOQL IntelliSense** options to complete projection query fields (including Lookup fields) and support to list and show to pick all fields from Lookup relationships (without deep limit). Only need detect the `SELECT` and `FROM` clauses to provide completions. *Also work String queries.* Only need to press `Ctrl + Space` into a query.

  - List all available **SObjects** stored in your org (need to execute *Refresh All SObjects Index* command) or list all available SObjects into your local project. Only need to press `Ctrl + Space` 

  - List all **fields from an SObject** if you write the API Name (And all field related information). Example: Write `Account.` to show all Account fields.

  - List all available **Record Types from a SObject** (Name and DeveloperName) and can *replace it to the String value* Example: `Account.yourRecordTypeName` will be transform to `'yourRecordTypeName'`. Aura Helper can detect if the suggetion is on a String to put or not the quottes symbol (')

  - List all **picklist values from a SObject field** to *replace it with the picklist value* Example: `Account.picklistField__c.picklistValue` will be transform to `'picklistValue'`. Aura Helper can detect if the suggetion is on a String to put or not the quottes symbol (')

  - **Some utils Snippets** (with variants) to create JavaScript unit codes easy. Only need to write `js.` to show all snippets.

----

<br/>
<br/>

# [**Code Format**](#code-format)
Aura Helper can format your code from all Apex Code files (classes and triggers) or any XML Metadata file.


## [**Apex Code Formatter**](#apex-code-formatter)

Aura Helper implements the first exclusive Apex Formatter for VSCode. Only need press `Alt + Shift + F` to format your files. Also can active **Format on Save** from VSCode options to format your Apex code when save files.

To addapt your formatting style as you like or need, Aura Helper has to many conficuration options on Extension Settings to change the format style. You can find all Apex format settings on Aura Helper extension preferences (**Aura Helper > Apex Format**).

![Apex Formatter Example](https://media.giphy.com/media/4m1cXbWEfDye2FQLPG/giphy.gif)

<br/>

## [**Compress XML Files**](#compress-xml-files)

To help developers to work with Git and reduce merge errors among other things, Aura Helper has two commands to change the XML file format to compress and minify the content with readable humans format and better to handle Git changes and conflicts.

Aura Helper granted always the same order of all XML elements on any file to identify changes better and has an options to select the order  of the XML elements on files. Go to **Aura Helper > Metadata > Xml Sort Order** on extension settings to choose the XML Sort order.

You can compress all XML Files from project or from a folder with **AuraHelper: Compress ALL XML Files** commands or compress a single file with **AuraHelper: Compress XML File**. Aura Helper support to compress XML files from other operations to compress affected files.

![Compress XML Example](https://media.giphy.com/media/TtqJNltAKvDzMBxzw9/giphy.gif)

---
<br/>
<br/>

# [**Metadata Files**](#metadata-files)
To work with all XML Metadata files (among other files), Aura Helper implements to many commands, options and features to work with files, minimize errors and maintance your project consistency and integrity.


## [**Repair Dependencies**](#repair-dependencies)
To maintenance your local *project integrity and cosistency*, specialy if you work with git as code master to deploy between environments the **Repair Dependencies** tool will be helpful. 

You can **repair all dependecies** errors automatically or only **check to find errors** and repair it manually (if you want). Aura Helper support to check and repair Dependencies errors with Metadata types for all XML Files, from CustomApplications to Worflow files...

To use this feature only need to execut the command **AuraHelper: Repair Project Dependencies**

When you run the command, Aura Helper will show to you all supported types (included in your local project) to allow to you to choose the Metadata Types to repair (To a better code maintance). Also you can use an `.ahignore.json` file to ignore some Metadata Types from repair operations.

<br/>

## [**Ignore Metadata**](#ignore-metadata)
Like Repair dependencies tool, the **Ignore Metadata** command has the same porpouse, maintenance your local *project integrity and cosistency* to deploy it with less errors, specially if work with git.

With this feature, you can *ignore* (even remove) all *Metadata files* or *Metadata included in files* (like some custom labels or workflow rules for example) **to avoid to deploy it between environments**.

This tool wil be **helpful** in some cases, like *Custom Labels* with different values between orgs (like ids) or to remove some *User Permissions* from Profiles or Permissions sets to avoid change it on the target org amont other use cases.

To ignore metadata, you need an `.ahignore.json` file to use it with the commands. You can has a single `.ahignore.json` file into your root project, like `.gitignore` to use it automatically, or can has several `.ahignore.json` files, with different names and locations and choose the preferred file when run the command to make the tool more flexible.

<br/>

## [**Package Generator**](#package-generator-metadata)

Aura Helper has a *really powerful* **Package Generator tool** to allow to the users to create *Package XML* Files (and *Destructive Changes* files) from several sources to retrieve, deploy or other porpouses. 

You can show all available Metadata types in your **Local Project** or from your **Auth Org** (including all namespaces data) to choose Metadata Types and elements manually to create the package files.This will be helpful to retrieve only one or several SObject Fields or Validations rules amon others, because Salesforce Org Browser can't do it.

Other important feature from Package Generator is the **GIT option** as datasource. This option allow to the user to choose two **branches, commits or tags** to get the code differences and create the Package XML and Destructive Files according the detected changes. With this option, refactor code are really easy to deploy and can maintenance better your App versions.

Finally, Package Generator can **merge several package or destructive** files into one file by type or merge all files into one single file (to deploy, retrieve or delete data).

![Package Generator Local Example](https://media.giphy.com/media/Kupmm73xsL5KYvQgEv/giphy.gif)

<br/>

## [**Custom Labels Editor**](#custom-labels-editor)

To work better with **Custom Labels from VSCode** and reduce the Salesforce dependency to develop, Aura Helper provide a **Graphic Interafce** to edit the Custom Labels Metadata file (must have downloaded into your project) without errors.

You can *create*, *edit*, *delete* and *deploy* to the Auth Org any Custom Label stored into the file. Aura Helper will be validate any Custom Label field to avoid to put wrong values.

To work with the Custom Labels Editor, go to the Custom Labels file and `rigth click` on it to choose **AuraHelper: Custom Labels Editor** option on contextual menu, or execute the command **AuraHelper: Custom Labels Editor** directly from the Command Palette.

![Custom Labels Editor Example](https://media.giphy.com/media/tFVDD0z7qjuYOdgUj0/giphy.gif)

## [**Create Aura files**](#create-aura-files)

To simplify work with Aura Components, Aura Helper can create **any Aura Component file** easy with one command. Only need to go to the Aura Component folder a press `right click` to view the contextual menu, and choose the **AuraHelper: Create Aura File** option. Aura Helper will analize the component folder to check for missing files and show the users the available files to create.

All files will be created with a simple default template except the **Aura Documentation File**, this file will be created automatically with the content of the documentation based on the user defined template. See [**Aura Documentation**](#aura-documentation) section to learn more about Aura Documentation features from Aura Helper.

## [**Compare Metadata**](#compare-metadata)

Like other tools, the **Metadata Comparator** tool are designed to maintenance the local project consistency and help to the users to maintenance the itegrity between environments.

With this feature, you can compare your **Local project with the Auth Rrg** to detect the Metadata Types that exists on the Auth Org but not exists on your local project. Also can **compare two Orgs** to get the Metadata Types that exists and not between two orgs.

## [**Retrieve Special Types**](#retrieve-special-types)

Some Metadata Types like *Profiles*, *Permission Sets*, *Record Types* or *Translations* among others are created by Salesforce on runtime when retrieve it to your local project, according the Metadata Types included into the Package XML files. 

To retrieve the entire data files *without create the package file or modify any other file* Aura Helper has the **Retrieve Special Types** command to allow to the user to select the special types to retrieve.

When execute the command, Aura Helper will show all available special types to download and allow to the user to select one, several or all types to retrieve.

Also you can choose to **Retrieve** data only from your **Local Project** to get and affect only the local metadata types. **Retrive from Auth Org** to include all available data from your org (including types that no exists on local) or **Retrieve Mixed** to retrieve only the Metadata Types that exists on yout local project, but will all Org data.


---
<br/>
<br/>

# [**Manage Permissions**](#salesforce-permissions)
Working with Salesforce permissions from VSCode its a risky task. To reduce de errors and make easy edit permissions from VSCode (without dependency from Salesforce) Aura Helper provide two util tools.


## [**Permission Editor**](#permission-editor)

The Permission Editor tool, is a graphic interface to allow the users to edit Permissions file like on Salesforce, with the same validations and depending fields. To use it, go to the permissions files (Profile, Permission Sets or Muting Permission Sets) and press `right click` to open contextual menu and select **AuraHelper: Permission Editor** or open the files on editor a execute the command **AuraHelper: Permission Editor** from command palette.

The permission editor tool has the **same behaviour than salesforce** with fields validations and controlled fields. For example, if you choose ModifyAll permission to one object, Aura Helper will select Automatically the Read, Create, Edit and ViewAll Permissions like Salesfoce (works equals if you unselect permissions)

![Permission Editor Example](https://media.giphy.com/media/WMjhfAwy8h6QXCmw4U/giphy.gif)

<br/>

## [**Modify Permissions**](#modify-permissions)

If the Permission Editor tool allow to the user to edit the permissions files, the **Modify Permissions** tool allow to the user to modify the permissions from any available Metadata Types. For example, in Permission Editor you can edit one permission to edit one or several Apex Classes permissions to the selected file. With the Modify Permissions tool yo can choose one Apex file to modify permissions on one or several permissions files.

To use this tool you can choose one file from the File Explorer and press `right click` to open contextual menu, an select **AuraHelper: Modify Permissions** and Aura Helper will show to you all available permissions Types (Profiles, Permissions Sets...) and allow the user to edit the permissions on all selected files.

Like the Permission Editor, the Modify Permissions tool has the same behaviour of Salesfoce with validations and controlled fields. For example, if you choose ModifyAll permission to one object, Aura Helper will select Automatically the Read, Create, Edit and ViewAll Permissions like Salesfoce (works equals if you unselect permissions)

![Modify Permissions Example](https://media.giphy.com/media/kygRXnOPLS3w1MzVmA/giphy.gif)

---
<br/>
<br/>

# [**Version Control**](#version-control)
Aura Helper are specially designed to work with GIT and DevOps workflows and has powerful tools to this porpouses.


## [**Packages from GIT**](#packages-from-git)

The **Package Generator** tool can connect with git an analize differences to find all created, edited and delete Metadata files (and types). When run the package generator, select GIT option to allow to the user to choose two **branches, commits or tags** to get the code differences and create the Package XML and Destructive Files according the detected changes. With this option, refactor code are really easy to deploy and can maintenance better your App versions.

![Package Generator GIT Example](https://media.giphy.com/media/XkGTpb3Ib6InqiF2G3/giphy.gif)

## [**Merge Packages Files**](#merge-packages-files)

Other importan feature from **Package Generator** tool, is the ability to **merge several package and destructive files** (all that you need) into **one file by type**. For example, you can choose three Package XML Files, five Destructive before deploy and two Destructive after deploy, and Aura Helper will be merge all files into only one Package XML with data Package XML files data, and the same with before and after destuctive files.

Also, you can **merge all files into only one file**. For example, you can select the same files of the las example, but merge all files into only one Package XML File with the content of all files (incluid destructives) or can merge all files into one Destructive XML before or after deploy.

![Package Generator Merge Example](https://media.giphy.com/media/KUNpnJdeaCl0RJ0xHc/giphy.gif)

## [**Other Tools**](#other-tools)

Other tools like [**Ignore Metadata**](#ignore-metadata) or [**Repair Dependencies**](#repair-dependencies) can be used to maintance a version control and Project Metadata Integrity. With [**Metadata Comparator**](#compare-metadata) you can compare metadata Between orgs or local and org to check if all is correc. The [**Manage Permissions**](#salesforce-permissions) tools can help to you to maintance Salesforce Permissions into your local project, without Salesforce org.

---
<br/>
<br/>

# [**Outline View**](#outline-view)
Aura Helper implements features to the VSCode Output Panel to analize the structure of to many files. Aura Helper provide outline information to Apex Code (Classes and Triggers), Aura Components (Components, Events and Applications), JavaScript Aura Files (Controller.jd and Helper.js) and all XML Metadata files from any Metadata Type.

## [**Apex Code Outline**](#apex-code-outline)

The **Apex Outline** provide information about any Apex Code file, like *Classes*, *Interfaces*, *Triggers*... You can view all Apex Nodes in a tree view to analize better any Apex file. Aura Helper will be show all fields, constants, methods, method parameters, method variables and to much information for any Apex File. Yo can click on any node to go to it on the file. **Provide more and better** information than the Salesforce Outline View.

![Apex Outline Example](https://media.giphy.com/media/70dLcYqzMIg0Pp6WdX/giphy.gif)

## [**Aura Componets Outline**](#aura-components-outline)

The **Aura Outline** provide information about any Aura Component, Application or Event. You can show all Aura Attributes, Registered events, dependencies... and much more from any Aura file. You can click on any node to go to it on the file.

![Aura Components Outline Example](https://media.giphy.com/media/URcpV8abXHCgrFtwIN/giphy.gif)

## [**Aura JavaScript Outline**](#aura-javascript-outline)

The **Aura JavaScript Outline** provide information the Controller and Helper JavaScript files. You can see al declared method on the files and click on any method to go to it on the file.

![Aura JavaScript Outline Example](https://media.giphy.com/media/DCXWzmIdCLY8Yd7J9R/giphy.gif)

## [**Metadata XML Files**](#metadata-xml-files)

The **Metadata XML Outline** provide information of any XML Metadata file. You can select any XML File to view the file structure, tags, values and more. You can click on any XML Element to go to it on the file.

![Metadata XML Outline Example](https://media.giphy.com/media/BYvqU8sGzylLNUqSUT/giphy.gif)

---
<br/>
<br/>

# [**Documentation**](#documentation)
To Help to the users with the boring documentation tasks, Aura Helper provide helpful tools to create documentation faster and with a few clicks.

## [**Apex Comments**](#apex-comments)
Aura Helper provide the **best Apex Comments** system because you can define your own comment template to create comments automatically based on the template. You can addapt the template to the preferred format to create the comments only with write `/**` and Aura Helper will be create the entire comment with the selected information based on the created template.

The Apex Comment Template system is a really powerful system because allow to the users to create their own custom tags with to many datasources to create the comments and replace the tags with the selected data. For example, you can define your oun `@author` tag with named `@creator`, and select Salesforce username as datasource to replace the `@creator` tag template automatically with the specified data. Work like JavaDoc, but allow to the users to customize the comments.

|  |  |
| :--- | :---: |
| ![Apex Comment Example 1](https://media.giphy.com/media/W6Xjw28kzGb8psOXj5/giphy.gif) | ![Apex Comment Example 2](https://media.giphy.com/media/DnKvudT2kRIsZRHsPc/giphy.gif) |



## [**Apex Documentation**](#apex-documentation)

If you write all your **Apex Comments** following the **defined template**, Aura Helper can extract all  information from the comments and tags to create a Navigable HTML documentation with the Apex Classes data and the comment information. 

The documentation will be generated with all classes, and will be grouped into Apex Classes, Test Classes, Interfaces, Enums, Scheduled Classes, Rest Classes, Batch Classes and Queueable Classes to a better organization.

To create the Apex Documentation, only need to run the comment **AuraHelper: Create Project Documentation**.

|  |  |
| :--- | :---: |
| ![Project Documentation Example 1](https://media.giphy.com/media/ZPkuuGwjxV6lvgxwFV/giphy.gif) | ![Project Documentation Example 2](https://media.giphy.com/media/rkdlNh46enuSfbR7VV/giphy.gif) |

## [**Aura Documentation**](#aura-documentation)

Like with Apex Documentation, Aura Helper can create the **Aura Documentation file** for any component with a few clicks based on a user defined template. If you comment the Controller and Helper files with the Standard Javascript comment schema, Aura Helper can extract the data to include it into the Aura Documentation.

To create the Aura Documentation only need to run the command **AuraHelper: Generate Aura Documentation** with the Aura doc file active, or can select the file and `rigth click` to open contextual menu and select **AuraHelper: Generate Aura Documentation**. When you execute the command **Aura Helper: Create Aura File** and choose Aura Documentation file, Aura Helper will create the file with the documentation generated.

|  |  |
| :--- | :---: |
| ![Aura Documentation Example 1](https://i.imgur.com/IPwVJHy.gif) | ![Aura Documentation Example 2](https://i.imgur.com/SHmaVYH.gif) |

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
