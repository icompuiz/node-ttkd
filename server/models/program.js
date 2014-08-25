'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var programSchema = new Schema({
	name: String,
	classes: [{
		ref: 'Class',
		type: ObjectId
	}],
	ranks: [{
		ref: 'Rank',
		type: ObjectId
	}]
});

var Program = mongoose.model('Program', programSchema);

module.exports = Program;