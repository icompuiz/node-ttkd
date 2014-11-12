/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {


        $stateProvider.state('checkin', {
          url: '/checkin', //
          abstract: true,
          templateUrl: 'partials/checkinBase',
          controller: function($state) {
            //$state.go('checkin.home.programs');
          }
        });

        $stateProvider.state('checkin.home', {
            url: '',
            abstract: true,
            views: {
                'application-body': {
                    templateUrl: 'partials/checkin/index',
                    controller: function() {}
                }
            }
        });

        $stateProvider.state('checkin.home.programs', {
            url: '/home',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/home',
                    controller: 'CheckinCtrl'
                }
            }
        });

        $stateProvider.state('checkin.home.ranked', {
            url: '/ranked/:classId',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/ranked',
                    controller: 'RankedCheckinCtrl'
                }
            }
        });

        $stateProvider.state('checkin.home.studentsRanked', {
            url: '/studentsRanked/:classId/:rankId',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/unranked',
                    controller: 'StudentsCheckinCtrl'
                }
            }
        });

        $stateProvider.state('checkin.home.studentsUnranked', {
            url: '/studentsUnranked/:classId',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/unranked',
                    controller: 'UnrankedCheckinCtrl'
                }
            }
        });

        // checkin screen registration form
        $stateProvider.state('checkin.students', {
            url: '',
            abstract: true,
            views: {
                'application-body': {
                    templateUrl: 'partials/students/index',
                    controller: function() {}
                }
            }
        });
        $stateProvider.state('checkin.students.create', {
            url: '/students/create?classId',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'CreateStudentCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.basic', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/basic',
                    controller: 'CreateStudentBasicCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.class', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/class',
                    controller: 'CreateStudentClassCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.photo', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/photo',
                    controller: 'CreateStudentPhotoCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.signature', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/signature',
                    controller: 'CreateStudentSignatureCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.econtact', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/econtact',
                    controller: 'CreateStudentEContactCtrl'
                }
            }
        });
        $stateProvider.state('checkin.students.create.confirm', {
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create/confirm',
                    controller: 'CreateStudentConfirmCtrl'
                }
            }
        });
    }]);

});