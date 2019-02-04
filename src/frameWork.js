const isMatching = (req, route) => {
  if (route.method && req.method != route.method) return false;
  if (route.url && req.url != route.url) return false;
  return true;
};

const send = function(res, content, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

class WebFrame {
  constructor() {
    this.routes = [];
  }
  use(handler) {
    this.routes.push({ handler });
  }
  get(url, handler) {
    this.routes.push({ method: "GET", url, handler });
  }
  post(url, handler) {
    this.routes.push({ method: "POST", url, handler });
  }

  handleRequest(req, res) {
    let isValidRoute = isMatching.bind(null, req);

    const matchedRoutes = this.routes.filter(isValidRoute);

    let next = () => {
      if (matchedRoutes.length == 0) {
        return;
      }
      let currentRoute = matchedRoutes[0];
      matchedRoutes.shift();
      currentRoute.handler(req, res, next, send);
    };
    next();
  }
}

module.exports = { App: WebFrame, isMatching };
