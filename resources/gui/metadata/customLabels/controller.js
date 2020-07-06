let customLabels;
let filterText = '';
let selectedCategory = 'all';
let modalType = 'new';
let label;
let orderByValue = 'fullName';
let orderInverse = false;
let orderIcon = 'expand_more';
let labelIndex;
// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener('message', event => {
    let eventData = event.data;
    switch (eventData.command) {
        case 'open':
            customLabels = eventData.model;
            customLabels.sort(function (labelA, labelB) {
                return labelA.fullName.toLowerCase().localeCompare(labelB.fullName.toLowerCase());
            });
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showContent();
            break;
        case 'deleted':
            customLabels = eventData.model;
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showPageMessage('success', formatStr('{!label.label_deleted_ok}', [eventData.extraData.label.fullName]));
            // @ts-ignore
            showContent();
            break;
        case 'deletedError':
            customLabels = eventData.model;
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showPageMessage('error', '{!label.label_delete_error}: \n' + eventData.error);
            // @ts-ignore
            showContent();
            break;
        case 'created':
            customLabels = eventData.model;
            // @ts-ignore
            showContent();
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showPageMessage('success', formatStr('{!label.label_created_succesfully}', [eventData.extraData.label.fullName]));
            break;
        case 'edited':
            customLabels = eventData.model;
            // @ts-ignore
            showContent();
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showPageMessage('success', formatStr('{!label.label_edited_succesfully}', [eventData.extraData.label.fullName]));
            break;
        case 'processKilled':
            // @ts-ignore
            showPageMessage('info', '{!label.user_canceled_operation}');
            break;
        default:
            break;
    }
});

function drawCategoryOptions(customLabels) {
    let content = [];
    let categories = [];
    content.push('<option value="all" selected>{!label.all_categories}</option>');
    content.push('<option value="none">{!label.no_category}</option>');
    for (const label of customLabels) {
        if (label.categories !== undefined && !categories.includes(label.categories))
            categories.push(label.categories);

    }
    for (const category of categories) {
        content.push('<option value="' + category + '">' + category + '</option>');
    }
    document.getElementById('selectCategories').innerHTML = content.join('\n');
}

