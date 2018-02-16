const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Vendor = require("../models/vendor");

router.post("/", (req, res, next) => {
    const vendor = new Vendor({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        location: req.body.location,
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
});

module.exports = router;
