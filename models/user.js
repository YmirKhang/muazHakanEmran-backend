const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type:String, required: true},
    credits: Number,
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