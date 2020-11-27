require('dotenv/config');
const axios = require('axios')

exports.CheckToken = ( req, res, next) => {
  const { authorization } = req.headers;
  const headers = {
    headers: {
      "Authorization":authorization
    }
  }
  axios.post(`${process.env.AUTH_HOST}:${process.env.AUTH_PORT}/auth/checkToken`, {}, headers)
  .then(response => {
    req.userId = response.data.userId;
    next();
  })
  .catch(err => {
    const error = new Error("token inválido ou expirado")
    error.httpStatusCode = 403
    return next(error)
  })
}

exports.CheckPermission = (userId, permission) => {
  return axios.post(`${process.env.AUTH_HOST}:${process.env.AUTH_PORT}/auth/permission`, {
    "userId" : userId,
    "permission" : permission
  })
}