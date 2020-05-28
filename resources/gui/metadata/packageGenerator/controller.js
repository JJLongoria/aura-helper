// @ts-ignore
let metadata;
let metadataForDeploy;
let metadataForDelete;
let nClicksOnMetadata = 0;
let nClicksOnObject = 0;
let lastTypeClicked;
let lastObjectClicked;
let metadataTypeFilter;
let metadataObjectFilter;
let metadataItemFilter;
let selectedMetadataType;
let selectedMetadataItem;
let selectedMetadataObject;
let saveOn = 'saveOnProject';
let isDestructive = false;
let createFor = 'forRetrieve';
let selectFromGitValue = 'twoLastCommits';
let selectedOptionToDownload = 'owned';
let deleteOrderValue = 'after';
let commits = [];
let branches = [];
// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener('message', event => {
    let eventData = event.data;
    switch (eventData.command) {
        case 'open':
            // @ts-ignore
            showContent();
            break;
        case 'metadataLoaded':
            metadataForDeploy = eventData.metadata.metadataForDeploy;
            metadataForDelete = eventData.metadata.metadataForDelete;
            if (isDestructive)
                metadata = metadataForDelete;
            else
                metadata = metadataForDeploy;
            document.getElementById('metadataContainer').style.display = 'block';
            drawMetadataTypes(true);
            // @ts-ignore
            closeSpinnerModal();
            break;
        case 'selectFromPackageOk':
            if (isDestructive)
                metadata = metadataForDelete;
            else
                metadata = metadataForDeploy;
            selectFromPackage(eventData.package);
        case 'lessThanTwoCommitsError':
            // @ts-ignore
            showContent();
            break;
        case 'gitData':
            commits = eventData.data.commits;
            branches = eventData.data.branches;
            openGitModal();
            // @ts-ignore
            showContent();
            break;
        case 'metadataSelectedFromGit':
            metadataForDeploy = eventData.metadata.metadataForDeploy;
            metadataForDelete = eventData.metadata.metadataForDelete;
            if (isDestructive)
                metadata = metadataForDelete;
            else
                metadata = metadataForDeploy;
            metadata = metadataForDeploy;
            drawMetadataTypes(metadata);
            closeGitModal();
            // @ts-ignore
            showContent();
            break;
        case 'packageCreated':
            // @ts-ignore
            showPageMessage('success', '{!label.package_created_ok}');
            break;
        case 'destructivePackageCreated':
            // @ts-ignore
            showPageMessage('success', '{!label.destructive_package_ok}');
            break;
        case 'fullPackageCreated':
            // @ts-ignore
            showPageMessage('success', '{!label.full_package_ok}');
            break;
        case 'selectFromPackageError':
            // @ts-ignore
            showPageMessage('error', '{!label.select_from_package_error}');
            break;
        case 'packageError':
            // @ts-ignore
            showPageMessage('error', '{!label.creating_package_error} ' + eventData.data.error);
            break;
        case 'processKilled':
            // @ts-ignore
            showPageMessage('info', '{!label.user_canceled_operation}');
            break;
        default:
            // @ts-ignore
            showContent();
            break;
    }
});

function loadMetadata(loadFrom) {
    // @ts-ignore
    closeAllPageMessages();
    // @ts-ignore
    openSpinnerModal();
    vscode.postMessage({ command: "loadMetadata", loadFrom: loadFrom, selectedOptionToDownload: selectedOptionToDownload });
}

function drawMetadataTypes(deleteChilds) {
    let content = [];
    if (metadata) {
        content.push('<ul class="metadataList">');
        Object.keys(metadata).forEach(function (key) {
            let metadataType = metadata[key];
            if (metadataType.childs && Object.keys(metadataType.childs).length > 0) {
                let colorClass = (isAnyChecked(metadataType.childs)) ? "metadataContentSelected" : "metadataContentColor";
                if (metadataTypeFilter && metadataTypeFilter.length > 0) {
                    if (key.toLowerCase().indexOf(metadataTypeFilter.toLowerCase()) != -1) {
                        content.push('<li class="metadataListElement" onclick="clickOnMetadataType(\'' + key + '\')">');
                        content.push(getCheckbox(metadataType.checked, key) + '<label id="label_' + key + '" style="padding-left: 8px; cursor: pointer;" class="' + colorClass + '">' + key + '</label>');
                        content.push('</li>');
                    }
                } else {
                    content.push('<li class="metadataListElement" onclick="clickOnMetadataType(\'' + key + '\')">');
                    content.push(getCheckbox(metadataType.checked, key) + '<label id="label_' + key + '" style="padding-left: 8px; cursor: pointer;" class="' + colorClass + '">' + key + '</label>');
                    content.push('</li>');
                }
            }
        });
        content.push('</ul>');
    }
    document.getElementById('metadataTypesContainer').innerHTML = content.join('\n');
    if (deleteChilds) {
        document.getElementById('metadataItemsContainer').innerHTML = '';
        document.getElementById('metadataObjectsContainer').innerHTML = '';
    }
}

