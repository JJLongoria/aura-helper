// @ts-ignore
let metadata;
let metadataOnLocal;
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
// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener('message', event => {
    let eventData = event.data;
    switch (eventData.command) {
        case 'open':
            metadata = eventData.model;
            document.getElementById('metadataContainer').style.display = 'block';
            drawMetadataTypes(true);
            // @ts-ignore
            showContent();
            break;
        case 'selectFromPackageOk':
            selectFromPackage(eventData.package);
            break;
        case 'metadataDeleted':
            metadata = eventData.data.metadata;
            drawMetadataTypes(true);
            // @ts-ignore
            showPageMessage('success', '{!label.metadata_deleted_succesfully}');
            break;
        case 'metadataDeletedError':
            // @ts-ignore
            showPageMessage('error', '{!label.delete_metadata_error}' + '\n' + eventData.data.error);
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

function deleteMetadata() {
    // @ts-ignore
    closeAllPageMessages();
    let anyChecked = false;
    if (metadata) {
        Object.keys(metadata).forEach(function (key) {
            if (metadata[key].childs && Object.keys(metadata[key].childs).length > 0) {
                Object.keys(metadata[key].childs).forEach(function (childKey) {
                    if (metadata[key].childs[childKey].childs && Object.keys(metadata[key].childs[childKey].childs).length > 0) {
                        if (isAnyChecked(metadata[key].childs[childKey].childs) || isAllChecked(metadata[key].childs[childKey].childs))
                            anyChecked = true;
                    } else {
                        if (isAnyChecked(metadata[key].childs) || isAllChecked(metadata[key].childs))
                            anyChecked = true;
                    }
                });
            }
        });
        if (isAnyChecked(metadata) || isAllChecked(metadata))
            anyChecked = true;
    }
    if (anyChecked)
        vscode.postMessage({ command: 'delete', model: { metadataOnOrg: metadata, metadataOnLocal: metadataOnLocal } });
    else {
        // @ts-ignore
        showPageMessage('error', '{!label.not_metadata_selected_for_delete}');
    }
}
