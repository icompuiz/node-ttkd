/* globals _: true, define: true */

define(['./module'], function (factories) {
	'use strict';

	factories.factory('ModelFty', [function() {

		function Model(Endpoint) {
			

			var _this = this;

			// publics
			_this.current = null;

			function initialize(defaultModel) {
				
				if (defaultModel) {
					defaultModel = _.clone(defaultModel);
				} else {
					defaultModel = {};
				}

				_this.current = defaultModel;
				return _this.current;
			}

			_this.init = initialize;

			_this.reset = function reset() {
				_this.current = null;
			};

			_this.create = function create(resetOnSuccess) {

				if (!_this.current._id) {
					var promise = Endpoint.endpoint.post(_this.current);

					if (resetOnSuccess) {
						promise.then(function() {
							_this.reset();
						});
					}

					return promise;

				}

				return false;

			};

			_this.read = function read(studentId, options, makeCurrent) {
				var promise = Endpoint.endpoint.one(studentId).get(options);

				if (makeCurrent) {

					promise.then(function(result) {

						_this.current = result;

					});

				}

				return promise;
			};

			_this.update = function update(options) {
				if (_this.current._id && _.isFunction(_this.current.put)) {
					return _this.current.put(options);
				}
				return false;
			};

			_this.remove = function remove(options) {

				if (_this.current._id && _.isFunction(_this.current.remove)) {
					return _this.current.remove(options);
				}
				return false;

			};

			_this.list = function list(options) {
				return Endpoint.endpoint.getList(options);
			};

			_this.save = function save() {
				var promise = false;
				if (_this.current) {

					if (_this.current._id) {
						// put (update)
						promise = _this.update();
					} else {
						// post (new)
						promise = _this.create();
					}

				}

				return promise;

			};

		}
		
		return {
			create: function create(endpoint, defaults) {
				return new Model(endpoint, defaults);
			}
		};

	}]);

});