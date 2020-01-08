
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

exports.newTab = async function () {
    await browser.getAllWindowHandles().then(async function (handles) {
        const newTabHandle = handles[1];
        await browser.switchTo().window(newTabHandle);
    });
    await browser.waitForAngular();
};

exports.backToFirstTab = async function () {
    await browser.getAllWindowHandles().then(async function (handles) {
        browser.driver.close();
        const mainTabHandle = handles[0];
        await browser.switchTo().window(mainTabHandle);
    });
    await browser.waitForAngular();
};

exports.getUniqueComment = function () {
    return `${ new Date().getTime() }-this is a unique comment`;
};
