var express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  redis = require('redis'),
  socket = require('socket.io'),
  port = 3000,
  app = express();

/**
* @desc connect to redis
*/
var publisher = redis.createClient(6379, {host: '192.168.99.100'});
var subscriber = redis.createClient(6379, {host: '192.168.99.100'});
// var publisher = redis.createClient();
// var subscriber = redis.createClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/client'));

/**
* @desc endpoints
*/
app.get('/', function(req, res) {
  res.json('connected to express');
});

/**
* @desc start up server with socket io and express
*/
var io = socket.listen(app.listen(port), {log: false});
console.log(' -- Party on port ' + port + ' -- ');

/**
* @desc socket.io
*/
io.sockets.on('connection', function (socket) {

  /**
  * @todo subscribe and publish to patterns
  * instead of hard coded values using psubscribe
  */
  subscriber.subscribe('chat');
  subscriber.subscribe('alert');

  socket.on('chat', function (data) {
    publisher.publish('chat', data);
  });

  socket.on('alert', function (data) {
    publisher.publish('alert', data);
  });

  // socket.on('join', function (data) {
  //   publisher.publish('join', {msg: 'user joined'});
  // });

  /**
  * @desc use redis subscriber to listen to any message from redis
  * to the server. when message arrives, send to client via socket
  * @todo figure out why console will throw memory leak warning
  */
  subscriber.on('message', function (channel, message) {
    socket.emit(channel, message);
  });
});
