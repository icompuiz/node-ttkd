define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewClassCtrl', ['saveAs', '$filter', '$rootScope', '$scope', '$state', '$stateParams','$log', 'Restangular', 'ProgramSvc', 'ClassSvc','StudentSvc',
		function(saveAs, $filter, $rootScope, $scope, $state, $stateParams, $log, Restangular, ProgramSvc, ClassSvc, StudentSvc) {
			$scope.currentClass = {};
            var program = {},
                emails = [];

            function populateStudentObjs() {
                var data = [];
                _($scope.currentClass.students).forEach(function(id) {
                    StudentSvc.read(id, null, false).then(function(s) {
                        if (!s) {
                            return;
                        }
                        data.push(s);
                        if (s.emailAddresses && s.emailAddresses.length > 0) {
                            _(s.emailAddresses).forEach(function(e) {
                                emails.push(e);
                            });
                        }
                    });
                });
                $scope.currentClass.studentObjs = data;
            }

			if (ClassSvc.current && ClassSvc.viewing) {
				$scope.currentClass = ClassSvc.current;
                populateStudentObjs();              
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(_class) {
					$scope.currentClass = _class;
                    ProgramSvc.read(_class.program, null, true);
                    populateStudentObjs();
				});
			}
			            
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

            $scope.sortInfo = {fields: ['id'], directions: ['asc']};

            function sortData(field, direction) {
                if(!$scope.allData) return;

                $scope.allData.sort(function(a, b) {
                    if(direction === 'asc') {
                        return a[field] > b[field] ? 1 : -1;
                    } else {
                        return a[field] > b[field] ? -1 : 1;
                    }
                });
            }

            $scope.$watch('sortInfo', function(newVal, oldVal){
                if (newVal.fields[0] === oldVal.fields[0] && newVal.directions[0] === oldVal.directions[0]) {
                    return;
                }

                sortData(newVal.fields[0], newVal.directions[0]);
                $scope.pagingOptions.currentPage = 1;
                setPagingData($scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            }, true);

            function setPagingData(page, pageSize) {
                if(!$scope.allData) return;
                $scope.totalServerItems = $scope.allData.length;
                $scope.myData = $scope.allData.slice((page - 1) * pageSize, page * pageSize);
            }

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
            };

            $scope.getPagedDataAsync = function(pageSize, page, useCachedData) {
                if(useCachedData) {
                    $scope.setPagingData(_.clone($scope.allData),page,pageSize);
                    return;
                }

                var data = [];
                if ($scope.currentClass.studentObjs && $scope.currentClass.studentObjs.length > 0) {
                    _($scope.currentClass.studentObjs).forEach(function(s) {
                        s.age = $filter('age')(s.birthday);
                        data.push(s);
                    });
                }
                $scope.allData = _.clone(data);
                $scope.setPagingData(data, page, pageSize);
            };

            function writeEmailList() {
                var studentFile = '';
                var d = new Date(),
                    year = d.getFullYear(),
                    month = d.getMonth()+1,
                    day = d.getDate();

                var filename = $scope.currentClass.name + '_emails_' + month + '-' + day + '-' + 
                                year + '.txt';

                _(emails).forEach(function(e) {
                    studentFile += e + '\r\n';
                });
                
                var blob = new Blob([studentFile], {type: 'text/plain;'});
                saveAs(blob, filename);
            }

            $scope.showGenerateEmailListConfirm = false;

            $scope.generateEmailList = function() {
                $scope.showGenerateEmailListConfirm = true;
            };

            $scope.confirmGenerateEmailList = function(writeList) {
                if (writeList) {
                    writeEmailList();
                }
                $scope.showGenerateEmailListConfirm = false;
            }

            $scope.$watch('currentClass.studentObjs', function () {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }, true);

            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, true);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, true);
                }
            }, true);

            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: $scope.sortInfo,
                columnDefs: [
                    { cellTemplate: '/partials/students/list/studentAvatar', sortable: false, width: 70, height: 70, cellClass: 'grid-student-list-icon-cell' },
                    { field: 'firstName', displayName: 'First Name' },
                    { field: 'lastName', displayName: 'Last Name' },
                    { field: 'age', displayName: 'Age' },
                    { cellTemplate: '/partials/students/list/viewButton', sortable: false },
                ]
            };

            $scope.view = function(row){
                console.log('View student id: ' + row.entity._id);
                $state.go('admin.students.view', {id: row.entity._id});
            };

	}]);
});	