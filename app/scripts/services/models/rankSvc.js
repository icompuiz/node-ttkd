/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('RankSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var RankModel = ModelFactory.create('ranks');

		function startCreating() {
			RankModel.creating = true;
			RankModel.editing = false;
			RankModel.viewing = false;
		}

		function startEditing() {
			RankModel.editing = true;
			RankModel.creating = false;
			RankModel.viewing = false;
		}

		function startViewing() {
			RankModel.viewing = true;
			RankModel.editing = false;
			RankModel.creating = false;
		}

		RankModel.startViewing = startViewing;
		RankModel.startEditing = startEditing;
		RankModel.startCreating = startCreating;

		return RankModel;


	}]);

});