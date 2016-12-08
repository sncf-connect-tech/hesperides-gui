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
 * This is for testing the module 'hesperides.module'
 */
describe('Testing hesperides module', function (){

    // load the module to be tested
    beforeEach (module('hesperides.module'));

    // Services
    var pageService, moduleService, technoService, fileService;

    describe('Testing the ModuleCtrl', function (){
        var scope, routeParams, dialog, location, translator, ctrl;

        beforeEach(inject(function($injector, $rootScope, $controller, TechnoService, ModuleService, HesperidesTemplateModal, Template, Page, FileService, Platform){
            // get dependencies
            scope = $rootScope.$new();
            dialog = $injector.get('$mdDialog');
            routeParams = $injector.get('$routeParams');
            location = $injector.get('$location');
            translator = $injector.get('$translate');

            // set the services
            pageService = Page;
            moduleService = ModuleService;
            technoService = technoService;
            fileService = FileService;

            // get controller
            ctrl = $controller('ModuleCtrl', {
                $scope: scope,
                $routeParams: routeParams,
                $location: location,
                $mdDialog: dialog,
                TechnoService: TechnoService,
                ModuleService:ModuleService,
                HesperidesTemplateModal: HesperidesTemplateModal,
                Template: Template,
                Page: Page,
                FileService: FileService,
                Platform: Platform,
                $translate: translator
            });

        }));

        it ('should check the page title is set to "Module"', function (){
           var title = pageService.title();
           expect(title).toBe('Hesperides > Module');
        });
    });
});