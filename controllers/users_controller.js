var User = require("../models/user.js"),
    ToDo = require("../models/todo.js"),
    mongoose = require("mongoose");

var UsersController = {};

//проверка, не существует ли уже пользователь
User.find({}, function (err, result) {
    if (err !== null) {
        console.log("Что-то идет не так");
        console.log(err);
    } else if (result.length === 0) {
        console.log("Создание тестового пользователя...");
        var exampleUser = new User({ "username": "usertest" });
        exampleUser.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Тестовый пользователь сохранен");
            }
        });
    }
});

UsersController.index = function (req, res) {
    console.log('Вызвано действие: UsersController.index');
    User.find(function (err, users) {
        if (err !== null) {
            res.json(500, err);
        } else {
            res.status(200).json(users);
        }
    });
};

//Найти пользователя по ID
UsersController.searchById = function (req, res) {
    var id = req.params.id;
    User.findOne({ "_id": id }, function (err, user) {
        if (err !== null) {
            res.json(500, err);
        } else {
            res.status(200).json(user);
        }
    });
};

//Найти пользователя
UsersController.search = function (req, res) {
    var username = req.params.username;
    User.findOne({ "username": username }, function (err, user) {
        if (err !== null) {
            res.json(500, err);
        } else {
            console.log(user);
            res.status(200).json(user);
        }
    });
};

//Отобразить пользователя
UsersController.show = function (req, res) {
    User.find({ 'username': req.params.username }, function (err, result) {
        if (err) {
            console.log(err);
        } else if (result.length !== 0) {
            if (result[0].role == "Администратор") {
                res.sendfile('./client/admin_panel.html');
            }
            else {
                res.sendfile('./client/list.html');
            }
        } else {
            res.send(404);
        }
    });
};

//Создать нового пользователя
UsersController.create = function (req, res) {
    var username = req.body.username;
    User.find({ "username": username }, function (err, result) {
        if (err) {
            res.send(500, err);
        } else if (result.length !== 0) {
            res.status(501).send("Пользователь уже существует!");
        } else {
            var newUser = new User({
                "username": username,
                "role": "Пользователь"
            });
            newUser.save(function (err, result) {
                if (err !== null) {
                    res.json(500, err);
                } else {
                    res.json(200, result);
                }
            });
        }
    });
};

//Обновить существующего пользователя
UsersController.update = function (req, res) {
    var username = req.params.username;
    var newUsername = { $set: { username: req.body.username } };
    User.updateOne({ "username": username }, newUsername, function (err, user) {
        if (err !== null) {
            res.status(500).json(err);
        } else {
            res.status(200).json(user);
        }
    });
};

//Удалить существующего пользователя
UsersController.destroy = function (req, res) {
    var id = req.params.id;
    User.deleteOne({ "_id": id }, function (err, user) {
        if (err !== null) {
            res.status(500).json(err);
        }
        else {
            ToDo.deleteMany({ "owner": id }, function (err, todo) {
                if (err !== null) {
                    res.status(500).json(err);
                } else {
                    res.json(user);
                }
            });
        }
    });
};

module.exports = UsersController;