function drawCustomLabels(customLabels) {
    let contentLines = [];
    contentLines.push('<table class="w3-table table">');
    contentLines.push('<tr class="tableHeaderRow">');
    contentLines.push('<th class="tableHeaderCell">{!label.actions}</th>');
    contentLines.push('<th onclick="orderBy(\'fullNameIcon\', \'fullName\')" class="tableHeaderCell">{!label.name}' + ((orderByValue === 'fullName') ? '<i id="fullNameIcon" class="material-icons w3-right">' + orderIcon + '</i>' : '') + '</th>');
    contentLines.push('<th onclick="orderBy(\'categoryIcon\', \'categories\')" class="tableHeaderCell">{!label.category}' + ((orderByValue === 'categories') ? '<i id="categoryIcon" class="material-icons w3-right">' + orderIcon + '</i>' : '') + '</th>');
    contentLines.push('<th onclick="orderBy(\'descriptionIcon\', \'shortDescription\')" class="tableHeaderCell">{!label.description}' + ((orderByValue === 'shortDescription') ? '<i id="descriptionIcon" class="material-icons w3-right">' + orderIcon + '</i>' : '') + '</th>');
    contentLines.push('<th onclick="orderBy(\'valueIcon\', \'value\')" class="tableHeaderCell">{!label.value}' + ((orderByValue === 'value') ? '<i id="valueIcon" class="material-icons w3-right">' + orderIcon + '</i>' : '') + '</th>');
    contentLines.push('<th onclick="orderBy(\'languageIcon\', \'language\')" class="tableHeaderCell">{!label.language}' + ((orderByValue === 'language') ? '<i id="languageIcon" class="material-icons w3-right">' + orderIcon + '</i>' : '') + '</th>');
    contentLines.push('</tr>');
    let index = 0;
    for (const label of customLabels) {
        let category = ((label.categories !== undefined) ? label.categories : '');
        if (filterText && filterText.trim().length > 0) {
            if (label.fullName.toLowerCase().indexOf(filterText.trim().toLowerCase()) !== -1) {
                if (!selectedCategory || selectedCategory === 'all') {
                    contentLines.push('<tr class="tableRow">');
                    contentLines.push('<td>');
                    contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
                    contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
                    contentLines.push('</td>');
                    contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
                    contentLines.push('<td class="tableCell">' + category + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
                    contentLines.push('</tr>');
                } else if (selectedCategory && selectedCategory === 'none' && category === '') {
                    contentLines.push('<tr class="tableRow">');
                    contentLines.push('<td>');
                    contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
                    contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
                    contentLines.push('</td>');
                    contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
                    contentLines.push('<td class="tableCell">' + category + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
                    contentLines.push('</tr>');
                } else if (selectedCategory && category === selectedCategory) {
                    contentLines.push('<tr class="tableRow">');
                    contentLines.push('<td>');
                    contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
                    contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
                    contentLines.push('</td>');
                    contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
                    contentLines.push('<td class="tableCell">' + category + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
                    contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
                    contentLines.push('</tr>');
                }
            }
        } else if (!selectedCategory || selectedCategory === 'all') {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td>');
            contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
            contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
            contentLines.push('</td>');
            contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.categories !== undefined) ? label.categories : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
            contentLines.push('</tr>');
        } else if (selectedCategory && selectedCategory === 'none' && category === '') {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td>');
            contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
            contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
            contentLines.push('</td>');
            contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.categories !== undefined) ? label.categories : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
            contentLines.push('</tr>');
        } else if (category && category === selectedCategory) {
            contentLines.push('<tr class="tableRow">');
            contentLines.push('<td>');
            contentLines.push('<a onclick="onClickEdit(' + index + ')"href="#"><i class="material-icons">edit</i></a>');
            contentLines.push('<a onclick="onClickDelete(' + index + ')" href="#"><i class="material-icons">delete</i></a>');
            contentLines.push('</td>');
            contentLines.push('<td class="tableCell">' + label.fullName + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.categories !== undefined) ? label.categories : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.shortDescription !== undefined) ? label.shortDescription : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.value !== undefined) ? label.value : '') + '</td>');
            contentLines.push('<td class="tableCell">' + ((label.language !== undefined) ? label.language : '') + '</td>');
            contentLines.push('</tr>');
        }
        index++;
    }
    contentLines.push('</table>');
    document.getElementById('customLabelsContent').innerHTML = contentLines.join('\n');
}

function onSearchCustomLabel() {
    // @ts-ignore
    filterText = document.getElementById('searchCustomLabel').value;
    drawCustomLabels(customLabels);
}

function onChangeCategory() {
    // @ts-ignore
    selectedCategory = document.getElementById('selectCategories').value
    drawCustomLabels(customLabels);
}

function onClickDelete(index) {
    // @ts-ignore
    closeAllPageMessages();
    labelIndex = index;
    openConfirmation();
}

