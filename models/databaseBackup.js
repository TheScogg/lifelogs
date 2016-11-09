const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const DaySchema = new Schema({
    date: String,
    activities: Object,
    survey: Object
});

// DaySchema.plugin(passportLocalMongoose);

module.exports.DaySchema = DaySchema;
