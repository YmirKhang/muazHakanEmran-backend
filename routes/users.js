var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/subscribe", (req,res,next) => {
    const user = new User({
        _id: req.body.id,
        name: req.body.name,
        location: req.body.location
    });
    user.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created user successfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id
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

router.post("/createJob", (req,res,next) => {
    const id = req.body.id;
    const job = req.body.job;
    job._id = mongoose.Types.ObjectId();
    User.update(
        {_id: id},
        { $push: { offeredJobs: job}})
        .exec()
        .then(result => {
            res.status(201).json({
                message: "Job is successfully added",
                job: result
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.get('/listJobs/:userid', (req,res,next) => {
    const id = req.params.userid;
    User.findById(id)
        .select('offeredJobs')
        .exec()
        .then(doc => {
            res.status(200).json({
                count: doc.offeredJobs.length,
                jobs: doc.offeredJobs,
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;
