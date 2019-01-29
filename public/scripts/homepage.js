const removeCookie = function() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

let selectedListId;

const addItem = function() {
  const itemDesc = document.getElementById("addItemBox").value;

  fetchItems(selectedListId, "/addItem", {
    method: "POST",
    body: JSON.stringify({ desc: itemDesc, id: selectedListId })
  });
};

const createItemBox = function(details) {
  let items = details.items;

  let itemsHtml = items.map(item => {
    return `<p id=${item.id}>` + item.description + "</p>";
  });
  document.getElementById("items").innerHTML = itemsHtml.join("");
  document.getElementById("title").innerHTML = `<h1>${details.title}</h1>`;
};

const getItems = function(data, clickedListId) {
  const todoLists = JSON.parse(data).todoLists;
  const matchedLists = todoLists.filter(list => list.id == clickedListId);

  selectedListId = +matchedLists[0].id;
  return { items: matchedLists[0].items, title: matchedLists[0].title };
};

const fetchItems = function(clickedListId, url = "/getData", details) {
  fetch(url, details)
    .then(response => response.text())
    .then(data => getItems(data, clickedListId))
    .then(details => createItemBox(details));
};

const addList = function() {
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
