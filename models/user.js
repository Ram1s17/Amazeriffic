var mongoose = require("mongoose");

// Это модель Mongoose для пользователей
var UserSchema = mongoose.Schema({
	username: String,
	role: String
});

var User = mongoose.model("User", UserSchema);
module.exports = User;