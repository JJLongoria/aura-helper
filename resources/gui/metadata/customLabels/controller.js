let customLabels;
let filterText = '';
let selectedCategory = 'all';
let modalType = 'new';
let label;

// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener('message', event => {
    let eventData = event.data;
    switch (eventData.command) {
        case 'open':
            customLabels = eventData.model;
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            // @ts-ignore
            showContent();
            break;
        case 'deleted':
            customLabels = eventData.model;
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            break;
        case 'created':
            customLabels = eventData.model;
            // @ts-ignore
            showContent();
            closeLabelModal();
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
            break;
        case 'edited':
            customLabels = eventData.model;
            // @ts-ignore
            showContent();
            closeLabelModal();
            drawCategoryOptions(customLabels);
            drawCustomLabels(customLabels);
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
    customLabels.sort(function (labelA, labelB) {
        return labelA.fullName.toLowerCase().localeCompare(labelB.fullName.toLowerCase());
    });
    contentLines.push('<table class="w3-table table">');
    contentLines.push('<tr class="tableHeaderRow">');
    contentLines.push('<th class="tableHeaderCell">{!label.actions}</th>');
    contentLines.push('<th class="tableHeaderCell">{!label.name}</th>');
    contentLines.push('<th class="tableHeaderCell">{!label.category}</th>');
    contentLines.push('<th class="tableHeaderCell">{!label.description}</th>');
    contentLines.push('<th class="tableHeaderCell">{!label.value}</th>');
    contentLines.push('<th class="tableHeaderCell">{!label.language}</th>');
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
    vscode.postMessage({ command: 'delete', labels: customLabels, index: index });
}

function onClickEdit(index) {
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

function save() {
    let correct = true;
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
    if (!fullName || fullName.trim().length === 0)
        correct = false;
    if (!shortDescription || shortDescription.trim().length === 0)
        correct = false;
    if (!value || value.trim().length === 0)
        correct = false;
    if (correct) {
        // @ts-ignore
        openSpinnerModal();
        label = {
            fullName: fullName,
            shortDescription: shortDescription,
            value: value,
            categories: (categories === 'not.custom.label.category.selected') ? undefined : categories,
            language: language
        };
        vscode.postMessage({ command: modalType, labels: customLabels, label: label });
    } else {
        // @ts-ignore
        document.getElementById('labelNameInput').value = fullName;
        // @ts-ignore
        document.getElementById('labelDescriptionInput').value = shortDescription;
        // @ts-ignore
        document.getElementById('labelValueInput').value = value;
    }
}
