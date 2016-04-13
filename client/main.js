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

	// List of all players wanting to play a game
	socket.on('awaiting-players', (players) => {
		console.log(players);
		console.log('awaiting_players');

		setAwatingPlayers(players);
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

	// Challenge an awaiting player to a game
	/*
	document.querySelector('.challenge-player').addEventListener('click', () => {

		socket.emit('challenge-player', () => {

		});

	});
	*/

	function setAwatingPlayers(players) {
		let container = document.querySelector('.waiting-users-container');
		let children  = document.querySelectorAll('.generated-item');

		if(children.length !== 0) {
			while(children[0]) {
				children[0].parentNode.removeChild(children[0]);
			}
		}

		for(let player_id in players) {
			let player         = players[player_id];
			let cloned_item    = document.querySelector('.player-item-hidden').cloneNode(true);
			let button_element = cloned_item.querySelector('.play-button');
			let name_element   = cloned_item.querySelector('.player-name');

			cloned_item.className  = "item generated-item";
			name_element.innerText = player.player_name;
			button_element.setAttribute('data-player-id', player.id);

			container.appendChild(cloned_item);
		}
	}
}());
