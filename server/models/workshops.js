'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var workshopsSchema = new Schema({
	name: String,
	workshops: [{
		ref: 'Class',
		type: ObjectId
	}]
});

var Workshops = mongoose.model('Workshops', workshopsSchema);

module.exports = Workshops;