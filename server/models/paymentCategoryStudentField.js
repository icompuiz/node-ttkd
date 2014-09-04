'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	$extend = require('mongoose-schema-extend');
	ObjectId = mongoose.Schema.Types.ObjectId;

var PaymentCategoryField = require('./PaymentCategoryField');

var paymentCategoryStudentFieldSchema = PaymentCategoryStudentField.schema.extend({
	student: {
		ref: 'Student',
		type: ObjectId
	}
});

var PaymentCategoryStudentField = mongoose.model('PaymentCategoryStudentField', paymentCategoryStudentFieldSchema);

module.exports = PaymentCategoryStudentField;