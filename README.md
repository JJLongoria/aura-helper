# Aura Helper

Extensión for Salesforce and Lightning Experience with some tools for make more easy the development work. 

### Run command "Aura Helper: Help" for open a navigable help with more information about the Aura Helper

## Features

The Aura Helper Extension contains some of next features:

### Commands features
Some commands with tools for help in your work. All commands start with "AuraHelper:"

#### Aura:
    - Aura Document Generator: A simple command for generate a skeleton of aura documentation file for an Aura Component based on user designed templates.
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

To many snippets and code completion tools for make your work more productive:

#### Aura (Lightning):
##### - Aura NS
    - aura.attribute: Create Aura Attribute (aura:attribute)
    - aura.handler: Create Aura Handler (aura:handler)
    - aura.initHandler: Create Initialization Component Aura Handler (aura:handler)
    - aura.eventHandler: Create Aura Component Event Handler (aura:handler)
    - aura.appEventHandler: Create Aura Application Event Handler (aura:handler)
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

##### - Lightning NS
    - ltn.accordion: Create Lightning Accordion Code Unit (lightning:accordion). Alternative: ltn.accSection
    - ltn.avatar: Create Lightning Avatar Code Unit (lightning:avatar)
    - ltn.breadcrumbs: Create Lightning Breadcrums Section Code Unit (lightning:breadcrumbs)
    - ltn.breadcrumb: Create Lightning Breadcrum Code Unit (lightning:breadcrumb)
    - ltn.button: Create Lightning Button Code Unit (lightning:button)
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
    

#### JavaScript:
    - aura.controllerFunction: Create a standard controller function
    - aura.function: Create a standard Aura function
    - aura.JSONPretty: Write an instruction for get pretty JSON
    - aura.JSONPrettyConsole: Write an instruction for pretty print JSON in console
    
#### Apex:
    - /** : Add a class or method comment on your apex code

### Contextual Menus

#### Explorer:
    - New Aura File: Active when click on .cmp file.

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
