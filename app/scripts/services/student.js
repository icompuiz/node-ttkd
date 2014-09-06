define(['./module'], function(services) {
	'use strict';

	services.service('StudentSvc', ['$http', '$rootScope', '$log', '$q', 'Restangular',
		function($http, $rootScope, $log, $q, Restangular) {
			var baseStudents = Restangular.all('students');

			var student = {
				createStudent: function(studentObj) {
						baseStudents.post(studentObj).then(function(studentObj){
							// TODO need to add student to class/program etc
							$log.info(studentObj + ' successfully saved');
						}, function() {
							$log.error('There was an error saving ' + studentObj);
						});
					}
			};

			return student;

		}
	]);

});
