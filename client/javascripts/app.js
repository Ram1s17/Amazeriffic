var main = function (toDoObjects) {
	"use strict";
	//создание пустого массива с вкладками
	var tabs = [];

	//вкладка Новые
	tabs.push({
		"name": "Новые",
		//Создаем функцию content
		//так, что она принимает обратный вызов
		"content": function(callback) {
			$.getJSON("todos.json", function(toDoObjects){
				var $content = $("<ul>");
				for (var i = toDoObjects.length-1; i>=0; i--) {
					var $todoListItem = liaWithEditOrDeleteOnClick(toDoObjects[i], function(){
						$(".tabs a:first-child span").trigger("click");
					});
					$content.append($todoListItem);
				}
				callback(null, $content);
			}).fail(function(jqXHR, textStatus, error){
				callback(error, null);
			});
		}
	});

	// добавляем вкладку Старые
	tabs.push({
		"name": "Старые",
		"content": function(callback) {
			$.getJSON("todos.json", function (toDoObjects) {
				var $content;
				$content = $("<ul>");
				for (var i = 0; i < toDoObjects.length; i++) {
					var $todoListItem = liaWithEditOrDeleteOnClick(toDoObjects[i], function() {
						$(".tabs a:nth-child(2) span").trigger("click");
					});
					$content.append($todoListItem);
				}
				callback(null, $content);
			}).fail(function(jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	// добавляем вкладку Теги
	tabs.push({
		"name": "Теги",
		"content":function (callback) {
			$.get("todos.json", function (toDoObjects) {	
				// создание $content для Теги 
				var organizedByTag = organizeByTags(toDoObjects),
					$content;
				organizedByTag.forEach(function (tag) {
					var $tagName = $("<h3>").text(tag.name);
						$content = $("<ul>");
					tag.toDos.forEach(function (description) {
						var $li = $("<li>").text(description);
						$content.append($li);
					});
					$("main .content").append($tagName);
					$("main .content").append($content);
				});
				callback(null,$content);
			}).fail(function (jqXHR, textStatus, error) {
				// в этом случае мы отправляем ошибку вместе с null для $content
				callback(error, null);
			});
		}
	});

	// создаем вкладку Добавить
	tabs.push({
		"name": "Добавить",
		"content":function () {
			$.get("todos.json", function (toDoObjects) {	
				$("main .content").append(
					'<input type="text" class="input-task">Описание</input><br>'+
					'<input type="text" class="input-tag">Теги</input><br>'+ 
					'<button class="add-task-btn">Добавить</button>'
				);
				

				$('.add-task-btn').on('click',function(){
					var description = $('.input-task').val().trim();
					var newTags = $('.input-tag').val().trim();
					if ((description != '') && (newTags != '')) {
						var tags = newTags.split(",");

						// создаем новый элемент списка задач
						var newToDo = {"description":description, "tags":tags};

						$.post("todos", newToDo, function (result){					
							$(".tabs a:first-child span").trigger("click");
						});

						alert('Новое задание "' + description + '" успешно добавлено!');
						$('.input-task').val("");
						$('.input-tag').val("");
					}
				});
				$(".tags").keyup(function(event){
					if (event.keyCode == 13) {
						$(".add-task-btn").click();
					}
				})
			});
		}
	});

	tabs.forEach(function (tab) {
		var $aElement = $("<a>").attr("href",""),
			$spanElement = $("<span>").text(tab.name);
		$aElement.append($spanElement);
		$("main .tabs").append($aElement);

		$spanElement.on("click", function () {
			var $content;
			$(".tabs a span").removeClass("active");
			$spanElement.addClass("active");
			$("main .content").empty();
			tab.content(function (err, $content) {
				if (err !== null) {
					alert ("Возникла проблема при обработке запроса: " + err);
				} else {
					$("main .content").append($content);
				}
			});
			return false;
		});
	});

	$(".tabs a:first-child span").trigger("click");
};

var organizeByTags = function(toDoObjects) {
	//Создание пустого массива для тегов
	var tags = [];
	//перебираем все задачи toDos
	toDoObjects.forEach(function(toDo){
		//перебираем все теги для каждой задачи
		toDo.tags.forEach(function (tag) {
			//убеждаемся, что этого тега еще нет в массиве
			if (tags.indexOf(tag) === -1) {
				tags.push(tag);
			}
		});
	});

	var tagObjects = tags.map(function (tag){
		//находим все задачи, содержащие этот тег
		var toDosWithTag = [];
		toDoObjects.forEach(function (toDo){
			//проверка, что результат indexOf не равен -1
			if (toDo.tags.indexOf(tag) !== -1){
				toDosWithTag.push(toDo.description);
			}
		});
		//связываем каждый тег с объектом, который
		//содержит название тега и массив
		return {"name":tag, "toDos":toDosWithTag };
	});

	return tagObjects;
};

var getDescription = function(toDoObjects) {
	var toDos = toDoObjects.map(function (toDo) {
		// просто возвращаем описание
		// этой задачи
		return toDo.description;
	});
	return toDos;
}


var liaWithEditOrDeleteOnClick = function(todo) {
	var $todoListItem = $("<li>").text(todo.description),
		$todoEditLink = $("<a>").attr("href", "todos/" + todo._id),
		$todoRemoveLink = $("<a>").attr("href", "todos/" + todo._id);
	
	$todoRemoveLink.text(" Удалить");
	console.log("todo._id: " + todo._id);
	console.log("todo.description: " + todo.description);

	$todoRemoveLink.on("click", function () {
		$.ajax({
			"url": "/todos/" + todo._id,
			"type": "DELETE"
		}).done(function (response) {
			$(".tabs a:first-child span").trigger("click");
		}).fail(function (err) {
			console.log("error on delete 'todo'!");
		});
		return false;
	});
	
	$todoListItem.append($todoRemoveLink);

	$todoEditLink.text(" Редактировать");
	$todoEditLink.on("click", function(){
		var newDescription = prompt("Введите новое название задачи:", todo.description);
		if (newDescription !== null && newDescription.trim() !== ""){
			$.ajax({
				"url": "/todos/" + todo._id,
				"type": "PUT",
				"data": {"description": newDescription},
			}).done(function (response){
				$(".tabs a:first-child span").trigger("click");
			}).fail(function (err){
				console.log("ERROR" + err);
			})
		}
		return false;
	})
	$todoListItem.append($todoEditLink);

	return $todoListItem;
};


$(document).ready(function () {
	$.getJSON("/todos.json", function (toDoObjects) {
		// вызов функции main с аргументом в виде объекта toDoObjects
		main(toDoObjects);
	});
});