const { BeforeAll, Before, After, AfterAll } = require('cucumber');
const restling = require('restling');

BeforeAll((next) => {
    console.log('BeforeAll hook');
    next();
});

Before(() => {
    console.log('Before hook');
});

After(() => {
    console.log('After hook');
    restling.del(`${ baseUrl }/rest/modules/${ testModuleName }/${ testModuleVersion }/workingcopy`);
});

AfterAll((next) => {
    console.log('AfterAll hook');
    next();
});
