'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	$extend = require('mongoose-schema-extend');
	ObjectId = mongoose.Schema.Types.ObjectId;

var PaymentCategoryField = require('./PaymentCategoryField');

var paymentCategoryProgramFieldSchema = PaymentCategoryProgramField.schema.extend({
	program: {
		ref: 'Program',
		type: ObjectId
	}
});

var PaymentCategoryProgramField = mongoose.model('PaymentCategoryProgramField', paymentCategoryProgramFieldSchema);

module.exports = PaymentCategoryProgramField;