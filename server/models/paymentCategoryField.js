'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var paymentCategoryFieldSchema = new Schema({
});

var PaymentCategoryField = mongoose.model('PaymentCategoryField', paymentCategoryFieldSchema);

module.exports = PaymentCategoryField;