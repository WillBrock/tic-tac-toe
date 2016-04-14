module.exports = (io) => {
	"use strict";

	let awaiting_players = {};
	let User             = require(`${__dirname}/models/User`);

	io.on('connection', (client) => {

		// Emit players waitng to play
		client.emit('awaiting-players', awaiting_players);

		client.on('disconnect', () => {
			if(awaiting_players[client.id]) {
				io.emit('delete-player', client.id);
				delete awaiting_players[client.id];
			}
		});

		// New player enters their name
		client.on('add-player', (player_name) => {
			awaiting_players[client.id] = {
				id          : client.id,
				player_name : player_name
			};

			io.emit('player-added', awaiting_players[client.id]);
		});
	});

};
