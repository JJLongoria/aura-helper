# Aura Helper
Extension for Salesforce and Lightning Experience with some tools for make more easy the development work. 

## Features

The Aura Helper Extension contains some of next features:

### Help
    - Run command "Aura Helper: Help" for open a navigable help with more information about the Aura Helper

### Format Code
    - Format Apex code with Ctrl+Atl+F

### File Structure View
    - Added a new view for explore the file structure. You can see al classes, interfaces, components... member and go to it with one click

### Local Metadata Management
#### Metadata
    - Compress XML Metadata Files for better git management and performance
    - Package Generator (From local or from Org)

#### Profiles
    - Compress profile files
    - Manage profile with custom UI on VSCode
    - Retrieve full Profile(s) permissions

#### Permission Sets
    - Compress permission sets files
    - Manage permission sets with custom UI on VSCode
    - Retrieve full Permission Set(s) permissions

### Commands features
Some commands with tools for help in your work. All commands start with "AuraHelper:"

#### Code Completion:
    - Refresh Metadata Index: Refresh the Aura Helper metadata index for support Code Completion tools with sObjects and queries.
    - Refresh Metadata Index for Object: Refresh the Aura metadata index for spececific object.

#### Aura:
    - Generate Aura Documentation: A simple command for generate a skeleton of aura documentation file for an Aura Component based on user designed templates.
                            If you create JavaScript comments with JavaScript standard scheme, method information will be filled automatically.
    - Add Method Section: Add a method section based on template to documentation file if you need modify it.
                        If method have JavaScript comment with JavaScript standard scheme, method information will be filled automatically.
    - New Aura File: Create a new Aura File for Aura Component Bundle. If you select an Aura Documentation File, it will be created based on the template.
    - Edit Aura Documentation Template: Command for edit Aura Documentation Template for Aura Components.
    - Edit Apex Comment Template: Command for edit Apex Comment Template for Apex Code.

#### Apex:
    - Add Apex Comment: Add a class or method comment on your apex code

#### JavaScript:
    - Add Javascript Aura Function: Add an Aura Javascript function block with params number indicated by the user

### Code Completion features

    Call components easy, construct components easy, complet code easy, make your work more easy. To many snippets and code completion tools for make your work more productive:

#### Query Support:
both in apex and lightning code (.cmp, .js ...) Aura Helper has support for autocomplete queries with fields and subfields of objects

#### Aura (Lightning):

##### - Get Aura Attributes:
You can get any component attributes (even the inherited) on .cmp files and .js files
Only need type: "v." and you can show and use all attributes. If the attribute is a SObject you can get all fields from it like in Apex Code

Also Aura Helper support for list the available types for to much attributes.

##### - Get JavaScript Controller functions:
You can get any controller functions (even the inherited) on .cmp files
Only need type: "c." and you can show and use all functions.

##### - Get JavaScript Helper functions:
You can get any helper functions (even the inherited) on .js files
Only need type: "helper." and you can show and use all functions.

##### - Get Apex Controller methods:
You can get any Apex controller methods (even the inherited) on .js file
Only need type: "c." and you can show and use all methods.
If you type "c.{methodName}.params" you get the JSON structure with method parameters

##### - Call Custom Component
You can get and call all Components, Events or Apps for .cmp files and .js files
Only need type: "c:" and you can show, use and call Componentes.
If you type <c:ComponentName You can get all attributes of the component for call it. Only appears not used attributes for easy component constructions.

