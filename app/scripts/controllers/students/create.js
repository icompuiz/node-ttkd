define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', '$stateParams', 'StudentSvc', 'WizardService',
		function($scope, $http, $log, $state, $stateParams, StudentSvc, WizardService) {

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
					// may be an existing student... try and load
					if (_.isEmpty($stateParams.id)) {
					    $scope.model = StudentSvc.init({});
					    // initialize wizard or pull existing wizard here
					    initializeWizard();
					} else {
					    StudentSvc.read($stateParams.id, {}, true).then(function(studentDoc) {
					    	// initialize wizard or pull existing wizard here
					    	$scope.model = studentDoc;
					    	initializeWizard();
					    });
					}
				} else {
					$scope.model = StudentSvc.current;
					initializeWizard();
				}
			}

			function initializeWizard() {
			    $scope.wizard = WizardService.get('admin.students.create');

				if (!$scope.wizard) {
					$scope.wizard = WizardService.create('admin.students.create', true);
					$state.go($scope.wizard.current.id); // go to the initial state of this progression
				}

				$scope.$watch('wizard.current', function(currentStep, previousStep) {
					if (currentStep && (currentStep.id !== previousStep.id)) {
						$state.go(currentStep.id);
					}
				});
			}

			initStudentObject();




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
