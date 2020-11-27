const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Profile = require('../models/profile')

const router = express.Router();
router.post('/checkToken', async (req, res, next) => {
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
      error.httpStatusCode = 403
      return next(error)
    }

    if (decoded && decoded.id) {
      req.userId = decoded.id;
    }

    res.status(200).json({ userId : req.userId });
  });
});

router.post('/permission' , async (req, res, next) => {
  const {userId, permission} = req.body;
  const user = await User.findOne({_id : userId}).populate('profile')
  const profileId = user.profile._id;
  if(profileId){
    const profile = await Profile.findById(profileId).populate('roles')
    const existRole = profile.roles.filter(r => permission.includes(r.name.toLowerCase())).length;
    if(existRole <= 0){
      return res.status(403).json({error: "Você não possui acesso a este módulo"});
    }
    return res.status(200).send();
  }
  return res.status(403).json({error: "Você não possui acesso a este módulo"});
})

router.post('/login', async (req, res, next) =>{
  const { login, password } = req.body;
  const user = await User.findOne({ login: login }).populate("profile")
  if (!user)
  {
    const error = new Error("Usuário não encontrado")
    error.httpStatusCode = 401
    return next(error)
  } 
  const compare = await bcrypt.compareSync(password, user.password);
  if (!compare){
    const error = new Error("Usuário inválido")
    error.httpStatusCode = 401
    return next(error)
  }

  const token = jwt.sign({ id: user._id }, process.env.SECRET|| "", {
    expiresIn: 3000
  });
  req.userId = user._id;

  return res.json({ token: token });
});

module.exports = app => app.use('/auth', router);