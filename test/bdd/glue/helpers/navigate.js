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