function drawMetadataObjects(typeName, objects, deleteChilds) {
    let content = [];
    if (objects) {
        content.push('<ul class="metadataList">');
        Object.keys(objects).forEach(function (key) {
            let metadataObject = objects[key];
            let colorClass = (isAnyChecked(metadataObject.childs)) ? "metadataContentSelected" : "metadataContentColor";
            if (metadataObjectFilter && metadataObjectFilter.length > 0) {
                if (key.toLowerCase().indexOf(metadataObjectFilter.toLowerCase()) != -1) {
                    content.push('<li class="metadataListElement" onclick="clickOnMetadataObject(\'' + typeName + '\', \'' + key + '\')">');
                    content.push(getCheckbox(metadataObject.checked, typeName, key) + '<label id="label_' + typeName + '_' + key + '" style="padding-left: 8px; cursor: pointer;" class="' + colorClass + '">' + key + '</label>');
                    content.push('</li>');
                }
            } else {
                content.push('<li class="metadataListElement" onclick="clickOnMetadataObject(\'' + typeName + '\', \'' + key + '\')">');
                content.push(getCheckbox(metadataObject.checked, typeName, key) + '<label id="label_' + typeName + '_' + key + '" style="padding-left: 8px; cursor: pointer;" class="' + colorClass + '">' + key + '</label>');
                content.push('</li>');
            }
        });
        content.push('</ul>');
    }
    document.getElementById('metadataObjectsContainer').innerHTML = content.join('\n');
    if (deleteChilds)
        document.getElementById('metadataItemsContainer').innerHTML = '';
}

function drawMetadataItems(typeName, objectName, items) {
    let content = [];
    if (items) {
        content.push('<ul class="metadataList">');
        Object.keys(items).forEach(function (key) {
            let metadataItem = items[key];
            if (metadataItemFilter && metadataItemFilter.length > 0) {
                if (key.toLowerCase().indexOf(metadataItemFilter.toLowerCase()) != -1) {
                    content.push('<li class="metadataListElement" onclick="clickOnMetadataItem(\'' + typeName + '\', \'' + objectName + '\', \'' + key + '\')">');
                    content.push(getCheckbox(metadataItem.checked, typeName, objectName, key) + '<label id="label_' + typeName + '_' + objectName + '_' + key + '" style="padding-left: 8px; cursor: pointer;">' + key + '</label>');
                    content.push('</li>');
                }
            } else {
                content.push('<li class="metadataListElement" onclick="clickOnMetadataItem(\'' + typeName + '\', \'' + objectName + '\', \'' + key + '\')">');
                content.push(getCheckbox(metadataItem.checked, typeName, objectName, key) + '<label id="label_' + typeName + '_' + objectName + '_' + key + '" style="padding-left: 8px; cursor: pointer;">' + key + '</label>');
                content.push('</li>');
            }
        });
        content.push('</ul>');
    }
    document.getElementById('metadataItemsContainer').innerHTML = content.join('\n');
}

function clickOnMetadataType(typeName) {
    nClicksOnObject = 0;
    lastObjectClicked = undefined;
    if (lastTypeClicked === typeName)
        nClicksOnMetadata++;
    else
        nClicksOnMetadata = 0;
    selectedMetadataType = typeName;
    if (metadata) {
        let metadataType = metadata[typeName];
        if (metadataType) {
            if (Object.keys(metadataType.childs).length > 0) {
                if (nClicksOnMetadata > 0) {
                    metadataType.checked = !metadataType.checked;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = metadataType.checked;
                    if (metadataType.checked)
                        checkAll(metadataType.childs, typeName)
                    else
                        uncheckAll(metadataType.childs, typeName);
                }
            } else {
                metadataType.checked = !metadataType.checked;
                // @ts-ignore
                document.getElementById('check_' + typeName).checked = metadataType.checked;
            }
            if (metadataType.checked)
                document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentSelected', 'metadataContentColor');
            if (Object.keys(metadataType.childs).length > 0) {
                document.getElementById('metadataObjectsTitle').innerHTML = typeName;
                drawMetadataObjects(typeName, metadataType.childs, true);
            } else {
                document.getElementById('metadataItemsContainer').innerHTML = '';
                document.getElementById('metadataObjectsContainer').innerHTML = '';
            }
        }
    }
    lastTypeClicked = typeName;
}

function clickOnMetadataObject(typeName, objName) {
    nClicksOnMetadata = 0;
    lastTypeClicked = undefined;
    if (lastObjectClicked === objName)
        nClicksOnObject++;
    else
        nClicksOnObject = 0;
    selectedMetadataObject = objName;
    if (metadata) {
        let metadataType = metadata[typeName];
        if (metadataType) {
            let metadataObject = metadataType.childs[objName];
            if (metadataObject) {
                if (Object.keys(metadataObject.childs).length > 0) {
                    if (nClicksOnObject > 0) {
                        metadataObject.checked = !metadataObject.checked;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = metadataObject.checked;
                        if (metadataObject.checked)
                            checkAll(metadataObject.childs, objName, typeName)
                        else
                            uncheckAll(metadataObject.childs, objName, typeName);
                    }
                } else {
                    metadataObject.checked = !metadataObject.checked;
                    // @ts-ignore
                    document.getElementById('check_' + typeName + '_' + objName).checked = metadataObject.checked;
                }
                if (metadataObject.checked)
                    document.getElementById('label_' + typeName + '_' + objName).className = document.getElementById('label_' + typeName + '_' + objName).className.replace('metadataContentSelected', 'metadataContentColor');
                if (isAnyChecked(metadataType.childs)) {
                    document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName + '_' + objName).className.replace('metadataContentColor', 'metadataContentSelected');
                    metadataType.checked = false;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = false;
                } else if (isAllChecked(metadataType.childs)) {
                    document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentSelected', 'metadataContentColor');
                    metadataType.checked = true;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = true;
                } else {
                    document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentSelected', 'metadataContentColor');
                    metadataType.checked = false;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = false;
                }
                if (Object.keys(metadataObject.childs).length > 0) {
                    document.getElementById('metadataItemsTitle').innerHTML = typeName + ': ' + objName;
                    drawMetadataItems(typeName, objName, metadataObject.childs);
                } else {
                    document.getElementById('metadataItemsContainer').innerHTML = '';
                }
            }
        }
    }
    lastObjectClicked = objName;
}

