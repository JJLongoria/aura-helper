var profile;
var isPermissionSet = '{!isPermissionSet}';
// @ts-ignore
const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    let profileData = event.data
    profile = profileData.model;
    let profileName = profileData.extraData.name;
    isPermissionSet = profileData.extraData.isPermissionSet;
    setProfileName(profileName);
    setNavigationContent(profile);
    setProfileMainData(profile);
    setAppVisibilityData(profile);
    setClassAccessesData(profile);
    setCustomMetadataAccessesData(profile);
    setCustomPermissionsData(profile);
    setCustomSettingAccessesData(profile);
    setFieldPermissionsData(profile);
    if (isPermissionSet) {
        document.getElementById("flowAccessesContainer").style.display = 'none';
        document.getElementById("layoutAssignmentsContainer").style.display = 'none';
        document.getElementById("loginHoursContainer").style.display = 'none';
        document.getElementById("loginIpRangesContainer").style.display = 'none';
    } else {
        setFlowAccessesData(profile);
        setLayoutAssignmentData(profile);
        setLoginHoursData(profile);
        setLoginIpRangesData(profile);
    }
    setObjectPermissionsData(profile);
    setPageAccessesData(profile);
    setRecordTypeVisibilitiesData(profile);
    setTabVisibilitiesData(profile);
    setUserPermissionsData(profile);
    showContent();
});

function showContent() {
    document.getElementById("spinner").style.display = 'none';
    document.getElementById("mainContent").style.display = 'block';
}

function setProfileName(profileName) {
    document.getElementById("profileName").innerHTML = profileName;
}

function setNavigationContent(profile) {
    let htmlContent = [];
    htmlContent.push('\t\t\t\t\t\t<a href="#mainDataContainer" class="w3-bar-item w3-border-bottom menu">Main Data</a>');
    Object.keys(profile).forEach(function (key) {
        if (key != 'isPermissionSet' && key != 'description' && key != 'userLicense' && key != 'custom' && key != 'profileActionOverrides' && key != 'categoryGroupVisibilities' && key != 'externalDataSourceAccesses' && key != 'fieldLevelSecurities') {
            if (isPermissionSet && key != 'layoutAssignments' && key != 'loginHours' && key != 'loginIpRanges' && key != 'flowAccessesContainer') {
                htmlContent.push('\t\t\t\t\t\t<a href="#' + key + 'Container" class="w3-bar-item w3-border-bottom menu">' + getProfileSectionName(key) + '</a>');
            } else if (!isPermissionSet) {
                htmlContent.push('\t\t\t\t\t\t<a href="#' + key + 'Container" class="w3-bar-item w3-border-bottom menu">' + getProfileSectionName(key) + '</a>');
            }
        }
    });
    htmlContent.push('<div style="margin-top:80px;"></div>');
    document.getElementById("navBar").innerHTML = htmlContent.join('\n');
}

function setProfileMainData(profile) {
    // @ts-ignore
    document.getElementById("mainData_Description").value = profile.description;
    if (isPermissionSet) {
        document.getElementById("licenseColumn").style.display = 'none';
        document.getElementById("customColumn").style.display = 'none';
        document.getElementById("descriptionColumn").className = document.getElementById("descriptionColumn").className.replace("w3-third", "w3-col");
    } else {
        // @ts-ignore
        document.getElementById("mainData_License").value = profile.userLicense;
        // @ts-ignore
        document.getElementById("mainData_Custom").checked = profile.custom;
    }
}

