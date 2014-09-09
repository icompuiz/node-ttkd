define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', 'StudentSvc',
		function($scope, $http, $log, $state, StudentSvc) {

			var wizardSteps = {};
			wizardSteps['admin.students.create.basic'] = { id: 'admin.students.create.basic', name: 'Basic Information', enabled: false };
			wizardSteps['admin.students.create.econtact'] = { id: 'admin.students.create.econtact', name: 'Emergency Contact', enabled: false };
			wizardSteps['admin.students.create.class'] = { id: 'admin.students.create.class', name: 'Class Information', enabled: false };
			wizardSteps['admin.students.create.photo'] = { id: 'admin.students.create.photo', name: 'Student Picture', enabled: false };
			wizardSteps['admin.students.create.signature'] = { id: 'admin.students.create.signature', name: 'Waiver Release', enabled: false };

			var wizardStepsOrder = [
				'admin.students.create.basic',
				'admin.students.create.econtact',
				'admin.students.create.class',
				'admin.students.create.photo',
				'admin.students.create.signature'
			];

			var defaultStep = 'admin.students.create.basic';


			// Create student object

			$scope.model = {
				firstName: 'Elijah',
				lastName: 'Pope',
				emailAddress: 'epope@ttkd.com',
				birthday: new Date('July 22, 1991'),
				address: {
					street: '123 Gumdrop Ln. Apt 53',
					city: 'Rochester',
					state: 'NY',
					zip: '14623'
				},
				phone: {
					home: '5852471236',
					cell: '5857452698'
				},
			};

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

			$scope.getStepName = function(key) {
				return wizardSteps[key].name;
			};

			$scope.isStepEnabled = function(key) {
				return wizardSteps[key].enabled;
			};

			function setCurrentStep(key){
				$scope.currentStep = wizardSteps[$scope.getStep(key)];
				enableStep($scope.currentStep.id);
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

			// Help and validation text
			$scope.firstNameHelp = {type: 'info', value: 'Enter the student\'s first name.'};
			$scope.lastNameHelp = {type: 'info', value: 'Enter the student\'s last name.'};
			$scope.emailHelp = {type: 'error', value: 'That email address is invalid. A valid email address is in the form of: e.g. user@website.com'};
			$scope.addressHelp = {type: 'info', value: 'Enter the address where the student resides.'};
			$scope.cityHelp = {type: 'info', value: 'Enter the city where the student resides.'};
			$scope.stateHelp = {type: 'info', value: 'Enter the state where the student resides.'};
			$scope.zipcodeHelp = {type: 'info', value: 'Enter the zip code where the student resides.'};
			$scope.homephoneHelp = {type: 'info', value: 'Enter the zip code where the student resides.'};
			$scope.cellphoneHelp = {type: 'info', value: 'Enter the zip code where the student resides.'};

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
				var currentStepIndex = $scope.getStepOrder($scope.currentStep.id);

				if(currentStepIndex + 1 < wizardStepsOrder.length) {
					setCurrentStep(wizardStepsOrder[currentStepIndex + 1]);
				} else {
					StudentSvc.create(true).then(onSaveSuccess);
				}

			};

			$scope.goToStep = function(key){
				if(wizardSteps[key].enabled) {
					setCurrentStep(key);
				}
			};









		}
	]);

});