function clickOnMetadataItem(typeName, objName, itemName) {
    nClicksOnMetadata = 0;
    nClicksOnObject = 0;
    lastTypeClicked = undefined;
    lastObjectClicked = undefined;
    selectedMetadataItem = itemName;
    if (metadata) {
        let metadataType = metadata[typeName];
        if (metadataType) {
            let metadataObject = metadataType.childs[objName];
            if (metadataObject) {
                let metadataItem = metadataObject.childs[itemName]
                if (metadataItem) {
                    metadataItem.checked = !metadataItem.checked;
                    // @ts-ignore
                    document.getElementById('check_' + typeName + '_' + objName + '_' + itemName).checked = metadataItem.checked;
                    if (isAnyChecked(metadataObject.childs)) {
                        document.getElementById('label_' + typeName + '_' + objName).className = document.getElementById('label_' + typeName + '_' + objName).className.replace('metadataContentColor', 'metadataContentSelected');
                        metadataObject.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = false;
                    } else if (isAllChecked(metadataObject.childs)) {
                        document.getElementById('label_' + typeName + '_' + objName).className = document.getElementById('label_' + typeName + '_' + objName).className.replace('metadataContentSelected', 'metadataContentColor');
                        metadataObject.checked = true;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = true;
                    } else {
                        document.getElementById('label_' + typeName + '_' + objName).className = document.getElementById('label_' + typeName + '_' + objName).className.replace('metadataContentSelected', 'metadataContentColor');
                        metadataObject.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = false;
                    }
                    if (isAnyChecked(metadataType.childs) || isAnyChecked(metadataObject.childs)) {
                        document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentColor', 'metadataContentSelected');
                        metadataType.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName).checked = false;
                    } else if (isAllChecked(metadataType.childs)) {
                        document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentSelected', 'metadataContentColor');
                        metadataType.checked = true;
                        // @ts-ignore
                        document.getElementById('check_' + typeName).checked = true;
                    } else {
                        document.getElementById('label_' + typeName).className = document.getElementById('label_' + typeName).className.replace('metadataContentSelected', 'metadataContentColor');
                        metadataType.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName).checked = false;
                    }
                }
            }
        }
    }
}

function isAnyChecked(objects) {
    let nChecked = 0;
    let nUnchecked = 0;
    Object.keys(objects).forEach(function (key) {
        let object = objects[key];
        if (object.childs && Object.keys(object.childs).length > 0) {
            Object.keys(object.childs).forEach(function (childKey) {
                let child = object.childs[childKey];
                if (child.checked)
                    nChecked++;
                else
                    nUnchecked++;
            });
        }
        if (object.checked)
            nChecked++;
        else
            nUnchecked++;
    });
    return nChecked > 0 && nUnchecked > 0;
}

function isAllChecked(objects) {
    let nChecked = 0;
    Object.keys(objects).forEach(function (key) {
        if (objects[key].checked)
            nChecked++;
    });
    return Object.keys(objects).length === nChecked;
}

function checkAll(objects, parent, grandParent) {
    if (!parent && !grandParent) {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = true;
            if (document.getElementById('check_' + key))
                // @ts-ignore
                document.getElementById('check_' + key).checked = true;
            if (document.getElementById('label_' + key))
                document.getElementById('label_' + key).className = document.getElementById('label_' + key).className.replace('metadataContentSelected', 'metadataContentColor');
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                    if (document.getElementById('check_' + key + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + childKey).checked = true;
                    if (document.getElementById('label_' + key + '_' + childKey))
                        document.getElementById('label_' + key + '_' + childKey).className = document.getElementById('label_' + key + '_' + childKey).className.replace('metadataContentSelected', 'metadataContentColor');
                    if (objects[key].childs[childKey].childs && Object.keys(objects[key].childs[childKey].childs).length > 0) {
                        Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                            objects[key].childs[childKey].childs[grandChildKey].checked = true;
                            if (document.getElementById('check_' + key + '_' + childKey + '_' + grandChildKey))
                                // @ts-ignore
                                document.getElementById('check_' + key + '_' + childKey + '_' + grandChildKey).checked = true;
                        });
                    }
                });
            }
        });
    } else if (parent && !grandParent) {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = true;
            if (document.getElementById('check_' + parent + '_' + key))
                // @ts-ignore
                document.getElementById('check_' + parent + '_' + key).checked = true;
            if (document.getElementById('label_' + parent + '_' + key))
                document.getElementById('label_' + parent + '_' + key).className = document.getElementById('label_' + parent + '_' + key).className.replace('metadataContentSelected', 'metadataContentColor');
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                    if (document.getElementById('check_' + key + '_' + parent + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + parent + '_' + childKey).checked = true;
                });
            }
        });
    } else {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = true;
            if (document.getElementById('check_' + grandParent + '_' + parent + '_' + key))
                // @ts-ignore
                document.getElementById('check_' + grandParent + '_' + parent + '_' + key).checked = true;
        });
    }
}

