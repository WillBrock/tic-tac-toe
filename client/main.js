(function() {
	"use strict";

	let socket = io();
	let active_player_name;

	// Submit new player
	document.querySelector('.player-name-form').addEventListener('submit', (e) => {
		e.preventDefault();
		let player_name_input = document.querySelector('.player-name');
		active_player_name    = player_name_input.value;

		socket.emit('add-player', active_player_name);
		document.querySelector('.player-name-form').className += " hidden";
	});

	// Challange a user to a game
	document.querySelector('.play-button', function() {
		let player_id = this.getAttribute('data-player-id');

		// Remove the current user and challange user from the awaiting user list
	});

	// List of all players wanting to play a game
	socket.on('awaiting-players', (players) => {
		setAwatingPlayers(players, true);
	});

	// Add new player to the awaiting player list
	socket.on('player-added', (player) => {
		let player_object = {};
		player_object[player.id] = {
			id          : player.id,
			player_name : player.player_name
		}

		setAwatingPlayers(player_object);
	});

	socket.on('delete-player', (player_id) => {
		let player_class = player_id.replace(/\/|#/g, '');
		// Query selector doesn't like / or #
		let element      = document.querySelector(`.prefix-${player_class}`);

		element.parentNode.removeChild(element);
	});

	function setAwatingPlayers(players, all = false) {
		let container = document.querySelector('.waiting-users-container');
		let children  = document.querySelectorAll('.generated-item');

		if(children.length !== 0 && all) {
			while(children[0]) {
				children[0].parentNode.removeChild(children[0]);
			}
		}

		for(let player_id in players) {
			let player         = players[player_id];
			let cloned_item    = document.querySelector('.player-item-hidden').cloneNode(true);
			let button_element = cloned_item.querySelector('.play-button');
			let name_element   = cloned_item.querySelector('.player-name');
			let player_class   = player_id.replace(/\/|#/g, '');

			cloned_item.className  = `item generated-item prefix-${player_class}`;
			name_element.innerText = player.player_name;
			button_element.setAttribute('data-player-id', player.id);

			container.appendChild(cloned_item);
		}
	}
}());
