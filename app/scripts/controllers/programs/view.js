define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 
		function($scope, $state, Restangular, ProgramSvc) {
			$scope.currentProgram = {};

			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} 

			$scope.backToHome = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

	}]);
});	