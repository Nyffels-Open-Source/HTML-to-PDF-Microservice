export const authentication = function (req, res, next) {
  if (process.env.CODE != req.headers.authorization) {
    res.status(401).send('INCORRECT AUTHENTICATION CODE');
  } else {
    next();
  }
};
