var rest = require('restling');
var path = require('path');

// input : element
// action : click on element
exports.clickOnElement = function (elm) {
    elm.click();
    browser.waitForAngular();
};

exports.waitForNotificationToDisappear = function () {
    browser.wait(ExpectedConditions.stalenessOf(element(by.css('.cg-notify-message'))), 12000); // angular-notify: "Default message duration is now 10 seconds" + CSS transition
};

// input : element and text to check
// action : check text if present in element
exports.checkIfElementContainsText = function (elm, text) {
    expect(elm.getText()).toContain(text);
};

exports.checkIfElementIsPresent = function (id) {
    element.all(by.id(id)).then(function (items) {
        expect(items.length).toBe(1);
    });
};

exports.checkIfElementIsPresentWithClass = function (className) {
    element.all(by.css(className)).then(function (items) {
        expect(items.length).toBeGreaterThan(0);
    });
};

exports.checkIfElementIsMissing = function (selector) {
    expect(element(by.css(selector)).isPresent()).toBeFalsy();
};

exports.checkIfElementIsDisabled = function (id, state) {
    expect(element(by.id(id)).getAttribute('disabled')).toBe(state);
};


// input : element and code http
// action : check if url returns specified http code
exports.checkResponseStatusCode = function (url, code) {
    rest.get(url).then((result) => expect(result.response.statusCode).toBe(code),
        (error) => console.log(error.message));
};

exports.putHttpRequest = function (url, payloadBody) {
    if (payloadBody.version_id) {
        return rest.putJson(url, payloadBody).catch((error) => console.error(error.message, error.statusCode, error.data));
    }
    // On récupère le version_id
    return rest.get(url + '/' + payloadBody.platform_name).then((resp) => {
        payloadBody.version_id = resp.data.version_id;
        return rest.putJson(url, payloadBody).catch((error) => console.error(error.message, error.statusCode, error.data));
    });
};

exports.deleteHttpRequest = function (url) {
    rest.del(url).then((result) => expect(result.response.statusCode).toBe(200),
        (error) => console.error(error.message + " (maybe resource does not exist so you cannot delete it)"));
};

exports.displayBrowserLogs = function () {
    browser.manage().logs().get('browser').then(function (browserLog) {
        console.log('log: ' + require('util').inspect(browserLog));
    });
};

exports.selectFirstElemOfAutocomplete = function (elem, arrowDown, keyTab, sleepTime) {
    browser.sleep(sleepTime);
    browser.driver.actions().mouseMove(elem);
    if (arrowDown) {
        elem.sendKeys(protractor.Key.ARROW_DOWN);
    }
    if (keyTab) {
        elem.sendKeys(protractor.Key.TAB);
    }
};

exports.moveMouseOnElement = function (targetId, waitForElemWithId) {
    browser.actions().mouseMove(element(by.id(targetId))).perform();
    browser.wait(ExpectedConditions.visibilityOf(element(by.id(waitForElemWithId))), 4000);
};

// generate string for data tests
exports.getRandomString = function (length) {
    var string = '';
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' //Include numbers if you want
    for (i = 0; i < length; i++) {
        string += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return string;
};

// clear input before sendKeys
exports.clearAndSendkeys = function (elm, newString) {
    elm.clear().then(function () {
        elm.sendKeys(newString);
    })
}

exports.getDownloadsPath = function () {
    return path.format({
        dir: __dirname
    });
};

exports.getCapabilities = function () {
    return {
        'browserName': 'chrome',
        'platform': 'ANY',
        'version': 'ANY',
        'chromeOptions': {
            // Get rid of --ignore-certificate yellow warning
            args: ['--no-sandbox', '--test-type=browser'],
            // Set download path and avoid prompting for download even though
            // this is already the default on Chrome but for completeness
            prefs: {
                'download': {
                    'prompt_for_download': false,
                    'default_directory': this.getDownloadsPath()
                }
            }
        }
    }
};

exports.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

exports.switchBrowserToNewTab = function () {
    return browser.getAllWindowHandles().then(function (handles) {
        const newTabHandle = handles[1];
        console.info('New tab handle = ' + newTabHandle);
        return browser.switchTo().window(newTabHandle);
    });
}

exports.switchBrowserBackToFirstTab = function () {
    return browser.getAllWindowHandles().then(function (handles) {
        browser.driver.close();
        const mainTabHandle = handles[0];
        console.info('Main tab handle = ' + mainTabHandle);
        return browser.switchTo().window(mainTabHandle);
    });
}

exports.checkSuccessNotification = function (text) {
    this.checkIfElementIsPresentWithClass('.cg-notify-message.success');
    this.checkIfElementContainsText(element.all(by.css('.cg-notify-message.success')).get(0), text);
}
