define(['../module'], function(controllers) {

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', 'AuthenticationSvc',
		function($scope, $http, $log, $state, AuthenticationSvc) {

			var current_step_index = 0;
			$scope.current_step = {};
			$scope.wizard_steps = [
				{id: 'admin.students.create.basic', name: 'Basic Information', enabled: true},
				{id: 'admin.students.create.class', name: 'Class Information', enabled: false},
				{id: 'admin.students.create.photo', name: 'Select Picture', enabled: false},
				{id: 'admin.students.create.signature', name: 'Waiver Signature', enabled: false}
			];

			$scope.current_step = $scope.wizard_steps[current_step_index];

			$state.go($scope.current_step.id);


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
				if((current_step_index+1) < $scope.wizard_steps.length) {
					//go to next state
					current_step_index += 1;
					$scope.current_step = $scope.wizard_steps[current_step_index];
					$state.go('class');

				} else {
					//SUBMIT to service
				}
			};



		}
	]);

});
