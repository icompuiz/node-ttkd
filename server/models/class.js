'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var classSchema = new Schema({
	name: String,
	students: [{
			ref: 'Student',
			type: ObjectId
		}],
	program: {
		ref: 'Program',
		type: ObjectId
	},
	meetingTimes: [{
		ref: 'MeetingTime',
		type: ObjectId
	}]
});

var Class = mongoose.model('Class', classSchema);

module.exports = Class;