##### - Aura NS
    - aura.attribute: Create Aura Attribute (aura:attribute)
    - aura.handler: Create Aura Handler (aura:handler)
    - aura.initHandler: Create Initialization Component Aura Handler (aura:handler)
    - aura.eventHandler: Create Aura Component Event Handler (aura:handler)
    - aura.appEventHandler: Create Aura Application Event Handler (aura:handler)
    - aura.onLocationChange: Create Aura Location Change Handler Code Unit (aura:handler)
    - aura.onSystemError: Create Aura System Error Handler Code Unit (aura:handler)
    - aura.onValueChanged: Create Aura Value Changed Handler Code Unit (aura:handler)
    - aura.onDestroy: Create Aura Component Destroy Handler Code Unit (aura:handler)
    - aura.onRender: 
    - aura.registerEvent: Create Aura Event Registration (aura:registerEvent)
    - aura.renderIf: Create Aura Render If Code Unit (aura:renderIf)
    - aura.if: Create Aura If Code Unit (aura:if)
    - aura.iteration: Create Aura Iteration Code Unit (aura:iteration)
    
##### - Ltng NS
    - ltng.style: Create ltng Required for CSS Style (ltng:require)
    - ltng.script: Create ltng Required for load scripts (ltng:require)
    - ltng.styleAfterLoad: Create ltng Required for CSS Styles  with afterScriptsLoaded attribute (ltng:require)
    - ltng.scriptAfterLoad: Create ltng Required for load scripts with afterScriptsLoaded attribute (ltng:require)

##### - Force NS
    - force.recordView: Create Force Record View Code Unit (force:recordView)
    - force.recordEdit: Create Force Record Edit Code Unit (force:recordEdit)
    - force.recordData: Create Force Record Data Code Unit (force:recordData)
    - force.outputField: Create Force Output Field Code Unit (force:outputField)
    - force.inputField: Create Force Output Field Code Unit (force:inputField)
    - force.canvasApp: Create Force Canvas App Code Unit (force:canvasApp)

##### - Force Chatter NS
    - forceChatter.feed: Create Force Chatter Feed Code Unit (forceChatter:feed)
    - forceChatter.publisher: Create Force Chatter Publisher Code Unit (forceChatter:publisher)

##### - Force Community NS
    - forceCommunity.appLauncher: Create Force Community App Launcher Code Unit (forceCommunity:appLauncher)
    - forceCommunity.notifications: Create Force Community Notifications Code Unit (forceCommunity:notifications)
    - forceCommunity.routeLink: Create Force Community Route Link Code Unit (forceCommunity:routeLink)
    - forceCommunity.waveDashboard: Create Force Community Wave Dashboard Code Unit (forceCommunity:waveDashboard)

