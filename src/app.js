const fs = require("fs");
const webFrame = require("./frameWork.js");
const form = require("../public/form.js");

const readBody = function(req, res, next) {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const getRequest = function(url) {
  if (url == "/") return "./public/index.html";
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
  fs.readFile("./public/index.html", "utf8", function(err, content) {
    if (err) {
    }
    res.write(content.replace("___form___", form[nameOfForm]));
    res.end();
  });
};

const app = new webFrame();

app.use(readBody);
app.get("/", renderMainPage.bind(null, "loginForm"));
app.get("/signUp", renderMainPage.bind(null, "signUpForm"));
app.post("/", registerNewUser);
app.use(provideData);

const handleRequest = app.handleRequest.bind(app);

module.exports = { handleRequest, provideData };
