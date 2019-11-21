/**
 * This is for testing the properties-list 'hesperides.module.propertiesList'
 */
describe('Testing hesperides properties-list', function () {

    const firstModelMock = {
        'key_value_properties': [
            {
                'name': 'property_1', 'comment': '', 'required': false,
                'defaultValue': 'DEFAULT', 'pattern': '',  'password': true,
            },
            {
                'name': 'property_2', 'comment': null, 'required': false,
                'defaultValue': '45', 'pattern': '45', 'password': false,
            },
        ],
    };

    const secondModelMock = {
        'key_value_properties': [
            {
                'name': 'John', 'comment': '', 'required': true,
                'defaultValue': '31', 'pattern': '',  'password': false,
            },
            {
                'name': 'Doe', 'comment': null, 'required': false,
                'defaultValue': '', 'pattern': '', 'password': false,
            },
        ],
    };

    // create properties mocks for the tests
    const firstPropertiesMock = {
        'key_value_properties': [
            {
                'name': 'property_1', 'value': false,                
            },
            {
                'name': "property_2", 'value': true,           
            }
        ],
        'moduleName': "Foo"
    };

    const secondPropertiesMock = {
        'key_value_properties' : [
            {
                'name': 'property_1', 'value': '45',                  
            },
            {
                'name': "property_3", 'value': "",                   
            },
            {
                'name': "property_4", 'value': "42",                    
            }
        ],
        'moduleName': "Bar"
    };            

    // load the module to be tested
    beforeEach(module('hesperides.module.propertiesList'));

     // Testing the initialise modulesWhereUsedAnNBusage of property
    describe('Testing the initiliseModuleNameAndNbUsageOfProperties', function() {
        let scope = null;
        let Properties = null;

        beforeEach(inject(function ($rootScope, $controller, _Properties_) {
            // new scope and test data
            scope = $rootScope.$new();              
            $controller('PropertiesListController', { $scope: scope }); 
            Properties = _Properties_;          
        }));

        it('should initialise propertiesToMerge.moduleWhereUsed and propertiesToMerge.nbUsage', function () {  

            properties = new Properties(angular.copy(firstPropertiesMock)); 
            firstModelProperties = new Properties(angular.copy(firstModelMock));
            expect(scope.isModelPropertiesAreModelOfGivenProperties(firstModelProperties, properties)).toEqual(true);
            secondModelProperties = new Properties(angular.copy(secondModelMock));
            expect(scope.isModelPropertiesAreModelOfGivenProperties(secondModelProperties, properties)).toEqual(false);
        });
    });


    describe('Testing the isModelPropertiesAreModelOfGivenProperties', function() {
        let scope = null;
        let Properties = null;

        beforeEach(inject(function ($rootScope, $controller, _Properties_) {
            // new scope and test data
            scope = $rootScope.$new();              
            $controller('PropertiesListController', { $scope: scope }); 
            Properties = _Properties_;          
        }));

        it('should test if model is a model of properties', function () {  

            propertiesToMerge = (new Properties(angular.copy(firstPropertiesMock)));

            scope.initiliseModulesWhereUsedAndNbUsageOfProperties(propertiesToMerge);
            expect(propertiesToMerge.key_value_properties.length).toEqual(2);
            expect(propertiesToMerge.key_value_properties[0].modulesWhereUsed).toEqual(["Foo"]);
            expect(propertiesToMerge.key_value_properties[0].nbUsage).toEqual(1);
        });
    });


    // Testing merge properties
    describe('Testing the MergeProperties', function () {      

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
            firstPropertiesToMerge = new Properties(angular.copy(firstPropertiesMock));           
            secondPropertiesToMerge = new Properties(angular.copy(secondPropertiesMock)); 

            // Execute methode to test
            scope.mergeProperties(firstPropertiesToMerge, secondPropertiesToMerge); 

            // Validating merge of two properties is successfull
            expect(firstPropertiesToMerge.key_value_properties.length).toEqual(4);
            expect(firstPropertiesToMerge.key_value_properties[0].modulesWhereUsed).toEqual(['Foo', 'Bar']);
            expect(firstPropertiesToMerge.key_value_properties[0].nbUsage).toEqual(2);
        });
    });
});
