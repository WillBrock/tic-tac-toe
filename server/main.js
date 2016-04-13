module.exports = (io) => {
	"use strict";

	let awaiting_players = {};
	let User             = require(`${__dirname}/models/User`);

	io.on('connection', (client) => {

		// Emit players waitng to play
		io.emit('awaiting-players', awaiting_players);

		client.on('disconnect', () => {
			delete awaiting_players[client.id];

			console.log('blah');

			io.emit('awaiting-players', awaiting_players);
		});

		// New player enters their name
		client.on('add-player', (player_name) => {
			console.log('add-player');

			awaiting_players[client.id] = {
				id          : client.id,
				player_name : player_name
			};

			io.emit('player-added', awaiting_players[client.id]);
		});
	});

};
