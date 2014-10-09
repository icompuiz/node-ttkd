define(['./module'], function(filters) {
    'use strict';

	  filters.filter('stringArray', ['$log', function() {
        return function(myArray) {
            return myArray.join(', ');
          };
      }]);
  });