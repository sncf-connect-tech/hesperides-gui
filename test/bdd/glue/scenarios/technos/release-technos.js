const send = require('../../helpers/send');

When('I click on the button to create the release of this techno', /** @this CustomWorld */ async function () {
    await send.clickById('e2e-techno-create-release-button');
    await send.acceptAlert();
    this.technoBuilder.withIsWorkingcopy(false);
});
