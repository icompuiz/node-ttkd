define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditClassCtrl', ['$scope', '$state', 'Restangular', 'ClassSvc', 'ProgramSvc',
		function($scope, $state, Restangular, ClassSvc, ProgramSvc) {
			$scope.currentClass = {};
			var currentProgram = {};


			if (ClassSvc.current && ClassSvc.editing) {
				$scope.currentClass = ClassSvc.current;
				//Store the original class so we can find and save changes after editing
				if (!ClassSvc.orig) {
					ClassSvc.orig = {
						name: ClassSvc.current.name,
						studentList: ClassSvc.current.studentList
					};
				}
			} 

			if (ProgramSvc.current) {
				currentProgram = ProgramSvc.current;
			}

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit');
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}

			$scope.saveClass = function() {

				//Compare class attributes, return true if they are the same
				function areSameClass(c1, c2) {
					var sameName = c1.name === c2.name,
						sameStudents = c1.studentList === c2.studentList;

					return sameName && sameStudents;
				}

				//Make sure the class name is not a duplicate within the program
				var classNames = _.map(currentProgram.classes, function(c) { return c.name });
				if (_.contains(classNames, $scope.currentClass.name)) {
					alert("Class name must be unique!");
					return;
				}

				//Find the original class in the program and replace it with the edited clas
				var i = _.findIndex(currentProgram.classes, function(c) {
					return areSameClass(c, ClassSvc.orig);
				})
				if (i >= 0) {
					currentProgram.classes[i] = $scope.currentClass;
				} else {
					currentProgram.classes.push($scope.currentClass);
				}

				ClassSvc.reset();
				ClassSvc.orig = null;

				goToPrevState();
				
			};

			$scope.cancelEdit = function() {

				ClassSvc.reset();
				ClassSvc.orig = null;

				goToPrevState();
			};

	}]);
});	