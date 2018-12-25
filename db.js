const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

//users
const User = new mongoose.Schema({
    username: String,
    password: String
});

const Maps = new mongoose.Schema({
    markerPositions: Array,
    markerDescriptions: Array,
    userID: String
});

const Itineraries = new mongoose.Schema({
    title: String,
    location: String,
    days: Number,
    description: String,
    userID: String
});

//use plugins (for slug)
Itineraries.plugin(URLSlugs('title'));

//register your model
mongoose.model('User', User);
mongoose.model('Maps', Maps);
mongoose.model('Itineraries', Itineraries);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/finalproject', {useNewUrlParser: true});