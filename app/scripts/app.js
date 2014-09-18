/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
define('app', [
    'angular',
    'angular-ui-router',
    'angular-bootstrap',
    // 'text!',
    'ngGrid',
    'restangular',
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
      ]).run(function($state, $rootScope, Restangular) {

        Restangular.setBaseUrl('/api');

        Restangular.setRestangularFields({
            id: '_id',
          });

        $state.go('login');
      });
  });
