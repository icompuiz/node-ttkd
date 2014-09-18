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
					ClassSvc.list().then(function(classes) {
						$scope.currentProgram.classes = _.where(classes, {program: $scope.currentProgram._id});
					});
				});
			}
			
			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} 

			$scope.goToViewClass = function(clss) {
				ClassSvc.init(clss);
				ClassSvc.startViewing();
				$state.go('admin.programs.viewclass', {id: clss._id});
			};

			$scope.backToHome = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

	}]);
});	