import applicationContext from "../core/applicationContext";
import { Paths } from "../core/paths";
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { Utils } = require('@aurahelper/core').CoreUtils;

export class TemplateUtils {

    static getApexCommentTemplate(custom: boolean) {
        let templateContent;
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

    static getTagsDataBySource(sources: any | any[], comment: any) {
        const result: any = {};
        sources = Utils.forceArray(sources);
        if (!applicationContext.parserData.template) {
            return;
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
                    const data = {
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