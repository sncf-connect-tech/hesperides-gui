const get = require('./get');

async function mouseOn(elem) {
    await browser.actions().mouseMove(elem).perform();
}

async function clearInput(elem) {
    await elem.getAttribute('ng-model').clear();
}

async function cleanInput(elem, text) {
    await clearInput(elem);
    await elem.sendKeys(text);
}

exports.mouseOnById = async function (id) {
    await mouseOn(get.elementById(id));
};

exports.mouseOnByCss = async function (selector) {
    await mouseOn(get.elementByCss(selector));
};

exports.clickById = async function (id) {
    await browser.waitForAngular();
    await this.mouseOnById(id);
    await get.elementById(id).click();
    await browser.waitForAngular();
};

exports.clickByCss = async function (selector) {
    await browser.waitForAngular();
    await this.mouseOnByCss(selector);
    await get.elementByCss(selector).click();
    await browser.waitForAngular();
};

exports.clickByCssContainingText = async function (selector, text) {
    await get.elementByCssContainingText(selector, text).click();
    await browser.waitForAngular();
};

exports.inputById = async function (id, text) {
    await cleanInput(get.elementById(id), text);
};

exports.inputByCss = async function (selector, text) {
    await cleanInput(get.elementByCss(selector), text);
};

exports.searchAndSelectFirstByCss = async function (selector, text) {
    await this.inputByCss(selector, text);
    await browser.waitForAngular();
    // eslint-disable-next-line no-undef
    await get.elementByCss(selector).sendKeys(protractor.Key.TAB);
};

exports.clickByIdAndAcceptAlert = async function (id) {
    await get.elementById(id).click();
    await this.acceptAlert();
};

exports.acceptAlert = async function () {
    await browser.switchTo().alert().accept();
    await browser.waitForAngular();
};
