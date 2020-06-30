var permissionSet;
var elementsFiltered = {};
// @ts-ignore
const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    let profileData = event.data
    permissionSet = profileData.model;
    let profileName = profileData.extraData.name;
    setProfileName(profileName);
    setNavigationContent(permissionSet);
    setProfileMainData(permissionSet);
    setAppVisibilityData(permissionSet);
    setClassAccessesData(permissionSet);
    setCustomMetadataAccessesData(permissionSet);
    setCustomPermissionsData(permissionSet);
    setCustomSettingAccessesData(permissionSet);
    setFieldPermissionsData(permissionSet);
    setLayoutAssignmentData(permissionSet);
    setLoginHoursData(permissionSet);
    setLoginIpRangesData(permissionSet);
    setObjectPermissionsData(permissionSet);
    setPageAccessesData(permissionSet);
    setRecordTypeVisibilitiesData(permissionSet);
    setTabVisibilitiesData(permissionSet);
    setUserPermissionsData(permissionSet);
    // @ts-ignore
    showContent();
});

function setProfileName(profileName) {
    document.getElementById("profileName").innerHTML = profileName;
}

function setNavigationContent(profile) {
    let htmlContent = [];
    htmlContent.push('\t\t\t\t\t\t<a href="#mainDataContainer" class="w3-bar-item w3-border-bottom menu">{!label.main_data}</a>');
    Object.keys(profile).forEach(function (key) {
        if (key != 'description' && key != 'userLicense' && key != 'custom' && key != 'profileActionOverrides' && key != 'categoryGroupVisibilities' && key != 'externalDataSourceAccesses' && key != 'fieldLevelSecurities') {
            htmlContent.push('\t\t\t\t\t\t<a href="#' + key + 'Container" class="w3-bar-item w3-border-bottom menu">' + getPermissionSetSectionName(key) + '</a>');
        }
    });
    htmlContent.push('<div style="margin-top:80px;"></div>');
    document.getElementById("navBar").innerHTML = htmlContent.join('\n');
}

function setProfileMainData(profile) {
    if (profile.description !== undefined)
        // @ts-ignore
        document.getElementById("mainData_Description").value = profile.description;
    // @ts-ignore
    document.getElementById("mainData_License").value = profile.userLicense;
    // @ts-ignore
    document.getElementById("mainData_Custom").checked = profile.custom;
}

