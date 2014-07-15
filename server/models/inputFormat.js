var $mongoose = require('mongoose'),
    Schema = $mongoose.Schema;

var InputFormatSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true
    }
});

var textModel = require('../plugins/textModel');
InputFormatSchema.plugin(textModel);

var InputFormat;
module.exports = InputFormat = $mongoose.model('InputFormat', InputFormatSchema);
