const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Profile = require('../models/profile')

exports.authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const error = new Error("Não foi possível localizar o token")
    error.httpStatusCode = 401
    return next(error)
  }

  const composition = authorization.split(' ');
  if (composition.length !== 2) {
    const error = new Error("Erro no token")
    error.httpStatusCode = 401
    return next(error)
  }

  const [protocol, token] = composition;
  if (!/^Bearer$/i.test(protocol)) {
    const error = new Error("formato de token não esperado")
    error.httpStatusCode = 401
    return next(error)
  }
  jwt.verify(token, process.env.SECRET || "", (err, decoded) => {
    if (err) {
      const error = new Error("token inválido ou expirado")
      error.httpStatusCode = 401
      return next(error)
    }

    if (decoded && decoded.id) {
      req.userId = decoded.id;
      req.profile = decoded.profile;
      req.permissions = decoded.roles;
    }

    next();
  });
}

exports.requirePermission = async (req, res, next, permissions) => {
  const { profile } = req;
  const backProfile = await Profile.findById(profile._id).populate('roles');
  
  let existsPermission = 0;
  if (backProfile && backProfile.roles) {
    existsPermission = permissions.includes("all") ? 1 : backProfile.roles.filter(r => r.active === true && permissions.includes(r.name.toLowerCase())).length;
  }

  if (existsPermission <= 0) {
    const error = new Error("Você não possui acesso a este módulo")
    error.httpStatusCode = 403
    return next(error)
  }
  next();
}

exports.requirePermissionAdmin = async (req, res, next) => {
  const { userId } = req;
  const user = await User.findOne({ _id: userId })
  const profile = await Profile.findOne({ _id: user.profile })

  if ((!user || !profile) || (profile !== null && profile.name !== null && profile.name !== "admin")) {
    const error = new Error("Você não possui acesso a este módulo")
    error.httpStatusCode = 403
    return next(error)
  }

  next();
}