function setAppVisibilityData(profile) {
    document.getElementById("applicationVisibilitiesTitle").innerHTML = getPermissionSetSectionName('applicationVisibilities');
    let contentLines = [];
    contentLines = contentLines.concat(getAppVisibilitySectionElement())
    for (const appVisibility of profile.applicationVisibilities) {
        contentLines = contentLines.concat(getAppVisibilitySectionElement(appVisibility));
    }
    document.getElementById("applicationVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function setClassAccessesData(profile) {
    document.getElementById("classAccessesTitle").innerHTML = getPermissionSetSectionName('classAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getClassAccessSectionElement())
    for (const classAccess of profile.classAccesses) {
        contentLines = contentLines.concat(getClassAccessSectionElement(classAccess));
    }
    document.getElementById("classAccessesBody").innerHTML = contentLines.join('\n');
}

function setCustomMetadataAccessesData(profile) {
    document.getElementById("customMetadataTypeAccessesTitle").innerHTML = getPermissionSetSectionName('customMetadataTypeAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomMetadataAccessSectionElement())
    for (const customMetadataAccess of profile.customMetadataTypeAccesses) {
        contentLines = contentLines.concat(getCustomMetadataAccessSectionElement(customMetadataAccess));
    }
    document.getElementById("customMetadataTypeAccessesBody").innerHTML = contentLines.join('\n');
}

function setCustomPermissionsData(profile) {
    document.getElementById("customPermissionsTitle").innerHTML = getPermissionSetSectionName('customPermissions');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomPermissionSectionElement())
    for (const customPermission of profile.customPermissions) {
        contentLines = contentLines.concat(getCustomPermissionSectionElement(customPermission));
    }
    document.getElementById("customPermissionsBody").innerHTML = contentLines.join('\n');
}

function setCustomSettingAccessesData(profile) {
    document.getElementById("customSettingAccessesTitle").innerHTML = getPermissionSetSectionName('customSettingAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getCustomSettingAccessSectionElement())
    for (const customSettingAccess of profile.customSettingAccesses) {
        contentLines = contentLines.concat(getCustomSettingAccessSectionElement(customSettingAccess));
    }
    document.getElementById("customSettingAccessesBody").innerHTML = contentLines.join('\n');
}

function setFieldPermissionsData(profile) {
    document.getElementById("fieldPermissionsTitle").innerHTML = getPermissionSetSectionName('fieldPermissions');
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
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" onclick="openCloseSection(\'' + key + '_fieldPermisionContainer\', \'' + key + '_fieldPermisionContainerCollapseBtn\')" style="width: 80%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<div onclick="openCloseSection(\'' + key + '_fieldPermisionContainer\', \'' + key + '_fieldPermisionContainerCollapseBtn\')" style="cursor: pointer; "><i id="' + key + '_fieldPermisionContainerCollapseBtn" class="material-icons md-32 md-light w3-right">expand_more</i></div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_fieldPermisionContainer" class="w3-container w3-hide" style="overflow: scroll;">');
        contentLines.push('<div class="w3-bar">');
        contentLines.push('<div class="w3-bar-item" style="width: 500px;">');
        contentLines.push('<div class="searchBox">');
        contentLines.push('<input id="' + key + '_fieldsFilter" oninput="onFilterElement(\'' + key + '_fieldsFilter\', \'fieldPermissions.' + key + '\')" onpaste="onFilterElement(\'' + key + '_fieldsFilter\', \'fieldPermissions.' + key + '\')" onkeypress="onFilterElement(\'' + key + '_fieldsFilter\', \'fieldPermissions.' + key + '\')" class="searchInput" type="text" name="" placeholder="{!label.filter}"/>');
        contentLines.push('<button class="searchButton" href="#"><i class="material-icons">search</i></button>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('<div class="w3-row" id="' + key + '_fieldsContainer">');
        contentLines.push('<table class="w3-table table">');
        contentLines = contentLines.concat(getFieldPermissionsSectionElement());
        for (const field of fieldByObject[key].fields) {
            contentLines = contentLines.concat(getFieldPermissionsSectionElement(key, field))
        }
        contentLines.push('</table>');
        contentLines.push('</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("fieldPermissionsBody").innerHTML = contentLines.join('\n');
}

function redrawFieldPermissionsForObject(obj) {
    let fieldByObject = {};
    for (const fieldPermission of permissionSet.fieldPermissions) {
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
    let contentLines = [];
    contentLines.push('<table class="w3-table table">');
    contentLines = contentLines.concat(getFieldPermissionsSectionElement());
    for (const field of fieldByObject[obj].fields) {
        contentLines = contentLines.concat(getFieldPermissionsSectionElement(obj, field))
    }
    contentLines.push('</table>');
    document.getElementById(obj + '_fieldsContainer').innerHTML = contentLines.join('\n');
}

function setLayoutAssignmentData(profile) {
    document.getElementById("layoutAssignmentsTitle").innerHTML = getPermissionSetSectionName('layoutAssignments');
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
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" onclick="openCloseSection(\'' + key + '_layoutAssignmentContainer\', \'' + key + '_layoutAssignmentCollapseBtn\')" style="width: 80%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<div onclick="openCloseSection(\'' + key + '_layoutAssignmentContainer\', \'' + key + '_layoutAssignmentCollapseBtn\')"><i id="' + key + '_layoutAssignmentCollapseBtn" class="material-icons md-32 md-light w3-right">expand_more</i></div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_layoutAssignmentContainer" class="w3-container w3-hide" style="overflow: scroll;">');
        contentLines.push('<div class="w3-bar">');
        contentLines.push('<div class="w3-bar-item" style="width: 500px;">');
        contentLines.push('<div class="searchBox">');
        contentLines.push('<input id="' + key + '_layoursFilter" oninput="onFilterElement(\'' + key + '_layoursFilter\', \'layoutAssignments.' + key + '\')" onpaste="onFilterElement(\'' + key + '_layoursFilter\', \'layoutAssignments.' + key + '\')" onkeypress="onFilterElement(\'' + key + '_layoursFilter\', \'layoutAssignments.' + key + '\')" class="searchInput" type="text" name="" placeholder="{!label.filter}">');
        contentLines.push('<button class="searchButton" href="#"><i class="material-icons">search</i></button>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('<div class="w3-row" id="' + key + '_layoutsContainer">');
        contentLines.push('<table class="w3-table table">');
        contentLines = contentLines.concat(getLayoutAssignmentSectionElement());
        for (const layoutAssignment of layoutsByObject[key].layouts) {
            let recordtypes = (recordtypesByObject[key]) ? recordtypesByObject[key].recordtypes : [];
            contentLines = contentLines.concat(getLayoutAssignmentSectionElement(key, layoutAssignment, recordtypes));
        }
        contentLines.push('</table>');
        contentLines.push('</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("layoutAssignmentsBody").innerHTML = contentLines.join('\n');
}

function redrawLayoutAssignmentForObject(obj) {
    let contentLines = [];
    let layoutsByObject = {};
    for (const layoutAssignment of permissionSet.layoutAssignments) {
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
    for (const recordTypeVisibility of permissionSet.recordTypeVisibilities) {
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
    contentLines.push('<table class="w3-table table">');
    contentLines = contentLines.concat(getLayoutAssignmentSectionElement());
    for (const layoutAssignment of layoutsByObject[obj].layouts) {
        let recordtypes = (recordtypesByObject[obj]) ? recordtypesByObject[obj].recordtypes : [];
        contentLines = contentLines.concat(getLayoutAssignmentSectionElement(obj, layoutAssignment, recordtypes));
    }
    contentLines.push('</table>');
    document.getElementById(obj + '_layoutsContainer').innerHTML = contentLines.join('\n');
}

function setLoginHoursData(profile) {
    if (profile.loginHours) {
        document.getElementById("loginHoursTitle").innerHTML = getPermissionSetSectionName('loginHours');
        let contentLines = [];
        contentLines.push('<table class="w3-table table">');
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.day}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.start_time}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.end_time}</th>');
        contentLines.push('</tr>');
        let daysProcessed = [];
        Object.keys(profile.loginHours).forEach(function (key) {
            let dayName = key.substring(0, 1).toUpperCase() + key.substring(1).replace('End', '').replace('Start', '');
            if (!daysProcessed.includes(dayName)) {
                contentLines.push('<tr class="tableRow">');
                contentLines.push('<td class="tableCell">' + dayName + '</td>');
                contentLines.push('<td class="tableCell">' + getHoursSelect(key, profile.loginHours[dayName.toLowerCase() + 'Start']) + '</td>');
                contentLines.push('<td class="tableCell">' + getHoursSelect(key, profile.loginHours[dayName.toLowerCase() + 'End']) + '</td>');
                contentLines.push('</tr>');
                daysProcessed.push(dayName);
            }
        });
        contentLines.push('</table>');
        document.getElementById("loginHoursBody").innerHTML = contentLines.join('\n');
    } else {
        document.getElementById("loginHoursContainer").style.display = 'none';
    }
}

function setLoginIpRangesData(profile) {
    document.getElementById("loginIpRangesTitle").innerHTML = getPermissionSetSectionName('loginIpRanges');
    let contentLines = [];
    contentLines.push('<table class="w3-table table">');
    contentLines = contentLines.concat(getLoginIpRangeSectionElement())
    let index = 0;
    for (const loginIpRange of profile.loginIpRanges) {
        contentLines = contentLines.concat(getLoginIpRangeSectionElement(index, loginIpRange))
        index++;
    }
    contentLines.push('</table>');
    contentLines.push('\t\t\t\t\t\t\t<div class="w3-row w3-left">');
    contentLines.push('\t\t\t\t\t\t\t<button onclick="addLoginIpRange()" style="margin-top:12px" class="w3-btn w3-right add">{!label.add_ip_range}</button>');
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("loginIpRangesBody").innerHTML = contentLines.join('\n');
}

function setObjectPermissionsData(profile) {
    document.getElementById("objectPermissionsTitle").innerHTML = getPermissionSetSectionName('objectPermissions');
    let contentLines = [];
    contentLines = contentLines.concat(getObjectPermissionSectionElement())
    for (const objectPermission of profile.objectPermissions) {
        contentLines = contentLines.concat(getObjectPermissionSectionElement(objectPermission));
    }
    document.getElementById("objectPermissionsBody").innerHTML = contentLines.join('\n');
}

function setPageAccessesData(profile) {
    document.getElementById("pageAccessesTitle").innerHTML = getPermissionSetSectionName('pageAccesses');
    let contentLines = [];
    contentLines = contentLines.concat(getPageAccessSectionElement())
    for (const pageAccess of profile.pageAccesses) {
        contentLines = contentLines.concat(getPageAccessSectionElement(pageAccess));
    }
    document.getElementById("pageAccessesBody").innerHTML = contentLines.join('\n');
}

function setRecordTypeVisibilitiesData(profile) {
    document.getElementById("recordTypeVisibilitiesTitle").innerHTML = getPermissionSetSectionName('recordTypeVisibilities');
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
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col subsectionHeader" onclick="openCloseSection(\'' + key + '_recordtypeVisibilityContainer\', \'' + key + '_recordtypeVisibilityCollapseBtn\')" style="width: 80%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<h4>' + key + '</h4>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t<div class="w3-col" style="width: 20%; cursor: pointer;">');
        contentLines.push('\t\t\t\t\t\t\t\t\t\t<div onclick="openCloseSection(\'' + key + '_recordtypeVisibilityContainer\', \'' + key + '_recordtypeVisibilityCollapseBtn\')"><i id="' + key + '_recordtypeVisibilityCollapseBtn" class="material-icons md-32 md-light w3-right">expand_more</i></div>');
        contentLines.push('\t\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
        contentLines.push('\t\t\t\t\t\t\t\t<div id="' + key + '_recordtypeVisibilityContainer" class="w3-container w3-hide" style="overflow: scroll;">');
        contentLines.push('<div class="w3-bar">');
        contentLines.push('<div class="w3-bar-item" style="width: 500px;">');
        contentLines.push('<div class="searchBox">');
        contentLines.push('<input id="' + key + '_recordTypesFilter" oninput="onFilterElement(\'' + key + '_recordTypesFilter\', \'recordTypeVisibilities.' + key + '\')" onpaste="onFilterElement(\'' + key + '_recordTypesFilter\', \'recordTypeVisibilities.' + key + '\')" onkeypress="onFilterElement(\'' + key + '_recordTypesFilter\', \'recordTypeVisibilities.' + key + '\')" class="searchInput" type="text" name="" placeholder="{!label.filter}">');
        contentLines.push('<button class="searchButton" href="#"><i class="material-icons">search</i></button>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('</div>');
        contentLines.push('<div class="w3-row" id="' + key + '_recordTypesContainer">');
        contentLines.push('<table class="w3-table table">');
        contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement());
        for (const recordtype of recordtypesByObject[key].recordtypes) {
            contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement(key, recordtype))
        }
        contentLines.push('</table>');
        contentLines.push('</div>');
        contentLines.push('\t\t\t\t\t\t\t\t</div>');
    });
    contentLines.push('\t\t\t\t\t\t\t</div>');
    document.getElementById("recordTypeVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function redrawRecordTypeVisibilities(obj) {
    let contentLines = [];
    let recordtypesByObject = {};
    for (const recordTypeVisibility of permissionSet.recordTypeVisibilities) {
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
    contentLines.push('<table class="w3-table table">');
    contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement());
    for (const recordtype of recordtypesByObject[obj].recordtypes) {
        contentLines = contentLines.concat(getRecordTypeVisibilitySectionElement(obj, recordtype))
    }
    contentLines.push('</table>');
    document.getElementById(obj + '_recordTypesContainer').innerHTML = contentLines.join('\n');
}

function setTabVisibilitiesData(profile) {
    document.getElementById("tabVisibilitiesTitle").innerHTML = getPermissionSetSectionName('tabVisibilities');
    let contentLines = [];
    contentLines = contentLines.concat(getTabVisibilitySectionElement())
    for (const tabVisibility of profile.tabVisibilities) {
        contentLines = contentLines.concat(getTabVisibilitySectionElement(tabVisibility));
    }
    document.getElementById("tabVisibilitiesBody").innerHTML = contentLines.join('\n');
}

function setUserPermissionsData(profile) {
    document.getElementById("userPermissionsTitle").innerHTML = getPermissionSetSectionName('userPermissions');
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
        let filter = elementsFiltered['applicationVisibilities'];
        if (!filter || appVisibility.application.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + appVisibility.application + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('app_' + appVisibility.application + '_visible', 'clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'visible\')', appVisibility.visible) + '</td>');
            contentLines.push('<td class="tableCell">' + getRadio('app_' + appVisibility.application + '_default', 'appDefault', 'clickOnElementCheck(\'applicationVisibilities\', \'' + appVisibility.application + '\', \'default\')', appVisibility.default) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.app_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.visible}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.default}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getClassAccessSectionElement(classAccess) {
    let contentLines = [];
    if (classAccess) {
        let filter = elementsFiltered['classAccesses'];
        if (!filter || classAccess.apexClass.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + classAccess.apexClass + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('apexClass_' + classAccess.apexClass + '_enabled', 'clickOnElementCheck(\'classAccesses\', \'' + classAccess.apexClass + '\', \'enabled\')', classAccess.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.class_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getCustomMetadataAccessSectionElement(customMetadataAccess) {
    let contentLines = [];
    if (customMetadataAccess) {
        let filter = elementsFiltered['customMetadataTypeAccesses'];
        if (!filter || customMetadataAccess.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + customMetadataAccess.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('customMetadata_' + customMetadataAccess.name + '_enabled', 'clickOnElementCheck(\'customMetadataTypeAccesses\', \'' + customMetadataAccess.name + '\', \'enabled\')', customMetadataAccess.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.custom_metadata_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getCustomPermissionSectionElement(customPermission) {
    let contentLines = [];
    if (customPermission) {
        let filter = elementsFiltered['customPermissions'];
        if (!filter || customPermission.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + customPermission.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('customPermission_' + customPermission.name + '_enabled', 'clickOnElementCheck(\'customPermissions\', \'' + customPermission.name + '\', \'enabled\')', customPermission.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.permission_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getCustomSettingAccessSectionElement(customSettingAccess) {
    let contentLines = [];
    if (customSettingAccess) {
        let filter = elementsFiltered['customSettingAccesses'];
        if (!filter || customSettingAccess.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + customSettingAccess.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('customSetting_' + customSettingAccess.name + '_enabled', 'clickOnElementCheck(\'customSettingAccesses\', \'' + customSettingAccess.name + '\', \'enabled\')', customSettingAccess.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.custom_setting_object_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getFieldPermissionsSectionElement(obj, field) {
    let contentLines = [];
    if (field) {
        let filter = elementsFiltered['fieldPermissions.' + obj];
        if (!filter || field.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + field.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('fieldPermission_' + obj + '.' + field.name + '_readable', 'clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'readable\')', field.readable) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('fieldPermission_' + obj + '.' + field.name + '_editable', 'clickOnElementCheck(\'fieldPermissions\', \'' + obj + '.' + field.name + '\', \'editable\')', field.editable) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.field_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.readable}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.editable}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getLayoutAssignmentSectionElement(obj, layoutAssignment, recordtypes) {
    let contentLines = [];
    if (layoutAssignment) {
        let filter = elementsFiltered['layoutAssignments'];
        if (!filter || layoutAssignment.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + layoutAssignment.name + '</td>');
            contentLines.push('<td class="tableCell">' + getRecordTypesSelect(obj, layoutAssignment, recordtypes) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.layout_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.assigned_record_type}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getLoginIpRangeSectionElement(index, loginIpRange) {
    let contentLines = [];
    if (loginIpRange) {
        contentLines.push('<tr class="tableRow">');
        contentLines.push('<td class="tableCell"><input style="width:90%" id="ip_startAddress_' + index + '" class="w3-input inputText" value="' + loginIpRange.startAddress + '" type="text" placeholder="{!label.start_address}..."></td>');
        contentLines.push('<td class="tableCell"><input style="width:90%" id="ip_endAddress_' + index + '" class="w3-input inputText" value="' + loginIpRange.endAddress + '" type="text" placeholder="{!label.end_address}..."></td>');
        contentLines.push('<td class="tableCell"><input style="width:90%" id="ip_description_' + index + '" class="w3-input inputText" value="' + loginIpRange.description + '" type="text" placeholder="{!label.description}..."></td>');
        contentLines.push('<td class="tableCell"><a class="material-icons" style="margin-top:12px; width:5px; cursor: pointer;" onclick="deleteLoginIpRange(' + index + ')">delete</a></td>');
        contentLines.push('</tr>');
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.start_address}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.end_address}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.description}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.actions}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getObjectPermissionSectionElement(objectPermission) {
    let contentLines = [];
    if (objectPermission) {
        let filter = elementsFiltered['layoutAssignments'];
        if (!filter || objectPermission.object.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + objectPermission.object + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_allowRead', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowRead\')', objectPermission.allowRead) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_allowCreate', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowCreate\')', objectPermission.allowCreate) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_allowEdit', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowEdit\')', objectPermission.allowEdit) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_allowDelete', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'allowDelete\')', objectPermission.allowDelete) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_viewAllRecords', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'viewAllRecords\')', objectPermission.viewAllRecords) + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('objectPermission_' + objectPermission.object + '_modifyAllRecords', 'clickOnElementCheck(\'objectPermissions\', \'' + objectPermission.object + '\', \'modifyAllRecords\')', objectPermission.modifyAllRecords) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.object_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.allow_read}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.allow_create}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.allow_edit}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.allow_delete}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.view_all_records}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.modify_all_records}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getPageAccessSectionElement(pageAccess) {
    let contentLines = [];
    if (pageAccess) {
        let filter = elementsFiltered['pageAccesses'];
        if (!filter || pageAccess.apexPage.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + pageAccess.apexPage + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('apexPage_' + pageAccess.apexPage + '_enabled', 'clickOnElementCheck(\'pageAccesses\', \'' + pageAccess.apexPage + '\', \'enabled\')', pageAccess.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.page_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getRecordTypeVisibilitySectionElement(obj, recordtypeVisibility) {
    let contentLines = [];
    if (recordtypeVisibility) {
        let filter = elementsFiltered['recordTypeVisibilities.' + obj];
        if (!filter || recordtypeVisibility.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + recordtypeVisibility.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('recordtype_' + obj + '.' + recordtypeVisibility.name + '_visible', 'clickOnElementCheck(\'recordTypeVisibilities\', \'' + obj + '.' + recordtypeVisibility.name + '\', \'visible\')', recordtypeVisibility.visible) + '</td>');
            contentLines.push('<td class="tableCell">' + getRadio('recordtype_' + obj + '.' + recordtypeVisibility.name + '_default', obj + '_rtDefault', 'clickOnElementCheck(\'recordTypeVisibilities\', \'' + recordtypeVisibility.name + '\', \'default\')', recordtypeVisibility.default) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.record_Type_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.visible}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.default}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getTabVisibilitySectionElement(tabVisibility) {
    let contentLines = [];
    if (tabVisibility) {
        let filter = elementsFiltered['tabVisibilities'];
        if (!filter || tabVisibility.tab.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + tabVisibility.tab + '</td>');
            contentLines.push('<td class="tableCell">' + getTabVisibilitySelect(tabVisibility.tab, tabVisibility.visibility) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.tab_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.visibility}</th>');
        contentLines.push('</tr>');
    }
    return contentLines;
}

function getUserPermissionSectionElement(userPermission) {
    let contentLines = [];
    if (userPermission) {
        let filter = elementsFiltered['userPermissions'];
        if (!filter || userPermission.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td class="tableCell">' + userPermission.name + '</td>');
            contentLines.push('<td class="tableCell">' + getCheckbox('userPermission_' + userPermission.name + '_enabled', 'clickOnElementCheck(\'userPermissions\', \'' + userPermission.name + '\', \'enabled\')', userPermission.enabled) + '</td>');
            contentLines.push('</tr>');
        }
    } else {
        contentLines.push('<tr class="tableHeaderRow">');
        contentLines.push('<th class="tableHeaderCell">{!label.user_permission_name}</th>');
        contentLines.push('<th class="tableHeaderCell">{!label.enabled}</th>');
        contentLines.push('</tr>');
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
        contentLines.push('\t\t\t\t\t\t\t\t<option value="DefaultOn">Default On</option>');
    if (selectedValue === 'DefaultOff')
        contentLines.push('\t\t\t\t\t\t\t\t<option value="DefaultOff" selected>Default Off</option>');
    else
        contentLines.push('\t\t\t\t\t\t\t\t<option value="DefaultOff">Default Off</option>');
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
    if (section === 'applicationVisibilities') {
        // @ts-ignore
        if (elementCheckField === 'default' && document.getElementById('app_' + elementName + '_' + elementCheckField).checked) {
            // @ts-ignore
            for (let appVisibility of permissionSet.applicationVisibilities) {
                appVisibility.default = false;
            }
        }
        // @ts-ignore
        for (let appVisibility of permissionSet.applicationVisibilities) {
            if (appVisibility.application == elementName) {
                // @ts-ignore
                appVisibility[elementCheckField] = document.getElementById('app_' + appVisibility.application + '_' + elementCheckField).checked;
            }
        }

    }
    if (section === 'classAccesses') {
        // @ts-ignore
        for (let apexClass of permissionSet.classAccesses) {
            if (apexClass.apexClass == elementName) {
                // @ts-ignore
                apexClass[elementCheckField] = document.getElementById('apexClass_' + apexClass.apexClass + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customMetadataTypeAccesses') {
        // @ts-ignore
        for (let customMetadata of permissionSet.customMetadataTypeAccesses) {
            if (customMetadata.name == elementName) {
                // @ts-ignore
                customMetadata[elementCheckField] = document.getElementById('customMetadata_' + customMetadata.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customPermissions') {
        // @ts-ignore
        for (let customPermission of permissionSet.customPermissions) {
            if (customPermission.name == elementName) {
                // @ts-ignore
                customPermission[elementCheckField] = document.getElementById('customPermission_' + customPermission.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'customSettingAccesses') {
        // @ts-ignore
        for (let customSetting of permissionSet.customSettingAccesses) {
            if (customSetting.name == elementName) {
                // @ts-ignore
                customSetting[elementCheckField] = document.getElementById('customSetting_' + customSetting.name + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'fieldPermissions') {
        // @ts-ignore
        for (let fieldPermission of permissionSet.fieldPermissions) {
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
    if (section === 'objectPermissions') {
        // @ts-ignore
        for (let objectPermission of permissionSet.objectPermissions) {
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
        for (let pageAccess of permissionSet.pageAccesses) {
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
            for (let appVisibility of permissionSet.applicationVisibilities) {
                appVisibility.default = false;
            }
        }
        // @ts-ignore
        for (let recordTypeVisibility of permissionSet.recordTypeVisibilities) {
            if (recordTypeVisibility.recordType == elementName) {
                // @ts-ignore
                recordTypeVisibility[elementCheckField] = document.getElementById('recordtype_' + recordTypeVisibility.recordType + '_' + elementCheckField).checked;
            }
        }
    }
    if (section === 'userPermissions') {
        // @ts-ignore
        for (let userPermission of permissionSet.userPermissions) {
            if (userPermission.name == elementName) {
                // @ts-ignore
                userPermission[elementCheckField] = document.getElementById('userPermission_' + userPermission.name + '_' + elementCheckField).checked;
            }
        }
    }
}

function addLoginIpRange() {
    // @ts-ignore
    permissionSet.loginIpRanges.push({ startAddress: '', endAddress: '', description: '' });
    setLoginIpRangesData(permissionSet);
}

function onSelectHour(moment) {
    // @ts-ignore
    permissionSet.loginHours[moment] = document.getElementById(moment + '_loginHours').value;
}

function onSelectVisibility(tabName) {
    // @ts-ignore
    let value = document.getElementById(tabName + '_visibility').value;
    // @ts-ignore
    for (let tabVisibility of permissionSet.tabVisibilities) {
        if (tabVisibility.tab === tabName)
            tabVisibility.visibility = value;
    }
}

function onSelectRecordType(obj, layoutName, recordtype) {
    // @ts-ignore
    // @ts-ignore
    let value = document.getElementById(obj + '-' + layoutName + '-' + recordType + '_assignment').value;
    // @ts-ignore
    for (let layoutAssignment of permissionSet.layoutAssignments) {
        if (layoutAssignment.layout === obj + '-' + layoutName) {
            if (recordtype === 'Master')
                layoutAssignment.recordType = undefined;
            else
                layoutAssignment.recordType = recordtype;
        }
    }
}

function openCloseSection(id, btnId) {
    var x = document.getElementById(id);
    let icon = document.getElementById(btnId);
    if (icon.innerHTML === 'expand_more') {
        x.className = x.className.replace(" w3-hide", " w3-show");
        icon.innerHTML = 'expand_less';
    } else if (icon.innerHTML === 'expand_less') {
        x.className = x.className.replace(" w3-show", " w3-hide");
        icon.innerHTML = 'expand_more';
    }
}

function deleteLoginIpRange(index) {
    // @ts-ignore
    if (permissionSet.loginIpRanges) {
        // @ts-ignore
        if (permissionSet.loginIpRanges.length - 1 >= index)
            // @ts-ignore
            permissionSet.loginIpRanges.splice(index, 1);
    }
    setLoginIpRangesData(permissionSet);
}

function save() {
    // @ts-ignore
    if (permissionSet.loginIpRanges && permissionSet.loginIpRanges.length > 0) {
        let index = 0;
        // @ts-ignore
        for (let loginIp of permissionSet.loginIpRanges) {
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
    permissionSet.description = document.getElementById('mainData_Description').value;
    vscode.postMessage({ command: 'save', profile: permissionSet });
}

function compressAndSave() {
    // @ts-ignore
    if (permissionSet.loginIpRanges && permissionSet.loginIpRanges.length > 0) {
        let index = 0;
        // @ts-ignore
        for (let loginIp of permissionSet.loginIpRanges) {
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
    permissionSet.description = document.getElementById('mainData_Description').value;
    vscode.postMessage({ command: 'compressAndSave', profile: permissionSet });
}

function getPermissionSetSectionName(profileSection) {
    let profileSectionNames = {
        applicationVisibilities: "{!label.application_visibilities}",
        categoryGroupVisibilities: "{!label.category_group_visibilities}",
        classAccesses: "{!label.class_accesses}",
        customMetadataTypeAccesses: "{!label.custom_metadata_type_accesses}",
        customPermissions: "{!label.custom_permissions}",
        customSettingAccesses: "{!label.custom_setting_accesses}",
        externalDataSourceAccesses: "{!label.external_data_source_accesses}",
        fieldPermissions: "{!label.field_permissions}",
        fieldLevelSecurities: "{!label.field_level_securities}",
        layoutAssignments: "{!label.layout_assignments}",
        loginHours: "{!label.login_hours}",
        loginIpRanges: "{!label.login_ip_ranges}",
        objectPermissions: "{!label.object_permissions}",
        pageAccesses: "{!label.page_accesses}",
        profileActionOverrides: "{!label.profile_action_overrides}",
        recordTypeVisibilities: "{!label.record_type_visibilities}",
        tabVisibilities: "{!label.tab_visibilities}",
        userPermissions: "{!label.user_permissions}"
    };
    return profileSectionNames[profileSection];
}

function onFilterElement(inputId, filterElement) {
    // @ts-ignore
    let filterText = document.getElementById(inputId).value;
    if (filterText)
        elementsFiltered[filterElement] = filterText;
    else if (elementsFiltered[filterElement])
        delete elementsFiltered[filterElement];
    let filterItem;
    if (filterElement.indexOf('.') !== -1) {
        let splits = filterElement.split('.');
        filterElement = splits[0];
        filterItem = splits[1];
    }
    switch (filterElement) {
        case 'applicationVisibilities':
            setAppVisibilityData(permissionSet);
            break;
        case 'classAccesses':
            setClassAccessesData(permissionSet);
            break;
        case 'customMetadataTypeAccesses':
            setCustomMetadataAccessesData(permissionSet);
            break;
        case 'customPermissions':
            setCustomPermissionsData(permissionSet);
            break;
        case 'customSettingAccesses':
            setCustomSettingAccessesData(permissionSet);
            break;
        case 'fieldPermissions':
            redrawFieldPermissionsForObject(filterItem);
            break;
        case 'layoutAssignments':
            redrawLayoutAssignmentForObject(filterItem);
            break;
        case 'objectPermissions':
            setObjectPermissionsData(permissionSet);
            break;
        case 'pageAccesses':
            setPageAccessesData(permissionSet);
            break;
        case 'recordTypeVisibilities':
            redrawRecordTypeVisibilities(filterItem);
            break;
        case 'tabVisibilities':
            setTabVisibilitiesData(permissionSet);
            break;
        case 'userPermissions':
            setUserPermissionsData(permissionSet);
            break;
        default:
            break;
    }
}

function getCheckbox(inputId, action, checked) {
    return '<div class="w3-col" style="width: 10%;"><label class="checkbox-label"><input id="' + inputId + '" type="checkbox" name="downloadOptions" ' + ((checked) ? 'checked' : '') + ' onclick="' + action + '"><span class="checkbox-custom"></span></label></div>';
}

function getRadio(inputId, name, action, checked) {
    return '<div class="w3-col" style="width: 10%;"><label class="checkbox-label"><input id="' + inputId + '" type="radio" name="' + name + '" ' + ((checked) ? 'checked' : '') + ' onclick="' + action + '"><span class="checkbox-custom circular"></span></label></div>';
}