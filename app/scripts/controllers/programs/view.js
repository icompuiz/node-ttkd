define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc',
		function($scope, $state, Restangular, ProgramSvc, ClassSvc) {
			$scope.currentProgram = {};

			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} 

			$scope.goToViewClass = function(clss) {
				ClassSvc.init(clss);
				ClassSvc.startViewing();
				$state.go('admin.programs.viewclass');
			};

			$scope.backToHome = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

	}]);
});	