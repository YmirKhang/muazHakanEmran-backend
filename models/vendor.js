const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    location : {
        lat: Number,
        lng: Number},
    capacity: {type: Number, required: true},
    holding: {type:Number, default:0 },
    isFactory: { type:Boolean, default: false}
});

module.exports = mongoose.model('Vendor', vendorSchema);