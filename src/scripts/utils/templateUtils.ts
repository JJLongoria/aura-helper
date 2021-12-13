import { applicationContext } from '../core/applicationContext';
import { Paths } from "../core/paths";
import { ApexCommentTemplate, ApexCommentTemplateTagData, CoreUtils, FileChecker, FileReader } from '@aurahelper/core';
const Utils = CoreUtils.Utils;

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

    static getTagsDataBySource(sources: string | string[], comment: any): any {
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
                if (tag && tagData && tag.source && sources.includes(tag.source)) {
                    const data: any = {
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