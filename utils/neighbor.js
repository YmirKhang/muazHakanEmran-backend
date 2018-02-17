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
