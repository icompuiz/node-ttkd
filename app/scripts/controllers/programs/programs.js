define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular', function($scope, $state, Restangular) {
		var basePrograms = Restangular.all('programs');
		var baseClasses = Restangular.all('classes');

		$scope.programs = {};
		$scope.newProgram = {
			classes: []
		};
		$scope.newClass = {};

		$scope.getPrograms = function() {
			$scope.programs = basePrograms.getList().$object;
		};
		$scope.getPrograms();

		$scope.goToAddProgram = function() {
			$state.go('admin.programs.create');
		};

		$scope.goToProgramsHome = function() {
			$state.go('admin.programs.home');
		};

		$scope.addProgram = function() {
			var programToAdd = {
				name: $scope.newProgram.name
			};
			//POST new program
			basePrograms.post(programToAdd).then(function(programAdded) {
				var classIDs = []; //Holds reference to program's classes
				async.each($scope.newProgram.classes,
					function(classItem, callback) {
						var classToAdd = {
							name: classItem.name,
							program: programAdded._id
						};

						//POST each new class and add object ID to array
						baseClasses.post(classToAdd).then(function(classAdded, err){
							classIDs.push(classAdded._id);							
							callback(err);
						});
					}, 
					function(err){
						//Add class references and PUT updated program
						Restangular.one('programs', programAdded._id).get().then(function(p){
							var programToUpdate = p;
							programToUpdate.classes = classIDs;
							console.log(p);
							programToUpdate.put();
						});
						$scope.newProgram = {};
					}
				);
			});
		};

		$scope.addClass = function() {
			$scope.newProgram.classes.push($scope.newClass);
			$scope.newClass = {};
		};
	}]);
});	