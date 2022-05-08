# Change Log
All notable changes to this project will be documented in this file.

## [4.1.3 - 2022-05-08]
### Added
- Enhanced Custom Labels Editor. Now can create the file if not exists.

### Fixed
- Fixed Custom Labels Editor because not save new labels
- Fixed the "undefined" word in tile when add new custom label

## [4.1.2 - 2022-04-10]
### Fixed
- Fixed Permission Editor Tool when edit some profiles or permission sets.

## [4.1.1 - 2022-01-09]

### Fixed
- Fixed an unexpected behaviour with newLinesBetweenCodeBlockMembers format option

## [4.1.0 - 2021-12-19]
- Improve performance of some processes
- Added Aura Helper SFDX Plugin to replace Aura Helper CLI
- Now if active **Aurahelper > Api > Use Aura Helper CLI** will be use Aura Helper SFDX Plugin instead Aura Helper CLI
- Added control to install and update Aura Helper SFDX instead Aura Helper CLI
- Improve and enhance performance
- Maintenance support to Aura Helper CLI v4.0.3 (Last version)

### Fixed
- Fixed compress xml error with some xml array fields
- Fixed Apex formatter error with subqueries as projection

## [4.0.0 - 2021-12-13]
### Added
- Changed to typescript
- Added support to API v53.0
- Add better support to projects with Metadata API Format
- Improve general performance about 60-70%
- Improve initialization
- Enhance **AuraHelper: Refresh All SObjects Definitions** to load definitions too much faster (improve speed about 95%)
- Enhance **List and describe Metadata Types from org** too much faster (improve speed about 95%)

### Fixed
- Fix all minor found errors
- Fix Apex formatter error when has .class... into the code

## [3.1.8 - 2021-11-18]
### Added
- Update package references
- Added new setting **AuraHelper > Metadata > Group Global Quick Actions** (true by default) to group global quick actions on GlobalActions group under Quick Actions Metadata Type when list and describe Metadata types

### Fixed
- Fixed some errorss when describe and add to package Global Quick Actions (also when process from git or from other packages)
- Fixed some errors when ignore metadata from files.
  
## [3.1.7 - 2021-10-7]
### Fixed
- Fixed errors when format some query clauses.

## [3.1.6 - 2021-10-7]
### Added
- Added new option to Metadata Comparator to retrieve data from org when compare with local.

### Fixed
- Fixed some problems on initializationn with new projects
- Fixed security problems with some package versions
- Fixed minor errors with Apex Code Watcher in some cases

## [3.1.5 - 2021-10-6]
### Added
- Added new GIFS to README
- Modify README to make info more clear
- Optimize Refresh SObject Definition command

### Fixed
- Fixed some errors when Refresh SObject Definition
- Fixed some errors with Retrieve Special Types
- Fixed not show info when ignore metadata finished sucesfully

## [3.1.4 - 2021-10-5]
### Added
- Added new GIFS to README

### Fixed
- Fixed README errors
- Fixed error with Package Generator because not show some create options when create from Local
- Fixed minor error with Custom Labels editor

## [3.1.3 - 2021-10-4]
### Added
- Updated README with more features, better explanations and more example gifs

### Fixed
- Fixed some errors on IntelliSense in some special cases
- Fixed some errors on Aura Helper init in some special cases with has malformed files into the project
- Fixed error with comment indentation in some cases
- Fixed errors removing some tags from comments when has no data
- Fixed errors when update Aura Helper CLI


## [3.1.2 - 2021-09-30]
### Added
- Formatter enhanced to get tabsize and tab spaces to format apex correct.
- Fixed and enhanced IntelliSense
- Added **AuraHelper: Help** command to open Aura Helper Wiki with entire documentation

## [3.1.1 - 2021-09-29]
### Fixed
- Fixed little problems with IntelliSense

