
exports.elementById = function (id) {
    return element(by.id(id));
};

exports.elementByCss = function (selector) {
    return element(by.css(selector));
};

exports.elementByCssContainingText = function (selector, text) {
    return element(by.cssContainingText(selector, text));
};

exports.elementsByCss = function (selector) {
    return element.all(by.css(selector));
};

exports.getUniqueComment = function () {
    return `${ new Date().getTime() }-this is a unique comment`;
};
