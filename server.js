var express = require("express"),
	http = require("http"),
	// импортируем библиотеку mongoose
	mongoose = require("mongoose"),
	app = express(),
	toDosController = require("./controllers/todos_controller.js"),
	UsersController = require("./controllers/users_controller.js");

app.use('/', express.static(__dirname + "/client"));
// app.use('/users/:username', express.static(__dirname + "/client"));

// командуем Express принять поступающие
// объекты JSON
app.use(express.urlencoded({ extended: true}));

// подключаемся к хранилищу данных Amazeriffic в Mongo
mongoose.connect('mongodb://localhost/amazeriffic',{
				useNewUrlParser: true,
				useCreateIndex: true,
				useUnifiedTopology: true
}).then(res => {
	console.log("DB connected");
}).catch(err => {
	console.log("ERROR" + err);
});

// начинаем слушать запросы
http.createServer(app).listen(3000);


app.get("/todos.json", toDosController.index);
app.get("/todos/:id", toDosController.show); 
app.post("/todos", toDosController.createTaskForUser);
app.put("/todos/:id", toDosController.update);
app.delete("/todos/:id", toDosController.destroy);

app.get("/users.json", UsersController.index);
app.get("/user/:username", UsersController.search);
app.get("/userID/:id", UsersController.searchById);
app.get("/users/:username", UsersController.show);
app.post("/users", UsersController.create);
app.put("/users/:username", UsersController.update);
app.delete("/users/:id", UsersController.destroy);

app.get("/users/:username/todos.json", toDosController.index);
app.post("/users/:username/todos", toDosController.create);
app.put("/users/:username/todos/:id", toDosController.update);
app.delete("/users/:username/todos/:id", toDosController.destroy);