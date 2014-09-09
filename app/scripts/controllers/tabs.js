define(['./module'], function(controllers){
	'use strict';
	controllers.controller('tabCtrl', ['$scope', '$state', function($scope, $state) {
			$scope.tabs = [
				{ title: 'Dashboard', state: 'dashboard', active: 'true'},
				{ title: 'Students', state: 'students' },
				{ title: 'Programs', state: 'programs' },
				{ title: 'Workshops', state: 'workshops' },
				{ title: 'Payments', state: 'payments' },
				{ title: 'Attendance', state: 'attendance' },
				{ title: 'Reporting', state: 'reporting' }
			];

			//Default to the dashboard view
			$state.go('dashboard');
	  }]);
});