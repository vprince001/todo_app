const fs = require("fs");
const { App } = require("./frameWork.js");
const form = require("../public/form.js");

const { INDEXPATH, ENCODING, FORMPLACEHOLDER } = require("./constants");
const { Todo } = require("./model/todo.js");
const { Item } = require("./model/item.js");
const { User } = require("./model/user.js");

let session = new Object();

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
  const userId = retrieveUserId(req);
  send(res, JSON.stringify(session[userId]), 200);
};

const retrieveUserId = function(req) {
  return req.headers.cookie.split("=")[1];
};

const setCookie = function(req, res) {
  const { USERID } = parseLoginData(req);
  res.setHeader("Set-Cookie", `username=${USERID}`);
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

const writeData = function(req, res) {
  const userId = retrieveUserId(req);
  const filePath = `./private_data/${userId}.json`;
  const data = JSON.stringify(session[userId]);

  fs.writeFile(filePath, data, err => {
    if (err) throw err;
    res.write(data);
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
  const userId = retrieveUserId(req);

  const listIndex = session[userId].todoLists.findIndex(
    list => list.id == listId
  );
  session[userId].todoLists[listIndex].deleteItem(itemId);
  writeData(req, res);
};

const saveItems = function(req, res) {
  const {
    listId,
    newTitle,
    newDescription,
    checkBoxesStatus,
    editedItems
  } = JSON.parse(req.body);

  const userId = retrieveUserId(req);
  const listIndex = session[userId].todoLists.findIndex(
    list => list.id == listId
  );
  const savedItems = session[userId].todoLists[listIndex].items;

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

  session[userId].todoLists[listIndex].editTitle(newTitle);
  session[userId].todoLists[listIndex].editDescription(newDescription);
  session[userId].todoLists[listIndex].items = savedItems;
  writeData(req, res);
};

const addItem = function(req, res) {
  const { id, desc } = JSON.parse(req.body);
  let item = { id: 0, description: desc, status: false };
  const userId = retrieveUserId(req);

  const matchedList = session[userId].todoLists.filter(
    list => list.id == id
  )[0];
  if (matchedList.items.length > 0) {
    item.id = matchedList.items[0].id + 1;
  }
  let listIndex = session[userId].todoLists.findIndex(item => item.id == id);

  let newItem = new Item(item);
  session[userId].todoLists[listIndex].addItem(newItem);
  writeData(req, res);
};

const deleteList = function(req, res) {
  const todoId = req.body;
  const userId = retrieveUserId(req);
  session[userId].deleteTodo(todoId);
  writeData(req, res);
};

const addList = function(req, res) {
  const { listTitle, listDescription } = JSON.parse(req.body);
  const userId = retrieveUserId(req);
  let listId = 0;
  if (session[userId].todoLists.length > 0) {
    listId = session[userId].todoLists[0].id + 1;
  }

  const todo = {
    id: listId,
    title: listTitle,
    description: listDescription,
    items: []
  };

  let list = new Todo(todo);
  session[userId].addTodo(list);
  writeData(req, res);
};

const renderHomepage = function(req, res) {
  const filePath = getRequest(req.url);
  const userName = retrieveUserId(req);

  fs.readFile(filePath, ENCODING, function(err, content) {
    if (err) console.log(err);
    res.write(content.replace("___userId___", userName));
    res.end();
  });
};

const getHomePage = function(req, res) {
  res.writeHead(302, { Location: "/htmls/homepage.html" });
  res.end();
};

const userExist = function(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.write("Account doesn't exist");
    res.end();
    return false;
  }
  return true;
};

const passwordMatched = function(res, PASSWORD = null, savedPassword = null) {
  if (PASSWORD != savedPassword) {
    res.write("Wrong Password");
    res.end();
    return false;
  }
  return true;
};

const loadHomePage = function(req, res, filePath, USERID, PASSWORD) {
  fs.readFile(filePath, (err, content) => {
    if (err) throw err;

    let userData = JSON.parse(content);
    if (!req.headers.cookie) {
      if (!passwordMatched(res, PASSWORD, userData.PASSWORD)) return;
      setCookie(req, res);
    }
    session[USERID] = userData;
    reviveInstances(USERID);
    getHomePage(req, res);
  });
};

const logUserIn = function(req, res) {
  const { USERID, PASSWORD } = parseLoginData(req);
  const filePath = `./private_data/${USERID}.json`;

  if (!userExist(res, filePath)) return;
  loadHomePage(req, res, filePath, USERID, PASSWORD);
};

const reviveInstances = function(USERID) {
  session[USERID] = new User(session[USERID]);
  if (session[USERID].todoLists.length) {
    session[USERID].todoLists = session[USERID].todoLists.map(
      list => new Todo(list)
    );

    session[USERID].todoLists = session[USERID].todoLists.map(list => {
      list.items = list.items.map(item => new Item(item));
      return list;
    });
  }
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
  if (req.headers.cookie) {
    let userId = retrieveUserId(req);
    const filePath = `./private_data/${userId}.json`;
    loadHomePage(req, res, filePath, userId);
    return;
  }

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
