module.exports = (io) => {
	"use strict";

	let awaiting_players = {};
	let User             = require(`${__dirname}/models/User`);
	let client_id        = null;

	io.on('connection', (client) => {

		// Emit players waitng to play
		client.emit('awaiting-players', awaiting_players);

		// Disconnect the client
		client.on('disconnect', () => {
			if(awaiting_players[client.id]) {
				io.emit('delete-player', client.id);
				delete awaiting_players[client.id];
			}
		});

		// New player enters their name
		client.on('add-player', (player_name) => {
			awaiting_players[client.id] = {
				id   : client.id,
				name : player_name
			};

			client.broadcast.emit('player-added', awaiting_players[client.id]);
		});

		// One player challanges another
		client.on('challange-player', (accepting_user) => {
			// Need to create the new game room

			// Emit to the accepting user that someone has challenged them
			io.sockets.connected[accepting_user].emit('player-challenged', 'blah');
		});

		// A player takes a turn
		client.on('take-turn', (data) => {

		});
	});

};
