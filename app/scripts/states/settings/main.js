/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('admin.settings', {
            url: '/settings',
            abstract: true,
            views: {
                'application-body': {
                    templateUrl: 'partials/settings/index',
                    controller: function() {}
                }
            }
        });

        $stateProvider.state('admin.settings.home', {
            url: '',
            views: {
            	'section-body': {
            		templateUrl: 'partials/settings/home',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.settings.import', {
            url: '/import',
            views: {
                'section-body': {
                    templateUrl: 'partials/settings/import',
                    controller: 'DataImportCtrl'
                }
            }
        });
        $stateProvider.state('admin.settings.export', {
            url: '/export',
            views: {
            	'section-body': {
            		templateUrl: 'partials/settings/export',
            		controller: 'DataExportCtrl'
            	}
            }
        });

    }]);

});