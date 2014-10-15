define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateRankCtrl', ['$document', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($document, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.intermediaryRanks = [];
			var tmp = [];
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			function setDropdownItems() {
				var ordered = [];
				if (program.rankObjs.length > 0){ 
					ordered = _.sortBy(program.rankObjs, 'rankOrder');
				}

				var orders = _.map(ordered, function(r){return r.rankOrder;});

				if (!$scope.rank.rankOrder) {
					$scope.rank.rankOrder = ordered.length + 1;
					orders.push($scope.rank.rankOrder);
				}
				
				$scope.dropdown.items = orders;	
			}

			if (RankSvc.current && RankSvc.creating) {
				$scope.rank = RankSvc.current;
				if ($scope.rank.intermediaryRanks) {
					tmp = _.sortBy($scope.rank.intermediaryRanks, function(r) {return r.rankOrder;});
				}
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
				$scope.rank.intermediaryRanks = $scope.intermediaryRanks;
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
				var selected = _.where(tmp, {isSelected: true});
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

           	//$scope.getData();

            $scope.$watch('rank.color', function (newVal, oldVal) {
            	if (!$scope.rank.color) {
            		$('.rank-color').css('background', '#FFFFFF');
            		$('.rank-color').text('None');
            	} else {
                	$('.rank-color').css('background', newVal);
            		$('.rank-color').text('');
            	}
            }, true);

            $scope.addSubrank = function() {
            	var newRankOrder = tmp.length + 1;

            	var newRank = {
            		name: 'Sub-rank' + newRankOrder,
            		rankOrder: newRankOrder,
            		id: makeid()
            	};

            	tmp.push(newRank);
            	//$scope.getData();
            };

             $scope.removeDisabled = function() {
            	var selected = _.where(tmp, {isSelected: true});
                return selected.length === 0;
            };

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {   

            		var ordered = $('#sortable li').map(function(i) { return this.id; }).get();

                    _(tmp).forEach(function(r) {
                    	if(r.isSelected) {
                    		$('#'+r.id).remove();  
                    		tmp = _.without(tmp, r);
                    		ordered = _.without(ordered, r.id);
                    	}
                    });

                    _(tmp).forEach(function(r){
            			r.rankOrder = _.indexOf(ordered, r.id) + 1;
            		});

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
                $scope.intermediaryRanks = tmp;
                if(!$scope.$$phase) {
               		$scope.$apply();
               	}
            };

            $scope.intermediaryRanks = tmp;

            $('#sortable').sortable({
            	stop: function(event, ui) {
            		var ordered = $('#sortable li').map(function(i) { return this.id; }).get();

            		_(tmp).forEach(function(r){
            			r.rankOrder = _.indexOf(ordered, r.id) + 1;
            		});
	                if(!$scope.$$phase) {
	               		$scope.$apply();
	               	}
            	}
            });

            $document.bind('click', function(e) {
            	e.stopPropagation();
            	if (e.target.className.indexOf('edit-name') < 0) {
          	  		_(tmp).forEach(function(r) {
            			r.editingName = false;
		                if(!$scope.$$phase) {
		               		$scope.$apply();
		               	}
            		});
            	}

            	// // Do not allow sorting if there are duplicate
            	// var ordered = $('#sortable li').map(function(i) { return this.id; }).get();
            	// var uniq = _.uniq(ordered);

            	// if (uniq.length !== ordered.length) {
            	// 	$('#sortable').sortable('disable');
            	// } else {
            	// 	$('#sortable').sortable('enable');
            	// }
            });

            $scope.edit = function(r) {
            	r.editingName = true;
            };

            function makeid(){
			    var text = "";
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < 5; i++ ) {
			        text += possible.charAt(Math.floor(Math.random() * possible.length));
			    }

			    return 'r' + text;
			}

            $scope.select = function(r, $event) {
            	r.isSelected = !r.isSelected;
            	if (r.isSelected) {
        			$('#' + r.id + ' .rank-list-item').css('background-color', '#c9dde1');
            	} else {
        			$('#' + r.id + ' .rank-list-item').css('background-color', '#d4d4d4');
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
				if ($scope.showSubrankNameMessage()) {
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
				if (tmp) {
					names = _.map(tmp, function(r){return r.name;});
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