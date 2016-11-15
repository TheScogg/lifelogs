var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var database = require('../models/database');
var mongoose = require('mongoose');



router.get('/', function (req, res) {
    // console.log(req.user);
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/views');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/views');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


// lifeLogs Specific POST & GET REQUESTS
// Get data from MongoDB database
router.get('/db', function (req, res){
    var aaa = (req.user.username.toLowerCase());
    console.log(aaa);
    var DayModel = mongoose.model(aaa, database.DaySchema);

    return DayModel.find(function (err, day) {
        if (!err) {
            return res.send(day);
        } else {
            return console.log(err);
        }
    });
});


// Post data to MongoDB database
router.post('/db', function (req, res){
    var username = (req.user.username.toLowerCase());

    var DayModel = mongoose.model(username, database.DaySchema);

    var day = new DayModel({
        date: req.body.date,
        activities: JSON.parse(req.body.activities),
        survey: JSON.parse(req.body.survey)
    });

    return day.save(function (err) {
        if (!err) {
            console.log("updated");
        } else {
            console.log(err);
        }
        return res.send(day);
    });
    // return res.send(day);
});

// Read a single day's data by ID
router.get('/db/:id', function (req, res){
    var username = (req.user.username.toLowerCase());
    var DayModel = mongoose.model(username, database.DaySchema);
    return DayModel.findById(req.params.id, function (err, day) {
        if (!err) {
            return res.send(day);
        } else {
            return console.log(err);
        }
    });
});

// Update a single day's data by ID
router.put('/db/:id', function (req, res){
    var username = (req.user.username.toLowerCase());
    var DayModel = mongoose.model(username, database.DaySchema);
    return DayModel.findById(req.params.id, function (err, day) {
        console.log(req.body.activities);
        day.date = req.body.date;
        day.activities= JSON.parse(req.body.activities),
        day.survey= JSON.parse(req.body.survey)
        // day.activities= req.body.activities,
        // day.survey= req.body.survey

        return day.save(function (err) {
            if (!err) {
                console.log("updated");
            } else {
                console.log(err);
            }
            return res.send(day);
        });
    });
});



module.exports = router;
