 var createPanel = function (UsersObjects) {
	var $input = $("<input>").addClass("input-username"),
		$butRegister = $("<button>").text("Создать аккаунт").addClass("authorization-btn"),
		$butEdit = $("<button>").text(" Изменить имя пользователя").addClass("authorization-btn"),
		$butDestroy = $("<button>").text("Удалить пользователя").addClass("authorization-btn");
		
	for (var i = 1; i < UsersObjects.length; i++) {
		$(".users-list").append($("<h3>").text(UsersObjects[i].username));
	}
	
	$butRegister.on("click", function() {
		var username = $input.val();
		if (username !== null && username.trim() !== "") {
			var newUser = {"username": username};
			$.post("/users", newUser, function(result) {
				console.log(result);
			}).done(function(response) {
				alert('Аккаунт пользователя успешно создан!');
			}).fail(function(jqXHR, textStatus, error) {
				if (jqXHR.status === 501) {
					alert("Такой пользователь уже существует!");
				} else {					
					alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
				}
			});
			location.reload();
		}
		else
            alert("Имя пользователя не задано!");
	});

	$butEdit.on("click", function(e) {
        e.preventDefault();
		if ($input.val() !== null && $input.val().trim() !== "") {
			var username = $input.val();
            $.get("/user/" + username, function(user){
                if (user != null) {
                    if (user.role != "Администратор") {
                        var newUsername = prompt("Введите новый имя пользователя", $input.val());
                        if (newUsername !== null && newUsername.trim() !== "") {
                            $.ajax({
                                'url': '/users/' + username,
                                'type': 'PUT',
                                'data': {'username': newUsername}
                            }).done(function(responde) {
                                alert('Имя пользователя успешно изменено!');
                            }).fail(function(jqXHR, textStatus, error) {
                                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                            });
                            location.reload();
                        }
                        else 
                            alert("Новое имя пользователя не задано!");
                    }
                    else {
                        alert("Изменение аккаунта администратора запрещено!");
                        $input.val("");
                    }
                }
                else {
                    alert("Данный пользователь отсутствует в системе!");
                    $input.val("");
                }
            });
		}
        else
            alert("Имя пользователя не задано!");
	});

	$butDestroy.on("click", function(e) {
		e.preventDefault();
		if ($input.val() !== null && $input.val().trim() !== "") {
			var username = $input.val();
            $.get("/user/" + username, function(user){
                if (user != null) {
                    if (user.role != "Администратор") {
                        if (confirm("Вы уверены, что хотите удалить польователя «" + username + "»?")) {
                            $.ajax({
                                'url': '/users/' + user._id,
                                'type': 'DELETE',
                            }).done(function(responde) {
                                alert('Аккаунт пользователя успешно удален!');
                            }).fail(function(jqXHR, textStatus, error) {
                                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                            });
                            location.reload();
                        }
                    }
                    else {
                        alert("Удаление аккаунта администратора запрещено!");
                        $input.val("");
                    }
                }
                else {
                    alert("Данный пользователь отсутствует в системе!");
                    $input.val("");
                }
            });
		}
        else
            alert("Имя пользователя не задано!");
	});

	$(".admin-panel").append($input);
	$(".admin-panel").append($butRegister);
	$(".admin-panel").append($butEdit);
    $(".admin-panel").append($butDestroy);
};

var main = function (UsersObjects) {
	"use strict";

    createPanel(UsersObjects);

    //создание пустого массива с вкладками
    var tabs = [];

    //вкладка Новые
    tabs.push({
        "name": "Новые",
        //Создаем функцию content
        //так, что она принимает обратный вызов
        "content": function(callback) {
            $.getJSON("/todos.json", function(toDoObjects){
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
            $.getJSON("/todos.json", function (toDoObjects) {
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
            $.get("/todos.json", function (toDoObjects) {	
                // создание $content для Теги 
                var organizedByTag = organizeByTags(toDoObjects),
                    $content;
                organizedByTag.forEach(function (tag) {
                    var $tagName = $("<h3>").text(tag.name);
                        $content = $("<ul>");
                    var i = 0;
                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text("Описание задачи: " +description);
                        $.get("/userID/" + tag.owners[i], function(owner) {
                            if (owner != null) {
                                 $li.append($("<h4>").text("Задача принадлежит: " + owner.username));
                            }
                        });
                        i++;
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
                    '<input type="text" class="input-name">Имя пользователя</input><br>' + 
                    '<input type="text" class="input-task">Описание</input><br>'+
                    '<input type="text" class="input-tag">Теги</input><br>'+ 
                    '<button class="add-task-btn">Добавить</button>'
                );

                $('.add-task-btn').on('click',function(){
                    var username = $('.input-name').val().trim();
                    var description = $('.input-task').val().trim();
                    var newTags = $('.input-tag').val().trim();
                    if ((description != '') && (newTags != '') && (username != '')) {
                        var tags = newTags.split(",");

                        $.get("/user/" + username, function(owner) {
                            if (owner != null) {
                                // создаем новый элемент списка задач
                                var newToDo = {"description":description, "tags":tags, "owner": owner._id};

                                $.post("/todos", newToDo, function (result){					
                                    $(".tabs a:first-child span").trigger("click");
                                });

                                alert('Новое задание "' + description + '" успешно добавлено!');
                                $('.input-task').val("");
                                $('.input-tag').val("");
                           }
                           else {
                               alert("Пользователь отсутствует в системе!");
                           }
                       });
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
        var owners = [];
		toDoObjects.forEach(function (toDo){
			//проверка, что результат indexOf не равен -1
			if (toDo.tags.indexOf(tag) !== -1){
				toDosWithTag.push(toDo.description);
                owners.push(toDo.owner);
			}
		});
		//связываем каждый тег с объектом, который
		//содержит название тега и массив
		return {"name":tag, "toDos":toDosWithTag, "owners": owners};
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
	var $todoListItem = $("<li>").text("Описание задачи: " + todo.description),
		$todoEditLink = $("<a>").attr("href", "todos/" + todo._id),
		$todoRemoveLink = $("<a>").attr("href", "todos/" + todo._id);
	
    $.get("/userID/" + todo.owner, function(owner) {
        if (owner != null) {
            $todoListItem.append($("<h4>").text("Задача принадлежит: " + owner.username));
        }
    });
    
	$todoRemoveLink.text(" Удалить");

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
	$.getJSON("/users.json", function (UsersObjects) {
		main(UsersObjects);
	});
});