## [3.1.0 - 2021-09-29]
### Added
- Enhanced IntelliSense node identification to provide the better IntelliSense recomendation for Salesforce (including Salesforce Official Extensions).
- Fully IntelliSense suport for sets, lists and maps, including the most complicated structures like Map\<Id, Map\<Id, List\<Map\<Id, String\>\>\>\>....
- Added new hover information with the same style that IntelliSense recomendations to provide the better hover information for salesforce.
- Fully support to hover information, including Custom Labels, fields, lists, maps, system classes, methods, sobjects...
- Added new Setting to enable or disable hover recomendations **AuraHelper > Intelli Sense > Enable Hover Information**
- Added new Setting to use the Standard Java Comments Template style or your custom Apex Comment Template **AuraHelper > Documentation > Use Standard Java Comments**

### Fixed
- Fixed little errors when refreshing SObject definitions

## [3.0.3 - 2021-09-21]
### Fixed
- Fixed some problems with Apex Formatter in some special cases.
- Fixed repository in package

## [3.0.2 - 2021-09-21]
### Added
- Enhanced IntelliSense recomendations descriptions to a better and clear information.

### Fixed
- Fixed some problems with Apex Formatter in some special cases.
- Fixed some problems with Picklist Values IntelliSense.

## [3.0.1 - 2021-09-20]
### Added
- Added validation to check if has any org on project before to connect with salesforce
- Added project file watcher to update some information when change auth org

### Fixed
- Fixed some problems in special scenarios when try to describe metadata
- Fixed minor problems with some IntelliSense suggestion descriptions

## [3.0.0 - 2021-09-18]
### Added
- The v3.0.0 is the biggest Update of Aura Helper Extension. This versión implements the Aura Helper Framework created in nodeJS. This framework are robust, faster and better than the old Aura Helper Code, this framework are fully tested. Aura Helper Framework is an open source framework to provide tools to any developer to create applications for salesforce. Aura Helper Extension and Aura Helper CLI use it.

- Added **Aura Helper Framework Modules** to enhance, reuse and optimize code and processes.
- Enhance general Aura Helper performance and make it more stable.
- Added **new configuration option: Aurahelper => Api => Use Aura Helper CLI** to use Aura Helper CLI or Aura Helper Framework in some processes. If use Aura Helper CLI, some processes will be execute outside VSCode (Recommended for PCs with low resources). If this options is not selected, all processes execute into VSCode context, faster but need more resources.
- Added **new keyword on Aura Documentation Template** {method.return} to add return information from comment to Aura Documentation automatic generator based on your templates.
- Added new **Apex Comment Template** system to create enhanced comments. You can create custom tags on comments to process information. Can select a data source to any tag and tag keyword to fill it automatically.
- Added a **better Apex comment** processing to extract data from comments and tags with more precission.
- Improve the **Refresing SObjects Index** on initialization to refresh only not existing definitions to load it faster.
- Enhanced **VSCode Output Panel** with a Symbol Provider to provide *outline information* of **Metadata XML** Files, **Aura** Files (Components, Apps and Events) and **Apex Code** files. Show more and better information that the standard Apex Outline.
- Added new configuration option to sort the Sort Order for XML Files. **aurahelper.metadata.XmlSortOrder** --> **Aurahelper › Metadata: Xml Sort Order**
- Enhance **AuraHelper: Modify Permissions**. Now work better with several files and suggest the field values better according the rest of values in the other files to edit.
- Added support to **Muting Permission Set** on  *Aura Helper: Modify Permissions* and *Aura Helper: Permission Editor*
- Enhanced **AuraHelper: Custom Labels Editor** to work faster and better, maintenance fields integrity and prevent accidental changes. Can validate fields and labels to avoid errors and create, edit and remove Labels from file and org. Added better messages and information to the user to make it usefull.
- Enhanced **AuraHelper: Package Generator** command to work better. Now has option windows to reduce the number of clicks and options to handle better. Metadata Loading are integrated into the component to make it more usefull. Changed icons and messages to make more easy to use.
- Enhanced **AuraHelper: Metadata Comparator** To show the progress download and change icons and delete process to make it more usefull and faster.
- Enhanced **AuraHelper: Permission Editor** to work better and add support to muting permission set, added new message and icons to make it more usefull. Added options menu to select compress or deploy the modified files. 
- Enhanced **AuraHelper: Retrieve Special Types** to work better with VSCode GUI and the Metadata Selector Input from Aura Helper. Now its more usefull and easy. Also has new icons.
- Enhanced **AuraHelper: Repair Project Dependencies** to work better with VSCode GUI and the Metadata Selector Input from Aura Helper. Now support more objects to repair or check dependencies and better menu options. Also has new icons.
- Enhanced **Apex Code IntelliSense** provided by Aura Helper. Identify all nodes and provide better recomendations. Improve performance and stability and analize code faster. Probably one of the best IntelliSense recomendations for Salesforce Apex Code.
- Enhanced **Aura Code IntelliSense** (Components and JavaScript Files) provided by Aura Helper. Identify all nodes and provide better recomendations. Improve performance and stability and analize code faster. Probably one of the best IntelliSense recomendations for Salesforce Aura Code.
- Change Activation word to get Javascript Snippets. Now is **js.** instead **aura.**
- Added synonym to **js.JSONPrettyConsole** snippet. Now can use also **js.PrintJSONPretty** 


