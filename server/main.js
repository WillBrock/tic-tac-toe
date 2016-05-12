module.exports = (io) => {
	"use strict";

	let awaiting_players = {};
	let active_games     = {};

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
			let opponent = awaiting_players[client.id];
			let room     = client.id;

			// Add players to the active games
			active_games[client.id] = {
				room : room
			};

			active_games[accepting_user] = {
				room : room
			};

			// Delete the users from the awaiting players list
			delete awaiting_players[client.id];
			delete awaiting_players[accepting_user];

			// Need to create the new game room
			client.join(room);
			io.sockets.connected[accepting_user].join(room);

			// Send the updated awaiting players list
			io.in(room).emit('awaiting-players', awaiting_players);

			// Emit to the accepting user that someone has challenged them
			io.sockets.connected[accepting_user].emit('player-challenged', {
				id   : client.id,
				name : opponent.name
			});
		});

		// Player takes a turn
		client.on('take-turn', (data) => {
			let room = active_games[client.id].room;
			client.broadcast.in(room).emit('update-turn', data);
		});

		// @todo Game over
		client.on('game-over', (data) => {

		});
	});

};
