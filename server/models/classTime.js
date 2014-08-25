'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var classTimeSchema = new Schema({
	dayOfWeek: String,
	startTime: Date,
	endTime: Date
});

var ClassTime = mongoose.model('ClassTime', classTimeSchema);

module.exports = ClassTime;