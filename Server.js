var express = require('express');
var rpio = require('rpio');
const app = express();
const { v4: uuidv4 } = require('uuid');
let {board, devices} = require('./dbs/dbs.cjs');
const fs = require('fs');

// rpio.close(16, rpio.PIN_RESET); // tbd rest pins

app.use(express.json()); 				//JSON support
app.use(express.urlencoded({ extended: true }));	//URL request support

function databaseUpdate() {
  	devices_export = '\nlet devices = ' + JSON.stringify(devices) + ';\nmodule.exports.devices = devices;\n';
	board_export = '\nlet board = '+ JSON.stringify(board) + ';\nmodule.exports.board = board;\n';
	fs.writeFile("./dbs/dbs.cjs", (devices_export + board_export), function(err) {
	if(err) {return console.log(err);}});
    console.log("Database Updated!");
    };

//////  route '/'

app.get('/', (req, res) => {
  return res.send('Instruction placeholder');
});

/////  route '/devices/'

app.get('/devices', (req, res) => {
  return res.send(Object.values(devices));
});

app.post('/devices', (req, res) => {
  return res.send('POST HTTP method on device resource');
});

/////  route '/devices/deviceID'

app.get('/devices/:deviceID', (req, res) => {
  return res.send(devices[req.params.deviceID]);
});

app.post('/devices/:deviceID', (req, res) => {
  
	const device = {
	    id:req.params.deviceID,
	    name: req.body.name,
	    pin: req.params.deviceID,				//based on body
	    value: req.body.value,			//tbd
	    mode: req.body.mode,
	    };
	    rpio.open(req.params.deviceID, rpio[device.mode], rpio[device.value])//i.e: 30,OUTPUT, HIGH //make exceptions
	devices[req.params.deviceID] = device;
	databaseUpdate();
    return res.json(device);
});

app.delete('/devices/:deviceID', (req, res) => {
  const {
    [req.params.deviceID]: device, 			//przypisanie destrukcyjne
    ...otherDevices
  } = devices;
  devices = otherDevices;
  databaseUpdate();
  return res.json(device);
});

/////	route '/board/

app.get('/board', (req, res) => {
  return res.send(Object.values(board));
});

/////	route '/board/boardPin

app.get('/board/:boardPin', (req, res) => {
  return res.send(board[req.params.boardPin]);
});


var server = app.listen(3000);
console.log('App Server is listening on port 3000');
