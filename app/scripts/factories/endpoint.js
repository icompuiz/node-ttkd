define(['./module'], function (factories) {
	'use strict';

	factories.factory('EndpointFty', ['Restangular', function(Restangular) {

		function Endpoint(endpointName) {

			this.endpoint = Restangular.service(endpointName);

		};

		return {
			create: function create(endpointName) {
				return new Endpoint(endpointName)
			}
		}

	}]);

});