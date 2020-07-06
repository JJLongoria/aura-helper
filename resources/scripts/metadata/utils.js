const Logger = require('../utils/logger');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const MetadataType = require('./metadataTypes');
const Config = require('../core/config');

const availableLanguages = [
    {
        label: "Albanian",
        value: "sq",
    },
    {
        label: "Afrikaans",
        value: "af",
    },
    {
        label: "Arabic",
        value: "ar",
    },
    {
        label: "Arabic (Algeria)",
        value: "ar_DZ",
    },
    {
        label: "Arabic (Bahrain)",
        value: "ar_BH",
    },
    {
        label: "Arabic (Egypt)",
        value: "ar_EG",
    },
    {
        label: "Arabic (Jordan)",
        value: "ar_JO",
    },
    {
        label: "Arabic (Kuwait)",
        value: "ar_KW",
    },
    {
        label: "Arabic (Lebanon)",
        value: "ar_LB",
    },
    {
        label: "Arabic (Libya)",
        value: "ar_LY",
    },
    {
        label: "Arabic (Morocco)",
        value: "ar_MA",
    },
    {
        label: "Arabic (Oman)",
        value: "ar_OM",
    },
    {
        label: "Arabic (Saudi Arabia)",
        value: "ar_SA",
    },
    {
        label: "Arabic (Sudan)",
        value: "ar_SD",
    },
    {
        label: "Arabic (Syria)",
        value: "ar_SY",
    },
    {
        label: "Arabic (Tunisia)",
        value: "ar_TN",
    },
    {
        label: "Arabic (United Arab Emirates)",
        value: "ar_AE",
    },
    {
        label: "Arabic (Yemen)",
        value: "ar_YE",
    },
    {
        label: "Armenian",
        value: "hy",
    },
    {
        label: "Basque",
        value: "eu",
    },
    {
        label: "Bosnian",
        value: "bs",
    },
    {
        label: "Bengali",
        value: "bn",
    },
    {
        label: "Bulgarian",
        value: "bg",
    },
    {
        label: "Burmese",
        value: "my",
    },
    {
        label: "Catalan",
        value: "ca",
    },
    {
        label: "Chinese (Simplified)",
        value: "zh_CN",
    },
    {
        label: "Chinese (Traditional)",
        value: "zh_TW",
    },
    {
        label: "Chinese (Hong Kong)",
        value: "zh_HK",
    },
    {
        label: "Chinese (Singapore)",
        value: "zh_SG",
    },
    {
        label: "Croatian",
        value: "hr",
    },
    {
        label: "Czech",
        value: "cs",
    },
    {
        label: "Danish",
        value: "da",
    },
    {
        label: "Dutch",
        value: "nl_NL",
    },
    {
        label: "Dutch (Belgium)",
        value: "nl_BE",
    },
    {
        label: "English",
        value: "en_US",
    },
    {
        label: "English (UK)",
        value: "en_GB",
    },
    {
        label: "English (Australia)",
        value: "en_AU",
    },
    {
        label: "English (Canada)",
        value: "en_CA",
    },
    {
        label: "English (Hong Kong)",
        value: "en_HK",
    },
    {
        label: "English (India)",
        value: "en_IN",
    },
    {
        label: "English (Ireland)",
        value: "en_IE",
    },
    {
        label: "English (Malaysia)",
        value: "en_MY",
    },
    {
        label: "English (New Zealand)",
        value: "en_NZ",
    },
    {
        label: "English (Philippines)",
        value: "en_PH",
    },
    {
        label: "English (Singapore)",
        value: "en_SG",
    },
    {
        label: "English (South Africa)",
        value: "en_ZA",
    },
    {
        label: "Estonian",
        value: "et",
    },
    {
        label: "Farsi",
        value: "fa",
    },
    {
        label: "Finnish",
        value: "fi",
    },
    {
        label: "French",
        value: "fr",
    },
    {
        label: "French (Belgium)",
        value: "fr_BE",
    },
    {
        label: "French (Canada)",
        value: "fr_CA",
    },
    {
        label: "French (Luxembourg)",
        value: "fr_LU",
    },
    {
        label: "French (Switzerland)",
        value: "fr_CH",
    },
    {
        label: "Georgian",
        value: "ka",
    },
    {
        label: "German",
        value: "de",
    },
    {
        label: "German (Austria)",
        value: "de_AT",
    },
    {
        label: "German (Belgium)",
        value: "de_BE",
    },
    {
        label: "German (Luxembourg)",
        value: "de_LU",
    },
    {
        label: "German (Switzerland)",
        value: "de_CH",
    },
    {
        label: "Greek",
        value: "el",
    },
    {
        label: "Gujarati",
        value: "gu",
    },
    {
        label: "Hebrew",
        value: "iw",
    },
    {
        label: "Hungarian",
        value: "hu",
    },
    {
        label: "Hindi",
        value: "hi",
    },
    {
        label: "Icelandic",
        value: "is",
    },
    {
        label: "Indonesian",
        value: "in",
    },
    {
        label: "Irish",
        value: "ga",
    },
    {
        label: "Italian",
        value: "it",
    },
    {
        label: "Italian (Switzerland)",
        value: "it_CH",
    },
    {
        label: "Japanese",
        value: "ja",
    },
    {
        label: "Kannada",
        value: "kn",
    },
    {
        label: "Korean",
        value: "ko",
    },
    {
        label: "Latvian",
        value: "lv",
    },
    {
        label: "Lithuanian",
        value: "lt",
    },
    {
        label: "Luxembourgish",
        value: "lb",
    },
    {
        label: "Macedonian",
        value: "mk",
    },
    {
        label: "Malay",
        value: "ms",
    },
    {
        label: "Malayalam",
        value: "ml",
    },
    {
        label: "Maltese",
        value: "mt",
    },
    {
        label: "Marathi",
        value: "mr",
    },
    {
        label: "Montenegrin",
        value: "sh_ME",
    },
    {
        label: "Norwegian",
        value: "no",
    },
    {
        label: "Polish",
        value: "pl",
    },
    {
        label: "Portuguese (European)",
        value: "pt_PT",
    },
    {
        label: "Portuguese (Brazil)",
        value: "pt_BR",
    },
    {
        label: "Romanian",
        value: "ro",
    },
    {
        label: "Romanian (Moldova)",
        value: "ro_MD",
    },
    {
        label: "Romansh",
        value: "rm",
    },
    {
        label: "Russian",
        value: "ru",
    },
    {
        label: "Serbian (Cyrillic)",
        value: "sr",
    },
    {
        label: "Serbian (Latin)",
        value: "sh",
    },
    {
        label: "Slovak",
        value: "sk",
    },
    {
        label: "Slovenian",
        value: "sl",
    },
    {
        label: "Spanish",
        value: "es",
    },
    {
        label: "Spanish (Argentina)",
        value: "es_AR",
    },
    {
        label: "Spanish (Bolivia)",
        value: "es_BO",
    },
    {
        label: "Spanish (Chile)",
        value: "es_CL",
    },
    {
        label: "Spanish (Colombia)",
        value: "es_CO",
    },
    {
        label: "Spanish (Costa Rica)",
        value: "es_CR",
    },
    {
        label: "Spanish (Dominican Republic)",
        value: "es_DO",
    },
    {
        label: "Spanish (Ecuador)",
        value: "es_EC",
    },
    {
        label: "Spanish (El Salvador)",
        value: "es_SV",
    },
    {
        label: "Spanish (Guatemala)",
        value: "es_GT",
    },
    {
        label: "Spanish (Honduras)",
        value: "es_HN",
    },
    {
        label: "Spanish (Mexico)",
        value: "es_MX ",
    },
    {
        label: "Spanish (Nicaragua)",
        value: "es_NI",
    },
    {
        label: "Spanish (Panama)",
        value: "es_PA",
    },
    {
        label: "Spanish (Paraguay)",
        value: "es_PY",
    },
    {
        label: "Spanish (Peru)",
        value: "es_PE",
    },
    {
        label: "Spanish (Puerto Rico)",
        value: "es_PR",
    },
    {
        label: "Spanish (United States)",
        value: "es_US",
    },
    {
        label: "Spanish (Uruguay)",
        value: "es_UY",
    },
    {
        label: "Spanish (Venezuela)",
        value: "es_VE",
    },
    {
        label: "Swahili",
        value: "sw",
    },
    {
        label: "Swedish",
        value: "sv ",
    },
    {
        label: "Tagalog",
        value: "tl",
    },
    {
        label: "Tamil",
        value: "ta",
    },
    {
        label: "Te reo",
        value: "mi",
    },
    {
        label: "Telugu",
        value: "te",
    },
    {
        label: "Thai",
        value: "th ",
    },
    {
        label: "Turkish",
        value: "tr",
    },
    {
        label: "Ukrainian",
        value: "uk",
    },
    {
        label: "Urdu",
        value: "ur",
    },
    {
        label: "Vietnamese",
        value: "vi",
    },
    {
        label: "Welsh",
        value: "cy",
    },
    {
        label: "Xhosa",
        value: "xh",
    },
    {
        label: "Zulu",
        value: "zu",
    },
];

