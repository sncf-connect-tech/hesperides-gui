/**
 * This is for testing the properties-list 'hesperides.module.propertiesList'
 */
describe('Testing hesperides properties-list', function () {
    // load the module to be tested
    beforeEach(module('hesperides.module.propertiesList'));

    // Testing merge properties
    describe('Testing the MergeProperties', function () {
        var firstPropertiesMock = {
            'key_value_properties': [
                {
                    'name': 'property_1',
                    'comment': '',
                    'required': false,
                    'defaultValue': 'DEFAULT',
                    'password': false,
                    'pattern': "DEFAULT",
                    'required': true
                    
                },
                {
                    'name': "property_2",
                    'storedValue': null,
                    'finalValue': "",
                    'defaultValue': "",
                    'password': true,
                    'required': false
                    
                }
            ],
            'moduleName': "Foo"
        };

        var secondPropertiesMock = {
            'key_value_properties' : [
                {
                    'name': 'property_1',
                    'comment': '',
                    'required': false,
                    'defaultValue': '45',
                    'password': true,
                    'required': true                   
                },
                {
                    'name': "property_3",
                    'storedValue': null,
                    'finalValue': "",
                    'defaultValue': "",
                    'password': true,
                    'required': false,                    
                },
                {
                    'name': "property_4",
                    'storedValue': "50",
                    'finalValue': "42",
                    'defaultValue': "42",
                    'password': false,
                    'required': true                    
                }
            ],
            'moduleName': "Bar"
        };            

        let scope = null;
        let Properties = null;

        beforeEach(inject(function ($rootScope, $controller, _Properties_) {
            // new scope and test data
            scope = $rootScope.$new();              
            $controller('PropertiesListController', { $scope: scope }); 
            Properties = _Properties_;          
        }));

        // tests
        it('should check that all the properties have been merged without duplication key (name)', function () {
            // Create properties
            firsPropertiesToMerge = (new Properties(firstPropertiesMock));           
            secondPropertiesToMerge = (new Properties(secondPropertiesMock)); 

            // Execute methode to test
            scope.mergeProperties(firsPropertiesToMerge, secondPropertiesToMerge); 
            
            // Validating merge of two properties is successfull
            expect(firsPropertiesToMerge.key_value_properties.length).toEqual(4);
            expect(firsPropertiesToMerge.key_value_properties[0].modulesWhereUsed).toEqual(['Foo', 'Bar']);
            expect(firsPropertiesToMerge.key_value_properties[0].nbUsage).toEqual(2);
        });
    });
});