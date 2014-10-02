/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		$stateProvider.state('admin.programs', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/programs/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.programs.home', {
            url: '/programs',
            views: {
            	'section-body': {
            		templateUrl: 'partials/programs/home',
            		controller: 'ProgramsCtrl'
            	}
            }
        });

        $stateProvider.state('admin.programs.create', {
            url: '/programs/create',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/create',
                    controller: 'CreateProgramCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.edit', {
            url: '/programs/edit/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/edit',
                    controller: 'EditProgramCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.view', {
            url: '/programs/view/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/view',
                    controller: 'ViewProgramCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.createclass', {
            url: '/programs/classes/create/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/classes/create',
                    controller: 'CreateClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.viewclass', {
            url: '/programs/classes/view/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/classes/view',
                    controller: 'ViewClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.editclass', {
            url: '/programs/classes/edit/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/classes/edit',
                    controller: 'EditClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.createrank', {
            url: '/programs/ranks/create/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/ranks/create',
                    controller: 'CreateRankCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.viewrank', {
            url: '/programs/ranks/view/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/ranks/view',
                    controller: 'ViewRankCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.editrank', {
            url: '/programs/ranks/edit/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/ranks/edit',
                    controller: 'EditRankCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.addstudenttype', {
            url: '/programs/classes/addstudent',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/classes/addstudent/studentType',
                    controller: 'EditClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.programs.addstudent', {
            url: '/programs/classes/addstudent/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/programs/classes/addstudent/existing',
                    controller: 'AddStudentCtrl'
                }
            }
        });
    }]);

});