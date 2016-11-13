var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieSession = require('cookie-session'); //Try this TODAY
var cookieParser = require('cookie-parser');
var path = require('path');
var io =  require('socket.io')();

//import Mongoose Database CODE
var database = require('./public/javascripts/database');

mongoose.connect('mongodb://localhost/projectDB');
// mongoose.connect('mongodb://heroku_13wmh570:fogerty21@ds147377.mlab.com:47377/heroku_13wmh570');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.set('view engine', 'html');

// Login System
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

passport.use(new GithubStrategy({
    clientID: "36f660aa51960b0df2f1",
    clientSecret: "73e223d3cecede8a5d295dec30a1a69ec48ec243",
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

// Express and Passport Session
var session = require('express-session');
app.use(session({secret: "-- ENTER CUSTOM SESSION SECRET --"}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, user);
});

// we will call this to start the GitHub Login process
app.get('/auth/github', passport.authenticate('github'));

// GitHub will call this URL
app.get('/auth/github/callback', passport.authenticate('github', {
//   successRedirect: '/index',
  failureRedirect: '/'
}),
  function(req, res) {
    // Upon successful login, redirect to /username, for example, localhost:3000/TheScogg
    // Have to find a way to make this secure, since anybody can access anybody's account by typing their name in the address bar.
    res.redirect('/' + req.user.username );
  }
);

app.get('/db', function (req, res){
    var DayModel = mongoose.model(req.user.username, database.DaySchema);

    return DayModel.find(function (err, day) {
        if (!err) {
            return res.send(day);
        } else {
            return console.log(err);
        }
    });
});

app.get('/', function (req, res) {
  var html = "<ul>\
    <li><a href='/auth/github'>GitHub</a></li>\
    <li><a href='/logout'>logout</a></li>\
  </ul>";
// dump the user for debugging

if (req.isAuthenticated()) {
  html += "<p>authenticated as user:</p>"
  html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
}
  res.send(html);
});

// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
    //Added 2nd condition : checks to make sure user inputted path is their username & not somebody else's
  if (req.isAuthenticated() && req._parsedUrl.pathname === "/" + req.user.username || req._parsedUrl.pathname === "/db" || req._parsedUrl.pathname === "/sortdb") {
      //&& req._parsedUrl.pathname === "/" + req.user.username || req._parsedUrl.pathname === "/db"
    // req.user is available for use here
    // console.log(req.user.username);
    var myUsername = (req.user.username);
    return next(); }

  // denied. redirect to login
  res.redirect('/')
}

app.get('/logout', function(req, res) {
    console.log('logging out');
    req.logout();
    res.redirect('/');
});

//ensureAuthenticated checks to make sure user is logged in through github.
app.get('/:username', ensureAuthenticated, function(req, res) {
        var DayModel = mongoose.model(req.user.username, database.DaySchema);

    DayModel.find({}, null, {sort: {"birds": "asc"}}, function (err, users) {});
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/api/user_data', function(req, res) {

            if (req.user === undefined) {
                // The user is not logged in
                res.json({});
            } else {
                res.json({
                    username: req.user
                });
            }
        });


//////////////////////////////////////////////////////////////////


/* ////////////////////////////////////////////// */
/* IMPORTED MONGOOSE SCHEMA CODE FROM database.js*/

//Will eventually point to name of user, instead of test name TheScogg

/* ////////////////////////////////////////////// */

/* CODE STOLEN FROM https://pixelhandler.com/posts/develop-a-restful-api-using-nodejs-with-express-and-mongoose */
// Display MongoDB JSON data for user
var DayModel = mongoose.model(req.user.username, database.DaySchema);


// Post data to MongoDB database
app.post('/db', function (req, res){
    console.log(req.body.activities);
    var day;

    day = new DayModel({
        date: req.body.date,
        activities: (req.body.activities),
        survey: (req.body.survey)
    });
    return day.save(function (err) {
        if (!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    // return res.send(day);
});



// Read a single day's data by ID
app.get('/db/:id', function (req, res){
    return DayModel.findById(req.params.id, function (err, day) {
        if (!err) {
            return res.send(day);
        } else {
            return console.log(err);
        }
    });
});

// Update a single day's data by ID
app.put('/db/:id', function (req, res){
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


var server = app.listen(process.env.port || 3000, function () {
    console.log("Node Server Running at http://%s:%s",
    server.address().address, server.address().port);
});


/*


*/
