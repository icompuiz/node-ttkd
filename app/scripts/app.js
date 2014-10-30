/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
define('app', [
    'angular',
    'angular-ui-router',
    'angular-bootstrap',
    'angular-file-upload',
    // 'text!',
    'ngGrid',
    'restangular',
    'sigPad',
    'swiper',
    'jquery-ui',
    './controllers/index',
    './directives/index',
    './factories/index',
    './filters/index',
    './services/index',
    './factories/index',
    './states/index'
  ], function(ng) {
    'use strict';

    return ng.module('ttkd', [
        'ngGrid',
        'restangular',
        'angularFileUpload',
        'ttkd.controllers',
        'ttkd.directives',
        'ttkd.factories',
        'ttkd.filters',
        'ttkd.services',
        'ttkd.factories',
        'ttkd.states',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'ui.router',
      ]).config(['$locationProvider',
        function($locationProvider) {

            $locationProvider.html5Mode(true).hashPrefix('!');

          }
      ]).config(['$provide',
        function($provide){
            $provide.decorator('dateParser', function($delegate){
                var oldParse = $delegate.parse;
                $delegate.parse = function(input, format) {
                    if ( !angular.isString(input) || !format ) {
                      return input;
                    }
                    return oldParse.apply(this, arguments);
                  };
                return $delegate;
              });
          }
        ]).run(function($state, $rootScope, Restangular) {
            
            Restangular.setBaseUrl('/api');

            Restangular.setRestangularFields({
                id: '_id',
              });

            $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
                $rootScope.previousState = from.name;
                $rootScope.previousParams = fromParams;
                $rootScope.currentState = to.name;
                $rootScope.currentParams = toParams;
                console.log('Previous state:'+$rootScope.previousState)
                console.log('Current state:'+$rootScope.currentState)
            });

            $state.go('login');

      });
  });
