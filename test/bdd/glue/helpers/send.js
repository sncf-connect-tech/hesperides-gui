const get = require('./get');

exports.clickById = async function (id) {
    await browser.waitForAngular();
    await get.elementById(id).click();
    await browser.waitForAngular();
};

exports.clickByCss = async function (selector) {
    await get.elementByCss(selector).click();
    await browser.waitForAngular();
};

exports.clickByCssContainingText = async function (selector, text) {
    await get.elementByCssContainingText(selector, text).click();
    await browser.waitForAngular();
};

exports.inputById = async function (id, text) {
    await get.elementById(id).sendKeys(text);
};

exports.inputByCss = async function (selector, text) {
    await get.elementByCss(selector).sendKeys(text);
};

exports.searchAndSelectFirstByCss = async function (selector, text) {
    await this.inputByCss(selector, text);
    await browser.waitForAngular();
    // eslint-disable-next-line no-undef
    await get.elementByCss(selector).sendKeys(protractor.Key.TAB);
};

exports.clickByIdAndAcceptAlert = async function (id) {
    await get.elementById(id).click();
    await browser.switchTo().alert().accept();
    await browser.waitForAngular();
};
