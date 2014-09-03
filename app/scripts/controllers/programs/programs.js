define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular', function($scope, $state, Restangular) {
		var basePrograms = Restangular.all('programs');
		var baseClasses = Restangular.all('classes');
		var baseRanks = Restangular.all('ranks');

		$scope.programs = {};
		$scope.newProgram = {
			classes: [],
			ranks: []
		};
		$scope.newClass = {};
		$scope.newRank = {};

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
				var classIDs = [],
					rankIDs = [];
				//Add classes to db
				async.parallel([
					function(callback, err) {
						//Add classes
						var i = 0;
						for (i=0; i<$scope.newProgram.classes.length; i++) {
							var classToAdd = {
								name: $scope.newProgram.classes.name,
								program: programAdded._id
							};
							//POST each new class and add object ID to array
							baseClasses.post(classToAdd).then(function(classAdded, err){
								classIDs.push(classAdded._id);
							});
						}
						callback();
					},
					function(callback, err) {
						//add Ranks
						var i = 0;
						for(i=0; i<$scope.newProgram.ranks.length; i++) {
							var rankToAdd = {
								name: $scope.newProgram.ranks.name,
								program: programAdded._id
							};
							//POST each new rank and add object ID to array
							baseRanks.post(rankToAdd).then(function(rankAdded, err){
								rankIDs.push(rankAdded._id);
							});
						}
						callback();
					}],
					function(err) {
						//Add class and rank references and PUT updated program
						Restangular.one('programs', programAdded._id).get().then(function(p){
							var programToUpdate = p;
							programToUpdate.classes = classIDs;
							programToUpdate.ranks = rankIDs;
							programToUpdate.put();
						});
						$scope.newProgram = {};
				});
			});
		};

		$scope.addClass = function() {
			$scope.newProgram.classes.push($scope.newClass);
			$scope.newClass = {};
		};

		$scope.addRank = function() {
			$scope.newProgram.ranks.push($scope.newRank);
			$scope.newRank = {};
		};
	}]);
});	