### Changed
- Changed All commands to work with **Aura Helper Framework**
- Removed the entire old code to replace with **Aura Helper Framework**
- Change all Code Completion providers to work with **Aura Helper Framework Languages Modules** to enchange code analyzing to improve performance and make better recomendations.
- Change Aura Helper **initialization** to improve performance and initialize faster and stable.
- Changed **Apex Comment Template** to a *better and more complete system* to able use many tags into the comments (all tags available in Javadoc and Javascript standard) and your own defined tags. The old templates will be replaced with the new templated but trying to respect your latest defined templates format.
- Changed **Icons** used by Aura Helper to addapt better to VSCode Style and make it clears.
- Removed **Aura Helper Outline View** to change it to **VSCode Outline panel** and enhance it to show all Salesforce Metadata Files. (XML Files, Aura Files, Classes, Triggers...)
- Remove **Aurahelper>Metadata>Merge Local Data Permissions** option because the profile editor works fine to add new elements.

### Fixed
- Fixed minor errors with some Aura Helper messages
- Fixed all existing errors with the new Framework.

## [2.3.1 - 2021-02-02]
### Changed
- Changed commands **AuraHelper: Add To Profile(s)** and **AuraHelper: Add To PermissionSet(s)** to combine into one command **AuraHelper: Modify Permissions** to able to select modify profiles or permission sets. Also changed on contextual menus.

### Fixed
- Fixed some problems with Add to Profile and Add to Permissions commands


## [2.3.0 - 2020-10-21]
### Added
- Added **new commands** for modify permission from one element on one or several (or all) permission sets or profiles. For instance, modify enabled permission on apex classes on all profiles. This commands are **AuraHelper: Add To Profile(s)** or **AuraHelper: Add To PermissionSet(s)**
- Added **Max Projection Field Per Line** setting to format queries on Apex. This setting allow select the max projection fields on queries. To format all fields on the same line set value 0. This setting replace *One Projection Field Per Line*.
- **Better format on inner queries**.
- **New Logo** designed by Isabel García Sánchez - Ib (igarciasanchez00@gmail.com)

### Changed
- Updated minimum supported version for **Aura Helper CLI**.

### Fixed
- Fixed letter case on imports and requires for case sensitive systems like linux.

## [2.2.1 - 2020-08-07]
### Added
- Fixed some problems when check if Aura Helper CLI has the correct version

## [2.2.0 - 2020-08-07]
### Added
- Added new **Apex Formatter Setting** to format properties on a single line when has no body. *Settings > Aura Helper > Apex Format > Class Members > Single Line Properties*
- Added new control for check the Aura Helper CLI installed version for suggest an update for compatibility reasons.

