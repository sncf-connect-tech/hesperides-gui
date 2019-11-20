/**
 * This is for testing the properties-list 'hesperides.module.propertiesList'
 */
describe('Testing hesperides properties-list', function () {
    // load the module to be tested
    beforeEach(module('hesperides.module.propertiesList'));

    describe('Testing the MergeProperties', function () {
        beforeEach(inject(function (){
            var model = {
                'key_value_properties' : [
                    {
                        'name': 'buzz',
                        'comment': '',
                        'required': false,
                        'defaultValue': 'DEFAULT',
                        'pattern': '',
                        'password': false,
                    },
                    {
                        'name': "property_2",
                        'storedValue': null,
                        'finalValue': "",
                        'defaultValue': "",
                        'transformations': []
                    }

                ]
            }
        }))
    })
})