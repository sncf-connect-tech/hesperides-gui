var rest = require('restling');
var vsct_utils = require('./lib.js');
var path = require('path');

// input : element
// action : click on element
exports.clickOnElement = function(elm){
    elm.click();
    browser.waitForAngular();
};

// input : element and text to check
// action : check text if present in element
exports.checkIfElementContainsText = function(elm,text){
    expect(elm.getText()).toContain(text);
};

exports.checkIfElementIsPresent = function(id){
    element.all(by.id(id)).then(function(items) {
        expect(items.length).toBe(1);
    });
};

exports.checkIfElementIsPresentWithClass = function(className){
    element.all(by.css(className)).then(function(items) {
        expect(items.length).toBeGreaterThan(0);
    });
};

exports.checkIfElementIsMissing = function (selector){
    expect(element(by.css(selector)).isPresent()).toBeFalsy();
};

exports.checkIfElementIsDisabled = function(id,state){
    expect(element(by.id(id)).getAttribute('disabled')).toBe(state);
};


// input : element and code http
// action : check if url returns specified http code
exports.checkResponseStatusCode = function(url,code,options){
    rest.get(url,options).then(function(result){
        expect(result.response.statusCode).toBe(code);
    }, function(error){
    	console.log(error.message);
    });
};

// input : element and code http
// action : check if get returns something empty
exports.checkResponseIsEmpty = function(url,options){
    rest.get(url,options).then(function(result){
        console.log("ici :"+result.response);
        expect(result.response).toBeNonEmptyString();
    }, function(error){
        console.log(error.message);
    });
};

// input : element and code http
// action : run DELETE http request
exports.deleteHttpRequest = function(url,code,options){
    rest.del(url,options).then(function(result){
        expect(result.response.statusCode).toBe(code);
    }, function(error){
    	console.log(error.message+" (maybe resource does not exist so you cannot delete it)");
    });
};

exports.displayBrowserLogs = function(){
	browser.manage().logs().get('browser').then(function(browserLog) {
	  console.log('log: ' + require('util').inspect(browserLog));
	});
};

exports.selectFirstElemOfAutocomplete = function(elem, arrowDown, keyTab, sleepTime){
    browser.sleep(sleepTime);
    browser.driver.actions().mouseMove(elem);
    if (arrowDown) {
        elem.sendKeys(protractor.Key.ARROW_DOWN);
    }
    if (keyTab) {
        elem.sendKeys(protractor.Key.TAB);
    }
};

// click on elem and check if resource is really created after page correctly displayed
// input : element to click, element checked to know if page is loaded, url to check if resource is really created
exports.clickToCreateAndCheckIfReallyCreated = function(id_button, id_elem_checked, rest_url) {

    var elm_button = element(by.id(id_button));
    var elm_toCheckIfPageIsCorrectlyLoaded = element(by.id(id_elem_checked));
    elm_button.click().then(function(){

        // astuce pour vérifier que la page est bien affichée avant de lancer l'appel REST : 
        // évite que l'appel soit lancé avant que le module soit vraiment créé
        elm_toCheckIfPageIsCorrectlyLoaded.isPresent().then(function(boolElemDisplayed){
            if (boolElemDisplayed) {
                vsct_utils.checkResponseStatusCode(rest_url,200,rest_options);
            }
        })
    });
};

// mouse move on element
// input : id of the element
exports.moveMouseOnElement = function(id,sleepTime) {
    var elm = element(by.id(id));
    browser.actions().mouseMove(elm).perform();
    browser.waitForAngular();
    browser.sleep(sleepTime);
};

// generate string for data tests
exports.getRandomString = function(length) {
    var string = '';
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' //Include numbers if you want
    for (i = 0; i < length; i++) {
        string += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return string;
};

// clear input before sendKeys
exports.clearAndSendkeys = function(elm,newString) {
    elm.clear().then(function() {
        elm.sendKeys(newString);
    })
}

// count the number of item of a css class
// in the DOM
exports.getCountOf = function(classSelector){

    return element.all(by.css(classSelector)).then(function(items) {
        return items.length;
    });

};

};

exports.getDownloadsPath = function() {
    return path.format ({
        dir: path.join(
            __dirname,
            '..',
            '..',
            '..',
            'reports'
        )
    });
};

exports.getCapabilities  = function() {
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
