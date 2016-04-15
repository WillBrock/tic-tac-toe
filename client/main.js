(function() {
	"use strict";

	let socket        = io();
	let current_turn  = false;
	let player_letter = 'X';
	let current_room  = null;

	// Different win combinations
	let wins = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 4, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 5, 9],
		[3, 5, 7]
	];

	// Submit new player
	document.querySelector('.player-name-form').addEventListener('submit', (e) => {
		e.preventDefault();
		let player_name_input = document.querySelector('.player-name');

		socket.emit('add-player', player_name_input.value);
		document.querySelector('.player-name-form').className += " hidden";
	});

	// Click a cell on the board
	document.querySelector('.square').addEventListener('click', function() {
		// Only continue if it's the current users turn or the cell has been used
		if(!current_turn || this.getAttribute('data-value')) {
			return;
		}

		let element = document.createElement('span');
		element.setAttribute('data-value', player_letter);
		element.innerText(player_letter);

		this.appendChild(element);

		socket.emit('take-turn', {
			cell : this.getAttribute('data-cell'),
			room : current_room
		});

		// Check for a winner
		let winner = checkWinner();
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
		let element = document.querySelector(`.prefix-${player_class}`);

		element.parentNode.removeChild(element);
	});

	socket.on('test', (msg) => {
		console.log(msg);
	});

	function challangePlayer() {
		let player_id = this.getAttribute('data-player-id');

		console.log('challange function');
		socket.emit('challange-player', player_id);
	}

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

			button_element.addEventListener('click', challangePlayer);

			container.appendChild(cloned_item);
		}
	}

	function checkWinner() {

	}
}());
