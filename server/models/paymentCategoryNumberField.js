'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	$extend = require('mongoose-schema-extend');
	ObjectId = mongoose.Schema.Types.ObjectId;

var PaymentCategoryField = require('./PaymentCategoryField');

var paymentCategoryNumberFieldSchema = PaymentCategoryNumberField.schema.extend({
	value: double
});

var PaymentCategoryNumberField = mongoose.model('PaymentCategoryNumberField', paymentCategoryNumberFieldSchema);

module.exports = PaymentCategoryNumberField;