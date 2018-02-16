const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    location : { type: { type: String, default:'Point' }, coordinates: [] },
    capacity: {type: Number, required: true},
    holding: {type:Number, default:0 },
    isFactory: { type:Boolean, default: false}
});

vendorSchema.index({"location": "2dsphere"});

module.exports = mongoose.model('Vendor', vendorSchema);