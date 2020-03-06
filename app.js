const http = require("http");

var server = http.createServer(requestHandler).listen(4000, error => {
	if(error){
		console.log("Error spinning up server");
	}else{
		console.log("Server Ready @ localhost:4000");
	}
});

function requestHandler(request, response){
	var send_message = "data to send to client";
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(send_message);
	response.end("");
}