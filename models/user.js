const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    android_id: {type:String, required: true},
    name: {type:String, required: true},
    credits: {type: Number, default: 0},
    location : {
        lat: Number,
        lng: Number},
    offeredJobs: [{
        _id: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        from : Date,
        to: Date,
        location: {lat: Number, lng: Number},
        onHold: {type:Boolean, default: false}
    }]

});

module.exports = mongoose.model('User', userSchema);