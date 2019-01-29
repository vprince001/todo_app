const removeCookie = function() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

const createItemsHtml = function(items) {
  let itemsHtml = items.map(item => {
    return `<p id=${item.id}>` + item.description + "</p>";
  });
  return itemsHtml.join("");
};

const getItems = function(data, clickedListId) {
  const todoLists = JSON.parse(data).todoLists;
  const matchedLists = todoLists.filter(list => list.id == clickedListId);
  return matchedLists[0].items;
};

const fetchItems = function(clickedListId) {
  fetch("/getData")
    .then(response => response.text())
    .then(data => getItems(data, clickedListId))
    .then(items => createItemsHtml(items))
    .then(
      itemsHtml => (document.getElementById("items").innerHTML = itemsHtml)
    );
};

const updateList = function() {
  const listTitle = document.getElementById("addListBox").value;
  fetchLists("/addList", { method: "POST", body: listTitle });
};

const getLists = function(data) {
  const userData = JSON.parse(data);
  return userData.todoLists;
};

const createListsHtml = function(lists) {
  let listsHtml = lists.map(list => {
    return (
      `<p id=${list.id} onclick=fetchItems(event.target.id)>` +
      list.title +
      "</p>"
    );
  });
  return listsHtml.join("");
};

const fetchLists = function(url, details) {
  fetch(url, details)
    .then(response => response.text())
    .then(data => getLists(data))
    .then(lists => createListsHtml(lists))
    .then(
      listsHtml => (document.getElementById("lists").innerHTML = listsHtml)
    );
};

window.onload = fetchLists.bind(null, "/getData");
