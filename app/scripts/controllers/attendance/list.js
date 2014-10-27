define(['../module'], function(controllers) {
    'use strict';

    controllers.controller('ListAttendanceCtrl', ['$scope', '$http', '$log', '$state', '$filter', 'AttendanceSvc', 'StudentSvc', 'WorkshopSvc', 'ClassSvc', 'ProgramSvc',
        function($scope, $http, $log, $state, $filter, AttendanceSvc, StudentSvc, WorkshopSvc, ClassSvc, ProgramSvc) {
            var defaultColumnDefs = [
                    { field: 'checkInTime', displayName: 'Check-in Time', cellTemplate: '/partials/attendance/list/dateCell'},
                    { field: 'fullName', displayName: 'Student'},
                    { field: 'eventName', displayName: 'Event Attended'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/studentViewButton'}
                ],
                studentColumnDefs = [
                    { field: 'checkInTime', displayName: 'Check-in Time', cellTemplate: '/partials/attendance/list/dateCell'},
                    { field: 'eventName', displayName: 'Event Attended'},
                    { field: 'achievementNames', displayName: 'Achievement(s)'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/removeButton'}
                ],
                classColumnDefs = [
                    { field: 'name', displayName: 'Class Name'},
                    { field: 'programName', displayName: 'Program'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/classViewButton'}
                ],
                workshopColumnDefs = [
                    { field: 'name', displayName: 'Workshop Name'},
                    { displayName: 'Date', cellTemplate: '/partials/workshops/list/workshopDate'},
                    { field: 'numAttendees', displayName: 'Attendees'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/workshopViewButton'}
                ];

            $scope.allData = [];

            $scope.filterStudent = {} ;

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

            $scope.columnDefs = defaultColumnDefs;

            $scope.selectStudents = function() {
                $scope.viewingStudent = false;
                $scope.columnDefs = defaultColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            };

            $scope.selectClasses = function() {
                $scope.viewingStudent = false;
                $scope.columnDefs = classColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);             
            };

            $scope.selectWorkshops = function() { 
                $scope.viewingStudent = false;
                $scope.columnDefs = workshopColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);             
            };

            $scope.viewStudentAttendance = function(row) {
                $scope.viewingStudent = true;
                $scope.columnDefs = studentColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {student: row.entity.student});
            };

            $scope.searchByStudent = function() {
                var data = [];
                var searchCriteria = $scope.filterStudent.name.toLowerCase();

                _($scope.allData).forEach(function(attendance) {
                    if (attendance.fullName.toLowerCase().indexOf(searchCriteria) > -1) {
                        data.push(attendance);
                    }
                });
                
                $scope.setPagingData(data, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            };

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.allData = data;
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getPagedDataAsync = function (pageSize, page, filterOptions) {
                setTimeout(function () {
                    var data = [];

                    if ($scope.columnDefs === classColumnDefs) { // Clicked the class tab
                        ClassSvc.list().then(function(classes) {
                            async.each(classes,
                                function(classItem, callback) {
                                    ProgramSvc.read(classItem.program, null, false).then(function(program) {
                                        classItem.programName = program.name;
                                        data.push(classItem);
                                        callback();
                                    });
                                },
                                function(err) {
                                    $scope.setPagingData(data,page,pageSize);
                            });
                        });
                    } else if ($scope.columnDefs === workshopColumnDefs) { // Clicked the workshops tab
                        WorkshopSvc.list().then(function(workshops) {
                            _(workshops).forEach(function(workshop) {
                                workshop.numAttendees = 0;
                                if (workshop.attendanceList) {
                                    workshop.numAttendees = workshop.attendanceList.length;
                                }
                                data.push(workshop);
                            });
                            $scope.setPagingData(data,page,pageSize);
                        });
                    } else if ($scope.columnDefs === studentColumnDefs) { // Viewing a student's attendace records
                        AttendanceSvc.list().then(function(attendances) {
                            attendances = _.where(attendances, filterOptions); //using filteroptions as list() param didn't work
                            async.each(attendances,
                                function(attendance, callback) {
                                    StudentSvc.read(attendance.student, null, false).then(function(student) {
                                        attendance.fullName = student.firstName + ' ' + student.lastName;

                                        if (attendance.workshop) {
                                            WorkshopSvc.read(attendance.classAttended, null, false).then(function(workshop) {
                                                attendance.eventName = 'Workshop: ' + workshop.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        } else {
                                            ClassSvc.read(attendance.classAttended, null, false).then(function(classObj) {
                                                attendance.eventName = classObj.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        }
                                    });
                                },
                                function(err) {
                                    // Need to add achievement data
                                    $scope.setPagingData(data,page,pageSize);
                            }); 
                        });
                    } else { // Viewing the default ng-grid
                        AttendanceSvc.list().then(function(attendances){
                            // add attendances to new array for ng-grid outputting
                            async.each(attendances,
                                function(attendance, callback) {
                                    StudentSvc.read(attendance.student, null, false).then(function(student) {
                                        attendance.fullName = student.firstName + ' ' + student.lastName;

                                        if (attendance.workshop) {
                                            WorkshopSvc.read(attendance.classAttended, null, false).then(function(workshop) {
                                                attendance.eventName = 'Workshop: ' + workshop.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        } else {
                                            ClassSvc.read(attendance.classAttended, null, false).then(function(classObj) {
                                                attendance.eventName = classObj.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        }
                                    });
                                },
                                function(err) {
                                    $scope.setPagingData(data,page,pageSize);
                            });                        
                        });
                    }
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
                afterSelectionChange: function () {
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
                columnDefs: defaultColumnDefs
            };

            $scope.$watch('filterStudent.name', function() {
                console.log($scope.filterStudent.name);
            });

            $scope.classGridOptions = {
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
                afterSelectionChange: function () {
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
                columnDefs: classColumnDefs
            };

            $scope.workshopGridOptions = {
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
                afterSelectionChange: function () {
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
                columnDefs: workshopColumnDefs
            };

            $scope.studentGridOptions = {
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
                afterSelectionChange: function () {
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
                columnDefs: studentColumnDefs
            };
        }
    ]);
});