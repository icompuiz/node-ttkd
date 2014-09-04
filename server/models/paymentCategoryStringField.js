'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	$extend = require('mongoose-schema-extend');
	ObjectId = mongoose.Schema.Types.ObjectId;

var PaymentCategoryField = require('./PaymentCategoryField');

var paymentCategoryStringFieldSchema = PaymentCategoryStringField.schema.extend({
	value: String
});

var PaymentCategoryStringField = mongoose.model('PaymentCategoryStringField', paymentCategoryStringFieldSchema);

module.exports = PaymentCategoryStringField;