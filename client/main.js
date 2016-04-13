(function() {
	"use strict";

	let socket = io();

	document.querySelector('.player-name-form').addEventListener('submit', (e) => {
		e.preventDefault();
		let player_name_input = document.querySelector('.player-name');
		let player_name       = player_name_input.value;
		console.log('asdf');

		socket.emit('add-player', player_name);
		player_name.className += "hidden";
	});
}());
