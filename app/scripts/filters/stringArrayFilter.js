define(['./module'], function(filters) {
    'use strict';

	  filters.filter('stringArray', ['$log', function() {
        return function(myArray) {
        	if (!myArray) {
        		return;
        	}
            return myArray.join(', ');
          };
      }]);
  });