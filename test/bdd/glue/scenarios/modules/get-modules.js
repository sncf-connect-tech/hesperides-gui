
When('I open this module', /** @this CustomWorld */ async function () {
    await browser.get(`${ baseUrl }/#/module/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }?type=${ this.moduleBuilder.getVersionType() }`);
});
