class Item {
  constructor(id, description, status) {
    this.description = description;
    this.status = status;
    this.id = id;
  }

  toggleStatus() {
    this.status = !this.status;
  }

  editDescription(newDescription) {
    this.description = newDescription;
  }
}

module.exports = { Item };
