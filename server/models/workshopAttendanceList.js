'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var workshopAttendanceListSchema = new Schema({
	students: [{
		ref: 'Student',
		type: ObjectId
	}],
	workshopDate: Date
});

var WorkshopAttendanceList = mongoose.model('WorkshopAttendanceList', workshopAttendanceListSchema);

module.exports = WorkshopAttendanceList;