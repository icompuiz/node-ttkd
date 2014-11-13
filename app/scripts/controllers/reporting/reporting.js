define(['../module'], function (controllers) {
'use strict';

	controllers.controller('ReportingCtrl', ['$scope','StudentSvc', function($scope, StudentSvc) {
		$scope.chartType = 'bar';
		$scope.months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		$scope.years = [];
		$scope.monthButtonContent = 'Select month';
		$scope.yearButtonContent = '';
		$scope.students = [];

		// Get attendance statistics from student registration dates 
		StudentSvc.list().then(function(students) {
			_(students).forEach(function(s) {
				if (s.registrationDate) {
					$scope.years.push(new Date(s.registrationDate).getFullYear());
					$scope.students.push(s);
				}
			});
			$scope.years = _.uniq($scope.years);
			$scope.years = _.sortBy($scope.years, function(s) {return 0-s;});
			
			// Initialize the chart to the most recent (current) year
			$scope.yearButtonContent = $scope.years[0];
			$scope.setChartData($scope.years[0]);
		});

		// Initialize the chart data structure 
		function initChartData() {
			var myData = [];

			var i=0;
			while (i<12) {
				var dataObj = {
					x: $scope.months[i],
					y: [0]
				};
				myData.push(dataObj);
				i++;
			}

			$scope.chartData = {
				series: "2014 Registrations",
				data: myData
			};
		}
		initChartData();

		// Chart configuration options
		$scope.chartConfig = {
			tooltips: true,
			labels: true,
			mouseover: function() {},
			mouseout: function() {},
			click: function() {},
			legend: {
				display: false,
				//could be 'left, right'
				position: 'left'
			},
			colors: ['#3B5C7C'],
			innerRadius: 0, // applicable on pieCharts, can be a percentage like '50%'
			lineLegend: 'lineEnd' // can be also 'traditional',
		};

		// Set chart data for the selected year (/month)
		$scope.setChartData = function(year) {

			var monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

			_($scope.students).forEach(function(s) {
				if (s.registrationDate && (new Date(s.registrationDate).getFullYear() == year)) {
					monthCounts[new Date(s.registrationDate).getMonth()]++;
				}
			});

			var max = _.max(monthCounts);

			var sum = 0;
			_(monthCounts).forEach(function(c) {
				sum += c;
			});

			var myData = [];
			var i=0;
			while (i<12) {
				var dataObj = {
					x: $scope.months[i],
					y: [monthCounts[i]]
				};
				myData.push(dataObj);
				i++;
			}

			$scope.chartTitle = 'Registration for ' + year + ' (Total: ' + sum + ')';
			$scope.chartData.data = myData;
		};

		// User has selected a year from the dropdown menu
		$scope.selectYear = function(year) {
			$scope.yearButtonContent = year;
			$scope.setChartData(year);
		};
		
	}]);

});