function uncheckAll(objects, parent, grandParent) {
    if (!parent && !grandParent) {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = false;
            if (document.getElementById('check_' + key))
                // @ts-ignore
                document.getElementById('check_' + key).checked = false;
            if (document.getElementById('label_' + key))
                document.getElementById('label_' + key).className = document.getElementById('label_' + key).className.replace('metadataContentSelected', 'metadataContentColor');
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                    if (document.getElementById('check_' + key + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + childKey).checked = false;
                    if (document.getElementById('label_' + key + '_' + childKey))
                        document.getElementById('label_' + key + '_' + childKey).className = document.getElementById('label_' + key + '_' + childKey).className.replace('metadataContentSelected', 'metadataContentColor');
                    if (objects[key].childs[childKey].childs && Object.keys(objects[key].childs[childKey].childs).length > 0) {
                        Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                            objects[key].childs[childKey].childs[grandChildKey].checked = false;
                            if (document.getElementById('check_' + key + '_' + childKey + '_' + grandChildKey))
                                // @ts-ignore
                                document.getElementById('check_' + key + '_' + childKey + '_' + grandChildKey).checked = false;
                        });
                    }
                });
            }
        });
    } else if (parent && !grandParent) {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = false;
            if (document.getElementById('check_' + parent + '_' + key))
                // @ts-ignore
                document.getElementById('check_' + parent + '_' + key).checked = false;
            if (document.getElementById('label_' + parent + '_' + key))
                document.getElementById('label_' + parent + '_' + key).className = document.getElementById('label_' + parent + '_' + key).className.replace('metadataContentSelected', 'metadataContentColor');
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                    if (document.getElementById('check_' + key + '_' + parent + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + parent + '_' + childKey).checked = false;
                });
            }
        });
    } else {
        Object.keys(objects).forEach(function (key) {
            objects[key].checked = false;
            if (document.getElementById('check_' + grandParent + '_' + parent + '_' + key))
                // @ts-ignore
                document.getElementById('check_' + grandParent + '_' + parent + '_' + key).checked = false;
        });
    }
}

function onCreateFromChanged(elementId) {
    let element = document.getElementById(elementId);
    // @ts-ignore
    if (element.checked)
        // @ts-ignore
        loadFrom = element.value;
}

function onChangeMetadataTypeFilter() {
    // @ts-ignore
    metadataTypeFilter = document.getElementById('filterMetadataType').value;
    drawMetadataTypes(false);
}

function onChangeMetadataObjectFilter() {
    // @ts-ignore
    metadataObjectFilter = document.getElementById('filterMetadataObject').value;
    if (selectedMetadataType && metadata[selectedMetadataType] && Object.keys(metadata[selectedMetadataType].childs).length > 0) {
        drawMetadataObjects(selectedMetadataType, metadata[selectedMetadataType].childs, false);
    }
}

function onChangeMetadataItemFilter() {
    // @ts-ignore
    metadataItemFilter = document.getElementById('filterMetadataItem').value;
    if (selectedMetadataType && metadata[selectedMetadataType] && Object.keys(metadata[selectedMetadataType].childs).length > 0 && metadata[selectedMetadataType].childs[selectedMetadataObject] && Object.keys(metadata[selectedMetadataType].childs[selectedMetadataObject].childs).length > 0) {
        drawMetadataItems(selectedMetadataType, selectedMetadataObject, metadata[selectedMetadataType].childs[selectedMetadataObject].childs);
    }
}

function createPackage() {
    // @ts-ignore
    closeAllPageMessages();
    let anyChecked = false;
    if (metadataForDeploy) {
        Object.keys(metadataForDeploy).forEach(function (key) {
            if (metadataForDeploy[key].childs && Object.keys(metadataForDeploy[key].childs).length > 0) {
                Object.keys(metadataForDeploy[key].childs).forEach(function (childKey) {
                    if (metadataForDeploy[key].childs[childKey].childs && Object.keys(metadataForDeploy[key].childs[childKey].childs).length > 0) {
                        if (isAnyChecked(metadataForDeploy[key].childs[childKey].childs) || isAllChecked(metadataForDeploy[key].childs[childKey].childs))
                            anyChecked = true;
                    } else {
                        if (isAnyChecked(metadataForDeploy[key].childs) || isAllChecked(metadataForDeploy[key].childs))
                            anyChecked = true;
                    }
                });
            }
        });
        if (isAnyChecked(metadataForDeploy) || isAllChecked(metadataForDeploy))
            anyChecked = true;
    }
    if (anyChecked)
        vscode.postMessage({ command: "createPackage", metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, createFor: createFor, saveOn: saveOn, deleteOrder: deleteOrderValue });
    else {
        // @ts-ignore
        showPageMessage('error', '{!label.not_metadata_selected_for_package_error}');
    }
}

