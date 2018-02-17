const mongoose = require("mongoose");
const Vendor = require("../models/vendor");

exports.updateNeighbors = function(vendor){
    const lat = vendor.location.coordinates[0];
    const lng = vendor.location.coordinates[1];
    Vendor.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(lat),Number(lng)]
                },
                distanceField: "distance",
                spherical: true,
                maxDistance: 100000
            }
        },
        {$limit: 10},
        {$match: { _id: { $ne: vendor._id}} },
        {$sort:{ distance:1 }}]
    ).exec()
        .then(docs=>    {
            vendor.neighbors = docs.slice(0,10);
            docs.map(doc=>{
                let neig_vendor = Vendor.findById(doc._id).then(neighborMapper(doc)
                );
            });
            vendor.save();
        });
};

const neighborMapper = (node) =>{
    const lat = node.location.coordinates[0];
    const lng = node.location.coordinates[1];
    Vendor.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(lat),Number(lng)]
                },
                distanceField: "distance",
                spherical: true,
                maxDistance: 100000
            }
        },
        {$limit: 10},
        {$match: { _id: { $ne: node._id}} },
        {$sort:{ distance:1 }}])
        .exec()
        .then(docs =>{
            node.neighbors = docs.slice(0,10);
            Vendor.findById(node._id).then(ins=> {
                ins.neighbors =docs;
                ins.save();
                console.log(ins._id);
            });
        })
}

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}