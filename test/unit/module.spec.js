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

/**
 * This is for testing the module 'hesperides.module'
 */
describe('Testing hesperides module', function () {
    // load the module to be tested
    beforeEach(module('hesperides.module'));

    describe('Testing the ModuleController', function () {
        const injected = {};

        beforeEach(inject(function ($injector, $rootScope, $controller, TechnoService, ModuleService, Module, HesperidesTemplateModal, Template, Page, FileService, Platform) {
            injected.Page = Page;
            injected.Module = Module;

            $controller('ModuleController', {
                $scope: $rootScope.$new(),
                $routeParams: $injector.get('$routeParams'),
                $location: $injector.get('$location'),
                $mdDialog: $injector.get('$mdDialog'),
                TechnoService,
                ModuleService,
                HesperidesTemplateModal,
                Template,
                Page,
                FileService,
                Platform,
                $translate: $injector.get('$translate'),
                $window: $injector.get('$window'),
            });
        }));

        it('should check the page title is set to "Module"', function () {
            const { Page } = injected;
            const title = Page.title();
            expect(title).toBe('Hesperides > Module');
        });

        it('can build a "Module" instance from a properties path', function () {
            const { Module } = injected;
            expect(Module.fromPropertiesPath('#ABC-1#module-a#1.0#WORKINGCOPY')).toEqual(jasmine.objectContaining({
                name: 'module-a',
                version: '1.0',
                is_working_copy: true,
                properties_path: '#ABC-1#module-a#1.0#WORKINGCOPY',
                title: 'module-a, 1.0 (working copy)',
                technos: [ ],
                version_id: -1,
            }));
            expect(Module.fromPropertiesPath('#ABC#DEF#module-b#1.2.3#RELEASE')).toEqual(jasmine.objectContaining({
                name: 'module-b',
                version: '1.2.3',
                is_working_copy: false,
                properties_path: '#ABC#DEF#module-b#1.2.3#RELEASE',
                title: 'module-b, 1.2.3',
                technos: [ ],
                version_id: -1,
            }));
            expect(() => Module.fromPropertiesPath('#module-b#1.0#WORKINGCOPY')).toThrow();
            expect(() => Module.fromPropertiesPath('#ABC-1#module-b#1.0#DUMMY')).toThrow();
            expect(() => Module.fromPropertiesPath('ABC-1#module-b#1.0#WORKINGCOPY')).toThrow();
        });
    });
});
