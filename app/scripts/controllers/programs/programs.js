define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular','ProgramFactory', function($scope, $state, Restangular, ProgramFactory) {
		var basePrograms = Restangular.all('programs');
		var baseClasses = Restangular.all('classes');
		var baseRanks = Restangular.all('ranks');


		$scope.programs = {};
		$scope.model = {
			classes: [],
			ranks: []
		};

		if (!ProgramFactory.current) {
			$scope.model = ProgramFactory.init($scope.model);
		} else {
			$scope.model = ProgramFactory.current;
		}


		$scope.newClass = {};
		$scope.newRank = {};
		$scope.allChecked = false;

		$scope.getPrograms = function() {
			basePrograms.getList().then(function(programs) {
				//Fetch and display the program's classes' names
				baseClasses.getList().then(function(classes) {
					var i;
					var programClasses = classes;
					for(i=0; i<programs.length; i++) {
						programClasses = _.where(classes, {'program': programs[i]._id});
						programs[i].classNames = [];
						var j;
	 					for(j=0; j<programClasses.length; j++) {
							programs[i].classNames.push(programClasses[j].name);
						}
					}
				});
				//Fetch and display the program's ranks' names
				//TODO parallel?
				baseRanks.getList().then(function(ranks) {
					var i;
					var programRanks = ranks;
					for(i=0; i<programs.length; i++) {
						programRanks = _.where(ranks, {'program': programs[i]._id});
						programs[i].rankNames = [];
						var j;
	 					for(j=0; j<programRanks.length; j++) {
							programs[i].rankNames.push(programRanks[j].name);
						}
					}
				});
				$scope.programs = programs;
			});
		};
		$scope.getPrograms();

		$scope.removeProgram = function(program) {
			Restangular.one('programs', program._id).remove().then(function() {
				$scope.programs = _.without($scope.programs, program);
			});
		};

		$scope.goToAddProgram = function() {
			$state.go('admin.programs.create');
		};

		$scope.goToProgramsHome = function() {
			$state.go('admin.programs.home');
		};

		$scope.addProgram = function() {
			var programToAdd = {
				name: $scope.model.name
			};
			//POST new program
			basePrograms.post(programToAdd).then(function(programAdded) {
				var classIDs = [],
					rankIDs = [];
				//Add classes to db
				(function(classIDs, rankIDs){
					async.parallel([
						function(callback, err) {
							//Add classes
							async.each($scope.model.classes,
								function(classItem, callback) {
									var classToAdd = {
										name: classItem.name,
										program: programAdded._id
									};
									//POST each new class and add object ID to array
									baseClasses.post(classToAdd).then(function(classAdded, err){
										classIDs.push(classAdded._id);
										callback();
									});
								},
								function(err) {
									callback();
								}
							);
						},
						function(callback, err) {
							//Add classes
							async.each($scope.model.ranks,
								function(rankItem, callback) {
									var rankToAdd = {
										name: rankItem.name,
										program: programAdded._id
									};
									//POST each new class and add object ID to array
									baseRanks.post(rankToAdd).then(function(rankAdded, err){
										rankIDs.push(rankAdded._id);
										callback();
									});
								},
								function(err) {
									callback();
								}
							);
						}],
						function(err) {
							//Add class and rank references and PUT updated program
							Restangular.one('programs', programAdded._id).get().then(function(p){
								var programToUpdate = p;
								programToUpdate.classes = classIDs;
								programToUpdate.ranks = rankIDs;
								programToUpdate.put();
							});
							$scope.model = {};
							$scope.model.classes = {};
							$scope.model.ranks = {};
					});
				})(classIDs, rankIDs);
			});
		};

		$scope.addClass = function() {
			$scope.model.classes.push($scope.newClass);
			$scope.newClass = {};
		};

		$scope.addRank = function() {
			$scope.model.ranks.push($scope.newRank);
			$scope.newRank = {};
		};

		$scope.checkAll = function() {
			var i;
			for(i=0; i<$scope.programs.length; i++){
				$scope.programs[i].selected = $scope.allChecked;
			}
		};

		$scope.removeSelected = function() {
			var i;
			for(i=0; i<$scope.programs.length; i++) {
				if($scope.programs[i].selected){
					$scope.removeProgram($scope.programs[i]);
				}
			}
		};
	}]);
});	