function createDestructive() {
    // @ts-ignore
    closeAllPageMessages();
    let anyChecked = false;
    if (metadataForDelete) {
        Object.keys(metadataForDelete).forEach(function (key) {
            if (metadataForDelete[key].childs && Object.keys(metadataForDelete[key].childs).length > 0) {
                Object.keys(metadataForDelete[key].childs).forEach(function (childKey) {
                    if (metadataForDelete[key].childs[childKey].childs && Object.keys(metadataForDelete[key].childs[childKey].childs).length > 0) {
                        if (isAnyChecked(metadataForDelete[key].childs[childKey].childs) || isAllChecked(metadataForDelete[key].childs[childKey].childs))
                            anyChecked = true;
                    } else {
                        if (isAnyChecked(metadataForDelete[key].childs) || isAllChecked(metadataForDelete[key].childs))
                            anyChecked = true;
                    }
                });
            }
        });
        if (isAnyChecked(metadataForDelete) || isAllChecked(metadataForDelete))
            anyChecked = true;
    }
    if (anyChecked)
        vscode.postMessage({ command: "createDestructive", metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, createFor: createFor, saveOn: saveOn, deleteOrder: deleteOrderValue });
    else {
        // @ts-ignore
        showPageMessage('error', '{!label.not_metadata_selected_for_destructive_package_error}');
    }
}

function createFullPackage() {
    // @ts-ignore
    closeAllPageMessages();
    let anyCheckedForDelete = false;
    let anyCheckedForDeploy = false;
    if (metadataForDelete) {
        Object.keys(metadataForDelete).forEach(function (key) {
            if (metadataForDelete[key].childs && Object.keys(metadataForDelete[key].childs).length > 0) {
                Object.keys(metadataForDelete[key].childs).forEach(function (childKey) {
                    if (metadataForDelete[key].childs[childKey].childs && Object.keys(metadataForDelete[key].childs[childKey].childs).length > 0) {
                        if (isAnyChecked(metadataForDelete[key].childs[childKey].childs) || isAllChecked(metadataForDelete[key].childs[childKey].childs))
                            anyCheckedForDelete = true;
                    } else {
                        if (isAnyChecked(metadataForDelete[key].childs) || isAllChecked(metadataForDelete[key].childs))
                            anyCheckedForDelete = true;
                    }
                });
            }
        });
        if (isAnyChecked(metadataForDelete) || isAllChecked(metadataForDelete))
            anyCheckedForDelete = true;
    }
    if (metadataForDeploy) {
        Object.keys(metadataForDeploy).forEach(function (key) {
            if (metadataForDeploy[key].childs && Object.keys(metadataForDeploy[key].childs).length > 0) {
                Object.keys(metadataForDeploy[key].childs).forEach(function (childKey) {
                    if (metadataForDeploy[key].childs[childKey].childs && Object.keys(metadataForDeploy[key].childs[childKey].childs).length > 0) {
                        if (isAnyChecked(metadataForDeploy[key].childs[childKey].childs) || isAllChecked(metadataForDeploy[key].childs[childKey].childs))
                            anyCheckedForDeploy = true;
                    } else {
                        if (isAnyChecked(metadataForDeploy[key].childs) || isAllChecked(metadataForDeploy[key].childs))
                            anyCheckedForDeploy = true;
                    }
                });
            }
        });
        if (isAnyChecked(metadataForDeploy) || isAllChecked(metadataForDeploy))
            anyCheckedForDeploy = true;
    }
    if (anyCheckedForDeploy || anyCheckedForDelete)
        vscode.postMessage({ command: "createFullPackage", metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, createFor: createFor, saveOn: saveOn, deleteOrder: deleteOrderValue });
    else {
        // @ts-ignore
        showPageMessage('error', '{!label.not_metadata_selected_for_full_package_error}');
    }
}

function selectAll() {
    let component = document.getElementById('selectAll');
    let selectAll = (component.innerHTML === 'All') ? true : false;
    let linkText = (component.innerHTML === 'All') ? 'None' : 'All';
    if (metadata) {
        if (selectAll) {
            checkAll(metadata);
        } else {
            uncheckAll(metadata);
        }
        component.innerHTML = linkText;
    }
}

