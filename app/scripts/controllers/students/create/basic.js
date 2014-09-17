define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentBasicCtrl', ['$scope', '$log', '$state', 'StudentSvc',
		function($scope, $log, $state, StudentSvc) {
			// Date of birth calendar
			$scope.today = function() {
					$scope.model.birthday = new Date();
			};
			//$scope.today();
			$scope.clear = function() {
					$scope.model.birthday = null;
			};
			$scope.open = function($event) {
					$event.preventDefault();
					$event.stopPropagation();
					$scope.opened = true;
			};

			$scope.dateOptions = {
					formatYear: 'yy',
					startingDay: 1
			};
			$scope.initDate = new Date('2014-01-01');
			$scope.format = 'MMMM dd, yyyy';

			function validateData() {
				return validateFirstName() && validateLastName();
			}

			function validateFirstName() {
				var firstName = $scope.model.firstName;

				if(firstName.length < 2 || firstName.length > 64) {
					$scope.errors.basic.firstName = 'First name must be between 2 and 64 characters long.';
					return false;
				}
			}

			function validateLastName() {
				var lastName = $scope.model.lastName;

				if(lastName.length < 2 || lastName.length > 64) {
					$scope.errors.basic.lastName = 'Last name must be between 2 and 64 characters long.';
					return false;
				}
			}

			function validateAddress() {
				var street = $scope.model.address.street;
				var city = $scope.model.address.city;
				var state = $scope.model.address.state;

				if(street.length < 2 || lastName.length > 128) {
					$scope.errors.basic.address.street = 'Street address must be between 2 and 128 characters long.';
					return false;
				}
			}










			var wizardSteps = {};
			wizardSteps['admin.students.create.basic'] = { id: 'admin.students.create.basic', name: 'Basic Information', enabled: false };
			wizardSteps['admin.students.create.econtact'] = { id: 'admin.students.create.econtact', name: 'Emergency Contact', enabled: false };
			wizardSteps['admin.students.create.class'] = { id: 'admin.students.create.class', name: 'Class Information', enabled: false };
			wizardSteps['admin.students.create.photo'] = { id: 'admin.students.create.photo', name: 'Student Picture', enabled: false };
			wizardSteps['admin.students.create.signature'] = { id: 'admin.students.create.signature', name: 'Waiver Signature', enabled: false };

			var wizardStepsOrder = [
				'admin.students.create.basic',
				'admin.students.create.econtact',
				'admin.students.create.class',
				'admin.students.create.photo',
				'admin.students.create.signature'
			];

			var defaultStep = 'admin.students.create.basic';

			$scope.errors = {};

			// Create student object
			if (!StudentSvc.current) {
				$scope.model = StudentSvc.init($scope.model);
			} else {
				$scope.model = StudentSvc.current;
			}

			$scope.getStep = function(key) {
				if(key in wizardSteps) {
					return key;
				} else {
					return defaultStep;
				}
			};

			$scope.getStepOrder = function(key) {
				return wizardStepsOrder.indexOf(key);
			};

			$scope.displayPreviousBtn = function() {
				return ($scope.getStepOrder($scope.currentStep.id) - 1 >= 0);
			};

			$scope.displayContinueBtn = function() {
				return ($scope.getStepOrder($scope.currentStep.id) + 1 < wizardStepsOrder.length);
			};

			$scope.displaySubmitBtn = function() {
				return ($scope.getStepOrder($scope.currentStep.id) + 1 === wizardStepsOrder.length);
			};

			$scope.submitBtnContent = 'Submit Registration';
			$scope.submitBtnDisabled = false;

			$scope.getStepName = function(key) {
				return wizardSteps[key].name;
			};

			$scope.isStepEnabled = function(key) {
				return wizardSteps[key].enabled;
			};

			function setCurrentStep(key){
				$scope.currentStep = wizardSteps[$scope.getStep(key)];
				enableStep($scope.currentStep.id);

				var currentIndex = $scope.getStepOrder($scope.currentStep.id);
				for(var i=(currentIndex + 1); i<wizardStepsOrder.length; i++) {
					disableStep(wizardStepsOrder[i]);
				}

				$state.go($scope.currentStep.id);
			}

			function enableStep(key) {
				$log.log('Attempting to enable step: ' + key);
				wizardSteps[key].enabled = true;
			}

			function disableStep(key) {
				$log.log('Attempting to disable step: ' + key);
				wizardSteps[key].enabled = false;
			}

			$scope.wizardSteps = wizardStepsOrder;

			// Set the current step in the wizard
			setCurrentStep($state.current.name);

			$scope.previous = function() {
				var currentStepIndex = $scope.getStepOrder($scope.currentStep.id);

				if(currentStepIndex - 1 >= 0) {
					setCurrentStep(wizardStepsOrder[currentStepIndex - 1]);
				} else {
					//submit to service
				}
			};

			function onSaveSuccess() {
				console.log('Student Saved Successfully');
			}

			$scope.submit = function() {
				// check for ng form validity

				var currentStepIndex = $scope.getStepOrder($scope.currentStep.id);

				if(currentStepIndex + 1 < wizardStepsOrder.length) {
					setCurrentStep(wizardStepsOrder[currentStepIndex + 1]);
				} else {
					$scope.submitBtnContent = 'Creating Student...';
					$scope.submitBtnDisabled = true;
					StudentSvc.create(true).then(onSaveSuccess);
				}

			};

			$scope.goToStep = function(key){
				if(wizardSteps[key].enabled) {
					setCurrentStep(key);
				}
			};

			$scope.showResetConfirm = false;
			$scope.reset = function() {
				$scope.showResetConfirm = true;
			};
			$scope.confirmReset = function(booleanValue) {
				$scope.showResetConfirm = false;

				if(booleanValue) {
					$scope.model = StudentSvc.init($scope.model);
					$scope.goToStep(defaultStep);
				}
			};






		}
	]);

});