class Utils {

    static getMetadataFromFileSystem() {
        let result = {
            sObjects: [],
        }
        let rootFolder = Paths.getMetadataRootFolder();
        let folders = FileReader.readDirSync(rootFolder);
        for (const folder of folders) {
            let childFolder = rootFolder + '/' + folder;
            if (folder === 'objects')
                result[folder] = this.getSObjects(childFolder);
            else if (folder !== 'aura' && folder != 'lwc' && folder != 'customMetadata' && folder != 'objectTranslations' && folder != 'reports' && folder != 'emailTemplates' && folder != 'dashboards')
                result[folder] = this.getFileNames(childFolder);
        }
        return result;
    }

    static getFileNames(folderPath) {
        let names = [];
        let files = FileReader.readDirSync(folderPath);
        for (const file of files) {
            let name = file.substr(0, file.indexOf('.'));
            if (!names.includes(name))
                names.push(name);
        }
        return names;
    }

    static getSObjects(folderPath) {
        let sObjects = [];
        let objFolders = FileReader.readDirSync(folderPath);
        for (const objFolder of objFolders) {
            sObjects.push(this.getSObjectData(folderPath + '/' + objFolder));
        }
        return sObjects;
    }

    static getSObjectData(objFolder) {
        let sObject = {
            name: Paths.getBasename(objFolder),
            fields: [],
            recordTypes: [],
            compactLayouts: [],
            listViews: [],
            validationRules: [],
            webLinks: [],
            isCustomSetting: false,
            isCustomMetadata: false,
        };
        let folders = FileReader.readDirSync(objFolder);
        for (const folder of folders) {
            if (!folder.endsWith('.xml'))
                sObject[folder] = this.getFileNames(objFolder + '/' + folder);
            else {
                let mainFile = FileReader.readFileSync(objFolder + '/' + folder);
                if (mainFile.indexOf('<customSettingsType>') != -1)
                    sObject.isCustomSetting = true;
                if (folder.indexOf('__mdt') != -1)
                    sObject.isCustomMetadata = true;
            }
        }
        return sObject;
    }

