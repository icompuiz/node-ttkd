define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', 'StudentSvc', 'WizardService',
		function($scope, $http, $log, $state, StudentSvc, WizardService) {

			$scope.errors = {};

			// $scope.model = {
			// 	"firstName": "Johnny",
			// 	"lastName": "Appleseed",
			// 	"address": {
			// 		"street": "1 Lomb Memorial Drive",
			// 		"city": "Rochester",
			// 		"zip": 14623
			// 	},
			// 	"emailAddress": "johnn.a@rit.edu",
			// 	"birthday": "1991-07-22T04:00:00.000Z"
			// };

			// Create student object
			function initStudentObject() {
				if (!StudentSvc.current) {
					$scope.model = StudentSvc.init({});
				} else {
					$scope.model = StudentSvc.current;
				}
			}

			initStudentObject();

			// Create wizard object
			$scope.wizard = WizardService.get('admin.students.create');
			if (!$scope.wizard) {
				$scope.wizard = WizardService.create('admin.students.create', true);
				$state.go($scope.wizard.current.id); // go to the initial state of this progression
			}

			// handle navigation
			$scope.$watch('wizard.current', function(currentStep, previousStep) {
				if (currentStep && (currentStep.id !== previousStep.id)) {
					$state.go(currentStep.id);
				}
			});


			$scope.displayPreviousBtn = function() {
				return $scope.wizard.peekPreviousIndex();
			};

			$scope.displayContinueBtn = function() {
				return $scope.wizard.peekNextIndex();
			};

			$scope.submitBtnContent = 'Submit Registration';

			function onSaveSuccess() {
				console.log('Student Saved Successfully');
			}

			$scope.submit = function() {
				// check for ng form validity
				$log.log($scope.model);

				if (!$scope.wizard.current.isFinalStep) {
					$scope.wizard.goFoward();
				} else {
					$scope.submitBtnContent = 'Creating Student...';
					$scope.submitBtnDisabled = true;
					StudentSvc.create(true).then(onSaveSuccess);
				}

			};

			$scope.showResetConfirm = false;
			$scope.reset = function() {
				$scope.showResetConfirm = true;
			};
			$scope.confirmReset = function(resetConfirmed) {
				$scope.showResetConfirm = false;

				if (resetConfirmed) {
					StudentSvc.reset();
					initStudentObject();
					$scope.wizard.reset();
					$scope.createStudent.$setPristine();
				}
			};
		}
	]);

});