##### - Lightning NS
    - ltn.accordion: Create Lightning Accordion Code Unit (lightning:accordion).
    - ltn.accordionSection: Create Lightning Accordion Code Unit (lightning:accordionSection). Alternative: ltn.accSection
    - ltn.avatar: Create Lightning Avatar Code Unit (lightning:avatar)
    - ltn.breadcrumbs: Create Lightning Breadcrums Section Code Unit (lightning:breadcrumbs)
    - ltn.breadcrumb: Create Lightning Breadcrum Code Unit (lightning:breadcrumb)
    - ltn.button: Create Lightning Button Code Unit (lightning:button)
    - ltn.buttonBrand: Create Lightning Button Brand Code Unit (lightning:button)
    - ltn.buttonNeutral: Create Lightning Button Neutral Code Unit (lightning:button)
    - ltn.buttonDestructive: Create Lightning Button Destructive Code Unit (lightning:button)
    - ltn.buttonSuccess: Create Lightning Button Success Code Unit (lightning:button)
    - ltn.buttonGroup: Create Lightning Accordion Code Unit. Alternative: ltn.buttonGrp
    - ltn.buttonIcon: Create Lightning Button Icon Code Unit (lightning:buttonIcon)
    - ltn.buttonIconStateful Create Lightning Button Icon Stateful Code Unit (lightning:buttonIconStateful)
    - ltn.buttonMenu: Create Lightning Button Menu Code Unit (lightning:buttonMenu)
    - ltn.buttonStateful: Create Lightning Button Stateful Code Unit (lightning:buttonStateful)
    - ltn.card: Create Lightning Card Code Unit (lightning:card)
    - ltn.carousel: Create Lightning Carousel Code Unit (lightning:carousel)
    - ltn.carouselImage: Create Lightning Carousel Image Code Unit (lightning:carouselImage)
    - ltn.checkboxGroup: Create Lightning Check Box Group Code Unit (lightning:checkboxGroup). Alternative: ltn.checkboxGrp, ltn.chkgrp
    - ltn.clickToDialService: Create Lightning Click to Dial Service Code Unit (lightning:clickToDialService)
    - ltn.clickToDial: Create Lightning Click to Dial Code Unit (lightning:clickToDial)
    - ltn.combobox: Create Lightning Combobox Code Unit (lightning:combobox)
    - ltn.container: Create Lightning Container Code Unit (lightning:container)
    - ltn.datatable: Create Lightning Data Table Code Unit (lightning:datatable)
    - ltn.dualListBox: Create Lightning Dual List Box Code Unit (lightning:dualListbox)
    - ltn.dynamicIconEllie: Create Lightning Dynamic Icon Ellie Type Code Unit (lightning:dynamicIcon)
    - ltn.dynamicIconEQ: Create Lightning Dynamic Icon EQ Type Code Unit (lightning:dynamicIcon)
    - ltn.dynamicIconStrength: Create Lightning Dynamic Icon Strength Type Code Unit (lightning:dynamicIcon)
    - ltn.dynamicIconTrend: Create Lightning Dynamic Icon Trend Type Code Unit (lightning:dynamicIcon)
    - ltn.dynamicIconWaffle: Create Lightning Dynamic Icon Waffle Type Code Unit (lightning:dynamicIcon)
    - ltn.fileCard: Create Lightning File Card Code Unit (lightning:fileCard)
    - ltn.fileUpload: Create Lightning File Upload Code Unit (lightning:fileUpload)
    - ltn.flexipageRegionInfo: Create Lightning Flexi Page Region Info Code Unit (lightning:flexipageRegionInfo)
    - ltn.flow: Create Lightning Flow Code Unit (lightning:flow)
    - ltn.formattedAddress: Create Lightning Formatted Address Code Unit (lightning:formattedAddress)
    - ltn.formattedAddressMap: Create Lightning Formatted Address With Map Code Unit (lightning:formattedAddress)
    - ltn.formattedDate: Create Lightning Formatted Date Code Unit (lightning:formattedDateTime)
    - ltn.formattedTime: Create Lightning Formatted Time Code Unit (lightning:formattedDateTime)
    - ltn.formattedDateTime: Create Lightning Formatted Date Time Code Unit (lightning:formatedDateTime)
    - ltn.formattedEmail: Create Lightning Formatted Email Code Unit (lightning:formattedEmail)
    - ltn.formattedLocation: Create Lightning Formatted Location Code Unit (lightning:formattedLocation)
    - ltn.formattedName: Create Lightning Formatted Name Code Unit (lightning:formattedName)
    - ltn.formattedNameShort: Create Lightning Formatted Name Short Code Unit (lightning:formattedName)
    - ltn.formattedNumberDecimal: Create Lightning Formatted Decimal Number Code Unit (lightning:formattedNumber)
    - ltn.formattedNumberCurrency: Create Lightning Formatted Currency Code Unit (lightning:formattedNumber)
    - ltn.formattedNumberPercent: Create Lightning Formatted Percent Code Unit (lightning:formattedNumber)
    - ltn.formattedPhone: Create Lightning Formatted Phone Code Unit (lightning:formattedPhone)
    - ltn.formattedRichText: Create Lightning Formatted Rich Text Code Unit (lightning:formattedRichText)
    - ltn.formattedText: Create Lightning Formatted Text Code Unit (lightning:formattedText)
    - ltn.formattedUrl: Create Lightning Formatted Text Code Unit (lightning:formattedUrl)
    - ltn.helptext: Create Lightning Help Text Code Unit (lightning:helptext)
    - ltn.icon: Create Lightning Icon Code Unit (lightning:icon)
    - ltn.inputDate: Create Lightning Input Date Code Unit (lightning:input)
    - ltn.inputDateTime: Create Lightning Input DateTime Code Unit (lightning:input)
    - ltn.inputTime: Create Lightning Input Time Code Unit (lightning:input)
    - ltn.inputColor: Create Lightning Input Color Code Unit (lightning:input)
    - ltn.inputFile: Create Lightning Input File Code Unit (lightning:input)
    - ltn.inputText: Create Lightning Input Text Code Unit (lightning:input)
    - ltn.inputEmail: Create Lightning Input Email Code Unit (lightning:input)
    - ltn.inputPassword: Create Lightning Input Password Code Unit (lightning:input). Alternative: ltn.inputPwd
    - ltn.inputTelephone: Create Lightning Input Telephone Code Unit (lightning:input)
    - ltn.inputUrl: Create Lightning Input URL Code Unit (lightning:input)
    - ltn.inputNumber: Create Lightning Input Number Code Unit (lightning:input)
    - ltn.inputCheckbox: Create Lightning Input Checkbox Code Unit (lightning:input). Alternative: ltn.inputChk
    - ltn.inputCheckboxButton: Create Lightning Input Checkbox Button Code Unit (lightning:input). Alternative: ltn.inputChkBtn
    - ltn.inputToggle: Create Lightning Input Toggle Code Unit (lightning:input)
    - ltn.inputRadio: Create Lightning Input Radio Button Code Unit (lightning:input)
    - ltn.inputSearch: Create Lightning Input Search Code Unit (lightning:input)
    - ltn.inputAddress: Create Lightning Input Address Code Unit (lightning:inputAddress)
    - ltn.inputField: Create Lightning Input Field Code Unit (lightning:inputField)
    - ltn.inputLocation: Create Lightning Input Location Code Unit (lightning:inputLocation)
    - ltn.inputName: Create Lightning Input Name Code Unit (lightning:inputName)
    - ltn.inputRichText: Create Lightning Input Rich Text Code Unit (lightning:inputRichText)
    - ltn.inputRichTextBottom: Create Lightning Input Rich Text With Bottom Toolbar Code Unit (lightning:inputRichText)
    - ltn.layout: Create Lightning Simple Layout Code Unit (lightning:layout)
    - ltn.layoutSpaceCenter: Create Lightning Layout with Horizontal Align Space and Vertical Align Center Code Unit (lightning:layout)
    - ltn.layoutSpaceStretch: Create Lightning Layout with Horizontal Align Space and Vertical Align Stretch Code Unit (lightning:layout)
    - ltn.layoutSpreadCenter: Create Lightning Layout with Horizontal Align Spread and Vertical Align Center Code Unit (lightning:layout)
    - ltn.layoutSpreadStretch: Create Lightning Layout with Horizontal Align Spread and Vertical Align Stretch Code Unit (lightning:layout)
    - ltn.layoutItem: Create Lightning Basic Layout Item Code Unit (lightning:layoutItem)
    - ltn.listView: Create Lightning List View Code Unit (lightning:listView)
    - ltn.map: Create Lightning City Map Code Unit (lightning:map)
    - ltn.menuItem: Create Lightning Menu Item Code Unit (lightning:menuItem)
    - ltn.menuItemUrl: Create Lightning Menu Item for URL Code Unit (lightning:menuItem)
    - ltn.navigation: Create Lightning Navigation Service Code Unit (lightning:navigation)
    - ltn.navigationItemApi: Create Lightning Notification Library Code Unit (lightning:notificationsLibrary)
    - ltn.omniToolkitApi: Create Lightning Omni Toolkit API Code Unit (lightning:omniToolkitAPI)
    - ltn.outputField: Create Lightning Output Field Code Unit (lightning:outputField)
    - ltn.overlayLibrary: Create Lightning Overlay Library Code Unit (lightning:overlayLibrary)
    - ltn.path: Create Lightning Path Code Unit (lightning:path)
    - ltn.picklistPath: Create Lightning Picklist Path Code Unit (lightning:picklistPath)
    - ltn.pill: Create Lightning Pill Code Unit (lightning:pill)
    - ltn.pillUrl: Create Lightning Pill URL Code Unit (lightning:pill)
    - ltn.pillAvatar: Create Lightning Pill with Avatar Code Unit (lightning:pill)
    - ltn.pillAvatarUrl: Create Lightning Pill URL with Avatar Code Unit (lightning:pill)
    - ltn.pillIcon: Create Lightning Pill with Icon Code Unit (lightning:pill)
    - ltn.pillIconUrl: Create Lightning Pill URL with Icon Code Unit (lightning:pill)
    - ltn.pillContainer: Create Lightning Pill Container Code Unit (lightning:pillContainer)
    - ltn.progressBar: Create Lightning Progress Bar Code Unit (lightning:progressBar)
    - ltn.progressBarCircular: Create Lightning Progress Bar Circular Code Unit (lightning:progressBar)
    - ltn.progressIndicator: Create Lightning Progress Indicator Code Unit (lightning:progressIndicator)
    - ltn.progressIndicatorPath: Create Lightning Progress Indicator like Path Code Unit (lightning:progressIndicator)
    - ltn.quickActionApi: Create Lightning Quick Action API Code Unit (lightning:quickActionAPI)
    - ltn.quipCard: Create Lightning Quip Card Code Unit (lightning:quipCard)
    - ltn.radioGroup: Create Lightning Radio Group Code Unit (lightning:radioGroup)
    - ltn.radioGroupBtn: Create Lightning Radio Group like Button Code Unit (lightning:radioGroup)
    - ltn.recordEditFormForCreate: Create Lightning Record Edit Form for Create a new record Code Unit (lightning:recordEditForm)
    - ltn.recordEditForm: Create Lightning Record Edit Form for Edit a record Code Unit (lightning:recordEditForm)
    - ltn.recordForm: Create Lightning Record Form Code Unit (lightning:recordForm)
    - ltn.recordViewForm: Create Lightning Record Form Code Unit (lightning:recordViewForm)
    - ltn.relativeDateTime: Create Lightning Relative Date Time Code Unit (lightning:relativeDateTime)
    - ltn.select: Create Lightning Select Code Unit (lightning:select)
    - ltn.slider: Create Lightning Slider Code Unit (lightning:slider)
    - ltn.spinner: Create Lightning Spinner Code Unit (lightning:spinner)
    - ltn.tab: Create Lightning Tab Code Unit (lightning:tab)
    - ltn.tabset: Create Lightning Tab Set Code Unit (lightning:tabset)
    - ltn.textArea: Create Lightning Text Area Code Unit (lightning:textArea)
    - ltn.tile: Create Lightning Tile Code Unit (lightning:tile)
    - ltn.tileIcon: Create Lightning Tile with Icon Code Unit (lightning:tile)
    - ltn.tileAvatar: Create Lightning Tile with Avatar Code Unit (lightning:tile)
    - ltn.tree: Create Lightning Tree Code Unit (lightning:tree)
    - ltn.treeGrid: Create Lightning Tree Grid Code Unit (lightning:treeGrid)
    - ltn.unsavedChanges: Create Lightning Unsaved Changes Code Unit (lightning:unsavedChanges)
    - ltn.utilityBarApi: Create Lightning Utility Bar API Code Unit (lightning:utilityBarAPI)
    - ltn.verticalNavigation: Create Lightning Vertical Navigation Code Unit (lightning:verticalNavigation)
    - ltn.verticalNavigationItem: Create Lightning Vertical Navigation Item Code Unit (lightning:verticalNavigationItem)
    - ltn.verticalNavigationItemBadge: Create Lightning Vertical Navigation Item Badge Code Unit (lightning:verticalNavigationItemBadge)
    - ltn.verticalNavigationItemIcon: Create Lightning Vertical Navigation Item Icon Code Unit (lightning:verticalNavigationItemIcon)
    - ltn.verticalNavigationOverflow: Create Lightning Vertical Navigation Overflow Code Unit (lightning:verticalNavigationOverflow)
    - ltn.verticalNavigationSection: Create Lightning Vertical Navigation Section Code Unit (lightning:verticalNavigationSection)
    - ltn.workspaceAPI: Create Lightning Workspace API Code Unit (lightning:workspaceAPI)
    
