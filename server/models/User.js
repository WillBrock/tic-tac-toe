"use strict";

let mongoose = require('mongoose');
let Schema   = mongoose.Schema;

let user_schema = new Schema({
	player_name : String,
	active      : Number
});

let User       = mongoose.model('User', user_schema);
module.exports = User;
