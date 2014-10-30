define(['./module'], function(filters) {
    'use strict';

	  filters.filter('dateTime', ['$filter', function($filter) {
        return function(date) {
        	if (!date) {
        		return;
        	}
          
          return $filter('date')(date, 'shortDate') + " " + $filter('date')(date, 'shortTime');

          };
      }]);
  });