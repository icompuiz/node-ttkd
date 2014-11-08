define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewStudentCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', 'StudentSvc',
		function($rootScope, $scope, $log, $state, $stateParams, StudentSvc) {
			$scope.currentStudent = {};

			if (StudentSvc.current && StudentSvc.viewing) {
				$scope.currentStudent = StudentSvc.current;
			} else if ($stateParams.id) {
				StudentSvc.read($stateParams.id, null, true).then(function(student) {
					$scope.currentStudent = student;
				});
			}

			if (StudentSvc.current && StudentSvc.viewing) {
				$scope.currentStudent = StudentSvc.current;
			}

			$scope.backToHome = function() {
				StudentSvc.reset();

				if ($rootScope.previousState && $rootScope.previousParams) {
					$state.go($rootScope.previousState, $rootScope.previousParams);
				} else if ($rootScope.previousState) {
					$state.go($rootScope.previousState);
				} else {
					$state.go('admin.students.home');
				}
			};

			$scope.showEContact1 = function() {
				return $scope.currentStudent.emergencyContacts && 
						$scope.currentStudent.emergencyContacts != null && 
						$scope.currentStudent.emergencyContacts.length > 0;
			};

			$scope.showEContact2 = function() {
				return $scope.currentStudent.emergencyContacts && 
						$scope.currentStudent.emergencyContacts != null && 
						$scope.currentStudent.emergencyContacts.length > 1;
			};

			$scope.editStudent = function() {
				StudentSvc.reset();
				$state.go('admin.students.edit', {id: $stateParams.id});
			};

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {
                    $log.log('Removing selected student...');

                    $log.log(' |_ Removing student: ' + $scope.currentStudent.firstName + ' ' + $scope.currentStudent.lastName + ' ' + $scope.currentStudent._id);
                    removeStudentData($scope.currentStudent);

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
            };

            $scope.showRemoveConfirm = false;

            function removeStudentData(student) {
                //Remove Student
                StudentSvc.read(student._id, null, true).then(function() {
                    StudentSvc.remove().then(function() {
                        StudentSvc.reset();
                        $scope.backToHome();
                    });
                });
            }

            $scope.hasNotifications = function() {
            	return $scope.currentStudent.message && $scope.currentStudent.message !== '';
            };

            $scope.editingNotifications = false;
            $scope.editNotifications = function() {
            	$scope.editingNotifications = true;
            };

            $scope.addNotifications = function() {
            	$scope.editingNotifications = true;
            };

            $scope.saveNotifications = function() {
            	$scope.editingNotifications = false;
            	StudentSvc.save(); // save message
            };
	}]);
});