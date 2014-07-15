var $mongoose = require('mongoose'),
    Schema = $mongoose.Schema;


var OutputFormatSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true
    }
});

var textModel = require('../plugins/textModel');
OutputFormatSchema.plugin(textModel);

var OutputFormat;
module.exports = OutputFormat = $mongoose.model('OutputFormat', OutputFormatSchema);
