var redis_url = process.env.REDIS_URL || "redis://127.0.0.1:6379/0"
var redis = require("redis");
var bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient(redis_url);

client.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = client;