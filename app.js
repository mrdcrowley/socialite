// Include GPIO library
var gpio = require("gpio");
// Define GPIO 4 PIN as OUT
var gpio4 = gpio.export(4, { direction: 'out' });

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'),
	Tumblr = require('tumblrwks');

var tumblr = new Tumblr(
	{
		consumerKey: 'wbv0QjwCd2yUEODaaUOXR8Ni7P8phsWUNzYZqnK4lNUVNMpA36'
	}, urlTumblr
);

var fileServer = new static.Server('./');

var port_nr = 8080,
	delay = 120000,
	urlTumblr = 'slantback.tumblr.com';

app.listen(port_nr);
console.log("Server created on port " + port_nr);


function handler (request, response) {

	request.addListener('end', function () {
		fileServer.serve(request, response);
	});
}

//	Disable socket debug messages (logs)
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
	//	Listens and gets the data from 'pin' channel
	socket.on('pin', function (data) {
		led_function(data["status"]);
	});
});

//	Function that sets or resets (1 or 0) the GPIO pin
var led_function = function(status){
	switch(status){
		case "on":
			gpio4.set();
			break;
		case "off":
			gpio4.reset();
			break;
	}
};

console.log('===');

// Get new tumblr posts
var tumblrPostsOld,
	getTumblrPosts = function getTumblrPosts(){
	tumblr.get('/posts', {hostname: urlTumblr}, function(json){
		var tumblrPostsNew = json.posts;

		// give a value to old posts if doesn't exist
		if (!tumblrPostsOld) {
			tumblrPostsOld = tumblrPostsNew;
		}

		// loop through tumblr posts to compare note_counts
		for ( i = tumblrPostsNew.length - 1; i >= 0; i--) {
			var postsNew = tumblrPostsNew[i];
			for ( x = tumblrPostsOld.length - 1; x >= 0; x--) {
				var postsOld = tumblrPostsOld[x];

				// find matching id, if note_count doesn't match, light up
				if ( ( postsNew.id == postsOld.id ) && ( postsNew.note_count != postsOld.note_count ) ) {
					console.log( postsNew.id  + ' ' + postsNew.note_count );
					console.log( postsOld.id + ' ' + postsOld.note_count );
					console.log('YES');
					gpio4.set();

				//no match
				} else {
					gpio4.reset();
				}
			}
		}
		console.log( 'checked' );
		tumblrPostsOld = tumblrPostsNew;
	});
};

// Call it up
getTumblrPosts();
setInterval(getTumblrPosts,delay);
