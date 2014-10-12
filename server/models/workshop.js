'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var workshopSchema = new Schema({
	name: String,
	attendanceList: [{
		ref: 'Student',
		type: ObjectId
	}],
	workshopDate: Date
});

var Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;