'use strict';

var $passport = require('passport'),
    $mongoose = require('mongoose'),
    _ = require('lodash'),
    $toastySession = require('../toastySession'),
    User = $mongoose.model('User');

function login(user, req, res, next) {
    req.logIn(user, function(err) {
        if (err) {
            return next(err);
        }

        user.salt = null;
        user.hash = null;

        $toastySession.user = req.user;

        authenticationCtrl.currentUser(req, res, next);

        // res.json(200, user);
    });
}

var authenticationCtrl = {
    currentUser: function(req, res, next) {

        var Route = $mongoose.model('Route');

        Route.whatResources($toastySession.user._id, function(err, assets) {

            var user = $toastySession.user.toObject();
            user.assets = assets;
            return res.jsonp(200, user);

        });


    },
    login: function(req, res, next) {

        if (req.isAuthenticated()) {
            console.log('authenticationCtrl::login::isAuthenticated', 'User is already logged in', 'resetting session');
            req.logout();
        }

        return $passport.authenticate('local', function(err, user) {

            if (err) {

                return next(err);
            }
            if (!user) {

                return res.send(401, 'Unauthorized: Bad username or password');
            }


            if (req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;


            login(user, req, res, next);

        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();

        return res.send(200);
    },
    register: function(req, res, next) {
        try {
            User.validate(req.body);
        } catch (err) {
            return res.send(400, err.message);
        }

        var password = req.body.password; // Copy password as we pass this seprately so it can be hashed

        User.register(new User(req.body), password, function(err, user) {
            if (err) {
                console.log("Auth.register ERROR:");
                console.log(err);
                return res.send(400, err);
            }

            login(user, req, res, next);
        });
    },
};


module.exports = authenticationCtrl;