define(['../module'], function(controllers) {

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', 'AuthenticationSvc',
		function($scope, $http, $log, $state, AuthenticationSvc) {

			var wizard_steps = {};
			wizard_steps['admin.students.create.basic'] = { id: 'admin.students.create.basic', name: 'Basic Information', enabled: false };
			wizard_steps['admin.students.create.class'] = { id: 'admin.students.create.class', name: 'Class Information', enabled: false };
			wizard_steps['admin.students.create.photo'] = { id: 'admin.students.create.photo', name: 'Student Picture', enabled: false };
			wizard_steps['admin.students.create.signature'] = { id: 'admin.students.create.signature', name: 'Waiver Release', enabled: false };

			var wizard_steps_order = [
				'admin.students.create.basic',
				'admin.students.create.class',
				'admin.students.create.photo',
				'admin.students.create.signature'
			]

			var default_step = 'admin.students.create.basic';

			$scope.getStep = function(key) {
				if(key in wizard_steps) {
					return key;
				} else {
					return default_step;
				}
			}

			$scope.getStepName = function(key) {
				return wizard_steps[key].name;
			}

			$scope.isStepEnabled = function(key) {
				return wizard_steps[key].enabled;
			}

			function setCurrentStep(key){
				$scope.current_step = wizard_steps[$scope.getStep(key)];
				enableStep($scope.current_step.id);
			}

			function enableStep(key) {
				$log.log("Attempting to enable step: " + key);
				wizard_steps[key].enabled = true;
			}

			function disableStep(key) {
				$log.log("Attempting to disable step: " + key);
				wizard_steps[key].enabled = false;
			}

			$scope.wizard_steps = wizard_steps_order;

			// Set the current step in the wizard
			setCurrentStep($state.current.name);
			$state.go($scope.current_step.id);

			// Help and validation text
			$scope.first_name_help = {type: 'info', value: 'Enter the student\'s first name.'};
			$scope.last_name_help = {type: 'info', value: 'Enter the student\'s last name.'};
			$scope.email_help = {type: 'error', value: 'That email address is invalid.'};

			// Date of birth calendar
			$scope.today = function() {
					$scope.dt = new Date();
			};
			$scope.today();
			$scope.clear = function() {
					$scope.dt = null;
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



			$scope.submit = function() {
				var current_step_index = wizard_steps_order.indexOf($scope.current_step.id);

				if(current_step_index + 1 < wizard_steps_order.length) {
					setCurrentStep(wizard_steps_order[current_step_index + 1]);
					$state.go($scope.current_step.id);
				} else {
					//submit to service
				}

			};

			$scope.goToStep = function(key){
				if(wizard_steps[key].enabled) {
					$state.go(key);
				}
			};









		}
	]);

});
