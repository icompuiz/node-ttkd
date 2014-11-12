var fs = require('fs'),
    _ = require('lodash'),
    csv = require('csv');

function mapEmailAddresses(columns, record) {

}

function mapEmergencyContacts(columns, record) {

}

function mapAddress(columns, record) {

}

function mapPhone(columns, record) {

}

function generalMap(columnName, record) {

	var index = _.indexOf(record, columnName);
	
	if (-1 === index) {
		return null;
	}

	return record[index];

}

var studentObjectMap = {
	firstName: 'firstName',
	lastName: 'lastName',
	emailAddresses: mapEmailAddresses,
	emergencyContacts: mapEmergencyContacts,
	birthday: 'birthday',
	address: mapAddress,
	phone: mapPhone
};

var parseCSV = function(csvContent, parseCSVTaskDone) {

    csv.parse(contents, function(err, data) {

        if (err) {
            return parseCSVTaskDone(err);
        }

        var columns = data.shift();

        var records = data.map(function(record) {

            var mappedRecord = {};

            columns.forEach(function(column, index) {

                mappedRecord[column] = record[index];

                var mapper = studentObjectMap[column];
                if (_.isFunction(mapper)) {

                } else {

                }

            });

            return mappedRecord;

        });

        parseCSVTaskDone(null, record);


    });

};

var ImportExportCtrl = {

    importStudentData: function(req, res, next) {

        var keys = _.keys(req.files);

        if (!_.isEmpty(keys)) {
            var file = req.files[keys[0]];

            // console.log(file);

            var contents = fs.readFileSync(file.path, {
                encoding: 'utf8'
            });

            parseCSV(contents, function(err, records) {

                if (err) {
                    return res.send(400, err.message || err);
                }

                return res.jsonp(200, records);

            });

        }

    }

};

module.exports = ImportExportCtrl;
