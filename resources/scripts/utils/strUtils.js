class StrUtils {

    static replace(str, replace, replacement) {
        return str.split(replace).join(replacement);
    }

}
module.exports = StrUtils;