##### - Lightning Community NS
    - ltnCommunity.backButton: Create Community Back Button Code Unit (lightningcommunity:backButton)

##### - Lightning Snapin NS
    - ltnSnapin.minimizedAPI: Create Lightning Snapin Minimized API Code Unit (lightningsnapin:minimizedAPI)
    - ltnSnapin.prechatAPI: Create Lightning Snapin Prechat API Code Unit (lightningsnapin:prechatAPI)
    - ltnSnapin.settingsAPI: Create Lightning Snapin Settings API Code Unit (lightningsnapin:settingsAPI)

##### - UI NS
    - ui.actionMenuItem: Create UI Action Menu Item Code Unit (ui:actionMenuItem)
    - ui.button: Create UI Button Code Unit (ui:button)
    - ui.checkboxMenuItem: Create UI Checkbox Menu Item Code Unit (ui:checkboxMenuItem)
    - ui.inputCheckbox: Create UI Input Checkbox Code Unit (ui:inputCheckbox)
    - ui.inputCurrency: Create UI Input Currency Code Unit (ui:inputCurrency)
    - ui.inputDate: Create UI Input Date Code Unit (ui:inputDate)
    - ui.inputDateTime: Create UI Input Date Time Code Unit (ui:inputDateTime)
    - ui.inputEmail: Create UI Input Email Code Unit (ui:inputEmail)
    - ui.inputNumber: Create UI Input Number Code Unit (ui:inputNumber)
    - ui.inputPhone: Create UI Input Phone Code Unit (ui:inputPhone)
    - ui.inputRadio: Create UI Input Radio Code Unit (ui:inputRadio)
    - ui.inputSecret: Create UI Input Secret Code Unit (ui:inputSecret)
    - ui.inputSelect: Create UI Input Select Single Selection Code Unit (ui:inputSelect)
    - ui.inputSelectMultiple: Create UI Input Select Multiple Selection Code Unit (ui:inputSelect)
    - ui.inputSelectDynamic: Create UI Input Select Dynamic Code Unit (ui:inputSelect)
    - ui.inputSelectOption: Create UI Input Select Option Code Unit (ui:inputSelectOption)
    - ui.inputText: Create UI Input Text Code Unit (ui:inputText)
    - ui.inputTextArea: Create UI Input Text Area Code Unit (ui:inputTextArea)
    - ui.inputURL: Create UI Input URL Code Unit (ui:inputURL)
    - ui.menu: Create UI Menu Code Unit (ui:menu)
    - ui.menuItemSeparator: Create UI Menu Item Separator Code Unit (ui:menuItemSeparator)
    - ui.menuList: Create UI Menu List Code Unit (ui:menuList)
    - ui.menuTriggerLink: Create UI Menu List Code Unit (ui:menuTriggerLink)
    - ui.messageConfirm: Create UI Confirmation Message Code Unit (ui:message)
    - ui.messageInfo: Create UI Information Message Code Unit (ui:message)
    - ui.messageWarning: Create UI Warning Message Code Unit (ui:message)
    - ui.messageError: Create UI Error Message Code Unit (ui:message)
    - ui.outputCheckbox: Create UI Output Checkbox Code Unit (ui:outputCheckbox)
    - ui.outputCurrency: Create UI Output Currency Code Unit (ui:outputCurrency)
    - ui.outputDate: Create UI Output Date Code Unit (ui:outputDate)
    - ui.outputDateTime: Create UI Output Date Time Code Unit (ui:outputDateTime)
    - ui.outputEmail: Create UI Output Email Code Unit (ui:outputEmail)
    - ui.outputNumber: Create UI Output Number Code Unit (ui:outputNumber)
    - ui.outputPhone: Create UI Output Phone Code Unit (ui:outputPhone)
    - ui.outputRichText: Create UI Output Rich Text Code Unit (ui:outputRichText)
    - ui.outputText: Create UI Output Text Code Unit (ui:outputText)
    - ui.outputTextArea: Create UI Output Text Area Code Unit (ui:outputTextArea)
    - ui.outputURL: Create UI Output URL Code Unit (ui:outputURL)
    - ui.radioMenuItem: Create UI Radio Menu Item Code Unit (ui:radioMenuItem)
    - ui.scrollerWrapper: Create UI Scroller Wrapper Code Unit (ui:scrollerWrapper)

