const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const fs = require('fs');
const get = require('./get');

exports.elementsExist = async function (elements) {
    await expect(elements.count()).to.eventually.be.gt(0);
};

exports.isPresentById = async function (id) {
    await expect(get.elementById(id).isPresent()).to.eventually.be.true;
};

exports.isPresentByCss = async function (selector) {
    await expect(get.elementByCss(selector).isPresent()).to.eventually.be.true;
};

exports.isNotPresentById = async function (id) {
    await expect(get.elementById(id).isPresent()).to.eventually.be.false;
};

exports.isNotPresentByCss = async function (selector) {
    await expect(get.elementByCss(selector).isPresent()).to.eventually.be.false;
};

exports.elementsCount = async function (elements, count) {
    await expect(elements.count()).to.eventually.be.equal(count);
};

exports.currentUrlEquals = async function (expectedUrl) {
    await browser.waitForAngular();
    await expect(browser.driver.getCurrentUrl()).to.eventually.be.equal(expectedUrl);
};

exports.containsText = async function (elem, text) {
    await expect(elem.getText()).to.eventually.have.string(text);
};

exports.containsValue = async function (elem, text) {
    await expect(elem.getAttribute('value')).to.eventually.have.string(text);
};

exports.notification = async function (success, message) {
    const successClassName = success ? '.success' : '';
    const elements = get.elementsByCss(`.cg-notify-message${ successClassName }`);
    await this.elementsExist(elements);
    await this.containsText(elements.get(0), message);
};

exports.itemsAreRequired = async function (items) {
    for (const item of items) {
        await expect(item.getAttribute('required')).to.eventually.equal('true');
    }
};

exports.fileContains = async function (filePath, content) {
    // eslint-disable-next-line no-sync
    await browser.wait(() => fs.existsSync(filePath), 1000).then(async function () {
        await expect(fs.promises.readFile(filePath, { encoding: 'utf8' })).to.eventually.be.equal(content);
    });
};
