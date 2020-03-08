var express = require("express");
var bodyParser = require('body-parser');

var app = express();

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
	For parsing bodies of POST requests
*/
app.use(bodyParser.json());		//JSON bodies
app.use(bodyParser.urlencoded({extended: true}))		//Extended bodies


/*
	Allow CORS
*/
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");	//Feel free to change the * to something more specific
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
	Send the client the css file
*/
app.get("/style.css", function(req, res){
	//Send style.css
	res.attachment("/style.css");
	res.end();
})

/*
	Send the client the js file
*/
app.get("/script.js", function(req, res){
	//Send script.js
	res.sendFile(__dirname + "/script.js");
})

/*
	Send the client an updated world.json file
*/
app.get("/world.json", function(req, res){
	res.sendFile(__dirname + "/world.json");
})

/*
	Handle a client request
*/
// app.post("/handle_request", function(req, res){
// 	console.log(req.body);
// })
app.post('/', function (req, res) {
	console.log((req.body));
	// if(req.body.data){
	// 	var data = req.body.data;

	// 	console.log(data);
	// }

	//Besides this, just do whatever we do with a get request for here
	res.sendFile(__dirname + "/index.html");
})

/*
	Spin up the server on port 4000
*/
var server = app.listen(4000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Sever Ready @ " + host + ":" + port);
})