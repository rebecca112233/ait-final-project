const express = require('express');
const mongoose = require('mongoose');

require('./db');

const bodyParser = require('body-parser');

//enable sessions
const session = require('express-session')
const sessionOptions = {
    secret: 'mySecret',
    resave: 'false',             
    saveUninitialized: 'false'
}
const auth = require('./auth.js');
const path = require('path');
const app = express();

const User = mongoose.model('User');
const Itineraries = mongoose.model('Itineraries');
const Maps = mongoose.model('Maps');

app.use(session(sessionOptions));

//view engine setup
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'))

//body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

//HOME PAGE
app.get('/', (req, res) => {
    res.render('index', {user: req.session.user});
});

//LOGIN
app.get('/register', (req, res) => {
    res.render('register', {user: req.session.user});
});

app.post('/register', (req, res) => {
    function success(user){
        auth.startAuthenticatedSession(req, user, function(){
            res.redirect("/");
        });
    }
    function error(message){
        res.render('register', message);
    }
    auth.register(req.body['username'], req.body['email'], req.body['password'], error, success);
});

app.get('/login', (req, res) => {
    res.render('login', {user: req.session.user});
});

app.post('/login', (req, res) => {
    function success(user){
        auth.startAuthenticatedSession(req, user, function(){
            res.redirect("/");
        })
    }
    function error(message){
        res.render('login', message)
    }
    auth.login(req.body['username'], req.body['password'], error, success);
});

app.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
})

//ITINERARY
app.get('/:username/itinerary/all', (req, res) => {
    User.findOne({"username": req.params.username}, (err, result) =>{
        Itineraries.find({"userID": result._id}, (err, currentItineraries) =>{
            if(req.query['filterTitle'] !== "" && req.query['filterTitle'] !== undefined){
                let itineraries = currentItineraries.filter((itinerary) => {
                    return itinerary.title === req.query['filterTitle'];
                });
                res.render('itinerary-all', {itineraries: itineraries, user: req.session.user});
            }
            else if(req.query['filterLocation'] !== "" && req.query['filterLocation'] !== undefined){
                let itineraries = currentItineraries.filter((itinerary) => {
                    return itinerary.location === req.query['filterLocation'];
                });
                res.render('itinerary-all', {itineraries: itineraries, user: req.session.user});
            }
            else if(req.query['onlyTitles'] !== "" && req.query['onlyTitles'] !== undefined){
                let itinerary_names = currentItineraries.map((itinerary, index, currentItineraries) => {
                    return itinerary.title;
                });
                res.render('itinerary-all', {titles: itinerary_names, user: req.session.user});
            }
            else{
                res.render('itinerary-all', {itineraries: currentItineraries, user: req.session.user});
            }
        })
    });
});

app.get('/:username/itinerary/create', (req, res) => {
    res.render('itinerary-create', {user: req.session.user});
});

app.post('/:username/itinerary/create', (req, res) => {
    const newItinerary = new Itineraries({
        'title': req.body['title'],
        'location': req.body['location'],
        'days': req.body['days'],
        'description': req.body['description'],
        'userID': req.session.user._id
    });
    newItinerary.save(function(err, user, count){
        User.findOne({"_id": req.session.user._id}, (err, result) => {
            res.redirect('/' + result.username + '/itinerary/all');
        });
    });
});

app.get('/:username/itinerary/:title', (req, res) => {
    Itineraries.findOne({title: req.params.title}, (err, result) => {
        res.render('itinerary-edit', {itinerary: result, user: req.session.user});
    });
});

app.post('/:username/itinerary/:title', (req, res) => {
    Itineraries.findOneAndUpdate({title: req.params.title}, {title: req.body['title'], days: req.body['days'], description: req.body['description']}, (err) =>{
        if(!err){
            User.findOne({"_id": req.session.user._id}, (err, result) => {
                res.redirect('/' + result.username + '/itinerary/all');
            });
        } else {
            console.log(err);
        }
    });
});

//MAPS
app.get('/:username/map', (req, res) => {
    User.findOne({"username": req.params.username}, (err, result) =>{
        Maps.find({"userID": result._id}, (err, map) =>{
            if(map !== undefined && map.length !== 0){
                res.render('map', {mapPosition: map[0].markerPositions, mapDescription: map[0].markerDescriptions, user: req.session.user});
            }
            else{
                res.render('map', {user: req.session.user});
            }
        });
    });
});

app.post('/:username/map', (req, res) => {
    const newMap = new Maps({
        'markerPositions': req.body['myHiddenPins'],
        'markerDescriptions': req.body['myHiddenDescs'],
        'userID': req.session.user._id
    });

    newMap.save(function(err, user, count){
        res.redirect('map');
    });
});
app.listen(process.env.PORT || 3000);