### Fixed
- Fixed some on MAC OS X to improve compatibility. Now have fully support for Windows, Linux and Mac Systems.
- Fixed bug on apex formatter with some reserved keywords used as identifier
- Fixed a bug with implements interfaces command with salesforce system classes

## [2.1.0 - 2020-07-17]
### Added
- Added support to compare metadata between two Salesforce Organizations to the command **AuraHelper: Metadata Comparator**
- Added new command **AuraHelper: Ignore Metadata from Project** for ignore metadata types from your local project.
- Added Support for linux and mac operative systems.

### Changed
- Changed command **AuraHelper: Compare Org With Local** for **AuraHelper: Metadata Comparator** and added support for compare metadata between orgs.

### Fixed
- Fixed bug with whitespaces in some cases with apex formatter.

## [2.0.2 - 2020-07-15]
### Fixed
- Fixed a problem when refreshing apex classes definitions.

## [2.0.1 - 2020-07-15]
### Fixed
- Fixed a problem when refreshing apex classes definitions at first time. 

## [2.0.0 - 2020-07-06]
### Added
- Added **Aura Helper CLI** into Aura Helper for support complex operation and make *more powerfull* and *optimize* Aura Helper
- Added **new setting** for update the SObject Index when VSCode start and Aura Helper extension is active.
- Added **new setting** for select if use *Advance GUI* or *Standard GUI* (Standard GUI by defaut because use less resources and VSCode standard components)
- Added a **new system for select metadata** types and create packages without Advance GUI.
- **Optimized** for *single core* or *multi core* CPU's
- Added **AuraHelper: Clear Problems Panel** command for *clear problems output panel* 
- Added **new component** for *Edit XML Files without Advance GUI*. Use VSCode standard interface for *use less resources*.
- Enhance XML treatments for **support all Salesforce API Versions** (Supported at the moment: Profiles, Permission Sets, Custom Labels).
- Added support for format switch statemets on Apex

### Changed
- Change **AuraHelper: Compress XML File** command for use *Aura Helper CLI*. Now its more faster and use less resources.
- Change **AuraHelper: Compress ALL XML Files** command for use *Aura Helper CLI*. Now its more faster and use less resources.
- Change Command **"AuraHelper: Match Org with Local** for **AuraHelper: Compare Org With Local**
- Change **AuraHelper: Compare Org With Local** command for use *Aura Helper CLI* for optimize resources and make it more faster
- Change Commands **AuraHelper: Retrieve Full Profile(s)**, **AuraHelper: Retrieve Full Permission Set(s)**, **AuraHelper: Retrieve Full Record Type(s)** for **AuraHelper: Retrieve Special Types**
- Chage **AuraHelper: Retrieve Special Types** for use *Aura Helper CLI* for make it more faster and optimize resources. Now support more types for retrieve (*Record Types, Profiles, Permission Sets, Translations and only Custom Object XML File*). Also support retrieve All types at time, select multiple types or a single type selection.
- Change **AuraHelper: Repair Project Dependencies** for use *Aura Helper CLI*. Now its more powerfull and can repair errors automatically or only check errors and show it to the user on Problems panel for repair manually.
- Change **AuraHelper: Refresh Metadata Index** for **AuraHelper: Refresh All SObjects Definitions** and modify command for use  Aura Helper CLI.
- Change **AuraHelper: Refresh Metadata Index for Object** for **"AuraHelper: Refresh SObject Definition** and modify command for use  Aura Helper CLI.
- Change **AuraHelper: Package Generator** for use *Aura Helper CLI*. Now its more powerfull and use less resources. Also, the option for select metadata from git its more accurate for create packages from git differences.
- Change **AuraHelper: Open Custom Labels on UI** for use *Aura Helper CLI*. Now its more powerfull and use less resources.
- Change **AuraHelper: Compare Org With Local** for work with Advance GUI or Standard GUI.
- Change **AuraHelper: Package Generator** for work with Advance GUI or Standard GUI
- Enhance commands **AuraHelper: Retrieve Special Types** and **AuraHelper: Repair Project Dependencies** for give more control and granularity to the user for select elements
- Change **AuraHelper: Open Permission Set on UI** and **AuraHelper: Open Profile on UI** for combine on one command **AuraHelper: Permission Editor**
- Change **AuraHelper: Permission Editor** command for use Aura Helper CLI, and optionally, the new Permission Editor Component with Standard VSCode GUI for use less resources.
- Change **AuraHelper: Open Custom Labels on UI** command for **AuraHelper: Custom Labels Editor** and use Aura Helper CLI and optinally, the new Custom Labels Editor Component with Standard VSCode GUI for use less resources.
- **Advance GUI are disabled** until improve it to use less resources and make it better, more flexible and accesible.
- **Increase Apex Formatter performance**. Now is 100% faster.


