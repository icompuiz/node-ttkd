'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var attendanceSchema = new Schema({
	student: {
		ref: 'Student',
		type: ObjectId
	},
	classAttended: { 
		ref: 'Class',
		type: ObjectId
	},
	checkInTime: Date,
});

var Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;