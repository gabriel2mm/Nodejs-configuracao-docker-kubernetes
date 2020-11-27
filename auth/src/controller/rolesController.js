const express = require('express')
const Role = require('../models/roles')
const AuthMiddleware = require('../middleware/auth')

const router = express.Router();
router.use(AuthMiddleware.authMiddleware);
router.use(AuthMiddleware.requirePermissionAdmin);
router.get('/', async (req, res) => {
  const roles = await Role.find({})
  return res.status(200).json(roles)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const Role = await Role.findOne({ _id: id }).catch(err => [])
  return res.status(200).json(Role)
})

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  Role.updateOne({ _id: id }, req.body)
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
  Role.deleteOne({ _id: id })
    .then(r => res.status(200).send())
    .catch(err => {
      const error = new Error("Não foi possível deletar usuário")
      error.httpStatusCode = 400
      next(error)
    })
})

router.post('/filter', async (req, res) => {
  const {name, created, active } = req.body;
  const roles = await Role.find( { $or: [{ name} , {active}, {created} ] });
  res.status(200).json(roles);
})

module.exports = app => app.use('/roles', router);