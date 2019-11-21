const get = require('./getters');

exports.clickById = async function (id) {
    await get.elementById(id).click();
};

exports.clickByCss = async function (selector) {
    await get.elementByCss(selector).click();
};

exports.inputByCss = async function (selector, text) {
    await get.elementByCss(selector).sendKeys(text);
};
