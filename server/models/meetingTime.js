'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var meetingTimeSchema = new Schema({
	startDate: Date,
	endDate: Date
});

var MeetingTime = mongoose.model('MeetingTime', meetingTimeSchema);

module.exports = MeetingTime;