# Change Log
All notable changes to this project will be documented in this file.

## [Unreleased]
- Initial release

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

## [0.1.1] - 2019-09-02
### Added
- Application Icon

- Commands:
    - AuraHelper: Edit Aura Doc Base Template
    - AuraHelper: Edit Aura Doc Method Template
    - AuraHelper: Edit Aura Doc Method Parameter Template

## [0.1.2] - 2019-09-02
### Added
- Application Icon modified

### Fixed
- Fixed some bugs with language recognition for use the snippets

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

## [1.1.0] - 2019-09-07
### Added
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