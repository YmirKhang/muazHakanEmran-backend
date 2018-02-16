var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/test/:message', function(req, res, next) {
  res.status(200).json({
      msg: "Working " + req.params.message
  });
});

router.post('/testPost', function(req, res, next) {
    res.status(201).json({
        id: "Id is :" + req.body.id,
        message: "Message is:" + req.body.message
    });
});


router.post

module.exports = router;
