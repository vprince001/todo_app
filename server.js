const http = require("http");
const { handleRequest } = require("./src/app.js");
const PORT = process.env.PORT || 8000;
let server = http.createServer(handleRequest);
server.listen(PORT, () => console.log("listening on ", PORT));
