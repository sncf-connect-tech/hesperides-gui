const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const get = require('./get');

exports.checkSuccessNotification = async function (message) {
    const elements = get.elementsByCss('.cg-notify-message.success');
    await this.elementsExist(elements);
    await this.containsText(elements.get(0), message);
};

exports.elementsExist = async function (elements) {
    await expect(elements.count()).to.eventually.be.gt(0);
};

exports.checkUrl = async function (expectedUrl) {
    await browser.driver.wait(() => browser.driver.getCurrentUrl()
        .then((url) => url === expectedUrl));
};

exports.containsText = async function (elem, text) {
    await expect(elem.getText()).to.eventually.have.string(text);
};

exports.checkItemsAreRequired = async function (items) {
    await items.forEach(function (item) {
        // On pourrait penser qu'il existe une manière plus concise de faire cette vérification, par
        // exemple `expect(item.getAttribute('required')).to.eventually.equal('true')`, mais pour avoir
        // essayé différentes solutions, c'est la seule qui effectue correctement ce contrôle.
        item.getAttribute('required').then(async function (required) {
            await expect(required).to.equal('true');
        });
    });
};
