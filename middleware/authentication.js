const { validateToken } = require("../services/authentication");

function checkCookie(cookieName) {
  return (req, res, next) => {
    const cookieTokenValue = req.cookies[cookieName];
    if (!cookieTokenValue) {
      return next();
    }
    try {
      const userPayload = validateToken(cookieTokenValue);
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}
module.exports = { checkCookie };
