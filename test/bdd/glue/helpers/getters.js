
exports.elementById = function (id) {
    return element(by.id(id));
};

exports.elementByCss = function (selector) {
    return element(by.css(selector));
};

exports.elementsByCss = function (selector) {
    return element.all(by.css(selector));
};