### Fixed
- Fixed **Apex formatter** for correct format inner class fields.
- Fixed **Apex formatter** for correct format of instanceof operator.
- Fixed **Apex formatter** for correct format of string on mutiple lines.
- Fixed **Apex formatter** for correct format comments on enums.
- Fixed **Apex formatter** for correct format SObejcts on first line of a body (after curly bracket).
- Fixed **Apex formatter** for correct format unary operators (+X, -X, ++X, --X, X--, X++)
- Fixed some bugs with **autocompletion tools** on apex and queries.

## [1.9.4 - 2020-04-15]
### Fixed
- Fixed problems with repair project dependencies
- Fixed problems with retrieve full profiles and permission sets

## [1.9.4 - 2020-03-12]
### Added
- Add repair dependencies command
- Add Retrieve Full RecordTypes command (work like Retrieve full profiles)
- Added option for keep blank lines on code for the Apex Formatter

### Changed
- Changed retrieve full profiles and retrieve full permission set commands

### Fixed
- Fixed  some bugs with XML files compression

## [1.9.3 - 2020-03-18]
### Fixed
- Fixed bug with format on save

## [1.9.2 - 2020-03-18]
### Fixed
- Fixed bugs with queries format

## [1.9.1 - 2020-03-17]
### Fixed
- Fixed bugs with apex formatter

## [1.9.0 - 2020-03-16]

### Added
- Added new command to generate project documentation automatically similar to salesforce official doc with navigable links on datatypes (both, custom and standard). To do this, it uses the classes stored locally together with the comments of methods, classes and variables that match the established template.
- Added support for creating comments for class variables so that they can be analyzed later to generate documentation
- Added Commands for implements interfaces and extended classes automatically - abstract and virtual methods - (only not implemented methods)
- Added support for more than 600 standard classes (Now support all apex classes, more than 1000)
- New Apex Formatter. Optimized at least 30% and added options for format style configuration.
- Added configuration option for merge profiles or permissions set permissions with the local data (if not exists in file)
<!-- - Added Apex Analysis for better code practices and detect erros or problematic code:
    - Code Complexity Measurement based on the model proposed by T.J. McCabe (1976) https://ieeexplore.ieee.org/document/1702388 -->

### Changed
- Better Code Completion Options for Apex Code
- Optimized to find code completions suggestions
- Enhanced custom Apex Tokenizer and Parser for Better code completion suggestions
- Added support for refresh profiles and permission sets with all objects or only objects from the org namespace

### Fixed
- Fixed some bugs with autocompletions tools that not shown inherited elements for apex classes.
- Fixed bugs with XML Compresion Tool
- Fixed a little bug when mathing org and local

