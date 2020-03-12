var express = require("express");
var bodyParser = require('body-parser');
var path = require("path");
var fs = require("fs");

var app = express();

/*
	Make static files available
*/
app.use(express.static(path.join(__dirname + "public")));

/*
	For parsing bodies of POST requests
*/
app.use(bodyParser.json());		//JSON bodies
app.use(bodyParser.urlencoded({extended: true}))		//Extended bodies


/*
	Allow CORS
*/
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");	//Feel free to change the * to something more specific, I think
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/*
	Send the client the html file
*/
app.get("/", function(req, res){
	//Send index.html
	res.sendFile(__dirname + "/index.html");
})

/*
	Send the client the public files
*/
app.get("/public/*", function(req, res){
	//Send public file
	res.sendFile(__dirname + req.url);
})

/*
	Send the client the js file
*/
app.get("/script.js", function(req, res){
	//Send script.js
	res.sendFile(__dirname + "/script.js");
})

/*
	Send the client a json file
*/
app.get("/*.json", function(req, res){
	//Send JSON
	console.log("Request for: " + req.url);
	res.sendFile(path.join(__dirname + req.url));
})

/*
	Handle a client request
*/
app.post('/', function (req, res) {
	if(req.body){				//If the POST request is a valid client JS request:
		var data = req.body;			//JSON object of the data sent to us

		// console.log(data);

		switch(parseInt(data.key)){
			case 40:
				//Down Arrow
				// console.log("down");
				move_obj(data.moving_obj, data.distance, 0, 1);

				break;
			case 38:
				//Up Arrow
				// console.log("up");
				move_obj(data.moving_obj, data.distance, 0, -1);

				break;
			case 37:
				//Left Arrow
				// console.log("left");
				move_obj(data.moving_obj, data.distance, -1, 0);

				break;
			case 39:
				//Right Arrow
				// console.log("right");
				move_obj(data.moving_obj, data.distance, 1, 0);

				break;
			case 18:
				//Alt

				break;
			case 9:
				//Tab

				break;
			default:
				console.log("Error: No matching keycode: " + data.key);

				break;
		}
	}
})

/*
	Spin up the server on port 4000
*/
var server = app.listen(4000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Sever Ready @ " + host + ":" + port);
})

//FUNCTIONS ========================================================================================

/*
	Checks to see if an object can be moved a certain distance and, if it can, moves it

	moving_object - the object to be moved
	distance - the distance to move it (absolute value, never negative)
	x_direction - the direction in the x axis to move it (ie. -1 for left, 0 for not at all, 1 for right)
	y_direction - the direction in the y axis to move it (ie. -1 for up, 0 for not at all, 1 for down)
*/
function move_obj(moving_object, distance, x_direction, y_direction){
	//Check to see if object can be moved
	//This is a big one! Not implemented yet!
	var moveable = true;

	//Move the object if it can be
	if(moveable){
		var data = JSON.parse(fs.readFileSync("world.json", "utf-8"));	//Load JSON

		var layers = data.layers;
		for(next_layer in layers){					//For each layer
			var layer = layers[next_layer];
			for(next_obj in layer){					//For each object
				if(
	JSON.stringify(layer[next_obj]).replace(/\"/g, '').replace(/\'/g, '') == JSON.stringify(moving_object).replace(/\"/g, '').replace(/\'/g, '')
				){		//Compare the two objects
					var object = layer[next_obj];

					//Move the object
					object.x = parseInt(object.x) + distance * x_direction;
					object.y = parseInt(object.y) + distance * y_direction;

					//Save the movement
					
				}
			}
		}
	}
}