const fs = require("fs");
const { App } = require("./frameWork.js");
const form = require("../public/form.js");

const { INDEXPATH, ENCODING, FORMPLACEHOLDER } = require("./constants");

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
  userDetails.todoLists = {};
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

const authenticateUser = function(req, res) {
  const { USERID, PASSWORD } = parseLoginData(req);
  const filePath = `./private_data/${USERID}.json`;
  if (!fs.existsSync(filePath)) {
    res.write("Account doesn't exist");
    res.end();
    return;
  }
  let expectedPassword = "";
  fs.readFile(filePath, ENCODING, function(err, content) {
    content = JSON.parse(content);
    expectedPassword = content.PASSWORD;
    if (PASSWORD != expectedPassword) {
      res.write("Wrong Password");
      res.end();
      return;
    }
    renderHomepage(req, res, USERID);
  });
};

const renderHomepage = function(req, res, USERID) {
  const filePath = getRequest(req.url);
  fs.readFile(filePath, ENCODING, function(err, content) {
    if (err) {
      console.log(err);
    }
    res.write(content.replace("___userId___", USERID));
    res.end();
  });
};

const app = new App();

app.use(readBody);
app.get("/", renderMainPage.bind(null, "loginForm"));
app.get("/signUp", renderMainPage.bind(null, "signUpForm"));
app.post("/", registerNewUser);
app.post("/homepage.html", authenticateUser);
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
