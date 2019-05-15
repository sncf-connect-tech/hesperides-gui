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
 * This is for testing the module 'hesperides.menu'
 */
describe('Testing hesperides menu', function() {

      // load the module to be tested
      beforeEach (module('hesperides.menu'));

      // This is for testing the menu help controller
      describe('Testing MenuHelpController', function() {

        var $scope, $mdDialog, $translate, $parse;

        var menuHelpCtrl, $httpBackend, $routeParams;

        beforeEach(inject(function($controller, $rootScope, _$httpBackend_, $injector, PlatformColorService, ApplicationService) {
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            $mdDialog = $injector.get('$mdDialog');
            $translate = $injector.get('$translate');
            $parse = $injector.get('$parse');
            menuHelpCtrl = $controller('MenuHelpController', {
                 $scope: $scope,
                 $mdDialog: $mdDialog,
                 $translate: $translate,
                 PlatformColorService: PlatformColorService,
                 $parse: $parse,
                 ApplicationService: ApplicationService });
        }));

      it('should be defined', function() {
        expect(menuHelpCtrl).toBeDefined();
      });

    });

    // This is for testing the menu module controller
    describe('Testing MenuModuleController', function (){

        var scope;

        beforeEach(inject(function($injector, $rootScope, $controller, ModuleService, Module){
            scope = $rootScope.$new();

            $controller('MenuModuleController', {
                $scope: scope,
                $mdDialog: $injector.get('$mdDialog'),
                $location: $injector.get('$location'),
                $timeout: $injector.get('$timeout'),
                ModuleService: ModuleService,
                Module: Module
            })
        }));

        it ('should get modules by name', function (){
           var modules = scope.find_modules_by_name('modules');
           expect(modules).toBeDefined();
        });

    });

});