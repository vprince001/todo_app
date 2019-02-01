const fs = require("fs");
const { App } = require("./frameWork.js");
const form = require("../public/form.js");

const { INDEXPATH, ENCODING, FORMPLACEHOLDER } = require("./constants");
const { Todo } = require("./model/todo.js");
const { Item } = require("./model/item.js");
const { User } = require("./model/user.js");

let userData;

//-------------------------Server Handlers-------------------------//

const serveStaticFiles = function(req, res, next, send) {
  let path = getRequest(req.url);
  fs.readFile(path, (err, content) => {
    if (err) {
      send(res, err, 404);
      return;
    }
    send(res, content, 200);
  });
};

const getUserData = function(req, res, next, send) {
  send(res, JSON.stringify(userData), 200);
};

const setCookie = function(req, res) {
  if (!req.headers.cookie) {
    res.setHeader("Set-Cookie", `username=${userData.USERID}`);
  }
};

const readBody = function(req, res, next) {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const getRequest = function(url) {
  if (url == "/") return INDEXPATH;
  return "./public" + url;
};

//-------------------------TODO Handlers-------------------------//

const writeData = function(res) {
  const userId = userData.USERID;
  let filePath = `./private_data/${userId}.json`;
  fs.writeFile(filePath, JSON.stringify(userData), err => {
    if (err) throw err;
    res.write(JSON.stringify(userData));
    res.end();
  });
};

const logUserOut = function(req, res) {
  let expiryDate = "Thu, 01 Jan 1970 00:00:00 UTC;";
  res.setHeader("Set-Cookie", `username=;expires=${expiryDate};`);
  res.writeHead(302, { Location: "/" });
  res.end();
};

const deleteItem = function(req, res) {
  const { itemId, listId } = JSON.parse(req.body);

  const listIndex = userData.todoLists.findIndex(list => list.id == listId);
  userData.todoLists[listIndex].deleteItem(itemId);
  writeData(res);
};

const saveItems = function(req, res) {
  const {
    listId,
    newTitle,
    newDescription,
    checkBoxesStatus,
    editedItems
  } = JSON.parse(req.body);

  const listIndex = userData.todoLists.findIndex(list => list.id == listId);
  const savedItems = userData.todoLists[listIndex].items;

  editedItems.forEach(editedItem => {
    let editedItemId = editedItem.id.substring(4);

    savedItems.forEach(savedItem => {
      if (savedItem.id == editedItemId) {
        savedItem.setDescription(editedItem.value);
      }
    });
  });

  let index = 0;
  savedItems.forEach(savedItem => {
    savedItem.setStatus(checkBoxesStatus[index]);
    index++;
  });

  userData.todoLists[listIndex].editTitle(newTitle);
  userData.todoLists[listIndex].editDescription(newDescription);
  userData.todoLists[listIndex].items = savedItems;
  writeData(res);
};

const addItem = function(req, res) {
  const { id, desc } = JSON.parse(req.body);
  let item = { id: 0, description: desc, status: false };

  const matchedList = userData.todoLists.filter(list => list.id == id)[0];
  if (matchedList.items.length > 0) {
    item.id = matchedList.items[0].id + 1;
  }
  let listIndex = userData.todoLists.findIndex(item => item.id == id);

  let newItem = new Item(item);
  userData.todoLists[listIndex].addItem(newItem);
  writeData(res);
};

const deleteList = function(req, res) {
  const todoId = req.body;
  userData.deleteTodo(todoId);
  writeData(res);
};

const addList = function(req, res) {
  const { listTitle, listDescription } = JSON.parse(req.body);

  let listId = 0;
  if (userData.todoLists.length > 0) {
    listId = userData.todoLists[0].id + 1;
  }

  const todo = {
    id: listId,
    title: listTitle,
    description: listDescription,
    items: []
  };

  let list = new Todo(todo);
  userData.addTodo(list);
  writeData(res);
};

const renderHomepage = function(req, res) {
  const filePath = getRequest(req.url);
  const userName = req.headers.cookie.split("=")[1];

  fs.readFile(filePath, ENCODING, function(err, content) {
    if (err) console.log(err);
    res.write(content.replace("___userId___", userName));
    res.end();
  });
};

const getHomePage = function(req, res) {
  setCookie(req, res);
  res.writeHead(302, { Location: "/htmls/homepage.html" });
  res.end();
};

const logUserIn = function(req, res) {
  const { USERID, PASSWORD } = parseLoginData(req);
  const filePath = `./private_data/${USERID}.json`;

  if (!fs.existsSync(filePath)) {
    res.write("Account doesn't exist");
    res.end();
    return;
  }

  fs.readFile(filePath, (err, content) => {
    userData = JSON.parse(content);
    userData = new User(userData);

    if (PASSWORD != userData.PASSWORD) {
      res.write("Wrong Password");
      res.end();
      return;
    }

    if (userData.todoLists.length) {
      userData.todoLists = userData.todoLists.map(list => new Todo(list));

      userData.todoLists = userData.todoLists.map(list => {
        list.items = list.items.map(item => new Item(item));
        return list;
      });
    }
    getHomePage(req, res);
  });
};

const parseData = function(content, index) {
  return content.split("&")[index].split("=")[1];
};

const parseLoginData = function(req) {
  let userId = parseData(req.body, 0);
  let password = parseData(req.body, 1);
  return { USERID: userId, PASSWORD: password };
};

const registerNewUser = function(req, res) {
  let userDetails = parseLoginData(req);
  userDetails.todoLists = [];

  userData = new User(userDetails);
  let filePath = `./private_data/${userDetails.USERID}.json`;

  if (fs.existsSync(filePath)) {
    renderMainPage("userNameError", req, res);
    return;
  }
  fs.writeFile(filePath, JSON.stringify(userDetails), err => {
    if (err) console.log(err);
  });
  renderMainPage("loginForm", req, res);
};

const renderMainPage = function(nameOfForm, req, res) {
  fs.readFile(INDEXPATH, ENCODING, function(err, content) {
    res.write(content.replace(FORMPLACEHOLDER, form[nameOfForm]));
    res.end();
  });
};

const app = new App();

app.use(readBody);
app.get("/", renderMainPage.bind(null, "loginForm"));
app.get("/signUp", renderMainPage.bind(null, "signUpForm"));
app.post("/", registerNewUser);
app.post("/login", logUserIn);
app.post("/logout", logUserOut);
app.get("/htmls/homepage.html", renderHomepage);
app.post("/addList", addList);
app.post("/addItem", addItem);
app.post("/deleteList", deleteList);
app.post("/deleteItem", deleteItem);
app.post("/saveItems", saveItems);
app.get("/getData", getUserData);

app.use(serveStaticFiles);

const handleRequest = app.handleRequest.bind(app);

module.exports = {
  handleRequest,
  provideData: serveStaticFiles,
  getRequest,
  parseData,
  parseLoginData,
  renderMainPage
};