function selectFromPackage(pkg) {
    if (!pkg) {
        vscode.postMessage({ command: "selectFromPackage" });
    }
    else if (metadata) {
        Object.keys(pkg).forEach(function (type) {
            if (metadata[type]) {
                if (pkg[type].includes('*')) {
                    metadata[type].checked = true;
                    checkAll(metadata[type].childs, type);
                } else {
                    for (let member of pkg[type]) {
                        let separator;
                        if (type === 'EmailTemplate' || type === 'Document' || type === 'Report' || type === 'Dashboard') {
                            // @ts-ignore
                            separator = '/';
                        } else if (type === 'Layout' || type === 'CustomObjectTranslation' || type === 'Flow') {
                            // @ts-ignore
                            separator = '-';
                        } else {
                            // @ts-ignore
                            separator = '.';
                        }
                        // @ts-ignore
                        if (member.indexOf(separator) != -1) {
                            // @ts-ignore
                            let object = member.substring(0, member.indexOf(separator));
                            // @ts-ignore
                            let item = member.substring(member.indexOf(separator) + 1);
                            if (metadata[type].childs[object] && metadata[type].childs[object].childs[item]) {
                                metadata[type].childs[object].childs[item].checked = true;
                                metadata[type].childs[object].checked = isAllChecked(metadata[type].childs[object].childs);
                            }
                        } else {
                            if (metadata[type].childs[member])
                                metadata[type].childs[member].checked = true;
                        }
                    }
                    metadata[type].checked = isAllChecked(metadata[type].childs);
                }
            }
        });
    }
    drawMetadataTypes(true);
}

function openSelectForGitOptions() {
    // @ts-ignore
    openSpinnerModal();
    vscode.postMessage({ command: "getGitData" });
}

function openGitModal() {
    if (commits && commits.length > 0) {
        let commitsContent = [];
        let index = 0;
        for (const commit of commits) {
            commitsContent.push('<ul class="w3-ul w3-card-4">');
            commitsContent.push('<li class="w3-bar">');
            commitsContent.push('<div class="w3-bar-item">');
            commitsContent.push('<i class="material-icons md-48">polymer</i>');
            commitsContent.push('</div>');
            commitsContent.push('<div class="w3-bar-item">');
            commitsContent.push('<span><b>' + commit.pointer + '</b></span><br>');
            commitsContent.push('<span class="w3-small">Title: ' + commit.title + '</span><br>');
            commitsContent.push('<span class="w3-tiny">Autor: ' + commit.author + '</span><br>');
            commitsContent.push('<span class="w3-tiny">Date: ' + commit.date.dateStr + '</span><br>');
            commitsContent.push('</div>');
            commitsContent.push('<div onclick="clickOnCommit(2, ' + index + ')" class="w3-bar-item w3-right menu" style="cursor:pointer; margin-left: 15px; padding-top:15px">');
            commitsContent.push('<i class="material-icons md-32">filter_2</i>');
            commitsContent.push('</div>');
            commitsContent.push('<div onclick="clickOnCommit(1, ' + index + ')" class="w3-bar-item w3-right menu" style="cursor:pointer; padding-top:15px"">');
            commitsContent.push('<i class="material-icons md-32">filter_1</i>');
            commitsContent.push('</div>');
            commitsContent.push('</li>');
            commitsContent.push('</ul>');
            index++;
        }
        document.getElementById('commitsListContent').innerHTML = commitsContent.join('\n');
    }
    if (branches && branches.length > 0) {
        let oneBranchesContent = [];
        let twoBranchesContent = [];
        let index = 0;
        // @ts-ignore
        for (const branch of branches) {
            if (branch.indexOf('*') === -1)
                oneBranchesContent.push(getBranchXML(branch, index, true));
            twoBranchesContent.push(getBranchXML(branch, index, false));
            index++;
        }
        document.getElementById('branchListForOneBranchContent').innerHTML = oneBranchesContent.join('\n');
        document.getElementById('branchListForTwoBranchesContent').innerHTML = twoBranchesContent.join('\n');
    }
    document.getElementById("gitModal").style.display = "block";
}

function getBranchXML(branch, index, forOne) {
    let branchContent = [];
    branchContent.push('<ul class="w3-ul w3-card-4">');
    branchContent.push('<li class="w3-bar">');
    branchContent.push('<div class="w3-bar-item">');
    branchContent.push('<i class="material-icons md-48">merge_type</i>');
    branchContent.push('</div>');
    branchContent.push('<div class="w3-bar-item">');
    branchContent.push('<span><b>' + branch + '</b></span><br>');
    branchContent.push('</div>');
    if (forOne) {
        branchContent.push('<div onclick="clickOnBranch(0, ' + index + ')" class="w3-bar-item w3-right menu" style="cursor:pointer; padding-top:15px"">');
        branchContent.push('<i class="material-icons md-32">filter_1</i>');
        branchContent.push('</div>');
    } else {
        branchContent.push('<div onclick="clickOnBranch(2, ' + index + ')" class="w3-bar-item w3-right menu" style="cursor:pointer; padding-top:15px"">');
        branchContent.push('<i class="material-icons md-32">filter_2</i>');
        branchContent.push('</div>');
        branchContent.push('<div onclick="clickOnBranch(1, ' + index + ')" class="w3-bar-item w3-right menu" style="cursor:pointer; padding-top:15px"">');
        branchContent.push('<i class="material-icons md-32">filter_1</i>');
        branchContent.push('</div>');
    }
    branchContent.push('</li>');
    branchContent.push('</ul>');
    return branchContent.join('\n');
}

function clickOnBranch(branchNumber, index) {
    let branch = branches[index];
    if (branchNumber === 0)
        // @ts-ignore
        document.getElementById('branchInput').value = branch.replace('*', '').trim();
    if (branchNumber === 1)
        // @ts-ignore
        document.getElementById('firstBranchInput').value = branch.replace('*', '').trim();
    if (branchNumber === 2)
        // @ts-ignore
        document.getElementById('secondBranchInput').value = branch.replace('*', '').trim();
}