function onClickEdit(index) {
    // @ts-ignore
    closeAllPageMessages();
    modalType = 'edit';
    label = customLabels[index];
    let category = ((label.categories !== undefined && label.categories.trim().length > 0) ? label.categories : 'not.custom.label.category.selected');
    let content = [];
    let categories = [];
    document.getElementById("labelModalTitle").innerHTML = '{!label.edit} <b>' + label.fullName + '</b> Label';
    content.push('<option value="not.custom.label.category.selected">{!label.no_category}</option>');
    for (const label of customLabels) {
        if (label.categories !== undefined && !categories.includes(label.categories))
            categories.push(label.categories);

    }
    for (const category of categories) {
        content.push('<option value="' + category + '">' + category + '</option>');
    }
    document.getElementById('labelCategoryInputSelect').innerHTML = content.join('\n');
    content = [];
    let languages = [];
    for (const label of customLabels) {
        if (label.language !== undefined && !languages.includes(label.language))
            languages.push(label.language);
    }
    for (const language of languages) {
        content.push('<option value="' + language + '">' + language + '</option>');
    }
    document.getElementById('labelLanguageInputSelect').innerHTML = content.join('\n');

    // @ts-ignore
    document.getElementById("labelNameInput").value = label.fullName;
    // @ts-ignore
    document.getElementById("labelNameInput").disabled = true;
    // @ts-ignore
    document.getElementById("labelDescriptionInput").value = ((label.shortDescription !== undefined) ? label.shortDescription : '');
    // @ts-ignore
    document.getElementById("labelValueInput").value = ((label.value !== undefined) ? label.value : '');
    // @ts-ignore
    document.getElementById("labelCategoryInput").value = '';
    // @ts-ignore
    document.getElementById("labelCategoryInputSelect").value = category;
    // @ts-ignore
    document.getElementById("labelLanguageInputSelect").value = ((label.language !== undefined) ? label.language : languages[0]);
    document.getElementById("labelModal").style.display = "block";
}

function onClickNewLabel() {
    // @ts-ignore
    closeAllPageMessages();
    modalType = 'new';
    let content = [];
    let categories = [];
    label = {
        fullName: undefined,
        shortDescription: undefined,
        value: undefined,
        categories: undefined,
        language: undefined
    };
    document.getElementById("labelModalTitle").innerHTML = '{!label.new_custom_label}';
    content.push('<option value="not.custom.label.category.selected">{!label.no_category}</option>');
    for (const label of customLabels) {
        if (label.categories !== undefined && !categories.includes(label.categories))
            categories.push(label.categories);

    }
    for (const category of categories) {
        content.push('<option value="' + category + '">' + category + '</option>');
    }
    document.getElementById('labelCategoryInputSelect').innerHTML = content.join('\n');
    content = [];
    let languages = [];
    for (const label of customLabels) {
        if (label.language !== undefined && !languages.includes(label.language))
            languages.push(label.language);
    }
    for (const language of languages) {
        content.push('<option value="' + language + '">' + language + '</option>');
    }
    document.getElementById('labelLanguageInputSelect').innerHTML = content.join('\n');
    // @ts-ignore
    document.getElementById("labelNameInput").value = '';
    // @ts-ignore
    document.getElementById("labelDescriptionInput").value = '';
    // @ts-ignore
    document.getElementById("labelValueInput").value = '';
    // @ts-ignore
    document.getElementById("labelCategoryInput").value = '';
    // @ts-ignore
    document.getElementById("labelCategoryInputSelect").value = 'not.custom.label.category.selected';
    // @ts-ignore
    document.getElementById("labelLanguageInputSelect").value = (languages.length > 0) ? languages[0] : '';
    document.getElementById("labelModal").style.display = "block";

}

function closeLabelModal() {
    document.getElementById("labelModal").style.display = "none";
}

function orderBy(iconId, field) {
    let icon = document.getElementById(iconId);
    if (icon) {
        if (icon.innerHTML === 'expand_more') {
            orderInverse = true;
            orderIcon = 'expand_less';
        } else {
            orderIcon = 'expand_more';
            orderInverse = false;
        }
    } else {
        orderIcon = 'expand_more';
        orderInverse = false;
    }
    orderByValue = field;
    customLabels.sort(function (labelA, labelB) {
        let fieldA = (labelA[orderByValue]) ? labelA[orderByValue] : '';
        let fieldB = (labelB[orderByValue]) ? labelB[orderByValue] : '';
        if (orderInverse)
            return fieldB.toLowerCase().localeCompare(fieldA.toLowerCase());
        else
            return fieldA.toLowerCase().localeCompare(fieldB.toLowerCase());
    });
    drawCustomLabels(customLabels);
}

