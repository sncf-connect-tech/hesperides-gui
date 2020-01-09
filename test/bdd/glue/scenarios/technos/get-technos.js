
When('I open this techno', /** @this CustomWorld */ async function () {
    await browser.get(`${ baseUrl }/#/techno/${ this.technoBuilder.name }/${ this.technoBuilder.version }?type=${ this.technoBuilder.getVersionType() }`);
    await browser.waitForAngular();
});
