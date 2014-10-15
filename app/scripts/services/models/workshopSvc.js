/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('WorkshopSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var WorkshopModel = ModelFactory.create('workshops');

		function startCreating() {
			WorkshopModel.creating = true;
			WorkshopModel.editing = false;
			WorkshopModel.viewing = false;
		}

		function startEditing() {
			WorkshopModel.editing = true;
			WorkshopModel.creating = false;
			WorkshopModel.viewing = false;
		}

		function startViewing() {
			WorkshopModel.viewing = true;
			WorkshopModel.editing = false;
			WorkshopModel.creating = false;
		}

		WorkshopModel.startViewing = startViewing;
		WorkshopModel.startEditing = startEditing;
		WorkshopModel.startCreating = startCreating;

		return WorkshopModel;


	}]);

});