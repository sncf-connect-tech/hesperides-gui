const get = require('./get');

exports.clickById = async function (id) {
    await get.elementById(id).click();
};

exports.clickByCss = async function (selector) {
    await get.elementByCss(selector).click();
};

exports.inputById = async function (id, text) {
    await get.elementById(id).sendKeys(text);
};

exports.inputByCss = async function (selector, text) {
    await get.elementByCss(selector).sendKeys(text);
};

exports.acceptAlert = async function () {
    await browser.switchTo().alert().accept();
    await browser.waitForAngular();
};
