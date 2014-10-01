define(['../../module'], function(controllers) {
    'use strict';

    controllers.controller('CreateStudentEContactCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc', 'EmergencyContactSvc', 'WizardService',
        function($scope, $log, $state, $stateParams, StudentSvc, EmergencyContactSvc, WizardService) {
            $scope.model = StudentSvc.current;

            if (!angular.isDefined($scope.model) || $scope.model == null) {
                $state.go("^", $stateParams);
            }

            $scope.relations = [
                'Mother', 'Mom', 'Dad', 'Father', 'Grandfather', 'Grandmother',
                'Brother', 'Sister'
            ];

            function initEContacts() {
                if (!$scope.model.emergencyContacts || $scope.model.emergencyContacts === null) {
                    $scope.model.emergencyContacts = [];
                }

                var econtactListLen = $scope.model.emergencyContacts.length;

                if (econtactListLen === 0) {
                    $scope.model.emergencyContacts[0] = EmergencyContactSvc.init({});
                }

                if (econtactListLen <= 1) {
                    $scope.model.emergencyContacts[1] = EmergencyContactSvc.init({});
                }
            }

            initEContacts();



        }
    ]);

});
