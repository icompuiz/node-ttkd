'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var paymentCategorySchema = new Schema({
	properties: [{
		ref: 'PaymentCategoryField',
		type: ObjectId
	}]
});

var PaymentCategory = mongoose.model('PaymentCategory', paymentCategorySchema);

module.exports = PaymentCategory;