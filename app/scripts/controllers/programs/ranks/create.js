define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateRankCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				if (!$scope.rank.rankOrder) {
					$scope.rank.rankOrder = ordered.length + 1;
					orders.push($scope.rank.rankOrder);
				}
				
				$scope.dropdown.items = orders;
			}

			if (ProgramSvc.current) {
				program = ProgramSvc.current;
				$scope.rank.program = program._id;
				setDropdownItems();
			} else if ($stateParams.id) { 
				ProgramSvc.editing = true;
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					var rankObjs = [];

					$scope.rank = {
						program: ProgramSvc.current._id
					};
					RankSvc.init($scope.rank);

					async.each(p.ranks,  // Attach rank objects to current program
						function(rId, callback) {
							RankSvc.read(rId, null, false).then(function(r) {
								if (r) {
									rankObjs.push(r);
								}
								callback();
							});
						},
						function(err) {
							program = p;
							program.rankObjs = rankObjs;
							setDropdownItems();
						}
					);
				});					
			} 

			$scope.setRankOrder = function(newVal) {
				if (!$scope.origRankOrder) {
					$scope.origRankOrder = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found) {
					$scope.swapRank = found;
					$scope.swapRank.newRankOrder = $scope.origRankOrder;
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
				if ($stateParams.id) {
					$state.go('admin.programs.edit', {id: $scope.rank.program});
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}


			$scope.cancelCreate = function() {

				RankSvc.reset();

				goToPrevState();
			};

			$scope.createRank = function() {
				if (!program.rankObjs) {
					program.rankObjs = [];
				}

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRank.newRankOrder;
				}

				program.rankObjs.push($scope.rank);

				RankSvc.reset();

				goToPrevState();
			};

			$scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };

            $scope.totalServerItems = 0;

            $scope.pagingOptions = {
                pageSizes: [25, 50, 100, 250, 500, 1000],
                pageSize: 25,
                currentPage: 1
            };

			$scope.getNumSelected = function() {
				var selected = _.where($scope.rank.intermediaryRanks, {isSelected: true});
				return selected.length;
			};

            $scope.setPagingData = function(data){
                $scope.myData = data;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.clearColor = function() {
            	$scope.rank.color = undefined;
            };

            $scope.getData = function () {
                var data = [];
                _($scope.rank.intermediaryRanks).forEach(function(r) {
                	data.push(r);
                });
                $scope.setPagingData(data);                
            };

           	$scope.getData();

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getData();
                }
            }, true);

            $scope.$watch('rank.color', function (newVal, oldVal) {
            	if (!$scope.rank.color) {
            		$('.rank-color').css('background', '#FFFFFF');
            		$('.rank-color').text('None');
            	} else {
                	$('.rank-color').css('background', newVal);
            		$('.rank-color').text('');
            	}
            }, true);

            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enableCellSelection: true,
                enableRowSelection: false,
                enableCellEdit: true,
                beforeSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if(event.target.tagName === 'BUTTON') {	
                        return false;
                    } else {
                        return true;
                    }
                },
                afterSelectionChange: function () {
                    if($scope.gridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'totalServerItems',
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: { fields: ['lastName', 'firstname'], directions: ['asc', 'asc'] },
                columnDefs: [
                    { cellTemplate: '/partials/programs/ranks/subranks/rankCheckbox', width: 50, sortable: false, enableCellEdit: false },                	
                    { field: 'name', displayName: 'Rank Name' },
                    { field: 'rankOrder', displayName: 'Order' }
                ]
            };

            $scope.selectRank = function(row) {
            	_($scope.rank.intermediaryRanks).forEach(function(r){
            		if(r.rankOrder === row.entity.rankOrder) {
            			r.isSelected = !r.isSelected;

            			if(r.isSelected) {
            				$scope.gridOptions.selectedItems.length += 1;
            			} else {
            				$scope.gridOptions.selectedItems.length -= 1;
            			}
            		}
            	});
            };

            $scope.addSubrank = function() {
            	if(!$scope.rank.intermediaryRanks) {
            		$scope.rank.intermediaryRanks = [];
            	}

            	var newRankOrder = $scope.rank.intermediaryRanks.length + 1;

            	var newRank = {
            		name: '<Name>',
            		rankOrder: newRankOrder
            	};

            	$scope.rank.intermediaryRanks.push(newRank);
            	$scope.getData();
            };

             $scope.removeDisabled = function() {
            	var selected = _.where($scope.rank.intermediaryRanks, {isSelected: true});
                return selected.length === 0;
            };

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {

                    _($scope.rank.intermediaryRanks).forEach(function(r) {
                    	if(r.isSelected) {
                    		$scope.rank.intermediaryRanks = _.without($scope.rank.intermediaryRanks, r);
                    	}
                    });

                    $scope.getData();

                    // empty selection
                    $scope.gridOptions.selectedItems = [];

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
            };

            $scope.showRemoveConfirm = false;

/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canCreateRank = function() {

				// Validate name
				if ($scope.isEmpty($scope.rank.name) || $scope.isDupName()) {
					return false;
				}

				// Validate sub-ranks
				if ($scope.showSubrankNameMessage() || $scope.showSubrankOrderMessage()) {
					return false;
				}

				return true;
			};

			$scope.isDupName = function() {
				if (!program.rankObjs) {
					return false;
				}

				var names = [];
				if (program) {
					names = _.map(program.rankObjs, function(c){return c.name;});
				}

				return _.contains(names, $scope.rank.name);
			};

			$scope.showSubrankNameMessage = function() {
				var names = [],
					uniq = [];
				if ($scope.rank.intermediaryRanks) {
					names = _.map($scope.rank.intermediaryRanks, function(r){return r.name;});
					uniq = _.uniq(names);
					return (names.length !== uniq.length);
				}
				return false;
			};

			$scope.showSubrankOrderMessage = function() {
				var orders = [],
					uniq = [];
				if ($scope.rank.intermediaryRanks && $scope.rank.intermediaryRanks.length > 0) {
					orders = _.map($scope.rank.intermediaryRanks, function(r){return r.rankOrder;});

					// Check for duplicates
					uniq = _.uniq(orders);
					if (uniq.length !== orders.length) {
						return true;
					}

					// Make sure ordering starts at 1
					if (!_.contains(orders, 1) && !_.contains(orders, '1')) {
						return true;
					}

					// Make sure they increment by 1
					if (_.max(orders) != $scope.rank.intermediaryRanks.length) {
						return true;
					}
				}
				return false;
			};
	}]);
});	