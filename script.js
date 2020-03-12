$(document).ready(function(){
//GLOBAL VARIABLES =========================================================
	var world = "world_JSON";
	var world_downloads_per_second = 0.01;

	var chat = "chat_JSON";
	var chat_downloads_per_second = 0.1;

	var request_queue = [];
	var requests_per_second = 1;

	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var canvas_fps = 20;

	var user_name = "player_one";
	var player = getPlayer(user_name);

	var camera = {
		"x": 0,
		"y": 0,
		"zoom": 1
	}

//SETUP ========================================
	getJSON("/world.json", world);
	getJSON("/chat.json", chat);

	$("#send_message_btn").click(() => {
		sendMessage();
	})

	canvas.width = window.innerWidth - document.getElementById("chat_wrapper").offsetWidth;
	canvas.height = window.innerHeight;


//CANVAS EVENT LISTENERS==========================================================================================================================

	var request_message = {};

	canvas.focus();

	canvas.addEventListener("keydown", (e) => {
		request_message.type = "keydown";
		request_message.key = e.keyCode;
		if(findFollow(JSON.parse(localStorage.getItem(world))) === false){
			//No Follow, abort
		}else{
			request_message.moving_obj = findFollow(JSON.parse(localStorage.getItem(world)));
			request_message.distance = JSON.parse(localStorage.getItem(world)).meta.grid_size_px;

			makeRequest(request_message);
		}
		request_message = {};
	})

//MAIN CODE ===============================================================
	//Set Intervals
	// setInterval(() => {
	// 	getJSON("/world.json", world)
	// }, 10000*1000);		//Every 500 ms, update my understanding of the world
	// setInterval(() => {
	// 	getJSON("/chat.json", chat)
	// }, 1000/chat_downloads_per_second);		//Every 500 ms, get the chat
	setInterval(() => {
		if(request_queue.length > 0){
			console.log("Sending Request to Server");
			makeRequest(request_queue.shift());
		}
	}, 1000/requests_per_second)		//Every 500 ms, send a request, if we have one

	setInterval(() => {
		updateCanvas(JSON.parse(localStorage.getItem(world)));
	}, 1000/canvas_fps);


	



	// console.log(JSON.parse(localStorage.getItem(world)));		//Test to try requests out.
//FUNCTION DEFINITIONS ==============================================================
	/*
		Updates the location of the canvas objects
	*/
	function updateCanvas(data){
		//Check if camera position has changed
		if(findFollow === false){
			//No Follow
		}else{
			updateCamera(findFollow(data));
		}

		//Clear Canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		//Draw all objects
		var layers = data.layers;
		for(next_layer in layers){					//For each layer
			var layer = layers[next_layer];
			for(next_object in layer){
				var object = layer[next_object];	//For each object in the layer

				//Check if object is visible from current view (not yet implemented)
				if(withinCanvas(object)){
					context.beginPath();
					var color = object.color;

					//Display the object
					switch(object.type){
						case "line":
							context.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.alpha + ")";

							context.lineWidth = object.linewidth;

							context.moveTo(object.x + camera.x, object.y + camera.y);
							context.lineTo(object.x + object.dx + camera.x, object.y + object.dy + camera.y);
							context.stroke();

							break;
						case "arc":
							context.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.alpha + ")";

							context.lineWidth = object.linewidth;
							
							context.arc(object.x + camera.x, object.y + camera.y, object.r, eval(object.start_angle), eval(object.end_angle), object.counter_clockwise);
							context.stroke();

							break;
						case "text":
							context.font = object.font;
							context.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.alpha + ")";
							context.textAlign = object.textAlign;
							context.fillText(object.text, object.x + camera.x, object.y + camera.y);

							break;
						case "img":
							var img = document.createElement("img");

							if(object.local){
								img.src = "public" + object.path;
							}else{
								img.src = object.path;
							}

							context.drawImage(img, object.x + camera.x, object.y + camera.y, object.width, object.height);

							break;
						case "rect":
							if(object.fill){
								context.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.alpha + ")";

								context.fillRect(object.x + camera.x, object.y + camera.y, object.width, object.height);
							}else{
								context.lineWidth = object.linewidth;

								context.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.alpha + ")";

								context.strokeRect(object.x + camera.x, object.y + camera.y, object.width, object.height);
							}

							break;
						default:
							console.log("Error displaying object: " + JSON.stringify(object) + "\nOn Camera: " + JSON.stringify(camera));

							break;
					}
				}
			}
		}
	}

	/*
		Given an object to follow, move the center of the canvas to point to the center of the object
	*/
	function updateCamera(object){
		var obj_center = getCenterOfObject(object);
		camera.x = getCenterOfCanvas()[0] - obj_center[0];
		camera.y = getCenterOfCanvas()[1] - obj_center[1];
	}

	/*
		Gets UI coordinates of what the center of the canvas is pointing to
	*/
	function getCenterOfCanvas(){
		return [canvas.width / 2, canvas.height /2];
	}

	/*
		Updates the center of a specific  JSON object
	*/
	function getCenterOfObject(object){
		switch(object.type){
						case "line":
							return [object.x + (object.dx / 2), object.y + (object.dy / 2)];

							break;
						case "arc":
							return [object.x, object.y];

							break;
						case "img":
							return [object.x + (object.width / 2), object.y + (object.height / 2)];

							break;
						case "rect":
							return [object.x + (object.width / 2), object.y + (object.height / 2)];

							break;
						default:
							console.log("Error updating camera: " + JSON.stringify(camera) + "\nTo Object: " + JSON.stringify(object));

							break;
					}
	}

	/*
		Finds the object in the world with follow enabled
	*/
	function findFollow(data){
		var layers = data.layers;
		for(next_layer in layers){					//For each layer
			var layer = layers[next_layer];
			for(next_object in layer){
				var object = layer[next_object];	//For each object in the layer

				if(player.follow == next_object){
					return object;
				}
			}
		}

		return false;
	}

	/*
		Tests to see if an object is within the canvas
	*/
	function withinCanvas(object){
		return true;

		/*
			Worry about this later, it's an efficiency thing only
		*/

		// switch(object.type){
		// 	case "line":
		// 		if((object.start.x < 0 && object.end.x < 0) || (object.start.y < 0 && object.end.y < 0)){	//To left or above
		// 			return false;
		// 		}else if((object.start.x > canvas.width && object.end.x canvas.width) || (object.start.y > canvas.height && object.end.y canvas.height)){	//To right or below
		// 			return false;
		// 		}else{
		// 			return true;
		// 		}

		// 		break;
		// 	case "arc":
		// 		if(object.x < -object.r  || object.y < -object.r){	//To left or above
		// 			return false;
		// 		}else if(object.x > canvas.width + object.r  || object.y > canvas.width + object.r){	//To right or below
		// 			return false;
		// 		}else{
		// 			return true;
		// 		}

		// 		break;
		// 	case "text":

		// 		break;
		// 	case "img":

		// 		break;
		// 	case "rect":

		// 		break;
		// 	default:
		// 		console.log("Error checking for withinCanvas on object: " + JSON.stringify(object) + "\nOn Camera: " + JSON.stringify(camera));

		// 		break;
		// }
	}

	/*
		Gets a JSON file at url and stores it in local storage at local_path
	*/
	function getJSON(url, local_path){
		console.log("Getting JSON");
		$.getJSON(url, (data) => {
			var json_string = JSON.stringify(data);
			if(json_string != localStorage.getItem(local_path)){
				//Update to JSON
				localStorage.setItem(local_path, json_string);

				handleNewJSON(local_path);
			}
		})
	}

	/*
		Handles JSON updates
	*/
	function handleNewJSON(local_path){
		//Handle new stuff here
	}

	/*
		Sends POST request to server

		Takes in objective JSON to be sent
	*/
	function makeRequest(request){
		console.log(request);
		$.post("http://127.0.0.1:4000/", request);
	}

	/*
		Requests to send a message to the chat
	*/
	function sendMessage(){
		var message_text = $("#message_box").val();
		console.log(message_text);
		makeRequest(JSON.stringify({"message_contents": message_text}));
	}

	/*
		Currently a stub which should, given a username, return a JSON file with
		the necessary player attributes, such as visible layers, etc.
	*/
	function getPlayer(name){
		return {
			"follow": "global_img_example",
			"layers": [
				"layer1"
			]
		}
	}
})