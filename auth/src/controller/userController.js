const express = require('express')
const User = require('../models/user')
const AuthMiddleware = require('../middleware/auth')

const router = express.Router();
router.use(AuthMiddleware.authMiddleware);
router.get('/', async (req, res) => {
  const users = await User.find({}).populate('profile')
  return res.status(200).json(users)
})

router.get('/outofprofile', async function(req, res){
  const users = await User.find({}).populate('profile')
  function outOfProfile(user, sum){
    if(!user.profile){
      sum = sum + 1;
    }
    return sum;
  }

  const count = users.reduce((sum, current ) => outOfProfile(current, sum), 0);
  res.status(200).send({count});
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).populated('profile').catch(err => [])
  return res.status(200).json(user)
})

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  User.updateOne({ _id: id }, req.body)
    .then(u => {
      return res.status(200).send()
    }).catch(err => {
      const error = new Error("Não foi possível atualizar usuário")
      error.httpStatusCode = 400
      next(error)
    })
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  User.deleteOne({ _id: id })
    .then(r => res.status(200).send())
    .catch(err => {
      const error = new Error("Não foi possível deletar usuário")
      error.httpStatusCode = 400
      next(error)
    })
})

router.get('/find/profile/:id', async (req, res) => {
  const {id} = req.params;
  const user = await User.find({profile: {"_id" : id}}).populate("profile")

  res.status(200).json(user);
});

router.post('/filter', async (req, res) => {
  const {name, lastname, email} = req.body;
  const users = await User.find( { $or: [{ first_name: name} , {last_name:lastname}, {email:email}] });

  res.status(200).json(users);
});


module.exports = app => app.use('/users', router);