function clickOnCommit(commitNumber, index) {
    let commit = commits[index];
    if (commitNumber === 1)
        // @ts-ignore
        document.getElementById('firstCommitInput').value = commit.pointer;
    if (commitNumber === 2)
        // @ts-ignore
        document.getElementById('secondCommitInput').value = commit.pointer;
}

function getCheckbox(checked, type, object, item) {
    if (type && !object && !item)
        return '<label class="w3-left checkbox-label"><input disabled id="check_' + type + '" type="checkbox" ' + ((checked) ? 'checked' : '') + '><span class="checkbox-custom"></label>';
    if (type && object && !item)
        return '<label class="w3-left checkbox-label"><input disabled id="check_' + type + '_' + object + '" type="checkbox" ' + ((checked) ? 'checked' : '') + '><span class="checkbox-custom"></label>';
    else
        return '<label class="w3-left checkbox-label"><input disabled id="check_' + type + '_' + object + '_' + item + '" type="checkbox" ' + ((checked) ? 'checked' : '') + '><span class="checkbox-custom"></label>';
}

function getRadio(checked, radioId, group) {
    return '<label class="w3-left checkbox-label"><input disabled id="' + radioId + '" type="radio" name="' + group + '" ' + ((checked) ? 'checked' : '') + '><span class="checkbox-custom"></label>';
}

function changeMetadataForSelect(inputId) {
    // @ts-ignore
    let value = document.getElementById(inputId).value;
    // @ts-ignore
    let checked = document.getElementById(inputId).checked;
    if (checked && value === 'deploy')
        isDestructive = false;
    else
        isDestructive = true;
    if (isDestructive) {
        metadata = metadataForDelete;
    } else {
        metadata = metadataForDeploy;
    }
    drawMetadataTypes(metadata);
}

function onChangeSaveOn(elementId) {
    let element = document.getElementById(elementId);
    // @ts-ignore
    if (element.checked)
        // @ts-ignore
        saveOn = element.value;
}

function onClickChangeFromGit(inputId) {
    // @ts-ignore
    let checked = document.getElementById(inputId).checked;
    if (checked) {
        // @ts-ignore
        selectFromGitValue = document.getElementById(inputId).value;
        // @ts-ignore
        correctInput('firstCommitInput');
        // @ts-ignore
        correctInput('secondCommitInput');
        // @ts-ignore
        correctInput('branchInput');
        // @ts-ignore
        correctInput('firstBranchInput');
        // @ts-ignore
        correctInput('secondBranchInput');
        document.getElementById('gitValidationMessage').style.display = 'none';
        if (selectFromGitValue === 'twoLastCommits') {
            document.getElementById('fromSpecificTwoCommitsBody').style.display = 'none';
            document.getElementById('fromOtherBranchBody').style.display = 'none';
            document.getElementById('fromOtherTwoBranchesBody').style.display = 'none';
        } else if (selectFromGitValue === 'specificCommits') {
            document.getElementById('fromSpecificTwoCommitsBody').style.display = 'block';
            document.getElementById('fromOtherBranchBody').style.display = 'none';
            document.getElementById('fromOtherTwoBranchesBody').style.display = 'none';
        } else if (selectFromGitValue === 'otherBranch') {
            document.getElementById('fromSpecificTwoCommitsBody').style.display = 'none';
            document.getElementById('fromOtherBranchBody').style.display = 'block';
            document.getElementById('fromOtherTwoBranchesBody').style.display = 'none';
        } else if (selectFromGitValue === 'twoBranches') {
            document.getElementById('fromSpecificTwoCommitsBody').style.display = 'none';
            document.getElementById('fromOtherBranchBody').style.display = 'none';
            document.getElementById('fromOtherTwoBranchesBody').style.display = 'block';
        }
    }
}

