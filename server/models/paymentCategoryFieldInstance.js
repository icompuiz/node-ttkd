'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var paymentCategoryFieldInstanceSchema = new Schema({
	value: String,
	entry: {
		ref: 'PaymentEntry',
		type: ObjectId
	}
});

var PaymentCategoryFieldInstance = mongoose.model('PaymentCategoryFieldInstance', paymentCategoryFieldInstanceSchema);

module.exports = PaymentCategoryFieldInstance;