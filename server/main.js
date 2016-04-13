module.exports = (io) => {
	"use strict";

	io.on('connection', (client) => {
		console.log('Client connected...');
	});
};