function selectFromGit() {
    let errorMessage = [];
    if (selectFromGitValue === 'twoLastCommits') { 
        // @ts-ignore
        openSpinnerModal();
        vscode.postMessage({ command: "selectFromGit", source: selectFromGitValue, data: { metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete } } });
        closeGitModal();
    } else if (selectFromGitValue === 'specificCommits') {
        // @ts-ignore
        let firstCommit = getCommit(document.getElementById('firstCommitInput').value);
        // @ts-ignore
        let secondCommit = getCommit(document.getElementById('secondCommitInput').value);
        if (!firstCommit) {
            errorMessage.push('{!label.first_commit_missing}');
            // @ts-ignore
            wrongInput('firstCommitInput');
        } else {
            // @ts-ignore
            correctInput('firstCommitInput');
        }
        if (!secondCommit) {
            errorMessage.push('{!label.second_commit_missing}');
            // @ts-ignore
            wrongInput('secondCommitInput');
        } else {
            // @ts-ignore
            correctInput('secondCommitInput');
        }
        if (firstCommit && secondCommit) {
            if (firstCommit.pointer === secondCommit.pointer) {
                errorMessage.push('{!label.same_commits_error}');
                // @ts-ignore
                wrongInput('firstCommitInput');
                // @ts-ignore
                wrongInput('secondCommitInput');
            } else {
                let firsCommitDate = new Date(firstCommit.date.dateStr);
                let secondCommitDate = new Date(secondCommit.date.dateStr);
                if ((firsCommitDate.valueOf() - secondCommitDate.valueOf()) > 0) {
                    errorMessage.push('{!label.wrong_commits_order}');
                    // @ts-ignore
                    wrongInput('firstCommitInput');
                    // @ts-ignore
                    wrongInput('secondCommitInput');
                } else {
                    // @ts-ignore
                    correctInput('secondCommitInput');
                    // @ts-ignore
                    correctInput('firstCommitInput');
                }
            }
        }
        if (errorMessage.length > 0) {
            document.getElementById('gitValidationMessage').innerHTML = errorMessage.join('\n');
            document.getElementById('gitValidationMessage').style.display = 'block';
        } else {
            // @ts-ignore
            openSpinnerModal();
            vscode.postMessage({ command: "selectFromGit", source: selectFromGitValue, data: { metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, firstCommit: firstCommit, secondCommit: secondCommit } });
            closeGitModal();
        }
    } else if (selectFromGitValue === 'otherBranch') {
        // @ts-ignore
        let branch = document.getElementById('branchInput').value;
        if (!branch) {
            errorMessage.push('{!label.branch_missing}');
            // @ts-ignore
            wrongInput('branchInput');
        } else {
            // @ts-ignore
            correctInput('branchInput');
        }
        if (errorMessage.length > 0) {
            document.getElementById('gitValidationMessage').innerHTML = errorMessage.join('\n');
            document.getElementById('gitValidationMessage').style.display = 'block';
        } else {
            // @ts-ignore
            openSpinnerModal();
            vscode.postMessage({ command: "selectFromGit", source: selectFromGitValue, data: { metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, branch: branch } });
            closeGitModal();
        }
    } else if (selectFromGitValue === 'twoBranches') {
        // @ts-ignore
        let firstBranch = document.getElementById('firstBranchInput').value;
        // @ts-ignore
        let secondBranch = document.getElementById('secondBranchInput').value;
        if (!firstBranch) {
            // @ts-ignore
            wrongInput('firstBranchInput');
            errorMessage.push('{!label.first_branch_missing}');
        } else {
            // @ts-ignore
            correctInput('firstBranchInput');
        }
        if (!secondBranch) {
            // @ts-ignore
            wrongInput('secondBranchInput');
            errorMessage.push('{!label.second_branch_missing}');
        } else {
            // @ts-ignore
            correctInput('secondBranchInput');
        }
        if (firstBranch && secondBranch) {
            if (firstBranch === secondBranch) {
                // @ts-ignore
                wrongInput('firstBranchInput');
                // @ts-ignore
                wrongInput('secondBranchInput');
                errorMessage.push('{!label.same_branches_error}');
            } else {
                // @ts-ignore
                correctInput('secondBranchInput');
                // @ts-ignore
                correctInput('firstBranchInput');
            }
        }
        if (errorMessage.length > 0) {
            document.getElementById('gitValidationMessage').innerHTML = errorMessage.join('\n');
            document.getElementById('gitValidationMessage').style.display = 'block';
        } else {
            // @ts-ignore
            openSpinnerModal();
            vscode.postMessage({ command: "selectFromGit", source: selectFromGitValue, data: { metadata: { metadataForDeploy: metadataForDeploy, metadataForDelete: metadataForDelete }, firstBranch: firstBranch, secondBranch: secondBranch } });
            closeGitModal();
        }
    }
}

function getCommit(commitId) {
    if (commits) {
        for (const commit of commits) {
            if (commit.pointer === commitId)
                return commit;
        }
    }
    return undefined;
}

function changeCreateFor(inputId) {
    // @ts-ignore
    let value = document.getElementById(inputId).value;
    // @ts-ignore
    let checked = document.getElementById(inputId).checked;
    if (checked)
        createFor = value;
}

function deleteOrder(inputId){
    // @ts-ignore
    let value = document.getElementById(inputId).value;
    // @ts-ignore
    let checked = document.getElementById(inputId).checked;
    if (checked)
        deleteOrderValue = value;
}

function changeDownloadMetadataOptions(inputId) {
    // @ts-ignore
    let value = document.getElementById(inputId).value;
    // @ts-ignore
    let checked = document.getElementById(inputId).checked;
    if (checked)
        selectedOptionToDownload = value;
}

function closeGitModal() {
    document.getElementById('fromSpecificTwoCommitsBody').style.display = 'none';
    document.getElementById('fromOtherBranchBody').style.display = 'none';
    document.getElementById('fromOtherTwoBranchesBody').style.display = 'none';
    selectFromGitValue = 'twoLastCommits';
    document.getElementById('gitValidationMessage').style.display = 'none';
    // @ts-ignore
    document.getElementById('fromLastTwoCommitsInput').checked = true;
    document.getElementById("gitModal").style.display = "none";
}

function gitFetch() {
    vscode.postMessage({ command: 'fetch' });
    document.getElementById("gitModal").style.display = "none";
    // @ts-ignore
    openSpinnerModal();
}