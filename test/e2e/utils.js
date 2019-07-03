/* eslint-disable global-require, id-length, lodash/prefer-includes */

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
    return rest.get(url).then((result) => expect(result.response.statusCode).toBe(code),
        (error) => console.log(error.message));
};

exports.putHttpRequest = function (url, payloadBody) {
    if (payloadBody.version_id) {
        return rest.putJson(url, payloadBody).catch((error) => console.error(error.message, error.statusCode, error.data));
    }
    return rest.get(`${ url }/${ payloadBody.platform_name }`).then((resp) => {
        payloadBody.version_id = resp.data.version_id;
        return rest.putJson(url, payloadBody);
    })
        .then((resp) => console.log(`\nSuccessful PUT ${ url } : ${ JSON.stringify(resp.data) }`))
        .catch((error) => console.error(`\n${ error.message }`, error.statusCode, error.data));
};

exports.deleteHttpRequest = function (url) {
    return rest.del(url).then((result) => expect(result.response.statusCode).toBe(200),
        (error) => console.error(`\n${ error.message } (maybe resource does not exist so you cannot delete it)`));
};

exports.displayBrowserLogs = function () {
    browser.manage().logs().get('browser').then(function (browserLog) {
        console.log(`log: ${ require('util').inspect(browserLog) }`);
    });
};

exports.selectFirstElemOfAutocomplete = function (elem) {
    browser.sleep(3500);
    browser.driver.actions().mouseMove(elem);
    elem.sendKeys(protractor.Key.TAB);
};

exports.moveMouseOnElement = function (targetId, waitForElemWithId) {
    browser.actions().mouseMove(element(by.id(targetId))).perform();
    browser.wait(ExpectedConditions.visibilityOf(element(by.id(waitForElemWithId))), 6000);
};

// generate string for data tests
exports.getRandomString = function (length) {
    var str = '';
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; // Include numbers if you want
    for (let i = 0; i < length; i++) {
        str += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return str;
};

// clear input before sendKeys
exports.clearAndSendkeys = function (elm, newString) {
    elm.clear().then(function () {
        elm.sendKeys(newString);
    });
};

exports.getDownloadsPath = function () {
    return path.format({
        dir: __dirname,
    });
};

exports.getCapabilities = function () {
    return {
        'browserName': 'chrome',
        'platform': 'ANY',
        'version': 'ANY',
        'chromeOptions': {
            // Get rid of --ignore-certificate yellow warning
            args: [ '--no-sandbox', '--test-type=browser' ],
            // Set download path and avoid prompting for download even though
            // this is already the default on Chrome but for completeness
            prefs: {
                'download': {
                    'prompt_for_download': false,
                    'default_directory': this.getDownloadsPath(),
                },
            },
        },
    };
};

exports.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

exports.switchBrowserToNewTab = function () {
    return browser.getAllWindowHandles().then(function (handles) {
        const newTabHandle = handles[1];
        console.info(`New tab handle = ${ newTabHandle }`);
        return browser.switchTo().window(newTabHandle);
    });
};

exports.switchBrowserBackToFirstTab = function () {
    return browser.getAllWindowHandles().then(function (handles) {
        browser.driver.close();
        const mainTabHandle = handles[0];
        console.info(`Main tab handle = ${ mainTabHandle }`);
        return browser.switchTo().window(mainTabHandle);
    });
};

exports.checkSuccessNotification = function (text) {
    this.checkIfElementIsPresentWithClass('.cg-notify-message.success');
    this.checkIfElementContainsText(element.all(by.css('.cg-notify-message.success')).get(0), text);
};

exports.resetDisplayInstancesByDefaultSettingToDefaultValue = function () {
    exports.clickOnElement(element(by.id('e2e-navbar-settings')));
    var switchDisplayInstancesByDefault = element(by.id('e2e-modal-settings-switch-unfold-instances-by-default'));
    exports.hasClass(switchDisplayInstancesByDefault, 'md-checked').then((isChecked) => {
        if (isChecked) {
            exports.clickOnElement(switchDisplayInstancesByDefault);
            exports.clickOnElement(element(by.id('e2e-modal-settings-button-save')));
        } else {
            exports.clickOnElement(element(by.id('e2e-modal-settings-button-close')));
        }
    });
};

exports.setDefaultDisplayModeSetting = function (displayMode) {
    exports.clickOnElement(element(by.id('e2e-navbar-settings')));
    exports.clickOnElement(element(by.id(`e2e-modal-settings-switch-display-mode-${ displayMode }`)));
    exports.clickOnElement(element(by.id('e2e-modal-settings-button-save')));
};

exports.copyPlatform = function (applicationName, srcPlatformName, newPlatformName, newPlatformVersion) {
    var navbarCreatePlatformFromButton = element(by.id('e2e-navbar-app-create-from'));
    navbarCreatePlatformFromButton.isDisplayed().then((isDisplayed) => {
        if (!isDisplayed) { // menu may or may not be already open by a previous test
            exports.clickOnElement(element(by.id('e2e-navbar-app')));
        }
    }).then(() => {
        exports.clickOnElement(navbarCreatePlatformFromButton);

        element(by.css('#e2e-modal-platform-create-from input[name="platformApplication"]')).sendKeys(applicationName);
        element(by.css('#e2e-modal-platform-create-from input[name="platformName"]')).sendKeys(newPlatformName);
        element(by.css('#e2e-modal-platform-create-from input[name="platformApplicationVersion"]')).sendKeys(newPlatformVersion);

        element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-application-autocomplete')).sendKeys(applicationName);
        exports.selectFirstElemOfAutocomplete(element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-application-autocomplete')));
        browser.waitForAngular(); // ajout pour que l'autocompletion soit prise en compte au moment du test

        var srcPlatformNameInput = element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-platform-autocomplete'));
        srcPlatformNameInput.sendKeys(srcPlatformName);
        exports.selectFirstElemOfAutocomplete(srcPlatformNameInput);
        browser.waitForAngular(); // ajout pour que l'autocompletion soit prise en compte au moment du test

        element(by.css('#e2e-modal-platform-create-from button[type="submit"]')).click().then(() => {
            element(by.id('properties_show-platform-event-button')).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                exports.checkResponseStatusCode(`${ hesperides_url }/rest/applications/${ applicationName }/platforms/${ newPlatformName }`, 200);
            });
        });
    });
};
