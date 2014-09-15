/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ClassSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var ClassModel = ModelFactory.create('classes');

		function startCreating() {
			ClassModel.creating = true;
			ClassModel.editing = false;
			ClassModel.viewing = false;
		}

		function startEditing() {
			ClassModel.editing = true;
			ClassModel.creating = false;
			ClassModel.viewing = false;
		}

		function startViewing() {
			ClassModel.viewing = true;
			ClassModel.editing = false;
			ClassModel.creating = false;
		}

		ClassModel.startViewing = startViewing;
		ClassModel.startEditing = startEditing;
		ClassModel.startCreating = startCreating;

		return ClassModel;


	}]);

});