const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const neighbor = require("../utils/neighbor");

const Vendor = require("../models/vendor");

router.post("/", (req, res, next) => {
    const vendor = new Vendor({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        isFactory: req.body.isFactory,
        location: {
            coordinates: [req.body.lat, req.body.lng]
        },
        capacity: req.body.capacity
    });
    vendor
        .save()
        .then(result => {
            console.log(result);

            res.status(201).json({
                message: "Created vendor successfully",
                createdProduct: {
                    name: result.name,
                    location: result.location,
                    _id: result._id,
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    neighbor.updateNeighbors(vendor);

});

router.get('/',(req,res,next)=>{
    Vendor.find().populate("neighbors")
        .select("name location holding capacity _id neighbors isFactory")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                vendors: docs.map(doc => {
                    return {
                        name: doc.name,
                        holding: doc.holding,
                        capacity: doc.capacity,
                        _id: doc._id,
                        location:doc.location,
                        neighbors: doc.neighbors.map(doc => {
                            return {
                                _id: doc._id,
                                coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]]
                            };
                        }),
                        isFactory: doc.isFactory
                    };
                })
            };
            res.status(200).json(response);

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/find/',(req,res,next) =>{
    const lat = req.query.lat;
    const lng = req.query.lng;
    const dist = req.query.dist;
    Vendor.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(lat),Number(lng)]
                },
                distanceField: "distance",
                spherical: true,
                maxDistance: Number(dist)
            }
        },/*{$project: {
            isAvailable: { "$cmp": [ "$capacity", "$holding" ] },
            _id: 0,
            name:1,
            capacity:1,
            holding: 1,
            distance: { $sum: "$counts"},
        }},
        { $match: {$and: [{ isFactory: false }, {isAvailable: 1}] } }*/]

    ).exec()
    .then(docs => {
            const response = {
                count: docs.length,
                vendors: docs.map(doc => {
                    return {
                        name: doc.name,
                        holding: doc.holding,
                        capacity: doc.capacity,
                        _id: doc._id,
                        lat: doc.location.coordinates[0],
                        lng: doc.location.coordinates[1]
                    };
                })
            };
            res.status(200).json(response);

        })
    .catch()
});

router.delete("/:vendorid", (req, res, next) => {
    const id = req.params.vendorid;
    Vendor.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Vendor deleted',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;
