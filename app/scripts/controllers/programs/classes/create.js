define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateClassCtrl', ['$scope', '$state', 'Restangular', 'ClassSvc', 'ProgramSvc',
		function($scope, $state, Restangular, ClassSvc, ProgramSvc) {
			$scope.newClass = {};
			var program = {};

			if (ClassSvc.current && ClassSvc.creating) {
				$scope.newClass = ClassSvc.current;
			} else {
				$scope.newClass = ClassSvc.init({
					program: ProgramSvc.current._id
				});
			}

			if (ProgramSvc.current) {
				program = ProgramSvc.current;
			}

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit');
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.prorams.home');
				}
			}

			$scope.cancelCreate = function() {

				ClassSvc.reset();

				goToPrevState();
			};

			$scope.createClass = function() {

				//Make sure the class name is not a duplicate within the program
				var classNames = _.map(program.classes, function(c) { return c.name });
				if (_.contains(classNames, $scope.newClass.name)) {
					alert('Class name must be unique!');
					return;
				}

				ProgramSvc.current.classes.push($scope.newClass);

				ClassSvc.reset();

				goToPrevState();
			};



/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canCreateClass = function() {
				return !$scope.isEmpty($scope.newClass.name);
			};

	}]);
});	