'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	$extend = require('mongoose-schema-extend');

var PaymentCategory = require('./PaymentCategory');

var paymentCategoryMerchandiseSchema = PaymentCategory.schema.extend({
	
});

var PaymentCategoryMerchandise = mongoose.model('PaymentCategoryMerchandise', paymentCategoryMerchandiseSchema);

module.exports = PaymentCategoryMerchandise;