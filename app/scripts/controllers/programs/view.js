define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewProgramCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ProgramSvc', 'ClassSvc',
		function($scope, $state, $stateParams, Restangular, ProgramSvc, ClassSvc) {
			$scope.currentProgram = {};

			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} else if ($stateParams.id) {
				ProgramSvc.read($stateParams.id, null, true).then(function(p) { 
					$scope.currentProgram = p;
				});
			}
			
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