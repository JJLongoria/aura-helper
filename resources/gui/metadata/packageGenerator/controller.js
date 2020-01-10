// @ts-ignore
let metadata;
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
            // @ts-ignore
            showContent();
            break;
        case 'metadataLoaded':
            metadata = eventData.metadata;
            document.getElementById('metadataContainer').style.display = 'block';
            drawMetadataTypes(true);
            // @ts-ignore
            closeSpinnerModal();
            break;
        case 'selectFromPackageOk':
            selectFromPackage(eventData.package);
            break;
        default:
            // @ts-ignore
            showContent();
            break;
    }
});

function loadMetadata(loadFrom) {
    console.log('@@Load Metadata');
    // @ts-ignore
    openSpinnerModal();
    vscode.postMessage({ command: "loadMetadata", loadFrom: loadFrom });
}

function drawMetadataTypes(deleteChilds) {
    let content = [];
    if (metadata) {
        content.push('<ul class="metadataList">');
        Object.keys(metadata).forEach(function (key) {
            let metadataType = metadata[key];
            if (metadataType.childs && Object.keys(metadataType.childs).length > 0) {
                let labelColor = (isAnyChecked(metadataType.childs)) ? "#DCDCAA" : "#D4D4D4";
                if (metadataTypeFilter && metadataTypeFilter.length > 0) {
                    if (key.toLowerCase().indexOf(metadataTypeFilter.toLowerCase()) != -1) {
                        content.push('<li class="metadataListElement" onclick="clickOnMetadataType(\'' + key + '\')">');
                        content.push(getCheckbox(metadataType.checked, key) + '<label id="label_' + key + '" style="padding-left: 8px; cursor: pointer; color: ' + labelColor + '">' + key + '</label>');
                        content.push('</li>');
                    }
                } else {
                    content.push('<li class="metadataListElement" onclick="clickOnMetadataType(\'' + key + '\')">');
                    content.push(getCheckbox(metadataType.checked, key) + '<label id="label_' + key + '" style="padding-left: 8px; cursor: pointer; color: ' + labelColor + '">' + key + '</label>');
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
            let labelColor = (isAnyChecked(metadataObject.childs)) ? "#DCDCAA" : "#D4D4D4";
            if (metadataObjectFilter && metadataObjectFilter.length > 0) {
                if (key.toLowerCase().indexOf(metadataObjectFilter.toLowerCase()) != -1) {
                    content.push('<li class="metadataListElement" onclick="clickOnMetadataObject(\'' + typeName + '\', \'' + key + '\')">');
                    content.push(getCheckbox(metadataObject.checked, typeName, key) + '<label id="label_' + typeName + '_' + key + '" style="padding-left: 8px; cursor: pointer; color: ' + labelColor + '">' + key + '</label>');
                    content.push('</li>');
                }
            } else {
                content.push('<li class="metadataListElement" onclick="clickOnMetadataObject(\'' + typeName + '\', \'' + key + '\')">');
                content.push(getCheckbox(metadataObject.checked, typeName, key) + '<label id="label_' + typeName + '_' + key + '" style="padding-left: 8px; cursor: pointer; color: ' + labelColor + '">' + key + '</label>');
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
                document.getElementById('label_' + typeName).style.color = '#D4D4D4';
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
                    document.getElementById('label_' + typeName + '_' + objName).style.color = '#D4D4D4';
                if (isAnyChecked(metadataType.childs)) {
                    document.getElementById('label_' + typeName).style.color = '#DCDCAA';
                    metadataType.checked = false;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = false;
                } else if (isAllChecked(metadataType.childs)) {
                    document.getElementById('label_' + typeName).style.color = '#D4D4D4';
                    metadataType.checked = true;
                    // @ts-ignore
                    document.getElementById('check_' + typeName).checked = true;
                } else {
                    document.getElementById('label_' + typeName).style.color = '#D4D4D4';
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
                        document.getElementById('label_' + typeName + '_' + objName).style.color = '#DCDCAA';
                        metadataObject.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = false;
                    } else if (isAllChecked(metadataObject.childs)) {
                        document.getElementById('label_' + typeName + '_' + objName).style.color = '#D4D4D4';
                        metadataObject.checked = true;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = true;
                    } else {
                        document.getElementById('label_' + typeName + '_' + objName).style.color = '#D4D4D4';
                        metadataObject.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName + '_' + objName).checked = false;
                    }
                    if (isAnyChecked(metadataType.childs) || isAnyChecked(metadataObject.childs)) {
                        document.getElementById('label_' + typeName).style.color = '#DCDCAA';
                        metadataType.checked = false;
                        // @ts-ignore
                        document.getElementById('check_' + typeName).checked = false;
                    } else if (isAllChecked(metadataType.childs)) {
                        document.getElementById('label_' + typeName).style.color = '#D4D4D4';
                        metadataType.checked = true;
                        // @ts-ignore
                        document.getElementById('check_' + typeName).checked = true;
                    } else {
                        document.getElementById('label_' + typeName).style.color = '#D4D4D4';
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
        if (objects[key].checked)
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
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                    if (document.getElementById('check_' + key + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + childKey).checked = true;
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
            if (objects[key].childs && Object.keys(objects[key].childs).length > 0) {
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                    if (document.getElementById('check_' + key + '_' + childKey))
                        // @ts-ignore
                        document.getElementById('check_' + key + '_' + childKey).checked = false;
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

function createPackage(createFor) {
    let anyChecked = false;
    if (metadata) {
        Object.keys(metadata).forEach(function (key) {
            if (metadata[key].childs && Object.keys(metadata[key].childs).length > 0) {
                Object.keys(metadata[key].childs).forEach(function (childKey) {
                    if (metadata[key].childs[childKey].childs && Object.keys(metadata[key].childs[childKey].childs).length > 0) {
                        if (!anyChecked && isAnyChecked(metadata[key].childs[childKey].childs))
                            anyChecked = true;
                    } else {
                        if (!anyChecked && isAnyChecked(metadata[key].childs))
                            anyChecked = true;
                    }
                });
            }
        });
        if (!anyChecked && isAnyChecked(metadata))
            anyChecked = true;
    }
    if (anyChecked)
        vscode.postMessage({ command: "createPackage", metadata: metadata, createFor: createFor, saveOn: saveOn });
    else
        vscode.postMessage({ command: "notMetadataSelected" });
}

function selectAll() {
    let component = document.getElementById('selectAll');
    let selectAll = (component.innerHTML === 'All') ? true : false;
    let linkText = (component.innerHTML === 'All') ? 'None' : 'All';
    console.log(component.innerHTML);
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
        console.log(JSON.stringify(pkg, null, 2));
        Object.keys(pkg).forEach(function (type) {
            if (metadata[type]) {
                if (pkg[type].includes('*')) {
                    metadata[type].checked = true;
                    checkAll(metadata[type].childs, type);
                } else {
                    for (let member of pkg[type]) {
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

function onChangeSaveOn(elementId) {
    console.log(elementId);
    let element = document.getElementById(elementId);
    console.log(element);
    // @ts-ignore
    if (element.checked)
        // @ts-ignore
        saveOn = element.value;
    console.log(saveOn);
}