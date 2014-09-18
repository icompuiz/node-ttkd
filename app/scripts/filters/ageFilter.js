define(['./module'], function(filters) {
	'use strict';

	filters.filter('age', ['$log', function($log) {
      return function(input) {
      	var time = Date.parse(input);

      	if(!isNaN(time)) {
      		var birthdate = (new Date(time)).getTime();
      		var ageDate = new Date(Date.now() - birthdate);
      		var age = Math.abs(ageDate.getUTCFullYear() - 1970);

      		$log.log(input + ': ' + age);
      		return age;
      	} else {
      		$log.log(input);
      		return 'N/A';
      	}
      };
    }]);
});