## [1.8.0 - 2020-01-23]
### Added
- Autocomplete support for Custom Labels. It is necessary to have them downloaded in the project. Work in Apex, Lightning and Javascript
- Autocomplete tools for Picklist values. Aura Helper list all available picklist values for each field object, and can select it for pick the value (Example => Account.picklistfield.picklistValue => 'picklistValue')
- Added new GUI on Advance Graphic Interface for manage Custom Labels on VSCode
- Multilanguage Support for the Advanced Graphic Interface (English and Spanish). Select It from Aura Helper's Configuration
- Added setting for choose to use a custom api version for download metadata.

### Changed
- Better Package Generator with support for create destructive packages, full packages and the posibility to select metadata from git differences. Optimized download metadata from org. 50% faster.
- Optimized refreshing metadata index for all object. 67% faster.
- Optimized Matching Org with Local command. Download Org Metadata 50% faster.

### Fixed
- Fixed bugs with Apex Method Params autocompletion tool on Javascript code
- Fixed little bugs with code completion on Aura Components
- Fixed little bugs with Apex Formatter

## [1.7.0 - 2020-01-10]
### Added
- Compress XML Files for better git management and performance
- Include Local Metadata Management for Permission Sets
- Retrieve full Permission Set(s) permissions
- Package Generator (From local or from Org)
- Create Graphic User Interface Engine for better experience
- Added Help in different languages (English and Spanish)
- Added Support for Code Suggestion on lightning component tags attribute's values like varian, size...(It has support for most types and attributes)
- Added Tool for Match Org content with Local content (delete metadata that not exists in local, user can choose the metadata for delete)

### Changed
- Optimized Refresh Metadata Index Commands
- Better Help 


### Fixed
- Fixed some problem with New Aura File Command
- Fixed bugs with Code Completion Tools

## [1.6.1 - 2019-12-11]
- Fixed some probles with dependencies

## [1.6.0 - 2019-12-11]
### Added
- Compress Profile files
- Include Local Metadata Management for Profiles
- Retrieve full Profile(s) permissions

## [1.5.1 - 2019-11-28]
### Fixed
- Fixed issues with autocompletion tools
- Fixed formatter issues
- Change File Structure View name for Outline

## [1.5.0 - 2019-11-07]
### Added
- Added autocompletion tools for SObjects and Classes (Support custom and more than 400 standard classes)
- Better code formatter
- Added a new view for explore the file structure.

### Fixed
- Fixed issues with autocompletion tools on queries
- Fixed classes autocompletion tools

## [1.4.1 - 2019-09-26]
### Fixed
    - Fixed some bugs with Apex Formatter

## [1.4.0 - 2019-09-24]
### Added
- Apex Code Formatter

## [1.3.0] - 2019-09-17
### Added
- Autocompletion for Attributes on Components and Javascript files if are sobjet types
- Support for queries completion on Apex and Lightning
- Autocompletion Support for some attribute types
- Added support for call and use easy more standard components (custom components are fully supported)

### Fixed
    - Fixed some bugs

## [1.2.0] - 2019-09-11
### Added
- Support for getting apex method parameters from JavaScript with "c.[methodName].params"
- Refresh Metadata Index command
- Refresh Metadata Index for Object command

### Fixed
- Fixed bugs with Apex Comment completion
- Fixed bugs when getting inherited apex controller methods

## [1.1.0] - 2019-09-09
### Added
- Added Settings for control if use autocompletion tools and code suggest

- Added Ligtning Snippets Variations
    - ltn.buttonBrand
    - ltn.buttonNeutral
    - ltn.buttonDestructive
    - ltn.buttonSuccess

- Added SLDS Snippets
    - slds.modal
    - slds.modalLtn
    - slds.modalTagline
    - slds.modalTaglineLtn
    - slds.modalHeadless
    - slds.modalHeadlessLtn
    - slds.modalFootless
    - slds.modalFootlessLtn
    - slds.modalDirectional
    - slds.modalDirectionalLtn

### Changed
- Improve code completion tools for make more easy work with Lightning
    - Call custom or standard componentes with autocompletion attributes (only appear not used)

