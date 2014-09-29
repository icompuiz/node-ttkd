define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditClassCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ClassSvc', 'ProgramSvc',
		function($scope, $state, $stateParams, Restangular, ClassSvc, ProgramSvc) {
			$scope.currentClass = {};
			var currentProgram = null;
			var orig = null;

			if (ClassSvc.current && ClassSvc.editing) {
				$scope.currentClass = ClassSvc.current;
				currentProgram = ProgramSvc.current;
				currentProgram.populated = true;
				if (!ClassSvc.orig) {
					ClassSvc.orig = {
						name: ClassSvc.current.name,
						studentList: ClassSvc.current.studentList
					}
				}
				orig = ClassSvc.orig;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(c) {
					$scope.currentClass = c;
					ClassSvc.orig = {
						name: c.name,
						studentList: c.studentList
					};
					orig = ClassSvc.orig;
					ProgramSvc.read($scope.currentClass.program, null, true).then(function(p) {
						var pClasses = [];
						currentProgram = p;
						async.each(p.classes,
							function(cItem, callback) {
								ClassSvc.read(cItem, null, false).then(function(pc) {
									pClasses.push(pc);
									callback();
								});
							},
							function(err) {
								currentProgram.classObjs = pClasses;
								currentProgram.populated = true;
							});
					});
				});
			}

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit', { id: currentProgram._id});
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}

			$scope.saveClass = function() {
				//Find the original class in the program and replace it with the edited class
				var i = _.findIndex(currentProgram.classObjs, function(c) {
					return c.name === ClassSvc.orig.name;
				});
				if (i >= 0) {
					currentProgram.classObjs[i] = $scope.currentClass;
				} else {
					currentProgram.classObjs.push($scope.currentClass);
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


/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveClass = function() {
				return !$scope.isEmpty($scope.currentClass.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (currentProgram && currentProgram.populated && orig) {
					names = _.map(currentProgram.classObjs, function(c){return c.name;});
					names = _.without(names, orig.name);
				}

				return _.contains(names, $scope.currentClass.name);
			};
	}]);
});	