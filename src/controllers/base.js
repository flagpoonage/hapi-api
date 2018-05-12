class BaseController {

  makeRoute (method, path, auth_required, handler) {
    let route = {
      method: method, 
      path: path,
      handler: handler
    };

    if (!auth_required) {
      route.options = {
        auth: false
      }
    };

    return route;
  }

}