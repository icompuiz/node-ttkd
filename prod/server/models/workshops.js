'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var workshopSchema = new Schema({
	name: String,
	workshops: [{
		ref: 'Class',
		type: ObjectId
	}]
});

var Workshops = mongoose.model('Workshops', workshopSchema);

module.exports = Workshops;