$(document).ready(function(){
//GLOBAL VARIABLES =========================================================
	var world = "world_JSON";
	var request_queue = []

//SETUP ========================================
	getWorld();

	setTimeout(() => {
//MAIN CODE ===============================================================
			setInterval(getWorld(), 500);		//Every 500 ms, update my understanding of the world
			setInterval(() => {
				if(request_queue.length > 0){
					console.log("Sending Request to Server");
					makeRequest(request_queue.shift());
				}
			}, 500)		//Every 500 ms, send a request, if we have one

			// console.log(JSON.parse(localStorage.getItem(world)));
			request_queue.push(localStorage.getItem(world));
	}, 100);
//FUNCTION DEFINITIONS ==============================================================
	/*
		Gets the world.json file from server

		JSON is stored in localStorage @ location: var world
	*/
	function getWorld(){
		$.getJSON("/world.json", (data) => {
			localStorage.setItem(world, JSON.stringify(data));
		})
	}

	/*
		Sends POST request to server

		Takes in json string to be sent
	*/
	function makeRequest(request){
		// $.ajax({
	 //        dataType: 'jsonp',
	 //        data: JSON.stringify(request),                      
	 //        // jsonp: 'callback',
	 //        url: 'http://localhost:4000/?callback=?',                     
	 //        success: function(data) {
	 //             //LOG
	 //             console.log('success');
	 //             console.log(JSON.stringify(data));               
	 //        }
	 //    });
		var http = new XMLHttpRequest();
	    http.open("POST", "http://127.0.0.1:4000/", true);
		http.setRequestHeader("Content-Type", "application/json");
		// http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		// console.log(request);
	    http.send(request);
	}
})