##### JavaScript:
    - aura.controllerFunction: Create a standard controller function
    - aura.function: Create a standard Aura function
    - aura.JSONPretty: Write an instruction for get pretty JSON
    - aura.JSONPrettyConsole: Write an instruction for pretty print JSON in console
    
##### Apex:
    - /** : Add a class or method comment on your apex code
    - Autocompletion support for more than 400 system classes
    - Autocompletion support for SObject
    - Autocompletion support for User Classes

#### SLDS Snippets:
    - slds.modal: Create a base Modal Dialog Code Unit with Salesforce Lightning Design System (SLDS)
    - slds.modalLtn: Create a base Modal Dialog Code Unit with Salesforce Lightning Design System (SLDS) and Lightning elements (Buttons, icon...)
    - slds.modalTagline: Create a base Modal Dialog with Tagline Code Unit with Salesforce Lightning Design System (SLDS)
    - slds.modalTaglineLtn: Create a base Modal Dialog with Tagline Code Unit with Salesforce Lightning Design System (SLDS) and Lightning elements (Buttons, icon...)
    - slds.modalHeadless: Create a base Modal Dialog Headless Code Unit with Salesforce Lightning Design System (SLDS)
    - slds.modalHeadlessLtn: Create a base Modal Dialog Headless Code Unit with Salesforce Lightning Design System (SLDS) and Lightning elements (Buttons, icon...)
    - slds.modalFootless: Create a base Modal Dialog Footless Code Unit with Salesforce Lightning Design System (SLDS)
    - slds.modalFootlessLtn: Create a base Modal Dialog Code Footless Unit with Salesforce Lightning Design System (SLDS) and Lightning elements (Buttons, icon...)
    - slds.modalDirectional: Create a base Modal Dialog Directional Code Unit with Salesforce Lightning Design System (SLDS)
    - slds.modalDirectionalLtn: Create a base Modal Dialog Code Directional Unit with Salesforce Lightning Design System (SLDS) and Lightning elements (Buttons, icon...)


### Contextual Menus

#### Explorer:
    - New Aura File: Active when click on .cmp file or Component Bundle Folder.
    - Compress Profile: Compress the profile file (one permission for line) 

### Settings
    - activeAttributeSuggest: Use Code Suggestion and autocompletion tools for component attributes (v.)
    - activeControllerFunctionsSuggest: Use Code Suggestion and autocompletion tools for JavaScript Controller Functions (c.)
    - activeHelperFunctionsSuggest: Use Code Suggestion and autocompletion tools for JavaScript Helper Functions (helper.)
    - activeControllerMethodsSuggest: Use Code Suggestion and autocompletion tools for Apex Controller Methods (c.) on javascript files
    - activeComponentSuggest: Use Code Suggestion and autocompletion tools for show custom components
    - activeComponentCallSuggest: Use Code Suggestion and autocompletion tools for show available attributes for standard components when are called
    - activeCustomComponentCallSuggest: Use Code Suggestion and autocompletion tools for show available attributes for custom components when are called
    - activeApexCommentSuggestion: Use Code Suggestion and autocompletion tools for create a method or class comment on Apex

<!-- \!\[feature X\]\(images/feature-x.png\) 

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**-->
