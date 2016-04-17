"use strict";

let express  = require('express');
let app      = express();
let http     = require('http').Server(app);
let io       = require('socket.io')(http);
let port     = 45689;

app.use(express.static(`${__dirname}/`));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/client/main.html`);
});

require(`${__dirname}/server/main.js`)(io);

http.listen(port, () => {
	console.log(`Listening on port...... ${port}`);
});
