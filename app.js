var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');


const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

var index = require('./routes/index');
var users = require('./routes/users');
const vendors = require('./routes/vendors');

var app = express();

var client = require('./utils/redis');

client.get("muaz" ,function(err,reply){
    console.log(reply);
});

const mongoURL = process.env.MONGODB_URI || "mongodb://localhost/denemedb";
mongoose.connect(mongoURL);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
);
if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
}
next();
});


app.use('/', index);
app.use('/users', users);
app.use('/vendors', vendors);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
