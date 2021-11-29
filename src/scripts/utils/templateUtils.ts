import { applicationContext } from '../core/applicationContext';
import { Paths } from "../core/paths";
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { Utils } = require('@aurahelper/core').CoreUtils;

export interface ApexCommentTagKeyword {
    name: string;
    source?: string;
    message?: string;
}

export interface ApexCommentTagData {
    tagData: ApexCommentTag;
    tag: ApexCommentTag;
    tagName: string;
}

export interface ApexCommentTag {
    equalsTo?: string;
    symbol?: string;
    keywords?: ApexCommentTagKeyword[];
    template?: string;
    multiple?: boolean;
    anywhere?: boolean;
    source?: string;
}

export interface ApexCommentsObjectData {
    tags: string[];
    template: string[]
}

export interface ApexCommentsData {
    class: ApexCommentsObjectData;
    interface?: ApexCommentsObjectData;
    enum?: ApexCommentsObjectData;
    method: ApexCommentsObjectData;
    constructor?: ApexCommentsObjectData;
    variable: ApexCommentsObjectData;
    property?: ApexCommentsObjectData;
}

export interface ApexCommentTemplate {
    tagSymbol: string;
    tags: any;
    comments: ApexCommentsData;
}

export class TemplateUtils {

    static getApexCommentTemplate(custom: boolean): ApexCommentTemplate | undefined {
        let templateContent: ApexCommentTemplate | undefined;
        if (custom) {
            if (FileChecker.isExists(Paths.getApexCommentUserTemplate())) {
                templateContent = JSON.parse(FileReader.readFileSync(Paths.getApexCommentUserTemplate()));
            }
        } else {
            if (FileChecker.isExists(Paths.getApexJavaBaseTemplate())) {
                templateContent = JSON.parse(FileReader.readFileSync(Paths.getApexCommentUserTemplate()));
            }
        }
        return templateContent;
    }

    static getTagsDataBySource(sources: string | string[], comment: ApexCommentTemplate): any {
        const result: any = {};
        sources = Utils.forceArray(sources);
        if (!applicationContext.parserData.template) {
            return undefined;
        }
        if (comment && comment.tags && Utils.hasKeys(comment.tags)) {
            let tagName;
            let tagData;
            for (tagName of Object.keys(comment.tags)) {
                let tag = applicationContext.parserData.template.tags[tagName];
                while (tag.equalsTo) {
                    tag = applicationContext.parserData.template.tags[tag.equalsTo];
                }
                tagData = comment.tags[tagName];
                if (tag && tagData && sources.includes(tag.source)) {
                    const data: ApexCommentTagData = {
                        tagData: tagData,
                        tag: tag,
                        tagName: tagName
                    };
                    result[tag.source] = data;
                }
            }
        }
        return result;
    }

}