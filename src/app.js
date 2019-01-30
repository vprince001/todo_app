const fs = require("fs");
const { App } = require("./frameWork.js");
const form = require("../public/form.js");

const { INDEXPATH, ENCODING, FORMPLACEHOLDER } = require("./constants");
const { TodoList } = require("./todoList.js");
const { TodoItem } = require("./todoItem.js");

let userData;

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

const provideData = function(req, res, next, send) {
  let path = getRequest(req.url);
  fs.readFile(path, (err, content) => {
    if (err) {
      send(res, err, 404);
      return;
    }
    send(res, content, 200);
  });
  next();
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
  fs.readFile(INDEXPATH, ENCODING, function(err, content) {
    res.write(content.replace(FORMPLACEHOLDER, form[nameOfForm]));
    res.end();
  });
};

const verifyUserId = function(filePath) {
  return fs.existsSync(filePath);
};

const verifyPassword = function(filePath, PASSWORD) {
  let content = fs.readFileSync(filePath, ENCODING);
  const expectedPassword = JSON.parse(content).PASSWORD;
  return PASSWORD == expectedPassword;
};

const logUserIn = function(req, res) {
  const { USERID, PASSWORD } = parseLoginData(req);
  const filePath = `./private_data/${USERID}.json`;

  if (!verifyUserId(filePath)) {
    res.write("Account doesn't exist");
    res.end();
    return;
  }

  if (!verifyPassword(filePath, PASSWORD)) {
    res.write("Wrong Password");
    res.end();
    return;
  }
  userData = JSON.parse(fs.readFileSync(filePath, ENCODING));
  getHomePage(req, res);
};

const getHomePage = function(req, res) {
  setCookie(req, res);
  res.writeHead(302, { Location: "/htmls/homepage.html" });
  res.end();
};

const setCookie = function(req, res) {
  if (!req.headers.cookie) {
    res.setHeader("Set-Cookie", `username=${userData.USERID}`);
  }
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

const deleteList = function(req, res) {
  const id = req.body;
  let index = userData.todoLists.findIndex(itemDetail => itemDetail.id == id);

  userData.todoLists.splice(index, 1);

  const userId = userData.USERID;
  writeData(res);
};

const addList = function(req, res) {
  const listTitle = req.body;
  let listId = 0;

  if (userData.todoLists.length > 0) {
    listId = userData.todoLists[0].id + 1;
  }

  let list = new TodoList(listId, listTitle, []);
  userData.todoLists.unshift(list);
  writeData(res);
};

const writeData = function(res) {
  const userId = userData.USERID;
  let filePath = `./private_data/${userId}.json`;
  fs.writeFileSync(filePath, JSON.stringify(userData));
  res.write(JSON.stringify(userData));
  res.end();
};

const deleteItem = function(req, res) {
  const { itemId, listId } = JSON.parse(req.body);

  const listIndex = userData.todoLists.findIndex(list => list.id == listId);
  const itemIndex = userData.todoLists[listIndex].items.findIndex(
    item => item.id == itemId
  );

  userData.todoLists[listIndex].items.splice(itemIndex, 1);
  writeData(res);
};

const addItem = function(req, res) {
  const { id, desc } = JSON.parse(req.body);
  let itemId = 0;
  const matchedList = userData.todoLists.filter(list => list.id == id)[0];
  if (matchedList.items.length > 0) {
    itemId = matchedList.items[0].id + 1;
  }
  let item = new TodoItem(itemId, desc, true);

  let index = userData.todoLists.findIndex(itemDetail => itemDetail.id == id);

  userData.todoLists[index].items.unshift(item);

  writeData(res);
};

const getUserData = function(req, res, next, send) {
  send(res, JSON.stringify(userData), 200);
};

const logUserOut = function(req, res) {
  let expiryDate = "Thu, 01 Jan 1970 00:00:00 UTC;";
  res.setHeader("Set-Cookie", `username=;expires=${expiryDate};`);
  res.writeHead(302, { Location: "/" });
  res.end();
};

const saveItems = function(req, res) {
  const { editedItems, listId } = JSON.parse(req.body);

  const listIndex = userData.todoLists.findIndex(list => list.id == listId);
  const savedItems = userData.todoLists[listIndex].items;

  editedItems.map(editedItem => {
    let editedItemId = editedItem.id.substring(4);

    savedItems.map(savedItem => {
      if (savedItem.id == editedItemId) {
        savedItem.description = editedItem.value;
      }
    });
  });
  userData.todoLists[listIndex].items = savedItems;
  writeData(res);
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
app.use(provideData);

const handleRequest = app.handleRequest.bind(app);

module.exports = {
  handleRequest,
  provideData,
  getRequest,
  parseData,
  parseLoginData,
  renderMainPage
};
