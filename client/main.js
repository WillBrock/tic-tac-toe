(function() {
	"use strict";

	let socket        = io();
	let current_turn  = false;
	let player_letter = 'X';
	let squares       = document.getElementsByClassName('square');

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
		document.querySelector('.player-name-form').classList.add('hidden');
	});

	// Click a cell on the board
	for(var i = 0; i < squares.length; i++) {
		squares[i].addEventListener('click', clickBoard);
	}

	// List of all players wanting to play a game
	socket.on('awaiting-players', (players) => {
		setAwatingPlayers(players, true);
	});

	// Add new player to the awaiting player list
	socket.on('player-added', (player) => {
		let player_object = {};
		player_object[player.id] = {
			id   : player.id,
			name : player.name
		};

		setAwatingPlayers(player_object);
	});

	// Removes a player from the awaiting players list
	socket.on('delete-player', (player_id) => {
		let player_class = player_id.replace(/\/|#/g, '');
		// Query selector doesn't like / or #
		let element = document.querySelector(`.prefix-${player_class}`);

		element.parentNode.removeChild(element);
	});

	// Alert a user that they have been challenged and the game has started
	// The player that challenged will make the first move
	socket.on('player-challenged', (opponent) => {
		// Set the opponents letter to O
		player_letter = 'O';

		clearBoard();
		setOpponentName(opponent.name);
		toggleText('waiting-your-turn', 'your-turn');
	});

	// Update the board after a player has taken a turn
	socket.on('update-turn', (data) => {
		markBoard(data.letter, data.cell);
		toggleText('your-turn', 'waiting-your-turn');

		if(data.win) {
			markWinner(false);
		}
		else {
			current_turn = true;
		}
	});

	/**
	 * Player challanges another player to a game
	 * @return void
	 */
	function challangePlayer() {
		let player_id   = this.getAttribute('data-player-id');
		let player_name = this.getAttribute('data-player-name');

		// Clear existing marks from previous games
		clearBoard();

		setOpponentName(player_name);

		socket.emit('challange-player', player_id);

		toggleText('your-turn', 'waiting-your-turn');
		current_turn = true;
	}

	/**
	 * Displays all players that are wanting to play
	 * @param object  players
	 * @param bool    all
	 */
	function setAwatingPlayers(players, all = false) {
		let container = document.querySelector('.waiting-users-container');
		let children  = document.querySelectorAll('.generated-item');

		if(children.length !== 0 && all) {
			while(children[0]) {
				if(!children[0].parentNode) {
					break;
				}

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
			name_element.innerText = player.name;
			button_element.setAttribute('data-player-name', player.name);
			button_element.setAttribute('data-player-id', player.id);

			button_element.addEventListener('click', challangePlayer);

			container.appendChild(cloned_item);
		}
	}

	/**
	 * A player makes a move
	 * @return void
	 */
	function clickBoard() {
		let value = this.getAttribute('data-value');
		let cell  = this.getAttribute('data-cell');

		// Only continue if it's the current users turn or the cell has been used
		if(!current_turn || value) {
			return;
		}

		markBoard(player_letter, cell);

		// Check for a winner
		let winner = isWinner();

		if(winner) {
			markWinner(true);
		}

		socket.emit('take-turn', {
			cell   : cell,
			letter : player_letter,
			win    : winner
		});

		if(!winner) {
			toggleText('waiting-your-turn', 'your-turn');
		}

		current_turn = false;
	}

	/**
	 * Mark the board with a players turn
	 * @param  text     letter either X or O
	 * @param  int      cell   position on the board
	 * @return void
	 */
	function markBoard(letter, cell) {
		let squares       = document.querySelectorAll('.square');
		let element       = document.createElement('span');
		element.innerText = letter;

		for(let i = 0; i < squares.length; i++) {
			let square       = squares[i];
			let current_cell = square.getAttribute('data-cell');

			if(current_cell === cell) {
				square.setAttribute('data-value', letter);
				square.appendChild(element);
				break;
			}
		}
	}

	/**
	 * Toggles the text when a player takes a turn
	 * @param  {[type]} class_name        [description]
	 * @param  {[type]} hidden_class_name [description]
	 * @return {[type]}                   [description]
	 */
	function toggleText(class_name, hidden_class_name) {
		let turn       = document.querySelector(`.${class_name}`);
		turn.classList.remove('hidden');

		let hidden       = document.querySelector(`.${hidden_class_name}`);
		hidden.classList.add('hidden');
	}

	/**
	 * Determine if there is a winning combination on the board
	 * @return bool [description]
	 */
	function isWinner() {
		let squares = document.querySelectorAll('.square');

		// Loop through each win combination
		for(let i = 0; i < wins.length; i++) {
			let win             = wins[i];
			let matches         = 0;
			let existing_letter = false;

			// Loop through each value in the win combination
			for(let x = 0; x < wins[x].length; x++) {
				let win_value = +win[x];

				// Loop through the squares
				for(let z = 0; z < squares.length; z++) {
					let square = squares[z];
					let letter = square.getAttribute('data-value');
					let cell   = +square.getAttribute('data-cell');

					// If there has not been any moves on this cell, nothing to do
					if(!letter) {
						continue;
					}

					// If we've already used a letter and the current letter doesn't match,
					// Then we don't have a win
					if(existing_letter && existing_letter !== letter) {
						continue;
					}

					// Nothing to do if the value doesn't match the cell
					if(win_value !== cell) {
						continue;
					}

					// If we get here we have a match
					existing_letter = letter;

					// If matches gets to 3, we have a winner
					matches++;
				}
			}

			// Here we can mark as won
			if(matches === 3) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Clear the board of existing marks from previous games
	 * @return void
	 */
	function clearBoard() {
		let squares = document.querySelectorAll('.square');
		for(let i = 0; i < squares.length; i++) {
			let square = squares[i];
			square.setAttribute('data-value', null);
		}
	}

	/**
	 * Display the text that a user has either won or lost
	 * @param  bool
	 * @return void
	 */
	function markWinner(winner) {
		let playing_fields = document.querySelectorAll('.playing-fields');
		let result_field   = document.querySelector('.winning-result');
		let winning_text   = winner ? 'You win!' : 'You loose!';

		for(let i = 0; i < playing_fields.length; i++) {
			let field = playing_fields[i];
			field.classList.add('hidden');
		}

		result_field.innerText = winning_text;
		result_field.classList.remove('hidden');
	}

	/**
	 * Sets the name of a players opponent
	 * @param text name opponent
	 */
	function setOpponentName(name) {
		let challenger_container = document.querySelector('.currently-playing-container');
		let challenger_field     = document.querySelector('.currently-playing');

		// Remove the hidden class
		challenger_container.classList.remove('hidden');

		challenger_field.innerText = name;
	}
}());
