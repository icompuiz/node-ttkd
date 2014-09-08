define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.newClass = {};
			$scope.newRank = {};
			$scope.allChecked = false;
			$scope.newProgram = {};
			$scope.editing = false;
			$scope.viewing = false;

			if (ProgramSvc.viewing && ProgramSvc.current) {
				$scope.viewing = ProgramSvc.current;
			} 
			if (ProgramSvc.editing && ProgramSvc.current) {
				$scope.editing = ProgramSvc.current;
			} 
			if (ProgramSvc.creating && ProgramSvc.current) {
				$scope.newProgram = ProgramSvc.current;
			} else if (ProgramSvc.creating && !ProgramSvc.current) {
				$scope.newProgram = ProgramSvc.init({
					classes: [],
					ranks: []
				});
			}

			$scope.getPrograms = function() {
				ProgramSvc.list().then(function(programs) {
					//Get class objects and put into programs
					ClassSvc.list().then(function(classes) {
						var i;
						for(i=0; i<programs.length; i++) {
							programs[i].classes = _.where(classes, {'program': programs[i]._id});
						}
					});
					//Get rank objects and put into programs
					RankSvc.list().then(function(ranks) {
						var i;
						for(i=0; i<programs.length; i++) {
							programs[i].ranks = _.where(ranks, {'program': programs[i]._id});
						}
					});
					$scope.programs = programs;
				});
			};
			$scope.getPrograms();

			$scope.removeProgram = function(program) {
				async.parallel([
					function(callback, err) {
						//Remove program's classes
						async.each(program.classes,
							function(classToRemove, callback) {
								ClassSvc.init(classToRemove);
								ClassSvc.remove().then(function() {
									callback();
									ClassSvc.reset();
								});
							},
							function(err) {
								callback();
							}
						);
					},
					function(callback, err) {
						//Remove program's ranks
						async.each(program.ranks,
							function(rankToRemove, callback) {
								RankSvc.init(rankToRemove);
								RankSvc.remove().then(function() {
									callback();
									RankSvc.reset();
								});
							},
							function(err) {
								callback();
							}
						);
					}, 
					function(err) {
						//Remove program
						ProgramSvc.init(program);
						ProgramSvc.remove().then(function() {
							$scope.programs = _.without($scope.programs, program);
							ProgramSvc.reset();
					});
				}]);
			};

			$scope.goToAddProgram = function() {
				ProgramSvc.creating = true;
				$state.go('admin.programs.create');
			};

			$scope.goToProgramsHome = function() {
				ProgramSvc.viewing = false;
				ProgramSvc.editing = false;
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

			$scope.addProgram = function() {
				var programToAdd = {
					name: $scope.newProgram.name
				};
				//POST new program
				ProgramSvc.init(programToAdd);
				ProgramSvc.create(true).then(function(programAdded) {
					var classIDs = [],
						rankIDs = [];
					//Add classes to db
					(function(classIDs, rankIDs){
						async.parallel([
							function(callback, err) {
								//Add classes
								async.each($scope.newProgram.classes,
									function(classItem, callback) {
										var classToAdd = {
											name: classItem.name,
											program: programAdded._id
										};
										//POST each new class and add object ID to array
										ClassSvc.init(classToAdd);
										ClassSvc.create(true).then(function(classAdded, err){
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
								async.each($scope.newProgram.ranks,
									function(rankItem, callback) {
										var rankToAdd = {
											name: rankItem.name,
											rankOrder: rankItem.rankOrder,
											program: programAdded._id
										};
										//POST each new class and add object ID to array
										RankSvc.init(rankToAdd)
										RankSvc.create().then(function(rankAdded, err){
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
								//Add class and rank references and update program
								ProgramSvc.read(programAdded._id, {}, true).get().then(function(p){
									var updates = {
										classes: classIDs,
										ranks: rankIDs
									};
									ProgramSvc.update(updates).then(function(updated) {									
										$scope.newProgram = {};
										$scope.newProgram.classes = {};
										$scope.newProgram.ranks = {};
									});
								});
						});
					})(classIDs, rankIDs);
				});
			};

			$scope.addClassToProgram = function(program) {
				program.classes.push($scope.newClass);
				$scope.newClass = {};
			};

			$scope.addRankToProgram = function(program) {
				program.ranks.push($scope.newRank);
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

			$scope.removeClassFromProgram = function(classToRemove, program) {
				program.classes = _.without(program.classes, classToRemove);
			};

			$scope.removeRankFromProgram = function(rankToRemove, program) {
				program.ranks = _.without(program.ranks, rankToRemove);
			};

			$scope.editProgram = function(program) {
				ProgramSvc.init(program);
				ProgramSvc.editing = true;
				$state.go('admin.programs.edit');
			};

			$scope.viewProgram = function(program) {
				ProgramSvc.init(program);
				ProgramSvc.viewing = true;
				$state.go('admin.programs.view');
			};

			$scope.saveProgram = function(program) {
				var programToSave = {
					//TODO transfer properties and save changed object to database
				}

				ProgramSvc.editing = false;
				ProgramSvc.reset();
			}
	}]);
});	