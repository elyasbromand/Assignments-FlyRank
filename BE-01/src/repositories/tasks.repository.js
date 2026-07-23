const tasks = [
  { id: 1, title: "Journal Writing", done: false },
  { id: 2, title: "Exercise", done: true },
  { id: 3, title: "Read a book", done: false },
];

function getAllTasks() {
  return tasks;
}

function getTaskById(id) {
  return tasks.find(task => task.id === id);
}

function createTask(title) {
  const newTask = {
    id: tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1,
    title,
    done: false,
  };

  tasks.push(newTask);
  return newTask;
}

function updateTask(id, changes) {
  const task = tasks.find(task => task.id === id);
  if(!task) return null;
  Object.assign(task, changes);
  return task;
}

function deleteTask(id)
{
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

export {getAllTasks, getTaskById, createTask, updateTask, deleteTask};