function setAppVisibilityData(profile) {
    document.getElementById("applicationVisibilitiesTitle").innerHTML = getProfileSectionName('applicationVisibilities');
    let contentLines = [];
    contentLines = contentLines.concat(getAppVisibilitySectionElement())
    for (const appVisibility of profile.applicationVisibilities) {
        contentLines = contentLines.concat(getAppVisibilitySectionElement(appVisibility));
    }
    document.getElementById("applicationVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function setClassAccessesData(profile) {
    document.getElementById("classAccessesTitle").innerHTML = getProfileSectionName('classAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getClassAccessSectionElement())
    for (const classAccess of profile.classAccesses) {
        contentLines = contentLines.concat(getClassAccessSectionElement(classAccess));
    }
    document.getElementById("classAccessesBody").innerHTML = contentLines.join('\n');
}

function setCustomMetadataAccessesData(profile) {
    document.getElementById("customMetadataTypeAccessesTitle").innerHTML = getProfileSectionName('customMetadataTypeAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomMetadataAccessSectionElement())
    for (const customMetadataAccess of profile.customMetadataTypeAccesses) {
        contentLines = contentLines.concat(getCustomMetadataAccessSectionElement(customMetadataAccess));
    }
    document.getElementById("customMetadataTypeAccessesBody").innerHTML = contentLines.join('\n');
}

function setCustomPermissionsData(profile) {
    document.getElementById("customPermissionsTitle").innerHTML = getProfileSectionName('customPermissions');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomPermissionSectionElement())
    for (const customPermission of profile.customPermissions) {
        contentLines = contentLines.concat(getCustomPermissionSectionElement(customPermission));
    }
    document.getElementById("customPermissionsBody").innerHTML = contentLines.join('\n');
}

function setCustomSettingAccessesData(profile) {
    document.getElementById("customSettingAccessesTitle").innerHTML = getProfileSectionName('customSettingAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomSettingAccessSectionElement())
    for (const customSettingAccess of profile.customSettingAccesses) {
        contentLines = contentLines.concat(getCustomSettingAccessSectionElement(customSettingAccess));
    }
    document.getElementById("customSettingAccessesBody").innerHTML = contentLines.join('\n');
}

function setFieldPermissionsData(profile) {
    document.getElementById("fieldPermissionsTitle").innerHTML = getProfileSectionName('fieldPermissions');
    let contentLines = [];
    let fieldByObject = {};
    for (const fieldPermission of profile.fieldPermissions) {
        let splits = fieldPermission.field.split('.');
        let objName = splits[0];
        let fieldName = splits[1];
        if (!fieldByObject[objName]) {
            fieldByObject[objName] = {
                name: objName,
                fields: []
            };
        }
        fieldByObject[objName].fields.push({
            name: fieldName,
            readable: fieldPermission.readable,
            editable: fieldPermission.editable,
        });
    }
    contentLines.push('\t\t\t\t\t\t\t<div class="w3-container" style="padding-left: 15px;">');
    Object.keys(fieldByObject).forEach(function (key) {
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" style="width: 80%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<button onclick="openCloseAccordion(\'' + key + '_fieldPermisionContainer\', \'' + key + '_fieldPermisionContainerCollapseBtn\')" id="' + key + '_fieldPermisionContainerCollapseBtn" style="margin-top:12px" class="w3-btn w3-right w3-tiny collapseSubSection">Show Fields</button>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div">');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_fieldPermisionContainer" class="w3-container w3-hide">');
        contentLines = contentLines.concat(getFieldPermissionsSectionElement());
        for (const field of fieldByObject[key].fields) {
            contentLines = contentLines.concat(getFieldPermissionsSectionElement(key, field))
        }
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("fieldPermissionsBody").innerHTML = contentLines.join('\n');
}

function setFlowAccessesData(profile) {
    document.getElementById("flowAccessesTitle").innerHTML = getProfileSectionName('flowAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getFlowAccessesSectionElement())
    for (const flowAccess of profile.flowAccesses) {
        contentLines = contentLines.concat(getFlowAccessesSectionElement(flowAccess));
    }
    document.getElementById("flowAccessesBody").innerHTML = contentLines.join('\n');
}

function setLayoutAssignmentData(profile) {
    document.getElementById("layoutAssignmentsTitle").innerHTML = getProfileSectionName('layoutAssignments');
    let contentLines = [];
    let layoutsByObject = {};
    for (const layoutAssignment of profile.layoutAssignments) {
        let splits = layoutAssignment.layout.split('-');
        let objName = splits[0];
        let layoutName = splits[1];
        if (!layoutsByObject[objName]) {
            layoutsByObject[objName] = {
                name: objName,
                layouts: []
            };
        }
        layoutsByObject[objName].layouts.push({
            name: layoutName,
            recordType: layoutAssignment.recordType,
        });
    }
    let recordtypesByObject = {};
    for (const recordTypeVisibility of profile.recordTypeVisibilities) {
        let splits = recordTypeVisibility.recordType.split('.');
        let objName = splits[0];
        let recordTypeName = splits[1];
        if (!recordtypesByObject[objName]) {
            recordtypesByObject[objName] = {
                name: objName,
                recordtypes: []
            };
        }
        recordtypesByObject[objName].recordtypes.push({
            name: recordTypeName,
            visible: recordTypeVisibility.visible,
            default: recordTypeVisibility.default,
        });
    }
    contentLines.push('\t\t\t\t\t\t\t<div class="w3-container" style="padding-left: 15px;">');
    Object.keys(layoutsByObject).forEach(function (key) {
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" style="width: 80%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<button onclick="openCloseAccordion(\'' + key + '_layoutAssignmentContainer\', \'' + key + '_layoutAssignmentCollapseBtn\')" id="' + key + '_layoutAssignmentCollapseBtn" style="margin-top:12px" class="w3-btn w3-right w3-tiny collapseSubSection">Show Layouts</button>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div">');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_layoutAssignmentContainer" class="w3-container w3-hide">');
        contentLines = contentLines.concat(getLayoutAssignmentSectionElement());
        for (const layoutAssignment of layoutsByObject[key].layouts) {
            let recordtypes = (recordtypesByObject[key]) ? recordtypesByObject[key].recordtypes : [];
            contentLines = contentLines.concat(getLayoutAssignmentSectionElement(key, layoutAssignment, recordtypes));
        }
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("layoutAssignmentsBody").innerHTML = contentLines.join('\n');
}

function setLoginHoursData(profile) {
    if (profile.loginHours) {
        document.getElementById("loginHoursTitle").innerHTML = getProfileSectionName('loginHours');
        let contentLines = [];
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Day</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Start Time</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>End Time</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
        let daysProcessed = [];
        Object.keys(profile.loginHours).forEach(function (key) {
            let dayName = key.substring(0, 1).toUpperCase() + key.substring(1).replace('End', '').replace('Start', '');
            if (!daysProcessed.includes(dayName)) {
                contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
                contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
                contentLines.push('\t\t\t\t\t\t\t\t\t<h5>' + dayName + '</h5>');
                contentLines.push('\t\t\t\t\t\t\t\t</div>');
                contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
                contentLines.push(getHoursSelect(key, profile.loginHours[dayName.toLowerCase() + 'Start']));
                contentLines.push('\t\t\t\t\t\t\t\t</div>');
                contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-third">');
                contentLines.push(getHoursSelect(key, profile.loginHours[dayName.toLowerCase() + 'End']));
                contentLines.push('\t\t\t\t\t\t\t\t</div>');
                contentLines.push('\t\t\t\t\t\t\t</div>');
                daysProcessed.push(dayName);
            }
        });
        document.getElementById("loginHoursBody").innerHTML = contentLines.join('\n');
    } else {
        document.getElementById("loginHoursContainer").style.display = 'none';
    }
}

function setLoginIpRangesData(profile) {
    document.getElementById("loginIpRangesTitle").innerHTML = getProfileSectionName('loginIpRanges');
    let contentLines = [];
    contentLines = contentLines.concat(getLoginIpRangeSectionElement())
    let index = 0;
    for (const loginIpRange of profile.loginIpRanges) {
        contentLines = contentLines.concat(getLoginIpRangeSectionElement(index, loginIpRange))
        index++;
    }
    contentLines.push('\t\t\t\t\t\t\t<div class="w3-row w3-left">');
    contentLines.push('\t\t\t\t\t\t\t<button onclick="addLoginIpRange()" style="margin-top:12px" class="w3-btn w3-right add">Add IP Range</button>');
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("loginIpRangesBody").innerHTML = contentLines.join('\n');
}

function setObjectPermissionsData(profile) {
    document.getElementById("objectPermissionsTitle").innerHTML = getProfileSectionName('objectPermissions');
    let contentLines = [];
    contentLines = contentLines.concat(getObjectPermissionSectionElement())
    for (const objectPermission of profile.objectPermissions) {
        contentLines = contentLines.concat(getObjectPermissionSectionElement(objectPermission));
    }
    document.getElementById("objectPermissionsBody").innerHTML = contentLines.join('\n');
}

function setPageAccessesData(profile) {
    document.getElementById("pageAccessesTitle").innerHTML = getProfileSectionName('pageAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getPageAccessSectionElement())
    for (const pageAccess of profile.pageAccesses) {
        contentLines = contentLines.concat(getPageAccessSectionElement(pageAccess));
    }
    document.getElementById("pageAccessesBody").innerHTML = contentLines.join('\n');
}

function setRecordTypeVisibilitiesData(profile) {
    document.getElementById("recordTypeVisibilitiesTitle").innerHTML = getProfileSectionName('recordTypeVisibilities');
    let contentLines = [];
    let recordtypesByObject = {};
    for (const recordTypeVisibility of profile.recordTypeVisibilities) {
        let splits = recordTypeVisibility.recordType.split('.');
        let objName = splits[0];
        let recordTypeName = splits[1];
        if (!recordtypesByObject[objName]) {
            recordtypesByObject[objName] = {
                name: objName,
                recordtypes: []
            };
        }
        recordtypesByObject[objName].recordtypes.push({
            name: recordTypeName,
            visible: recordTypeVisibility.visible,
            default: recordTypeVisibility.default,
        });
    }
    contentLines.push('\t\t\t\t\t\t\t<div class="w3-container" style="padding-left: 15px;">');
    Object.keys(recordtypesByObject).forEach(function (key) {
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" style="width: 80%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<button onclick="openCloseAccordion(\'' + key + '_recordtypeVisibilityContainer\', \'' + key + '_recordtypeVisibilityCollapseBtn\')" id="' + key + '_recordtypeVisibilityCollapseBtn" style="margin-top:12px" class="w3-btn w3-right w3-tiny collapseSubSection">Show Record Types</button>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div">');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_recordtypeVisibilityContainer" class="w3-container w3-hide">');
        contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement());
        for (const recordtype of recordtypesByObject[key].recordtypes) {
            contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement(key, recordtype))
        }
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("recordTypeVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function setTabVisibilitiesData(profile) {
    document.getElementById("tabVisibilitiesTitle").innerHTML = getProfileSectionName('tabVisibilities');
    let contentLines = [];
    contentLines = contentLines.concat(getTabVisibilitySectionElement())
    for (const tabVisibility of profile.tabVisibilities) {
        contentLines = contentLines.concat(getTabVisibilitySectionElement(tabVisibility));
    }
    document.getElementById("tabVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function setUserPermissionsData(profile) {
    document.getElementById("userPermissionsTitle").innerHTML = getProfileSectionName('userPermissions');
    let contentLines = [];
    contentLines = contentLines.concat(getUserPermissionSectionElement())
    for (const userPermission of profile.userPermissions) {
        contentLines = contentLines.concat(getUserPermissionSectionElement(userPermission));
    }
    document.getElementById("userPermissionsBody").innerHTML = contentLines.join('\n');
}




function getAppVisibilitySectionElement(appVisibility) {
    let contentLines = [];
    if (appVisibility) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + appVisibility.application + '" type="text" placeholder="Application Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (appVisibility.visible)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="app_' + appVisibility.application + '_visible" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'visible\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="app_' + appVisibility.application + '_visible" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'visible\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (appVisibility.default)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="app_' + appVisibility.application + '_default" class="w3-radio" type="radio" name="appVisibility_default" checked onclick="clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'default\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="app_' + appVisibility.application + '_default" class="w3-radio" type="radio" name="appVisibility_default" onclick="clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'default\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>App Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Visible</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Default</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getClassAccessSectionElement(classAccess) {
    let contentLines = [];
    if (classAccess) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + classAccess.apexClass + '" type="text" placeholder="Class Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (classAccess.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="apexClass_' + classAccess.apexClass + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'classAccesses\', \'' + classAccess.apexClass + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="apexClass_' + classAccess.apexClass + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'classAccesses\', \'' + classAccess.apexClass + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Class Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getCustomMetadataAccessSectionElement(customMetadataAccess) {
    let contentLines = [];
    if (customMetadataAccess) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + customMetadataAccess.name + '" type="text" placeholder="Custom Metadata Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (customMetadataAccess.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customMetadata_' + customMetadataAccess.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'customMetadataTypeAccesses\', \'' + customMetadataAccess.name + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customMetadata_' + customMetadataAccess.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'customMetadataTypeAccesses\', \'' + customMetadataAccess.name + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Custom Metadata Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getCustomPermissionSectionElement(customPermission) {
    let contentLines = [];
    if (customPermission) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + customPermission.name + '" type="text" placeholder="Permission Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (customPermission.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customPermission_' + customPermission.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'customPermissions\', \'' + customPermission.name + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customPermission_' + customPermission.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'customPermissions\', \'' + customPermission.name + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Permission Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getCustomSettingAccessSectionElement(customSettingAccess) {
    let contentLines = [];
    if (customSettingAccess) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + customSettingAccess.name + '" type="text" placeholder="Custom Setting Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (customSettingAccess.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customSetting_' + customSettingAccess.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'customSettingAccesses\', \'' + customSettingAccess.name + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="customSetting_' + customSettingAccess.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'customSettingAccesses\', \'' + customSettingAccess.name + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Custom Setting Object Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getFieldPermissionsSectionElement(obj, field) {
    let contentLines = [];
    if (field) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + field.name + '" type="text" placeholder="Field Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (field.readable)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="fieldPermission_' + obj + '.' + field.name + '_readable" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'readable\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="fieldPermission_' + obj + '.' + field.name + '_readable" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'readable\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (field.editable)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="fieldPermission_' + obj + '.' + field.name + '_editable" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'editable\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="fieldPermission_' + obj + '.' + field.name + '_editable" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'editable\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Field Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Readable</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Editable</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getFlowAccessesSectionElement(flowAccess) {
    let contentLines = [];
    if (flowAccess) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + flowAccess.flow + '" type="text" placeholder="Flow Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (flowAccess.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="flowAccess_' + flowAccess.flow + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'flowAccesses\', \'' + flowAccess.flow + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="flowAccess_' + flowAccess.flow + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'flowAccesses\', \'' + flowAccess.flow + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Flow Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getLayoutAssignmentSectionElement(obj, layoutAssignment, recordtypes) {
    let contentLines = [];
    if (layoutAssignment) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + layoutAssignment.name + '" type="text" placeholder="Layout Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:30%">');
        contentLines.push(getRecordTypesSelect(obj, layoutAssignment, recordtypes));
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Layout Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Assigned Record Type</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getLoginIpRangeSectionElement(index, loginIpRange) {
    let contentLines = [];
    if (loginIpRange) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" id="ip_startAddress_' + index + '" class="w3-input inputText" value="' + loginIpRange.startAddress + '" type="text" placeholder="Start Address...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" id="ip_endAddress_' + index + '" class="w3-input inputText" value="' + loginIpRange.endAddress + '" type="text" placeholder="End Address...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" id="ip_description_' + index + '" class="w3-input inputText" value="' + loginIpRange.description + '" type="text" placeholder="Description...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width: 10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<a class="material-icons" style="margin-top:12px; width:5px; cursor: pointer;" onclick="deleteLoginIpRange(' + index + ')">delete</a></button>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Start Address</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>End Address</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 30%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Description</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width: 10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Actions</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getObjectPermissionSectionElement(objectPermission) {
    let contentLines = [];
    if (objectPermission) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:40%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + objectPermission.object + '" type="text" placeholder="Object Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.allowRead)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowRead" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowRead\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowRead" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowRead\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.allowCreate)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowCreate" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowCreate\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowCreate" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowCreate\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.allowEdit)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowEdit" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowEdit\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowEdit" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowEdit\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.allowDelete)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowDelete" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowDelete\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_allowDelete" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowDelete\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.viewAllRecords)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_viewAllRecords" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'viewAllRecords\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_viewAllRecords" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'viewAllRecords\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        if (objectPermission.modifyAllRecords)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_modifyAllRecords" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'modifyAllRecords\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="objectPermission_' + objectPermission.object + '_modifyAllRecords" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'modifyAllRecords\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:40%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Object Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Allow Read</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Allow Create</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Allow Edit</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Allow Delete</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>View All Records</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:10%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Modify All Records</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getPageAccessSectionElement(pageAccess) {
    let contentLines = [];
    if (pageAccess) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + pageAccess.apexPage + '" type="text" placeholder="Class Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (pageAccess.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="apexPage_' + pageAccess.apexPage + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'pageAccesses\', \'' + pageAccess.apexPage + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="apexPage_' + pageAccess.apexPage + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'pageAccesses\', \'' + pageAccess.apexPage + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Class Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getRecordTypeVisibilitySectionElement(obj, recordtypeVisibility) {
    let contentLines = [];
    if (recordtypeVisibility) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + recordtypeVisibility.name + '" type="text" placeholder="Field Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (recordtypeVisibility.visible)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="recordtype_' + obj + '.' + recordtypeVisibility.name + '_visible" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'recordTypeVisibilities\', \'' + obj + '.' + recordtypeVisibility.name + '\', \'visible\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="recordtype_' + obj + '.' + recordtypeVisibility.name + '_visible" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'recordTypeVisibilities\', \'' + obj + '.' + recordtypeVisibility.name + '\', \'visible\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (recordtypeVisibility.default)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="recordtype_' + obj + '.' + recordtypeVisibility.name + '_default" class="w3-radio" type="radio" name="' + obj + '_default" checked onclick="clickOnElementCheck(\'recordTypeVisibilities\', \'' + obj + '.' + recordtypeVisibility.name + '\', \'default\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="recordtype_' + obj + '.' + recordtypeVisibility.name + '_default" class="w3-radio" type="radio" name="' + obj + '_default" onclick="clickOnElementCheck(\'recordTypeVisibilities\', \'' + obj + '.' + recordtypeVisibility.name + '\', \'default\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:70%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Record Type Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Visible</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Default</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getTabVisibilitySectionElement(tabVisibility) {
    let contentLines = [];
    if (tabVisibility) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + tabVisibility.tab + '" type="text" placeholder="Tab Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:15%">');
        contentLines.push(getTabVisibilitySelect(tabVisibility.tab, tabVisibility.visibility));
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Tab Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Visibility</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}

function getUserPermissionSectionElement(userPermission) {
    let contentLines = [];
    if (userPermission) {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row sectionRow">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<input style="width:90%" class="w3-input inputText" readonly value="' + userPermission.name + '" type="text" placeholder="User Permission Name...">');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        if (userPermission.enabled)
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="userPermission_' + userPermission.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" checked onclick="clickOnElementCheck(\'userPermissions\', \'' + userPermission.name + '\', \'enabled\')"/>');
        else
            contentLines.push('\t\t\t\t\t\t\t\t\t<input id="userPermission_' + userPermission.name + '_enabled" class="w3-check inputCheckbox" type="checkbox" onclick="clickOnElementCheck(\'userPermissions\', \'' + userPermission.name + '\', \'enabled\')"/>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    } else {
        contentLines.push('\t\t\t\t\t\t\t<div class="w3-row">');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col" style="width:85%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>User Permission Name</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div class="w3-col w3-center" style="width:15%">');
        contentLines.push('\t\t\t\t\t\t\t\t\t<h5>Enabled</h5>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t</div>');
    }
    return contentLines;
}



function getHoursSelect(moment, selectedValue) {
    let contentLines = [];
    contentLines.push('\t\t\t\t\t\t\t<select style="width:90%" id="" class="w3-select w3-input inputText" id="' + moment + '_loginHours" name="' + moment + '_loginHours" onchange="onSelectHour(\'' + moment + '\')">');
    if (selectedValue === -1)
        contentLines.push('\t\t\t\t\t\t\t\t<option value="-1" selected>--None--</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="-1">--None--</option>');
    if (selectedValue === 0)
        contentLines.push('\t\t\t\t\t\t\t\t<option value="0" selected>12:00 AM</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="0">12:00 AM</option>');
    for (let i = 1; i <= 23; i++) {
        let value = i * 60;
        if (selectedValue === value) {
            if (i < 12)
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + value + '" selected>' + i + ':00 AM</option>');
            else
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + value + '" selected>' + i + ':00 PM</option>');
        } else {
            if (i < 12)
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + value + '">' + i + ':00 AM</option>');
            else
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + value + '">' + i + ':00 PM</option>');
        }
    }
    if (selectedValue === 1440)
        contentLines.push('\t\t\t\t\t\t\t\t<option value="1440" selected>End of Day</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="1440">End of Day</option>');
    contentLines.push('\t\t\t\t\t\t\t</select>');
    return contentLines.join('\n');
}

function getTabVisibilitySelect(tab, selectedValue) {
    let contentLines = [];
    contentLines.push('\t\t\t\t\t\t\t<select style="width:90%" id="" class="w3-select w3-input inputText" id="' + tab + '_visibility" name="' + tab + '_visibility" onchange="onSelectVisibility(\'' + tab + '\')">');
    if (selectedValue === 'DefaultOn')
        contentLines.push('\t\t\t\t\t\t\t\t<option value="DefaultOn" selected>Default On</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Hidden">Hidden</option>');
    if (selectedValue === 'DefaultOff')
        contentLines.push('\t\t\t\t\t\t\t\t<option value="DefaultOff" selected>Default Off</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Hidden">Hidden</option>');
    if (selectedValue === 'Hidden')
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Hidden" selected>Hidden</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Hidden">Hidden</option>');
    contentLines.push('\t\t\t\t\t\t\t</select>');
    return contentLines.join('\n');
}

function getRecordTypesSelect(obj, layout, recordtypes) {
    let contentLines = [];
    let recordType = (layout.recordType) ? layout.recordType : 'Master';
    contentLines.push('\t\t\t\t\t\t\t<select style="width:90%" id="" class="w3-select w3-input inputText" id="' + obj + '-' + layout.name + '-' + recordType + '_assignment" name="' + obj + '-' + layout.name + '-' + recordType + '_assignment" onchange="onSelectRecordType("' + obj + '", "' + layout.name + '", "' + recordType + '")">');
    if (recordType === 'Master')
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Master" selected>Master</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="Master">Master</option>');
    if (recordtypes) {
        for (let rt of recordtypes) {
            if (obj + '.' + rt.name === recordType)
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + rt.name + '" selected>' + rt.name + '</option>');
            else
                contentLines.push('\t\t\t\t\t\t\t\t<option value="' + rt.name + '">' + rt.name + '</option>');
        }
    }
    contentLines.push('\t\t\t\t\t\t\t</select>');
    return contentLines.join('\n');
}


function clickOnElementCheck(section, elementName, elementCheckField) {
    console.log('clickOnElementCheck');
    console.log('section => ' + section);
    console.log('elementName => ' + elementName);
    console.log('elementCheckField => ' + elementCheckField);
    if (section === 'applicationVisibilities') {
        // @ts-ignore
        if (elementCheckField === 'default' && document.getElementById('app_' + elementName + '_' + elementCheckField).checked) {
            // @ts-ignore
            for (let appVisibility of profile.applicationVisibilities) {
                appVisibility.default = false;
            }
        }
        // @ts-ignore
        for (let appVisibility of profile.applicationVisibilities) {
            if (appVisibility.application == elementName) {
                // @ts-ignore
                appVisibility[elementCheckField] = document.getElementById('app_' + appVisibility.application + '_' + elementCheckField).checked;
            }
        }

    }
    if (section === 'classAccesses') {
        // @ts-ignore
        for (let apexClass of profile.classAccesses) {
            if (apexClass.apexClass == elementName) {
                // @ts-ignore
                apexClass[elementCheckField] = document.getElementById('apexClass_' + apexClass.apexClass + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customMetadataTypeAccesses') {
        // @ts-ignore
        for (let customMetadata of profile.customMetadataTypeAccesses) {
            if (customMetadata.name == elementName) {
                // @ts-ignore
                customMetadata[elementCheckField] = document.getElementById('customMetadata_' + customMetadata.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customPermissions') {
        // @ts-ignore
        for (let customPermission of profile.customPermissions) {
            if (customPermission.name == elementName) {
                // @ts-ignore
                customPermission[elementCheckField] = document.getElementById('customPermission_' + customPermission.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customSettingAccesses') {
        // @ts-ignore
        for (let customSetting of profile.customSettingAccesses) {
            if (customSetting.name == elementName) {
                // @ts-ignore
                customSetting[elementCheckField] = document.getElementById('customSetting_' + customSetting.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'fieldPermissions') {
        // @ts-ignore
        for (let fieldPermission of profile.fieldPermissions) {
            if (fieldPermission.field == elementName) {
                // @ts-ignore
                fieldPermission[elementCheckField] = document.getElementById('fieldPermission_' + fieldPermission.field + '_' + elementCheckField).checked;
                if (elementCheckField === 'editable' && fieldPermission[elementCheckField]) {
                    fieldPermission.readable = fieldPermission[elementCheckField];
                    // @ts-ignore
                    document.getElementById('fieldPermission_' + fieldPermission.field + '_readable').checked = true;
                }
            }
        }
    }
    if (section === 'flowAccesses') {
        // @ts-ignore
        for (let flowAccess of profile.flowAccesses) {
            if (flowAccess.flow == elementName) {
                // @ts-ignore
                flowAccess[elementCheckField] = document.getElementById('flowAccess_' + flowAccess.flow + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'objectPermissions') {
        // @ts-ignore
        for (let objectPermission of profile.objectPermissions) {
            if (objectPermission.object == elementName) {
                // @ts-ignore
                objectPermission[elementCheckField] = document.getElementById('objectPermission_' + objectPermission.object + '_' + elementCheckField).checked;
                if (elementCheckField === 'allowRead' && !objectPermission.allowRead) {
                    objectPermission.allowCreate = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowCreate').checked = false;
                    objectPermission.allowEdit = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowEdit').checked = false;
                    objectPermission.allowDelete = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowDelete').checked = false;
                    objectPermission.viewAllRecords = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_viewAllRecords').checked = false;
                    objectPermission.modifyAllRecords = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_modifyAllRecords').checked = false;
                }
                if ((elementCheckField === 'allowCreate' && objectPermission.allowCreate) || (elementCheckField === 'allowEdit' && objectPermission.allowEdit) || (elementCheckField === 'allowDelete' && objectPermission.allowDelete) || (elementCheckField === 'viewAllRecords' && objectPermission.viewAllRecords) || (elementCheckField === 'modifyAllRecords' && objectPermission.modifyAllRecords)) {
                    objectPermission.allowRead = true;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowRead').checked = true;
                    if (elementCheckField === 'allowDelete' && objectPermission.allowDelete) {
                        objectPermission.allowEdit = true;
                        // @ts-ignore
                        document.getElementById('objectPermission_' + objectPermission.object + '_allowEdit').checked = true;
                    }
                }
                if (elementCheckField === 'allowEdit' && !objectPermission.allowEdit) {
                    objectPermission.allowDelete = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowDelete').checked = false;
                    objectPermission.modifyAllRecords = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_modifyAllRecords').checked = false;
                }
                if (elementCheckField === 'allowDelete' && !objectPermission.allowDelete) {
                    objectPermission.modifyAllRecords = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_modifyAllRecords').checked = false;
                }
                if (elementCheckField === 'viewAllRecords' && !objectPermission.viewAllRecords) {
                    objectPermission.modifyAllRecords = false;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_modifyAllRecords').checked = false;
                }
                if (elementCheckField === 'modifyAllRecords' && objectPermission.modifyAllRecords) {
                    objectPermission.allowEdit = true;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowEdit').checked = true;
                    objectPermission.allowDelete = true;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_allowDelete').checked = true;
                    objectPermission.viewAllRecords = true;
                    // @ts-ignore
                    document.getElementById('objectPermission_' + objectPermission.object + '_viewAllRecords').checked = true;
                }
            }
        }
    }
    if (section === 'pageAccesses') {
        // @ts-ignore
        for (let pageAccess of profile.pageAccesses) {
            if (pageAccess.apexPage == elementName) {
                // @ts-ignore
                pageAccess[elementCheckField] = document.getElementById('apexPage_' + pageAccess.apexPage + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'recordTypeVisibilities') {
        // @ts-ignore
        if (elementCheckField === 'default' && document.getElementById('recordtype_' + recordTypeVisibility.recordType + '_' + elementCheckField).checked) {
            // @ts-ignore
            for (let appVisibility of profile.applicationVisibilities) {
                appVisibility.default = false;
            }
        }
        // @ts-ignore
        for (let recordTypeVisibility of profile.recordTypeVisibilities) {
            if (recordTypeVisibility.recordType == elementName) {
                // @ts-ignore
                recordTypeVisibility[elementCheckField] = document.getElementById('recordtype_' + recordTypeVisibility.recordType + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'userPermissions') {
        // @ts-ignore
        for (let userPermission of profile.userPermissions) {
            if (userPermission.name == elementName) {
                // @ts-ignore
                userPermission[elementCheckField] = document.getElementById('userPermission_' + userPermission.name + '_' + elementCheckField).checked;
            }
        }
    }
}

function addLoginIpRange() {
    // @ts-ignore
    profile.loginIpRanges.push({ startAddress: '', endAddress: '', description: '' });
    setLoginIpRangesData(profile);
}

function onSelectHour(moment) {
    // @ts-ignore
    profile.loginHours[moment] = document.getElementById(moment + '_loginHours').value;
}

function onSelectVisibility(tabName) {
    // @ts-ignore
    let value = document.getElementById(tabName + '_visibility').value;
    // @ts-ignore
    for (let tabVisibility of profile.tabVisibilities) {
        if (tabVisibility.tab === tabName)
            tabVisibility.visibility = value;
    }
}

function onSelectRecordType(obj, layoutName, recordtype) {
    // @ts-ignore
    // @ts-ignore
    let value = document.getElementById(obj + '-' + layoutName + '-' + recordType + '_assignment').value;
    // @ts-ignore
    for (let layoutAssignment of profile.layoutAssignments) {
        if (layoutAssignment.layout === obj + '-' + layoutName) {
            if (recordtype === 'Master')
                layoutAssignment.recordType = undefined;
            else
                layoutAssignment.recordType = recordtype;
        }
    }
}

function openCloseAccordion(id, btnId) {
    var x = document.getElementById(id);
    let btn = document.getElementById(btnId);
    if (btn.innerHTML === 'Show' || btn.innerHTML === 'Show Fields' || btn.innerHTML === 'Show Record Types' || btn.innerHTML === 'Show Layouts') {
        x.className = x.className.replace(" w3-hide", " w3-show");
        if (btn.innerHTML === 'Show')
            btn.innerHTML = 'Collapse';
        if (btn.innerHTML === 'Show Fields')
            btn.innerHTML = 'Hide Fields';
        if (btn.innerHTML === 'Show Record Types')
            btn.innerHTML = 'Hide Record Types';
        if (btn.innerHTML === 'Show Layouts')
            btn.innerHTML = 'Hide Layouts';
    } else if (btn.innerHTML === 'Collapse' || btn.innerHTML === 'Hide Fields' || btn.innerHTML === 'Hide Record Types' || btn.innerHTML === 'Hide Layouts') {
        x.className = x.className.replace(" w3-show", " w3-hide");
        if (btn.innerHTML === 'Collapse')
            btn.innerHTML = 'Show';
        if (btn.innerHTML === 'Hide Fields')
            btn.innerHTML = 'Show Fields';
        if (btn.innerHTML === 'Hide Record Types')
            btn.innerHTML = 'Show Record Types';
        if (btn.innerHTML === 'Hide Layouts')
            btn.innerHTML = 'Show Layouts';
    }
}

function deleteLoginIpRange(index) {
    // @ts-ignore
    if (profile.loginIpRanges) {
        // @ts-ignore
        if (profile.loginIpRanges.length - 1 >= index)
            // @ts-ignore
            profile.loginIpRanges.splice(index, 1);
    }
    setLoginIpRangesData(profile);
}

function save() {
    // @ts-ignore
    if (profile.loginIpRanges && profile.loginIpRanges.length > 0) {
        let index = 0;
        // @ts-ignore
        for (let loginIp of profile.loginIpRanges) {
            // @ts-ignore
            loginIp.startAddress = document.getElementById('ip_startAddress_' + index).value;
            // @ts-ignore
            loginIp.endAddress = document.getElementById('ip_endAddress_' + index).value;
            // @ts-ignore
            loginIp.description = document.getElementById('ip_description_' + index).value;
            index++;
        }
    }
    // @ts-ignore
    profile.description = document.getElementById('mainData_Description').value;
    vscode.postMessage({ command: 'save', profile: profile });
}

function compressAndSave() {
    // @ts-ignore
    if (profile.loginIpRanges && profile.loginIpRanges.length > 0) {
        let index = 0;
        // @ts-ignore
        for (let loginIp of profile.loginIpRanges) {
            // @ts-ignore
            loginIp.startAddress = document.getElementById('ip_startAddress_' + index).value;
            // @ts-ignore
            loginIp.endAddress = document.getElementById('ip_endAddress_' + index).value;
            // @ts-ignore
            loginIp.description = document.getElementById('ip_description_' + index).value;
            index++;
        }
    }
    // @ts-ignore
    profile.description = document.getElementById('mainData_Description').value;
    vscode.postMessage({ command: 'compressAndSave', profile: profile });
}

function cancel() {
    vscode.postMessage({ command: 'cancel' });
}

function getProfileSectionName(profileSection) {
    let profileSectionNames = {
        applicationVisibilities: "Application Visibilities",
        categoryGroupVisibilities: "Category Group Visibilities",
        classAccesses: "Class Accesses",
        customMetadataTypeAccesses: "Custom Metadata Type Accesses",
        customPermissions: "Custom Permissions",
        customSettingAccesses: "Custom Setting Accesses",
        externalDataSourceAccesses: "External Data Source Accesses",
        fieldPermissions: "Field Permissions",
        fieldLevelSecurities: "Field Level Security",
        flowAccesses: "Flow Accesses",
        layoutAssignments: "Layout Assignments",
        loginHours: "Login Hours",
        loginIpRanges: "Login IP Ranges",
        objectPermissions: "Object Permissions",
        pageAccesses: "Page Accesses",
        profileActionOverrides: "Profile Action Overrides",
        recordTypeVisibilities: "Record Type Visibilities",
        tabVisibilities: "Tab Visibilities",
        userPermissions: "User Permissions"
    };
    return profileSectionNames[profileSection];
}