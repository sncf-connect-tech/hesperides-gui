/* eslint-disable no-unused-vars */
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

// Ces variables globales sont nécessaires au MenuHelpController
const SUPPORT_URL = '';
const SWAGGER_LINK = '';
const DOCUMENTATION_LINK = '';

describe('Testing hesperides menu', function () {
    // load the module to be tested
    beforeEach(module('hesperides.menu'));

    // This is for testing the menu help controller
    describe('Testing MenuHelpController', function () {
        let menuHelpCtrl = null;

        beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, $injector, PlatformColorService, ApplicationService, UserService) {
            const $scope = $rootScope.$new();
            const $httpBackend = _$httpBackend_;
            const $mdDialog = $injector.get('$mdDialog');
            const $translate = $injector.get('$translate');
            const $parse = $injector.get('$parse');
            const $location = $injector.get('$location');
            const $window = $injector.get('$window');
            menuHelpCtrl = $controller('MenuHelpController', {
                $scope,
                $mdDialog,
                $translate,
                $parse,
                $location,
                $window,
                PlatformColorService,
                ApplicationService,
                UserService,
            });
        }));

        it('should be defined', function () {
            expect(menuHelpCtrl).toBeTruthy();
        });
    });

    // This is for testing the menu module controller
    describe('Testing MenuModuleController', function () {
        let scope = null;

        beforeEach(inject(function ($injector, $rootScope, $controller, ModuleService, Module) {
            scope = $rootScope.$new();

            $controller('MenuModuleController', {
                $scope: scope,
                $mdDialog: $injector.get('$mdDialog'),
                $location: $injector.get('$location'),
                $timeout: $injector.get('$timeout'),
                ModuleService,
                Module,
            });
        }));

        it('should get modules by name', function () {
            var modules = scope.find_modules_by_name('modules');
            expect(modules).toBeTruthy();
        });
    });
});
