'use strict';

var DeleteRequestInterceptor = function(resource, model) {

    // Access Control: remove 
    resource.before('delete', function(req, res, next) {


        console.log('plugin::modelDeleteIntercept::before::delete::enter');

        model.findById(req.params.id).exec(function(err, doc) {

            if (err) {
                console.log('plugin::modelDeleteIntercept::before::delete::findById::err', err);
                return res.send(500, err.message || err);
            }

            if (!doc) {
                err = new Error('Model not found');
                console.log('plugin::modelDeleteIntercept::before::delete::findById::err', err);
                return res.send(404, err.message || err);
            }


            doc.remove(function(err) {
                if (err) {
                    console.log('plugin::modelDeleteIntercept::before::delete::findById::remove::err');
                    return res.send(200, err.message);
                }
                console.log('plugin::modelDeleteIntercept::before::delete::findById::remove::success');
                res.json(200, doc);
            });

        });
    });


};

module.exports = {
	plugin: DeleteRequestInterceptor
};