    static createFolderMetadataMap(dataFromOrg) {
        let folderMetadataMap = {};
        for (const metadataType of dataFromOrg) {
            if (metadataType.xmlName === MetadataType.CUSTOM_FIELDS) {
                folderMetadataMap[metadataType.directoryName + '/fields'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.INDEX) {
                folderMetadataMap[metadataType.directoryName + '/indexes'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.BUSINESS_PROCESS) {
                folderMetadataMap[metadataType.directoryName + '/businessProcesses'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.COMPACT_LAYOUT) {
                folderMetadataMap[metadataType.directoryName + '/compactLayouts'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.RECORD_TYPE) {
                folderMetadataMap[metadataType.directoryName + '/recordTypes'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.BUTTON_OR_LINK) {
                folderMetadataMap[metadataType.directoryName + '/webLinks'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.VALIDATION_RULE) {
                folderMetadataMap[metadataType.directoryName + '/validationRules'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.SHARING_REASON) {
                folderMetadataMap[metadataType.directoryName + '/sharingReasons'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.LISTVIEW) {
                folderMetadataMap[metadataType.directoryName + '/listViews'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.FIELD_SET) {
                folderMetadataMap[metadataType.directoryName + '/fieldSets'] = metadataType;
            } else if (!folderMetadataMap[metadataType.directoryName]) {
                folderMetadataMap[metadataType.directoryName] = metadataType;
            }
        }
        return folderMetadataMap;
    }

    static isAnyChecked(objects) {
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

    static isAllChecked(objects) {
        let nChecked = 0;
        Object.keys(objects).forEach(function (key) {
            if (objects[key].checked)
                nChecked++;
        });
        return Object.keys(objects).length === nChecked;
    }

    static checkAll(objects, parent, grandParent) {
        if (!parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                    Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                        objects[key].childs[childKey].childs[grandChildKey].checked = true;
                    });
                });
            });
        } else if (parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                });
            });
        } else {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
            });
        }
    }

    static uncheckAll(objects, parent, grandParent) {
        if (!parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                    Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                        objects[key].childs[childKey].childs[grandChildKey].checked = false;
                    });
                });
            });
        } else if (parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                });
            });
        } else {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
            });
        }
    }

    static getChildsData(object) {
        let nChilds = -1;
        let totalItems = 0;
        let nSubChild = -1;
        let totalChilds = 0;
        if (object && Utils.haveChilds(object)) {
            if (nChilds === -1)
                nChilds = 0;
            Object.keys(object.childs).forEach(function (key) {
                totalItems++;
                if (object.childs[key].checked)
                    nChilds++;
                if (Utils.haveChilds(object.childs[key])) {
                    if (nSubChild === -1)
                        nSubChild = 0;
                    Object.keys(object.childs[key].childs).forEach(function (childKey) {
                        totalChilds++;
                        if (object.childs[key].childs[childKey].checked)
                            nSubChild++;
                    });
                }
            });
        }
        return {
            selectedItems: nChilds,
            selectedSubItems: nSubChild,
            totalItems: totalItems,
            totalSubItems: totalChilds
        };
    }

    static combineMetadata(metadataTarget, metadataSource) {
        Object.keys(metadataSource).forEach(function (key) {
            const metadataTypeSource = metadataSource[key];
            const metadataTypeTarget = metadataTarget[key];
            if (metadataTypeTarget) {
                const childKeys = Object.keys(metadataTypeSource.childs);
                if (childKeys.length > 0) {
                    Object.keys(metadataTypeSource.childs).forEach(function (childKey) {
                        const metadataObjectSource = metadataTypeSource.childs[childKey];
                        const metadataObjectTarget = metadataTypeTarget.childs[childKey];
                        if (metadataObjectTarget) {
                            const grandChildKeys = Object.keys(metadataObjectSource.childs);
                            if (grandChildKeys.length > 0) {
                                Object.keys(metadataObjectSource.childs).forEach(function (grandChildKey) {
                                    const metadataItemSource = metadataObjectSource.childs[grandChildKey];
                                    const metadataItemTarget = metadataObjectTarget.childs[grandChildKey];
                                    if (metadataItemTarget && metadataItemSource.checked) {
                                        metadataTarget[key].childs[childKey].childs[grandChildKey].checked = true;
                                    } else {
                                        metadataTarget[key].childs[childKey].childs[grandChildKey] = metadataItemSource;
                                    }
                                });
                                metadataTarget[key].childs[childKey].checked = Utils.isAllChecked(metadataTarget[key].childs[childKey].childs);
                            } else {
                                metadataTarget[key].childs[childKey].checked = metadataObjectSource.checked;
                            }
                        } else {
                            metadataTarget[key].childs[childKey] = metadataObjectSource;
                        }
                    });
                    metadataTarget[key].checked = Utils.isAllChecked(metadataTarget[key].childs);
                } else {
                    metadataTarget[key].checked = metadataTypeSource.checked;
                }
            } else {
                metadataTarget[key] = metadataSource[key];
            }
        });
        return metadataTarget;
    }

    static getXMLTag(tagName, xmlValue) {
        let isJSONValue = false;
        let attributes = Utils.getAttributes(xmlValue);
        try {
            let jsonVal = JSON.parse(xmlValue);
            if (jsonVal)
                isJSONValue = true
            else
                isJSONValue = false;
        } catch (error) {
            isJSONValue = false;
        }
        let keys = Object.keys(xmlValue);
        let onlyAttrs = false;
        if (keys.length == 1 && keys.includes('@attrs'))
            onlyAttrs = true;
        if (xmlValue !== undefined && xmlValue !== '' && !onlyAttrs) {
            if (typeof xmlValue === 'string' && !isJSONValue) {
                xmlValue = Utils.escapeChars(xmlValue);
            }
            if (attributes.length > 0 && !onlyAttrs)
                return '<' + tagName.trim() + ' ' + attributes.join(' ') + '>' + xmlValue + '</' + tagName.trim() + '>';
            else
                return '<' + tagName.trim() + '>' + xmlValue + '</' + tagName.trim() + '>';

        }
        if (attributes.length > 0)
            return '<' + tagName.trim() + ' ' + attributes.join(' ') + '/>';
        else
            return '<' + tagName.trim() + '/>';
    }

    static escapeChars(value) {
        value = value.split('&amp;').join('&');
        value = value.split('&quot;').join('"');
        value = value.split('&apos;').join('\'');
        value = value.split('&lt;').join('<');
        value = value.split('&gt;').join('>');

        value = value.split('«!--').join('<!--');
        value = value.split('--»').join('-->');
        value = value.split('&').join('&amp;');
        value = value.split('"').join('&quot;');
        value = value.split('\'').join('&apos;');
        if (value.indexOf('<!') === -1) {
            value = value.split('<').join('&lt;');
            value = value.split('>').join('&gt;');
        }
        return value;
    }

    static getXMLBlock(blockName, data, compress, initIndent) {
        let xmlBlock = [];
        if (data) {
            if (Array.isArray(data)) {
                for (const dataElement of data) {
                    let line = [];
                    if (typeof dataElement === 'object') {
                        let attributes = Utils.getAttributes(dataElement);
                        if (attributes.length > 0)
                            line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '>');
                        else
                            line.push(Utils.getTabs(initIndent) + '<' + blockName + '>');
                        let orderedKeys = Object.keys(dataElement).sort(function (a, b) {
                            return a.toLowerCase().localeCompare(b.toLowerCase());
                        });
                        for (const key of orderedKeys) {
                            if (Array.isArray(dataElement[key])) {
                                dataElement[key] = dataElement[key].sort(function (a, b) {
                                    return a.toLowerCase().localeCompare(b.toLowerCase());
                                });
                                for (const arrayElement of dataElement[key]) {
                                    line.push(Utils.getXMLTag(key, arrayElement));
                                }
                            } else {
                                if (Array.isArray(dataElement[key]) || typeof dataElement[key] === 'object') {
                                    line.push(Utils.getXMLBlock(key, dataElement[key], compress, 0));
                                } else {
                                    line.push(Utils.getXMLTag(key, dataElement[key]));
                                }
                            }
                        }
                        line.push('</' + blockName + '>');
                    } else {
                        line.push(Utils.getTabs(initIndent) + Utils.getXMLTag(blockName, dataElement));
                    }
                    xmlBlock.push(line.join(''));
                }
            } else if (typeof data === 'object') {
                let line = [];
                let attributes = Utils.getAttributes(data);
                let text = Utils.getText(data);
                let lineData = [];
                let orderedKeys = Object.keys(data).sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                if (text !== undefined) {
                    text = Utils.escapeChars(text);
                    lineData.push(text);
                } else {
                    for (const key of orderedKeys) {
                        if (key !== '@attrs' && key !== '#text') {
                            lineData.push(Utils.getXMLTag(key, data[key]));
                        }
                    }
                }
                if (lineData.length > 0) {
                    if (attributes.length > 0)
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '>');
                    else
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + '>');
                    line.push(lineData.join(''));
                    line.push('</' + blockName + '>');
                } else {
                    if (attributes.length > 0)
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '/>');
                    else
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + '/>');
                }
                xmlBlock.push(line.join(''));
            } else {
                xmlBlock.push(Utils.getTabs(initIndent) + Utils.getXMLTag(blockName, data));
            }
        }
        return xmlBlock;
    }

    static getAttributes(data) {
        let attributes = [];
        if (data['@attrs'] !== undefined) {
            Object.keys(data['@attrs']).forEach(function (key) {
                attributes.push(key + '="' + data['@attrs'][key] + '"');
            });
        }
        return attributes;
    }

    static getText(data) {
        let text = undefined;
        if (data['#text'] !== undefined)
            text = data['#text'];
        return text;
    }

    static getTabs(nTabs) {
        let tabs = '';
        for (let i = 0; i < nTabs; i++) {
            tabs += '\t';
        }
        return tabs;
    }

    static prepareXML(source, target) {
        Object.keys(target).forEach(function (key) {
            if (source[key] !== undefined) {
                if (Array.isArray(target[key])) {
                    target[key] = Utils.forceArray(source[key]);
                } else if (typeof target[key] === 'object' && typeof source[key] !== 'object') {
                    target[key] = {};
                } else {
                    target[key] = source[key];
                }
            }
        });
        return target;
    }

    static sort(elements, fields, caseSensitive) {
        if (Array.isArray(elements)) {
            elements.sort(function (a, b) {
                if (fields && fields.length > 0) {
                    let nameA = '';
                    let nameB = '';
                    let counter = 0;
                    for (const field of fields) {
                        let valA = (a[field] !== undefined) ? a[field] : "";
                        let valB = (b[field] !== undefined) ? b[field] : "";
                        if (counter == 0) {
                            nameA = valA;
                            nameB = valB;
                        } else {
                            nameA += '_' + valA;
                            nameB += '_' + valB;
                        }
                        counter++;
                    }
                    if (caseSensitive) {
                        return nameA.localeCompare(nameB);
                    } else {
                        return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                    }
                } else {
                    if (caseSensitive) {
                        return a.localeCompare(b);
                    } else {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    }
                }
            });
        }
    }

    static forceArray(element) {
        let result = [];
        if (element !== undefined) {
            if (Array.isArray(element))
                result = element;
            else
                result.push(element);
        }
        return result;
    }

    static haveChilds(object) {
        return object && object.childs && Object.keys(object.childs).length > 0;
    }

    static getTypesForAuraHelperCommands(metadata) {
        let types = [];
        Object.keys(metadata).forEach(function (typeKey) {
            if (metadata[typeKey].checked) {
                types.push(typeKey);
            } else {
                Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                    if (metadata[typeKey].childs[objectKey].checked) {
                        types.push(typeKey + ':' + objectKey);
                    } else {
                        Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                            if (metadata[typeKey].childs[objectKey].childs[itemKey].checked)
                                types.push(typeKey + ':' + objectKey + ':' + itemKey);
                        });
                    }
                });
            }
        });
        return types;
    }

    static deleteCheckedMetadata(metadata) {
        Object.keys(metadata).forEach(function (typeKey) {
            Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                if (Utils.haveChilds(metadata[typeKey].childs[objectKey])) {
                    Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                        if (metadata[typeKey].childs[objectKey].childs[itemKey].checked)
                            delete metadata[typeKey].childs[objectKey].childs[itemKey];
                    });
                    if (metadata[typeKey].childs[objectKey].checked)
                        delete metadata[typeKey].childs[objectKey];
                } else {
                    if (metadata[typeKey].childs[objectKey].checked)
                        delete metadata[typeKey].childs[objectKey];
                }
            });
            if (!Utils.haveChilds(metadata[typeKey]))
                delete metadata[typeKey];
        });
        return metadata;
    }

    static availableOnVersion(elementData, lastVersion, orgVersion) {
        let maxVersion = (elementData.maxApi === -1) ? lastVersion : elementData.maxApi;
        let minVersion = elementData.minApi;
        if (!maxVersion)
            maxVersion = orgVersion
        return orgVersion >= minVersion && orgVersion <= maxVersion;
    }

    static createXMLFile(xmlMetadata) {
        let result = {};
        let lastVersion = Config.getLastVersion();
        let orgVersion = parseInt(Config.getOrgVersion());
        Object.keys(xmlMetadata).forEach(function (xmlField) {
            let elementData = xmlMetadata[xmlField];
            if (Utils.availableOnVersion(elementData, lastVersion, orgVersion)) {
                if (elementData.datatype === 'array') {
                    result[xmlField] = [];
                } else if (elementData.datatype === 'object') {
                    result[xmlField] = {};
                } else {
                    result[xmlField] = undefined;
                }
            }
        });
        return result;
    }

    static getAvailableLanguages() {
        return availableLanguages;
    }

    static getLanguageByLabel(label) {
        for (let lang of availableLanguages) {
            if (lang.label === label)
                return lang;
        }
        return undefined;
    }
}
module.exports = Utils;