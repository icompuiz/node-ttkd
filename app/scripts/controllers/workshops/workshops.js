define(['../module'], function (controllers) {
	'use strict';
	controllers.controller('WorkshopsCtrl', ['$scope', '$state', 'WorkshopSvc', 
		function($scope, $state, WorkshopSvc) {

			$scope.createWorkshop = function() {
				WorkshopSvc.reset();
				WorkshopSvc.startCreating();
				$state.go('admin.workshops.create');
			};

			$scope.editWorkshop = function(row) {
				WorkshopSvc.startEditing();
				WorkshopSvc.init(row.entity);
				$state.go('admin.workshops.edit', { id: row.entity._id });
			};

			$scope.viewWorkshop = function(row) {
				WorkshopSvc.startViewing();
				WorkshopSvc.init(row.entity);
				$state.go('admin.workshops.view', { id: row.entity._id });
			};

			$scope.removeWorkshop = function(workshop) {

				WorkshopSvc.read(workshop._id, null, true).then(function(w) {
					WorkshopSvc.remove().then(function() {
						$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
						WorkshopSvc.reset();
					});
				});
			};

		/************ GridOptions *********************************/
			$scope.filterOptions = {
				filterText: '',
				useExternalFilter: true
			};

			$scope.totalServerItems = 0;
			
			$scope.pagingOptions = {
				pageSizes: [10, 25, 50],
				pageSize: 10,
				currentPage: 1
			};

			$scope.setPagingData = function(data, page, pageSize) {
				var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
				$scope.myData = pagedData;
				$scope.totalServerItems = data.length;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

			$scope.getPagedDataAsync = function(pageSize, page, searchText) {
				setTimeout(function () {
					var data = [];
					WorkshopSvc.list().then(function(workshops) {
						_(workshops).forEach(function(w) {
							data.push({
								'_id': w._id,
								'name': w.name,
								'workshopDate': w.workshopDate
							});
						});
						$scope.setPagingData(data, page, pageSize);				
					});
				}, 100);
			};

			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.gridOptions = {
            	data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                beforeSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if(event.target.tagName === 'BUTTON') {
                        return false;
                    } else {
                        return true;
                    }
                },
                afterSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if($scope.gridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Workshop Name' },
                    { field: 'workshopDate', displayName: 'Date', cellTemplate: '/partials/workshops/list/workshopDate'},
                    { cellTemplate: '/partials/workshops/list/optionsButtons', sortable: false, displayName: 'Actions'}
                ]
            };

/*************** End GridOptions******************************/

            $scope.removeDisabled = function() {
                return $scope.gridOptions.selectedItems.length === 0;
            };

			$scope.removeSelected = function() {
				$scope.showRemoveConfirm = true;
			};

			$scope.confirmRemove = function(remove) {
				if(remove) {
					_($scope.gridOptions.selectedItems).forEach(function(workshop) {
						$scope.removeWorkshop(workshop);
					});
					$scope.gridOptions.selectedItems.length = 0;
					$scope.showRemoveConfirm = false;
				} else {
					$scope.showRemoveConfirm = false;
				}
			};

		
		
	}]);

});