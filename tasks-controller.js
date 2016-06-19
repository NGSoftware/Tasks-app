//
// Implemetns the Singleton pattern to initialize the page just one time
//
	tasksController = function (){
		
		var taskPage;
		var initialised = false;
		
		function errorLogger(errorCode,errorMessage){
			console.error(errorCode + ':' + errorMessage);
		}
		
		function taskCountChanged(){
			var count = $(taskPage).find('#tblTasks tbody tr').length;
			$('footer').find('#taskCount').text(count);
		}

		function clearTask(){
			$(taskPage).find('form').fromObject({});
		}

		function renderTable(){
			$.each($(taskPage).find('#tblTasks tbody tr'), function (idx, row){
				var due = Date.parse($(row).find('[datetime]').text());
				if (due.compareTo(Date.today()) < 0){
					$(row).addClass("overdue");
				}
				else if (due.compareTo((2).days().fromNow()) <= 0){
					$(row).addClass("warning");
				}
			});
		}

		return{
			
			init: function(page, callback){
				if (initialised){
					callback()
				}
				else {
				
					taskPage = page;				

					storageEngine.init(function (){
						storageEngine.initObjectStore('task', function (){
							callback();
						},errorLogger)
					},errorLogger);

					$(taskPage).find('[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required');

					$(taskPage).find('tbody tr:odd').addClass('odd');

					$(taskPage).find('#btnAddTask').click(function (evt){
						evt.preventDefault();
						$(taskPage).find('#taskCreation').removeClass('not');
					});

					$(taskPage).find('#tblTasks tbody').on('click', 'tr', function (evt){
						evt.preventDefault();
						$(evt.target).closest('td').siblings().andSelf().toggleClass('rowHighlight');
					});

					$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', function (evt){
						evt.preventDefault();
						storageEngine.delete('task',$(evt.target).data().taskId,function (){
							$(taskPage).find('#tblTasks tbody tr:odd').removeClass('odd');
							$(taskPage).find(evt.target).parents('tr').remove();
							$(taskPage).find('#tblTasks tbody tr:odd').addClass('odd');
							//refresh counter
							taskCountChanged();
						},errorLogger);
					});

					$(taskPage).find('#saveTask').click(function (evt){
						evt.preventDefault();
						if($(taskPage).find('form').valid()){
							var task = $(taskPage).find('form').toObject();
							storageEngine.save('task',task,function (savedTask){
								//$('#taskRow').tmpl(savedTask).appendTo($(taskPage).find('#tblTasks tbody'));
								$(taskPage).find('#tblTasks tbody').empty();
								tasksController.loadTasks();
								//$(':input').val('');
								clearTask();
								$(taskPage).find('#taskCreation').addClass('not');
								//refresh counter
								taskCountChanged();
							}, errorLogger);
							//$(taskPage).find('tbody tr:odd').addClass('odd');						
						}
					});

					$(taskPage).find("#clearTask").click(function (evt){
						evt.preventDefault();
						clearTask();
					});

					$(taskPage).find('#tblTasks tbody').on('click', '.editRow', function (evt){
						evt.preventDefault();
						$(taskPage).find('#taskCreation').removeClass('not');
						storageEngine.findById('task',$(evt.target).data().taskId,function (task){
							$(taskPage).find('form').fromObject(task);
						},errorLogger);
					});

					$(taskPage).find('#tblTasks tbody').on('click', '.completeRow', function (evt){
						evt.preventDefault();
						$(taskPage).find('#taskCreation').removeClass('not');
						storageEngine.findById('task',$(evt.target).data().taskId,function (task){
							task.complete = true;
							storageEngine.save('task', task, function (){
								tasksController.loadTasks();
							}, errorLogger);
						},errorLogger);
					});

					initialised = true;

				}

			}, loadTasks: function (){
				storageEngine.findAll('task',function (tasks){
					
					tasks.sort(function (o1,o2 ){
						return Date.parse(o1.requiredBy).compareTo(Date.parse(o2.requiredBy));
					});

					$.each(tasks, function (index,task){
						if (!task.complete){
							task.complete = false;
						}
						$(taskPage).find('#tblTasks tbody tr:odd').removeClass('odd');
						$('#taskRow').tmpl(task).appendTo($(taskPage).find('#tblTasks tbody'));
						taskCountChanged();
						renderTable();
						$(taskPage).find('#tblTasks tbody tr:odd').addClass('odd');
					});
				}, errorLogger);
			}
		}
	}();