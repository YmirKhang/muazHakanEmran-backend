var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

var client = require('../utils/redis');

const User = require("../models/user");
const Vendor = require("../models/vendor");

router.post('/getVendorRoute',(req,res,next)=>{
    const lat = req.body.lat;
    const lng = req.body.lng;
    const user_id = req.body.id;
    const amount = req.body.amount;
    Vendor.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(lat),Number(lng)]
                },
                distanceField: "distance",
                spherical: true,
                maxDistance: 20000
            }
        },{ $sort: {isFactory:1}}]
    ).exec()
        .then(docs => {
            const response = {
                vendors: docs.map(doc => {
                    return {
                        name: doc.name,
                        holding: doc.holding,
                        capacity: doc.capacity,
                        isFactory: doc.isFactory,
                        _id: doc._id,
                        lat: doc.location.coordinates[0],
                        lng: doc.location.coordinates[1],
                    };
                })
            };
            res.status(200).json(response);

        })
        .catch(err=>{
            res.status(500).json({error: err});
        })
});

router.post('/getJobsRoute',(req,res,next)=>{

});

router.post('/getJobs',(req,res,next)=>{

});

router.post('/transactVendor',(req,res,next)=>{
   const vendor_id =  req.body.vendor_id;
   const route_id = req.body.route_id;
   const user_id = req.body.user_id;
   User.update().exec().then().catch();
});

module.exports = router;
