var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
var client = require('../utils/redis');

const User = require("../models/user")

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find()
        .select("_id android_id name offeredJobs")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        name: doc.name,
                        _id: doc._id,
                        android_id: doc.android_id,
                        _id: doc._id,
                        offeredJobs:doc.offeredJobs.map(job =>{
                            return{
                                lat: job.location.coordinates[0],
                                lng: job.location.coordinates[1],
                                quantity: job.quantity,
                                _id: job._id
                                }

                        })
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

router.post("/recycle", (req,res,next)=>{
    const tx_id = req.body.tx_id;
    const user_id = req.body.user_id;
    client.lrange("transaction_keys",0,-1,function(err,replies){
       if(replies.indexOf(tx_id)!=-1){
           client.hgetall(tx_id,function(err,replies){
               res.status(200).json({
                    msg: replies
               });
           })
       }else{
           res.status(404).json({
               msg: "Not a valid tx id"
           });
       }
    });
});

router.post("/subscribe", (req,res,next) => {
    const user = new User({
        _id: mongoose.Types.ObjectId(),
        android_id: req.body.id,
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

router.get('/me/:userid',(req,res,next)=>{
    const id = req.params.userid;
    User.aggregate([{$project:{
        _id:1,
        android_id:1,
        credits:1,
        openTasks: { $filter:{ input:"$offeredJobs", as:"job",cond:{ $ne:["$$job.finished", false] }  }},
        closedTasks: { $filter:{ input:"$offeredJobs", as:"job",cond:{ $eq:["$$job.finished", false] }  }},
    }},{$match: {android_id: id}}]).exec().then(doc=>{
        obj = {me:doc[0]}
        res.status(200).json({
            _id:doc[0]._id,
            android_id: doc[0].android_id,
            credits:doc[0].credits,
            openJobs: doc[0].openTasks.map(job=>{
                return{
                    _id: job._id,
                    quantity: job.quantity,
                    lat: job.location.coordinates[0],
                    lng: job.location.coordinates[1]
                }
            }),
            closedJobs: doc[0].closedTasks.map(job=>{
                return{
                    _id: job._id,
                    quantity: job.quantity,
                }

            })
        });
    }).catch(err =>{
        res.status(500).json({error: err});
    });

})

router.post("/createJob", (req,res,next) => {
    const id = req.body.id;
    const job = {};
    job.quantity = req.body.quantity;
    job.location = {};
    job.location.coordinates=[];
    job.location.coordinates.push(req.body.lat);
    job.location.coordinates.push(req.body.lng);
    job._id = mongoose.Types.ObjectId();
    User.findOne(
        { android_id:id },
    ) .select("_id android_id name offeredJobs")
        .exec()
        .then(doc => {
            if(doc){
                return doc.android_id;
            }else{
                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    android_id: req.body.id,
                    location: req.body.location
                });

                var savePromise = user.save().then(user.android_id).then(JSON.parse);
                return savePromise;
            }
        }).then(id=>{
            User.update(
                {android_id: id},
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


});

router.get('/:userid/listJobs', (req,res,next) => {
    const id = req.params.userid;
    console.log(id);
    User.findOne(
    { android_id:id },
    ) .select("_id android_id name offeredJobs")
        .exec()
        .then(doc => {
            res.status(200).json({
                count: doc.offeredJobs.length,
                offeredJobs:doc.offeredJobs.map(job =>{
                return{
                    lat: job.location.coordinates[0],
                    lng: job.location.coordinates[1],
                    quantity: job.quantity,
                    _id: job._id
                }

            })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;
