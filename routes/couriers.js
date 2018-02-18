var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

var client = require('../utils/redis');

const User = require("../models/user");
const Vendor = require("../models/vendor");

router.post('/getVendorRoute',(req,res,next)=>{
    const lat = req.body.lat;
    const lng = req.body.lng;
    const user_id = req.body.user_id;
    const amount = req.body.amount;
    console.log(req.body);
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
        },{ $match:{ $or:
            [
                {holding: {$gt: 0}},
                {isFactory:{ $eq: true}}
                ]}},{ $sort: {isFactory:1}}]
    ).exec()
        .then(docs => {
            if(docs.length>0) {

                const response = {
                    count: docs.length,
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

                const route = {
                    _id: mongoose.Types.ObjectId(),
                    vendors: docs.map(doc => {
                        return {
                            _id: doc._id
                        }
                    })
                }
                console.log(route);
                res.status(200).json(response);
                let key = "bounty" + user_id;

                client.set(key, 0,function(err,reply){
                })
                User.update({android_id : user_id},
                    {activeRoute: route}).exec().then(res=>{
                        console.log(res);
                })
            }else{
                res.status(200).json({msg:"Can't find route for now"});
            }

        })
        .catch(err=>{
            res.status(500).json({error: err});
        })
});

router.post('/getJobs',(req,res,next)=>{

});

router.get('/currentJob/:user_id',(req,res,next)=>{
    const id = req.params.user_id;
    User.findOne({android_id: id}).select('activeRoute android_id').exec().then(doc=>{
        res.status(200).json(doc);
    }).catch(err=>{
        res.status(500).json({error:err});
    })
});

router.post('/finishJob',(req,res,next)=>{
    const user_id = req.body.user_id;
    const tx_id = req.body.tx_id;
    client.hgetall(tx_id,function(err,replies){
       let bounty = replies.bounty || 220;
       let place = replies.factory || "Sisli";
       User.update({android_id:user_id},{$inc: {credits: Number(bounty)}}).exec().then(doc=>{
           User.findOne({android_id: user_id}).select('android_id credits _id').exec().then(doc=>{

               res.status(200).json({
                   credits: doc.credits,
                   android_id:doc.android_id,
                   msg:"You have earned " + bounty + " credits for delivering to " + place,
                   _id: doc._id
               });
           }).catch(err=>{
               res.status(500).json({error:err});
           })
       });
    });
})

router.post('/transactVendor',(req,res,next)=>{
   const vendor_id =  req.body.vendor_id;
   const user_id = req.body.user_id;
   const bounty = req.body.bounty;
   User.update({android_id:user_id},{ $pop: {"activeRoute.vendors":-1}}).exec().then().catch();
    let key = "bounty" + user_id;
    console.log(key);
    client.incrby(key, bounty,function(err,reply){
    })
    Vendor.findOne({_id:vendor_id}).select('holding _id').exec().then(doc=>{
        let holding  = doc.holding - Number(bounty);
        if(holding<0){holding=0}
        Vendor.update({_id:vendor_id},{holding:holding}).exec().then().catch(err=>{
                console.log("Error during vendor update");
        })
    }).catch(err =>{ console.log("error during vendor update")});
    User.findOne({android_id: user_id}).select('activeRoute android_id').exec().then(doc=>{
        res.status(200).json(doc);
    }).catch(err=>{
        res.status(500).json({error:err});
    })
});

router.get('/finishRoute/:userId',(req,res,next)=>{
   const user_id = req.params.userId;
   let key = "bounty" + user_id;
   client.get(key,function(err,reply){
      console.log(reply);
      User.update({android_id:user_id},{ $set: {"activeRoute":[]},$inc: {credits: Number(reply)}}).exec().then(doc =>{
          User.findOne({android_id: user_id}).select('activeRoute android_id credits').exec().then(doc=>{

              res.status(200).json({
                  credits: doc.credits,
                  android_id:doc.android_id,
                  msg:"You have earned " + reply + " credits"
              });
          }).catch(err=>{
              res.status(500).json({error:err});
          })
      }).catch();
      client.del(key,function(err,reply){

      })
   });
});

module.exports = router;
