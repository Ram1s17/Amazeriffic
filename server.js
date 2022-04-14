var express = require("express"),
	http = require("http"),
	// импортируем библиотеку mongoose
	mongoose = require("mongoose"),
	app = express(),
	toDos = [
		{
		"description" : "Купить продукты",
		"tags" : [ "шопинг", "рутина" ]
		},
		{
		"description" : "Сделать несколько новых задач",
		"tags" : [ "писательство", "работа" ]
		},
		{
		"description" : "Подготовиться к лекции в понедельник",
		"tags" : [ "работа", "преподавание" ]
		},
		{
		"description" : "Ответить на электронные письма",
		"tags" : [ "работа" ]
		},
		{
		"description" : "Вывести Грейси на прогулку в парк",
		"tags" : [ "рутина", "питомцы" ]
		},
		{
		"description" : "Закончить писать книгу",
		"tags" : [ "писательство", "работа" ]
		}
	];

app.use(express.static(__dirname + "/client"));

// командуем Express принять поступающие
// объекты JSON
app.use(express.urlencoded({ extended: true}));
// подключаемся к хранилищу данных Amazeriffic в Mongo
mongoose.connect('mongodb://localhost/amazeriffic', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true 
}).then(res => {
	console.log("DB Connected!")
}).catch(err => {
	console.log(Error, err.message);
});

// Это модель Mongoose для задач
var ToDoSchema = mongoose.Schema({
	description: String,
	tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);
// начинаем слушать запросы
http.createServer(app).listen(3000);


// этот маршрут замещает наш файл
// todos.json в примере из части 5
app.get("/todos.json", function (req, res) {
	ToDo.find({}, function (err, toDos) {
		if (err !== null) {
			console.log("ERROR" + err);
		}
		else {
			res.json(toDos);
		}
	});
});

app.post("/todos", function (req, res) {
	console.log(req.body);

	var newToDo = new ToDo({
		"description":req.body.description,
		"tags":req.body.tags
	});

	newToDo.save(function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send("ERROR");
		} else {
			// клиент ожидает, что будут возвращены все задачи,
			// поэтому для сохранения совместимости сделаем дополнительный запрос
			ToDo.find({}, function (err, result) {
				if (err !== null) {
					// элемент не был сохранен
					res.send("ERROR");
				}
				else {
					res.json(result);
				}
			});
		}
	});
}); 
