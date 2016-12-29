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
    describe('Testing iterablePropertiesListController', function (){

        // test data
        var model = {
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

        // inject the controller
        beforeEach(inject(function ($httpBackend, $rootScope, $controller){
            // new scope and test data
            scope = $rootScope.$new();
            scope.modelProperty = model.iterable_properties[0];
            scope.valueProperty = properties.iterable_properties[0];

            // Mock the http service
            http = $httpBackend;
            http.when('GET', './config.json').respond(200, "");

            // the controller
            $controller('iterablePropertiesListController', {$scope: scope});
        }));

        // tests
        it ('should check that all the valuations have been merged', function (){

            _(scope.valueProperty.iterable_valorisation_items).each(function (valuations){

                // values exists
                var _values = valuations.values;
                expect(_values).toBeDefined();

                // values cain't exceed the model fields count
                expect(_values.length == scope.modelProperty.fields.length).toBeTruthy();

                // all properties should be in values
                _(['val1', 'val2', 'val3']).each(function (val){
                    expect(_.some(_values, {name: val})).toBe(true);
                });
            });
        });

        it ('should add a new iterable bloc', function (){
            var beforeCount = scope.valueProperty.iterable_valorisation_items.length;

            // when
            scope.addValue();

            // then
            expect(beforeCount == scope.valueProperty.iterable_valorisation_items.length - 1).toBeTruthy();

            var bloc = scope.valueProperty.iterable_valorisation_items[beforeCount];
            // all properties should be in new bloc
            _(['val1', 'val2', 'val3']).each(function (val){
                expect(_.some(bloc.values, {name: val})).toBe(true);
            });

        });
    });
 });