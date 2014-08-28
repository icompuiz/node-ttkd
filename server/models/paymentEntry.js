'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var paymentEntrySchema = new Schema({
	category: {
		ref: 'PaymentCategory',
		type: ObjectId
	},
	instance: {
		ref: 'PaymentCategoryFieldInstance',
		type: ObjectId
	}
});

var PaymentEntry = mongoose.model('PaymentEntry', paymentEntrySchema);

module.exports = PaymentEntry;