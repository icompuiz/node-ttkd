define(['./module'], function(filters) {
    'use strict';

	  filters.filter('dateTime', ['$filter', function($filter) {
        var NULL_DATE = new Date(-8640000000000000);

        return function(date) {
        	if (!date || date == NULL_DATE.toISOString()) {
        		return;
        	}
          
          return $filter('date')(date, 'shortDate') + " " + $filter('date')(date, 'shortTime');

          };
      }]);
  });