/*
 * This file is part of the Hesperides distribution.
 * (https://github.com/voyages-sncf-technologies/hesperides)
 * Copyright (c) 2016 VSCT.
 *
 * Hesperides is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * Hesperides is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


'use strict';

/**
 * This is for testing hesperides module 'hesperides.properties'
 */
 describe('Testing hesperides properties', function (){

    // load the module to be tested
    beforeEach(module('hesperides.properties'));

    // Testing iterable properties
    describe('Testing iterable properties', function (){

        // test data
        var model = {
            "key_value_properties": [
                {
                    "name":"buzz",
                    "comment":"",
                    "required":false,
                    "defaultValue":"DEFAULT",
                    "pattern":"",
                    "password":false
                },
                {
                    "name":"blah",
                    "comment":null,
                    "required":false,
                    "defaultValue":"",
                    "pattern":"",
                    "password":false
                }
            ],
            "iterable_properties":[
                {
                    "name":"iterable",
                    "comment":"",
                    "required":false,
                    "defaultValue":"",
                    "pattern":"",
                    "fields":[
                        {
                            "name":"val2",
                            "comment":"Ceci est un commentaire",
                            "required":false,
                            "defaultValue":"",
                            "pattern":"",
                            "password":false
                        },
                        {
                            "name":"val3",
                            "comment":null,
                            "required":true,
                            "defaultValue":"",
                            "pattern":"",
                            "password":false
                        },
                        {
                            "name":"val1",
                            "comment":null,
                            "required":false,
                            "defaultValue":"valeur par default",
                            "pattern":"",
                            "password":false
                        }
                    ],
                    "password":false
                }
            ]
        };

        var properties = {
            "key_value_properties": [
                {
                    "name":"foo",
                    "value":"bar"
                },
                {
                    "name":"buzz",
                    "value":""
                }
            ],
            "iterable_properties":[
                {
                    "name":"iterable",
                    "iterable_valorisation_items":[
                        {
                            "title":"not used",
                            "values":[
                                {
                                    "name":"val3",
                                    "value":"sf"
                                },
                                {
                                    "name":"val2",
                                    "value":"sss222"
                                }
                            ]
                        },
                        {
                            "title":"not used",
                            "values":[
                                {
                                    "name":"val3",
                                    "value":"DD"
                                },
                                {
                                    "name":"val2",
                                    "value":"dfs"
                                },
                                {
                                    "name":"val1",
                                    "value":"sfsf"
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        // the scope, with testing values
        var scope, http;

        var Properties;

        // inject the controller
        beforeEach(inject(function ($httpBackend, $rootScope, $controller, _Properties_){
            // new scope and test data
            scope = $rootScope.$new();

            scope.iterables = properties.iterable_properties;
            scope.iterablesModel = model.iterable_properties;

            // Mock the http service for the config
            http = $httpBackend;
            http.when('GET', './config.json').respond(200, "");

            // the controller
            $controller('IterablePropertiesContainerController', {$scope: scope});

            // The Properties factory
            Properties = _Properties_;

        }));

        // tests
        it ('should check that all the valuations have been merged', function (){

            // Create and merge properties
            var merged = (new Properties(properties)).mergeWithModel(new Properties(model));

            // Validating simple properties
            expect(merged.key_value_properties.length).toEqual(3);
            expect(merged.key_value_properties[0]).toEqual(jasmine.objectContaining(
                {name: 'foo', value: 'bar', filtrable_value: 'bar', inModel: false, required: false, defaultValue: '',        pattern: '', password: false}));
            expect(merged.key_value_properties[1]).toEqual(jasmine.objectContaining(
                {name: 'buzz', value: '',   filtrable_value: '',    inModel: true,  required: false, defaultValue: 'DEFAULT', pattern: '', password: false}));
            expect(merged.key_value_properties[2]).toEqual(jasmine.objectContaining(
                {name: 'blah', value: '',                  comment: null,           required: false, defaultValue: '',      pattern: '', password: false}));

            // Validating iterable properties
            expect(merged.iterable_properties.length).toEqual(1);
            _.each(merged.iterable_properties[0].iterable_valorisation_items, function (valuations){

                // every item should have an .id field
                expect ( valuations.id ).toBeDefined();

                // values exists
                expect(valuations.values).toBeDefined();

                // values cain't exceed the model fields count
                expect(valuations.values.length).toEqual(model.iterable_properties[0].fields.length);

                // all properties should be in values
                _.each(['val1', 'val2', 'val3'], function (val){
                    expect(valuations.values).toContain(jasmine.objectContaining({name: val}));
                });
            });
        });

        it ('should add a new iterable bloc', function (){
            var count = scope.iterables[0].iterable_valorisation_items.length;

            // given
            var property = scope.iterables[0];

            // when
            scope.addOne(property);

            // then
            expect(scope.iterables[0].iterable_valorisation_items.length).toEqual(count + 1);

            var bloc = _.last(scope.iterables[0].iterable_valorisation_items);
            // all properties should be in new bloc
            _.each(['val1', 'val2', 'val3'], function (val){
                expect(_.some(bloc.values, {name: val})).toBe(true);
            });
        });

        it ('should remove a iterable bloc', function (){
            // Create and merge properties
            var merged = (new Properties(properties)).mergeWithModel(new Properties(model));
            scope.iterables = merged.iterable_properties;

            var beforeCount = scope.iterables[0].iterable_valorisation_items.lenth;
            scope.deleteOne(scope.iterables[0].iterable_valorisation_items[0]);
            expect ( beforeCount == scope.iterables[0].iterable_valorisation_items.length + 1 )
        });

        it ('should test filtering on deleted iterable properties', function (){
            // TODO : please add the test for deleted iterable properties filtering here when implemented
        });

        it ('should test filtering on unspecified iterable properties', function (){
            // TODO : please add the test for unspecified iterable properties filtering here when implemented
        });

    });
 });