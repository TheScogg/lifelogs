const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const DaySchema = new Schema({
    date: String,
    activities: Array,
    survey: Array
});



// DaySchema.plugin(passportLocalMongoose);


module.exports.DaySchema = DaySchema;


// var DaySchema = mongoose.model('Post', {
//   activities:     { type: String, required: true },
//   activities:     { type: Object, required: true },
//   date:           { type: Object, required: true}
// })
//
// module.exports = DaySchema