function onClickNewCategory() {
    // @ts-ignore
    let checked = document.getElementById('onClickNewCategoryInput').checked;
    if (checked) {
        document.getElementById('newLabelCategoryContent').style.display = 'block';
        document.getElementById('existingLabelCategoryContent').style.display = 'none';
    } else {
        document.getElementById('newLabelCategoryContent').style.display = 'none';
        document.getElementById('existingLabelCategoryContent').style.display = 'block';
    }
}

function openConfirmation() {
    document.getElementById('confirmationModalTitle').innerHTML = '{!label.delete_confirmation_label_title}';
    document.getElementById('confirmationModalContent').innerHTML = '{!label.delete_confirmation_label_message}';
    document.getElementById('confirmationModal').style.display = 'block';
}

function cancelConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function okConfirmation() {
    // @ts-ignore
    openSpinnerModal();
    vscode.postMessage({ command: 'delete', labels: customLabels, index: labelIndex });
    document.getElementById('confirmationModal').style.display = 'none';
}

function save() {
    // @ts-ignore
    closeAllPageMessages();
    document.getElementById('labelValidation').innerHTML = '';
    document.getElementById('labelValidation').style.display = 'none';
    let errorMessage = [];
    // @ts-ignore
    let fullName = document.getElementById('labelNameInput').value;
    // @ts-ignore
    let shortDescription = document.getElementById('labelDescriptionInput').value;
    // @ts-ignore
    let value = document.getElementById('labelValueInput').value;
    // @ts-ignore
    let categories = undefined;
    // @ts-ignore
    let newCategory = document.getElementById('onClickNewCategoryInput').checked;
    // @ts-ignore
    if (newCategory)
        // @ts-ignore
        categories = document.getElementById('labelCategoryInput').value;
    else
        // @ts-ignore
        categories = document.getElementById('labelCategoryInputSelect').value;
    // @ts-ignore
    let language = document.getElementById('labelLanguageInputSelect').value;
    if (!fullName || fullName.trim().length === 0) {
        errorMessage.push('{!label.label_name_missing_error}');
        // @ts-ignore
        wrongInput('labelNameInput');
    } else {
        // @ts-ignore
        correctInput('labelNameInput');
    }
    if (!shortDescription || shortDescription.trim().length === 0) {
        errorMessage.push('{!label.label_description_missing_error}');
        // @ts-ignore
        wrongInput('labelDescriptionInput');
    } else {
        // @ts-ignore
        correctInput('labelDescriptionInput');
    }
    if (!value || value.trim().length === 0) {
        errorMessage.push('{!label.label_value_missing_error}');
        // @ts-ignore
        wrongInput('labelValueInput');
    } else {
        // @ts-ignore
        correctInput('labelValueInput');
    }
    if (errorMessage.length === 0) {
        label = {
            fullName: fullName,
            shortDescription: shortDescription,
            value: value,
            categories: (categories === 'not.custom.label.category.selected') ? undefined : categories,
            language: language
        };
        if (modalType === 'new') {
            let exists = false;
            for (const existingLabel of customLabels) {
                if (existingLabel.fullName === label.fullName) {
                    exists = true;
                    break;
                }
            }
            if (exists) {
                errorMessage.push('{!label.duplicate_label_error}');
            } else {
                // @ts-ignore
                openSpinnerModal();
                vscode.postMessage({ command: modalType, labels: customLabels, label: label });
            }
        } else {
            closeLabelModal();
            // @ts-ignore
            openSpinnerModal();
            vscode.postMessage({ command: modalType, labels: customLabels, label: label });
        }
    } else {
        document.getElementById('labelValidation').innerHTML = errorMessage.join('\n');
        document.getElementById('labelValidation').style.display = 'block';
    }
}
