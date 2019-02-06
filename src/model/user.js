class User {
  constructor(userData) {
    this.name = userData.name;
    this.username = userData.username;
    this.password = userData.password;
    this.todoLists = userData.todoLists;
  }

  addTodo(todo) {
    this.todoLists.unshift(todo);
  }
  deleteTodo(todoId) {
    this.todoLists = this.todoLists.filter(todo => todo.id != todoId);
  }
}

module.exports = { User };
