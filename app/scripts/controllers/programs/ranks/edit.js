define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditRankCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			var orig = null;

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				if (orders.length === 0) {
					$scope.rank.rankOrder = 1;
					orders.push($scope.rank.rankOrder);
				}

				$scope.dropdown.items = orders;
			}

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.editing) {
				$scope.rank = RankSvc.current;
				program = ProgramSvc.current;
				if (!RankSvc.orig) {
					RankSvc.orig = {
						name: RankSvc.current.name
					};
					orig = RankSvc.orig;
				}
				program.populated = true;
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				RankSvc.read($stateParams.id, null, true).then(function(r) {
					$scope.rank = RankSvc.current;
					RankSvc.orig = {
						name: r.name
					};
					orig = RankSvc.orig;
					ProgramSvc.read(r.program, null, true).then(function(p) {
						var rankObjs = [];

						async.each(p.ranks,  // Attach rank objects to current program
							function(rId, callback) {
								RankSvc.read(rId, null, false).then(function(r) {
									rankObjs.push(r);
									callback();
								});
							},
							function(err) {
								program = p;
								program.rankObjs = rankObjs;
								program.populated = true;
							}
						);
					});
				});					
			}

			// For new ranks, initialize to the last rankOrder for the program
			if (!$scope.rank.rankOrder && program.rankObjs) {
				$scope.rank.rankOrder = program.rankObjs.length + 1;
			}

			$scope.setRankOrder = function(newVal) {
				if (!$scope.oldVal) {
					$scope.oldVal = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found) {
					$scope.swapRank = found;
					$scope.swapRankOrder = $scope.oldVal;
					$scope.showOrderWarning = true;
				} else {
					$scope.showOrderWarning = false;
				}

				$scope.rank.rankOrder = newVal;

				// HACK to close bootstrap dropdown after Item is selected
				// otherwise the dropdown menu stays open after item selection any time
				// after the initial selection
				$('[data-toggle="dropdown"]').parent().removeClass('open');
			};

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit', {id: $scope.rank.program});
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}


			$scope.cancelEdit = function() {

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
			};

			$scope.saveRank = function() {
				//Find the original rank in the program and replace it with the edited rank
				var i = _.findIndex(program.rankObjs, function(r) {
					return r.name === RankSvc.orig.name;
				});
				if (i >= 0) {
					program.rankObjs[i] = $scope.rank;
				} else {
					program.rankObjs.push($scope.rank);
				}

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
				
			};



/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveRank = function() {
				return !$scope.isEmpty($scope.rank.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (program && program.populated && orig) {
					names = _.map(program.rankObjs, function(r){return r.name;});
					names = _.without(names, orig.name);
				}

				return _.contains(names, $scope.rank.name);
			};
	}]);
});	