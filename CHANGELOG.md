# Change Log
All notable changes to this project will be documented in this file.
## [2.1.1 - 2020-07-XX]
### Added
- Added new **Apex Formatter Setting** to format properties on a single line when has no body. *Settings > Aura Helper > Apex Format > Class Members > Single Line Properties*
- Added new control for check the Aura Helper CLI installed version for suggest an update for compatibility reasons.

### Fixed
- Fixed some on MAC OS X  to  improve compatibility. Now have fully support for Windows, Linux and Mac Systems.
- Fixed bug on apex formatter with some reserved keywords used as identifier
- Fixed a bug with implements interfaces command with salesforce system classes

## [2.1.0 - 2020-07-XX]
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
