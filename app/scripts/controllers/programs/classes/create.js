define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateClassCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ClassSvc', 'ProgramSvc',
		function($scope, $state, $stateParams, Restangular, ClassSvc, ProgramSvc) {
			$scope.newClass = {};
			var program = {
				classObjs: [],
				rankObjs: []
			};

			if (ProgramSvc.current) {
				program = ProgramSvc.current;
				$scope.newClass.program = program._id;
			} else if (ClassSvc.current && ClassSvc.creating) {
				$scope.newClass = ClassSvc.current;
				program = ProgramSvc.current;
			} else if ($stateParams.id) {
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					var classObjs = [];
					async.each(p.classes, 
						function(cId, callback) {
							ClassSvc.read(cId, null, false).then(function(c) {
								classObjs.push(c);
								callback();
							});
						},
						function(err) {
							program = p;
							program.classObjs = classObjs;
						}
					);
					$scope.newClass = {
						program: ProgramSvc.current._id
					};
					ClassSvc.init($scope.newClass);
				});					
			} 

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit', {id: $scope.newClass.program});
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}

			$scope.cancelCreate = function() {

				ClassSvc.reset();

				goToPrevState();
			};

			$scope.createClass = function() {

				//Make sure the class name is not a duplicate within the program
				var classNames = _.map(program.classObjs, function(c) { return c.name; });
				if (_.contains(classNames, $scope.newClass.name)) {
					alert('Class name must be unique!');
					return;
				}

				program.classObjs.push($scope.newClass);
				ProgramSvc.init(program);

				ClassSvc.reset();

				goToPrevState();
			};



/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canCreateClass = function() {
				return !$scope.isEmpty($scope.newClass.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (program) {
					names = _.map(program.classObjs, function(c){return c.name;});
				}

				return _.contains(names, $scope.newClass.name);
			};
	}]);
});	