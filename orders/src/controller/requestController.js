const express = require('express')
const Request = require('../models/request');
const Auth = require('../middleware/token')

const router = express.Router();
router.use(Auth.CheckToken);
router.get('/', async (req, res) => {
  const requests = await Request.find({ user: req.userId})
  return res.status(200).json(requests)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const request = await Request.findOne({ _id: id , user:req.userId}).catch(err => [])
  return res.status(200).json(request)
})

router.post('/', (req, res, next) => {
  const { body } = req;

  Request.create({ ...body, user: req.userId }).then(r => {
    return res.status(201).send()
  }).catch(err => {
      const error = new Error("Não foi possível criar request")
      error.httpStatusCode = 400
      next(error)
  })
})

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  Request.updateOne({ _id: id, user: req.userId }, req.body)
    .then(u => {
      return res.status(200).send()
    }).catch(err => {
      console.error("Não foi possível atualizar request : ", err)
      const error = new Error("Não foi possível atualizar request")
      error.httpStatusCode = 400
      next(error)
    })
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  Request.deleteOne({ _id: id, user:  req.userId})
    .then(r => res.status(200).send())
    .catch(err => {
      console.error("Não foi possível excluir request : ", err)
      const error = new Error("Não foi possivel deletar request")
      error.httpStatusCode = 400
      next(error)
    })
})

router.get("/find/user/:id", (req, res) => {
  const { id } = req.params;
  const requests = Request.find({ user:  id });

  return res.status(200).json(requests);
})

router.post('/filter', async (req, res) => {
  const {equipament, description, type, status} = req.body;
  const requests = await Request.find({ $or : [ {equipament}, {description}, {type}, {status} ]})
  res.status(200).json(requests)
})

module.exports = app => app.use('/requests', router);