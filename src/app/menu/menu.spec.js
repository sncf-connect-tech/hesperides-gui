'use strict';

describe('MenuControllers', function() {
  beforeEach(module('hesperides.module','material.components.dialog','pascalprecht.translate','hesperides'));
  var $scope, $mdDialog, $translate, $parse;

  describe('MenuHelpCtrl', function() {
    var menuHelpCtrl, $httpBackend, $routeParams;

    var translationMock = {
      'FOO': 'bar',
      'BAR': 'foo'
    };

    beforeEach(module('pascalprecht.translate', function ($translateProvider) {
      $translateProvider
          .translations('en', translationMock)
          .translations('en', {
              'FOO': 'bar',
              'BAR': 'foo'
          })
          .preferredLanguage('en');
    }));

    beforeEach(inject(function($controller, $rootScope, _$httpBackend_, $injector, hesperidesGlobals, PlatformColorService, ApplicationService) {
      $scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      $mdDialog = $injector.get('$mdDialog');
      $translate = $injector.get('$translate');
      $parse = $injector.get('$parse');
      menuHelpCtrl = $controller('MenuHelpCtrl', { $scope: $scope, $mdDialog: $mdDialog, hesperidesGlobals: hesperidesGlobals,
                                                    $translate: $translate, PlatformColorService: PlatformColorService,
                                                    $parse: $parse, ApplicationService: ApplicationService });
    }))

    it('should be defined', function() {
      expect(menuHelpCtrl).toBeDefined();
    });

    it( 'should test window open event', inject( function( $window ) {
        spyOn( $window, 'open' ).and.callFake( function() {
            return true;
        } );
        $scope.display_swagger();
        expect( $window.open ).toHaveBeenCalled();
        expect( $window.open ).toHaveBeenCalledWith( "/swagger.html" );
    }));
  });
});