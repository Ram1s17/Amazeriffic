var main = function (toDoObjects) { 
    "use strict";

    var toDos = toDoObjects.map(function (toDo) { 
		// просто возвращаем описание 
		// этой задачи 
		return toDo.description; 
	});
    $(".tabs a span").toArray().forEach(function (element) { 
	    // создаем обработчик щелчков для этого элемента 
	    $(element).on("click", function () {
	        // поскольку мы используем версию элемента jQuery,
	        // нужно создать временную переменную,
	        // чтобы избежать постоянного обновления
	        var $element = $(element);
	        $(".tabs a span").removeClass("active"); 
	        $(element).addClass("active");
	        $("main .content").empty();

	        if ($element.parent().is(":nth-child(1)")) { 
	            for (var i = toDos.length-1; i > -1; i--) { 
		            $(".content").append($("<li>").text(toDos[i]));
	            }
	        } 
	        else if ($element.parent().is(":nth-child(2)")) { 
		        toDos.forEach(function (todo) { 
			        $(".content").append($("<li>").text(todo));
		        });
	        }
			else if ($element.parent().is(":nth-child(3)")) { 
				// ЭТО КОД ДЛЯ ВКЛАДКИ ТЕГИ 
				console.log("Щелчок на вкладке Теги"); 
			} 
	        else if ($element.parent().is(":nth-child(4)")) { 
		        $(".content").append(
		            '<input type="text" class="inp">'+
			        '<button class="btn">Добавить</button>'
		        );
	            var newToDo;
		        $('.btn').on('click',function(){
		            newToDo= $('.inp').val();
		            if (newToDo!='') {
		                toDos.push( newToDo);
			            alert('Новое задание "'+newToDo+'" успешно добавлено!');
			            $('.inp').val("");
		            }
	            })
	        }
	        return false;
	    })
    })
    $(".tabs a:first-child span").trigger("click");
};
$(document).ready(function () { 
	$.getJSON("todos.json", function (toDoObjects) { 
		// вызов функции main с аргументом в виде объекта toDoObjects 
		main(toDoObjects); 
	}); 
});