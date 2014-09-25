/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('admin.students', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/students/index',
            		controller: function() {}
            	}
            }
        });

        $stateProvider.state('admin.students.home', {
            url: '/students',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/list',
                    controller: 'ListStudentCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.view', {
            url: '/students/view/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/view',
                    controller: 'ViewStudentCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit', {
            url: '/students/edit/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'CreateStudentCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create', {
            url: '/students/create',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'CreateStudentCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.basic', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/basic',
                    controller: 'CreateStudentBasicCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.basic', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/basic',
                    controller: 'CreateStudentBasicCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.class', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/class',
                    controller: 'CreateStudentClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.class', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/class',
                    controller: 'CreateStudentClassCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.photo', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/photo',
                    controller: 'CreateStudentPhotoCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.photo', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/photo',
                    controller: 'CreateStudentPhotoCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.signature', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/signature',
                    controller: 'CreateStudentSignatureCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.signature', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/signature',
                    controller: 'CreateStudentSignatureCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.econtact', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/econtact',
                    controller: 'CreateStudentEContactCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.econtact', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/econtact',
                    controller: 'CreateStudentEContactCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.confirm', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/confirm',
                    controller: 'CreateStudentConfirmCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.edit.confirm', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/confirm',
                    controller: 'CreateStudentConfirmCtrl'
                }
            }
        });


    }]).run(['WizardService', function Run(WizardService) {
        
        var wizardSteps = {};
        wizardSteps['admin.students.create.basic'] = { id: 'admin.students.create.basic', name: 'Basic Information', enabled: false };
        wizardSteps['admin.students.create.econtact'] = { id: 'admin.students.create.econtact', name: 'Emergency Contact', enabled: false };
        wizardSteps['admin.students.create.class'] = { id: 'admin.students.create.class', name: 'Class Information', enabled: false };
        wizardSteps['admin.students.create.photo'] = { id: 'admin.students.create.photo', name: 'Student Picture', enabled: false };
        wizardSteps['admin.students.create.signature'] = { id: 'admin.students.create.signature', name: 'Waiver Signature', enabled: false };
        wizardSteps['admin.students.create.confirm'] = { id: 'admin.students.create.confirm', name: 'Review Registration', enabled: false, isFinalStep: true };
        

        wizardSteps['admin.students.edit.basic'] = { id: 'admin.students.edit.basic', name: 'Basic Information', enabled: true };
        wizardSteps['admin.students.edit.econtact'] = { id: 'admin.students.edit.econtact', name: 'Emergency Contact', enabled: true };
        wizardSteps['admin.students.edit.class'] = { id: 'admin.students.edit.class', name: 'Class Information', enabled: true };
        wizardSteps['admin.students.edit.photo'] = { id: 'admin.students.edit.photo', name: 'Student Picture', enabled: true };
        wizardSteps['admin.students.edit.confirm'] = { id: 'admin.students.edit.confirm', name: 'Review Registration', enabled: true, isFinalStep: true };



        var wizardStepsOrder = [
            wizardSteps['admin.students.create.basic'],
            wizardSteps['admin.students.create.econtact'],
            wizardSteps['admin.students.create.class'],
            wizardSteps['admin.students.create.photo'],
            wizardSteps['admin.students.create.signature'],
            wizardSteps['admin.students.create.confirm']
        ];

        var wizardStepsOrderEdit = [
            wizardSteps['admin.students.edit.basic'],
            wizardSteps['admin.students.edit.econtact'],
            wizardSteps['admin.students.edit.class'],
            wizardSteps['admin.students.edit.photo'],
            wizardSteps['admin.students.edit.confirm']
        ];

        WizardService.register('admin.students.create', wizardStepsOrder);
        WizardService.register('admin.students.edit', wizardStepsOrderEdit);

    }]);

});