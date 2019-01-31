let selectedListId;

const deleteItem = function(event) {
  let itemId = event.target.id;

  fetch("/deleteItem", {
    method: "POST",
    body: JSON.stringify({ itemId: itemId, listId: selectedListId })
  })
    .then(response => response.text())
    .then(data => getItems(data, selectedListId))
    .then(details => createItemBox(details));
};

const addItem = function() {
  const itemDesc = document.getElementById("addItemTextBox").value;
  const event = { target: { id: selectedListId } };
  fetchItems(event, "/addItem", {
    method: "POST",
    body: JSON.stringify({ desc: itemDesc, id: selectedListId })
  });
};

const createHtmlElement = function(
  tag,
  text = "",
  id = "",
  method = "",
  type = ""
) {
  const element = document.createElement(tag);
  element.innerText = text;
  element.id = id;
  element.onclick = method;
  element.type = type;
  return element;
};

const changeTodoDescription = function() {
  const description = document.getElementById("todoDescription").innerText;

  console.log(",,,,,,,>", description);
};

const changeTodoTitle = function() {
  const titleDiv = document.getElementById("todoTitle");
  const text = titleDiv.innerText;

  const parentDiv = titleDiv.parentElement;
  const inputBox = createHtmlElement(
    "input",
    "",
    "todoTitleTextBox",
    "",
    "text"
  );
  inputBox.value = text;
  parentDiv.replaceChild(inputBox, titleDiv);
};

const createHeadDiv = function(itemDetails) {
  const headDiv = createHtmlElement("div");
  const title = createHtmlElement(
    "h1",
    itemDetails.title,
    "todoTitle",
    changeTodoTitle
  );

  const description = createHtmlElement(
    "h3",
    itemDetails.description,
    "todoDescription",
    changeTodoDescription
  );

  const inputBox = createHtmlElement("input", "", "addItemTextBox", "", "text");
  const addItemButton = createHtmlElement("button", "Add", "", addItem);

  headDiv.appendChild(title);
  headDiv.appendChild(description);
  headDiv.appendChild(inputBox);
  headDiv.appendChild(addItemButton);
  return headDiv;
};

const editItem = function() {
  const id = event.target.id;

  const descDiv = document.getElementById(id);
  const text = descDiv.innerText;

  const itemDiv = descDiv.parentElement;
  const textBox = createHtmlElement("textArea", text, id);
  itemDiv.replaceChild(textBox, descDiv);
};

const createBodyDiv = function(itemDetails) {
  const bodyDiv = createHtmlElement("div");
  itemDetails.items.forEach(item => {
    const itemDiv = createHtmlElement("div");
    const description = createHtmlElement(
      "div",
      item.description,
      `item${item.id}`,
      editItem,
      ""
    );
    const checkBox = createHtmlElement("input", "", "", "", "checkbox");
    checkBox.className = "checkBoxes";
    checkBox.checked = item.status;

    const button = createHtmlElement("button", "X", item.id, deleteItem);
    itemDiv.appendChild(checkBox);
    itemDiv.appendChild(description);
    itemDiv.appendChild(button);
    description.style.display = "inline";
    bodyDiv.appendChild(itemDiv);
  });
  return bodyDiv;
};

const saveItems = function() {
  const checkBoxes = Object.values(
    document.getElementsByClassName("checkBoxes")
  );
  const checkBoxesStatus = checkBoxes.map(checkBox => checkBox.checked);

  const editedItems = Object.values(document.getElementsByTagName("textArea"));
  const editedItemValues = editedItems.map(item => {
    return { id: item.id, value: item.value };
  });

  const newTitle = document.getElementById("todoTitleTextBox").value;

  let details = {
    method: "POST",
    body: JSON.stringify({
      listId: selectedListId,
      newTitle: newTitle,
      checkBoxesStatus: checkBoxesStatus,
      editedItems: editedItemValues
    })
  };

  fetchLists("/getData");
  fetch("/saveItems", details)
    .then(response => response.text())
    .then(data => getItems(data, selectedListId))
    .then(details => createItemBox(details));
};

const createBottomDiv = function() {
  const bottomDiv = createHtmlElement("div");
  const saveButton = createHtmlElement("button", "Save", "", saveItems);
  const deleteButton = createHtmlElement(
    "button",
    "Delete list",
    "",
    deleteList
  );
  bottomDiv.appendChild(saveButton);
  bottomDiv.appendChild(deleteButton);
  return bottomDiv;
};

const createItemBox = function(itemDetails) {
  const itemAreaDiv = document.getElementById("itemArea");
  itemAreaDiv.innerHTML = "";

  const headDiv = createHeadDiv(itemDetails);
  const bodyDiv = createBodyDiv(itemDetails);
  const bottomDiv = createBottomDiv();

  itemAreaDiv.appendChild(headDiv);
  itemAreaDiv.appendChild(bodyDiv);
  itemAreaDiv.appendChild(bottomDiv);
};

const getItems = function(data, clickedListId) {
  const todoLists = JSON.parse(data).todoLists;
  const matchedLists = todoLists.filter(list => list.id == clickedListId);

  selectedListId = +matchedLists[0].id;
  return {
    items: matchedLists[0].items,
    description: matchedLists[0].description,
    title: matchedLists[0].title
  };
};

const fetchItems = function(event, url = "/getData", details) {
  clickedListId = event.target.id;
  fetch(url, details)
    .then(response => response.text())
    .then(data => getItems(data, clickedListId))
    .then(details => createItemBox(details));
};

const deleteList = function() {
  fetchLists("/deleteList", { method: "POST", body: selectedListId });
  document.getElementById("itemArea").innerHTML = "";
};

const addList = function() {
  const listTitle = document.getElementById("todoTitleBox").value;
  const listDescription = document.getElementById("todoDescriptionBox").value;

  fetchLists("/addList", {
    method: "POST",
    body: JSON.stringify({ listTitle, listDescription })
  });
};

const createListsHtml = function(lists) {
  const listAreaDiv = document.getElementById("listArea");
  listAreaDiv.innerHTML = "";

  lists.forEach(list => {
    let listDiv = document.createElement("div");
    listDiv.id = list.id;
    listDiv.innerText = list.title;
    listDiv.onclick = fetchItems;
    listAreaDiv.appendChild(listDiv);
  });
};

const getLists = function(data) {
  const userData = JSON.parse(data);
  return userData.todoLists;
};

const fetchLists = function(url, details) {
  fetch(url, details)
    .then(response => response.text())
    .then(data => getLists(data))
    .then(lists => createListsHtml(lists));
};

window.onload = fetchLists.bind(null, "/getData");
