'use strict';

var fs = require('fs'),
    _ = require('lodash'),
    async = require('async'),
    csv = require('csv');


var parseCSV = function(csvContent, parseCSVTaskDone) {

    csv.parse(csvContent, function(err, data) {

        if (err) {
            return parseCSVTaskDone(err);
        }

        var csvHeaders = data.shift();


        var records = data.map(function(record) {


            function reduceRecord(previousValue, currentValue, index, reduceInput) {
                previousValue[reduceInput[index]] = record[index];
                return previousValue;
            }

            var mappedRecord = csvHeaders.reduce(reduceRecord, {});

            return mappedRecord;

        });

        parseCSVTaskDone(null, records);


    });

};

var saveStudents = function(studentRecords, saveStudentsTaskDone) {

    var mongoose = require('mongoose');
    var StudentModel = mongoose.model('Student');
    var results = {
        errors: [],
        imported: []
    };

    var saveStudent = function(studentRecord, saveStudentIteratorDone) {

        studentRecord.emailAddresses = [];
        studentRecord.emergencyContacts = [];
        studentRecord.phone = {};
        studentRecord.address = {};

        if (studentRecord.emailAddress1) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress1);
        }
        if (studentRecord.emailAddress2) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress2);
        }
        if (studentRecord.emailAddress3) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress3);
        }

        if (studentRecord.emergencyContact1Name || studentRecord.emergencyContact1Phone || studentRecord.emergencyContact1Relationship) {
            var emc1 = {
                name: studentRecord.emergencyContact1Name,
                phoneNumber: studentRecord.emergencyContact1Phone,
                relationship: studentRecord.emergencyContact1Relationship,
                email: studentRecord.emergencyContact1Email
            };

            delete studentRecord.emergencyContact1Name;
            delete studentRecord.emergencyContact1Phone;
            delete studentRecord.emergencyContact1Relationship;
            delete studentRecord.emergencyContact1Email;

            studentRecord.emergencyContacts.push(emc1);
        }
        if (studentRecord.emergencyContact2Name || studentRecord.emergencyContact2Phone || studentRecord.emergencyContact2Relationship) {
            var emc2 = {
                name: studentRecord.emergencyContact2Name,
                phoneNumber: studentRecord.emergencyContact2Phone,
                relationship: studentRecord.emergencyContact2Relationship,
                email: studentRecord.emergencyContact2Email
            };
            delete studentRecord.emergencyContact2Name;
            delete studentRecord.emergencyContact2Phone;
            delete studentRecord.emergencyContact2Relationship;
            delete studentRecord.emergencyContact2Email;

            studentRecord.emergencyContacts.push(emc2);
        }

        if (studentRecord.homePhone) {
            studentRecord.phone.home = studentRecord.homePhone;
            delete studentRecord.homePhone;
        }

        if (studentRecord.cellPhone) {
            studentRecord.phone.cell = studentRecord.cellPhone;
            delete studentRecord.cellPhone;
        }

        if (studentRecord.city) {
            studentRecord.address.city = studentRecord.city;
            delete studentRecord.city;
        }
        if (studentRecord.state) {
            studentRecord.address.state = studentRecord.state;
            delete studentRecord.state;
        }
        if (studentRecord.zip) {
            studentRecord.address.zip = studentRecord.zip;
            delete studentRecord.zip;
        }



        var student = new StudentModel(studentRecord);

        console.log('Importing student record for %s %s', student.firstName, student.lastName);


        student.save(function(err) {

            if (err) {
                results.error.push({
                    message: 'Could not import student record for ' + studentRecord.firstName + ' ' + studentRecord.lastName,
                    error: err
                });
            } else {
                results.imported.push({
                    message: 'Successfully imported student record for ' + studentRecord.firstName + ' ' + studentRecord.lastName,
                    id: student._id
                });
            }

            saveStudentIteratorDone();

        });

    };

    async.each(studentRecords, saveStudent, function(err) {
        saveStudentsTaskDone(err, results);
    });
};

var ImportExportCtrl = {

    importStudentData: function(req, res) {

        var keys = _.keys(req.files);

        if (!_.isEmpty(keys)) {
            var file = req.files[keys[0]];

            console.log(file);

            var contents = fs.readFileSync(file.path, {
                encoding: 'utf8'
            });

            parseCSV(contents, function(err, records) {

                if (err) {
                    return res.send(400, err.message || err);
                }

                saveStudents(records, function(err, results) {
                    return res.jsonp(200, results);
                });


            });

        }

    }

};

module.exports = ImportExportCtrl;