## [1.0.0] - 2019-09-07
### Added
- Commands:
    - AuraHelper: Help
    - AuraHelper: Edit Apex Comment Template

- Better Code performance

- Code Completion Provider
    - v.[attributeName]
    - c.[functionName] (On .cmp files)
    - c.[methodName] (On .js files)
    - helper.[functionName] (On .js files)
    - c:[Component|Event|Application]

- Menus
    - Explorer
        - AuraHelper: New Aura File (Now also active when click on aura bundle folder)

- Code Completion Snippets:
    - aura.if
    - aura.iteration
    - aura.onLocationChange
    - aura.onSystemError
    - aura.onValueChanged
    - aura.onDestroy
    - aura.onRender


    - ltng.style
    - ltng.script
    - ltng.styleAfterLoad
    - ltng.scriptAfterLoad


    - force.recordView
    - force.recordEdit
    - force.recordData
    - force.outputField
    - force.inputField
    - force.canvasApp
    - forceChatter.feed


    - forceCommunity.appLauncher
    - forceCommunity.notifications
    - forceCommunity.routeLink
    - forceCommunity.waveDashboard


    - ltn.accordion
    - ltn.accordionSection
    - ltn.accSection
    - ltn.avatar
    - ltn.breadcrumbs
    - ltn.breadcrumb
    - ltn.button
    - ltn.buttonGroup
    - ltn.buttonGrp
    - ltn.buttonIcon
    - ltn.buttonIconStateful
    - ltn.buttonMenu
    - ltn.buttonStateful
    - ltn.card
    - ltn.carousel
    - ltn.carouselImage
    - ltn.checkboxGroup
    - ltn.checkboxGrp
    - ltn.chkgrp
    - ltn.clickToDialService
    - ltn.clickToDial
    - ltn.combobox
    - ltn.container
    - ltn.datatable
    - ltn.dualListBox
    - ltn.dynamicIconEllie
    - ltn.dynamicIconEQ
    - ltn.dynamicIconStrength
    - ltn.dynamicIconTrend
    - ltn.dynamicIconWaffle
    - ltn.fileCard
    - ltn.fileUpload
    - ltn.flexipageRegionInfo
    - ltn.flow
    - ltn.formattedAddress
    - ltn.formattedAddressMap
    - ltn.formattedDate
    - ltn.formattedTime
    - ltn.formattedDateTime
    - ltn.formattedEmail
    - ltn.formattedLocation
    - ltn.formattedName
    - ltn.formattedNameShort
    - ltn.formattedNumberDecimal
    - ltn.formattedNumberCurrency
    - ltn.formattedNumberPercent
    - ltn.formattedPhone
    - ltn.formattedRichText
    - ltn.formattedText
    - ltn.formattedUrl
    - ltn.helptext
    - ltn.icon
    - ltn.inputDate
    - ltn.inputDateTime
    - ltn.inputTime
    - ltn.inputColor
    - ltn.inputFile
    - ltn.inputText
    - ltn.inputEmail
    - ltn.inputPassword
    - ltn.inputPwd
    - ltn.inputTelephone
    - ltn.inputUrl
    - ltn.inputNumber
    - ltn.inputCheckbox
    - ltn.inputChk
    - ltn.inputCheckboxButton
    - ltn.inputChkBtn
    - ltn.inputToggle
    - ltn.inputRadio
    - ltn.inputSearch
    - ltn.inputAddress
    - ltn.inputField
    - ltn.inputLocation
    - ltn.inputName
    - ltn.inputRichText
    - ltn.inputRichTextBottom
    - ltn.layout
    - ltn.layoutSpaceCenter
    - ltn.layoutSpaceStretch
    - ltn.layoutSpreadCenter
    - ltn.layoutSpreadStretch
    - ltn.layoutItem
    - ltn.listView
    - ltn.map
    - ltn.menuItem
    - ltn.menuItemUrl
    - ltn.navigation
    - ltn.navigationItemApi
    - ltn.omniToolkitApi
    - ltn.outputField
    - ltn.overlayLibrary
    - ltn.path
    - ltn.picklistPath
    - ltn.pill
    - ltn.pillUrl
    - ltn.pillAvatar
    - ltn.pillAvatarUrl
    - ltn.pillIcon
    - ltn.pillIconUrl
    - ltn.pillContainer
    - ltn.progressBar
    - ltn.progressBarCircular
    - ltn.progressIndicator
    - ltn.progressIndicatorPath
    - ltn.quickActionApi
    - ltn.quipCard
    - ltn.radioGroup
    - ltn.radioGroupBtn
    - ltn.recordEditFormForCreate
    - ltn.recordEditForm
    - ltn.recordForm
    - ltn.recordViewForm
    - ltn.relativeDateTime
    - ltn.select
    - ltn.slider
    - ltn.spinner
    - ltn.tab
    - ltn.tabset
    - ltn.textArea
    - ltn.tile
    - ltn.tileIcon
    - ltn.tileAvatar
    - ltn.tree
    - ltn.treeGrid
    - ltn.unsavedChanges
    - ltn.utilityBarApi
    - ltn.verticalNavigation
    - ltn.verticalNavigationItem
    - ltn.verticalNavigationItemBadge
    - ltn.verticalNavigationItemIcon
    - ltn.verticalNavigationOverflow
    - ltn.verticalNavigationSection
    - ltn.workspaceAPI


    - ltnCommunity.backButton

    
    - ltnSnapin.minimizedAPI
    - ltnSnapin.prechatAPI
    - ltnSnapin.settingsAPI


    - ui.actionMenuItem
    - ui.button
    - ui.checkboxMenuItem
    - ui.inputCheckbox
    - ui.inputCurrency
    - ui.inputDate
    - ui.inputDateTime
    - ui.inputEmail
    - ui.inputNumber
    - ui.inputPhone
    - ui.inputRadio
    - ui.inputSecret
    - ui.inputSelect
    - ui.inputSelectMultiple
    - ui.inputSelectDynamic
    - ui.inputSelectOption
    - ui.inputText
    - ui.inputTextArea
    - ui.inputURL
    - ui.menu
    - ui.menuItemSeparator
    - ui.menuList
    - ui.menuTriggerLink
    - ui.messageConfirm
    - ui.messageInfo
    - ui.messageWarning
    - ui.messageError
    - ui.outputCheckbox
    - ui.outputCurrency
    - ui.outputDate
    - ui.outputDateTime
    - ui.outputEmail
    - ui.outputNumber
    - ui.outputPhone
    - ui.outputRichText
    - ui.outputText
    - ui.outputTextArea
    - ui.outputURL
    - ui.radioMenuItem
    - ui.scrollerWrapper

### Changed
- Modified command "AuraHelper: Edit Aura Doc Base Template" for "AuraHelper: Edit Aura Documentation Template"
- Delete command AuraHelper: Edit Aura Doc Method Template
- Delete command AuraHelper: Edit Aura Doc Method Parameter Template

## [0.1.2] - 2019-09-02
### Added
- Application Icon modified

## [0.1.1] - 2019-09-02
### Added
- Application Icon

- Commands:
    - AuraHelper: Edit Aura Doc Base Template
    - AuraHelper: Edit Aura Doc Method Template
    - AuraHelper: Edit Aura Doc Method Parameter Template


### Fixed
- Fixed some bugs with language recognition for use the snippets

## [0.1.0] - 2019-09-01
### Added
- Commands:
    - AuraHelper: Generate Aura Documentation
    - AuraHelper: Add Method Block to Doc
    - AuraHelper: Add Apex Comment
    - AuraHelper: Add Javascript Aura Function
    - AuraHelper: New Aura File

- Code completion for javascript, aura and apex

- Menus
    - Explorer
        - AuraHelper: New Aura File
