function authMiddleware(req, res, next) {
  const isAdminAuthenticated = req.session.admin;
  const isStudentAuthenticated = req.session.student;
  const isSessionValid =
    req.session.cookie && req.session.cookie.expires > Date.now();

  if (isAdminAuthenticated && isSessionValid) {
    res.locals.adminUsername = req.session.adminUsername;
    next();
  } else if (isStudentAuthenticated && isSessionValid) {
    res.locals.student = req.session.student;
    next();
  } else if (
    req.url === "/" ||
    req.url === "/login" ||
    req.url === "/admin/login"
  ) {
    next();
  } else {
    res.redirect("/");
  }
}

module.exports = authMiddleware;
