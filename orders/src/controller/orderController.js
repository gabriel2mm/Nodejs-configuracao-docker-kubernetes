const express = require('express')
const Order = require('../models/order')
const AWS = require('aws-sdk');
const Auth = require('../middleware/token')

const router = express.Router();
router.use(Auth.CheckToken);
router.get('/', async (req, res, next) => {
  Auth.CheckPermission(req.userId, ["admin"]).then(async (resp) => {
    const orders = await Order.find({ user: req.userId }).populate('request')
    return res.status(200).json(orders)
  }).catch(err => {
    const error = new Error("Você não possui permissão para visualizar este módulo")
    error.httpStatusCode = 403
    next(error)
  })
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id, user: req.userId  }).populate('request').catch(err => [])
  return res.status(200).json(order)
})

router.get('/map', async (req, res) => {
  const { id } = req.params;
  const order = await Order.find().populate('request').catch(err => [])
  order.map((o, index) => console.log(o, index));

  return res.status(200).json(order)
})

router.post('/', (req, res, next) => {
  const { body } = req;
  Order.create({ ...body, user: req.userId }).then(response => {
    return res.status(200).send();
  }).catch(errr => {
    const error = new Error("Não foi possível criar order")
    error.httpStatusCode = 400
    next(error)
  })
})

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  Order.updateOne({ _id: id, user: req.userId }, req.body)
    .then(u => {
      return res.status(200).send()
    }).catch(err => {
      console.error("Não foi possível atualizar ordem : ", err)
      const error = new Error("Não foi possível atualizar order")
      error.httpStatusCode = 400
      next(error)
    })
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  Order.deleteOne({ _id: id, user:req.userId })
    .then(r => res.status(200).send())
    .catch(err => {
      console.error("Não foi possível excluir ordem : ", err)
      const error = new Error("Não foi possível deletar order")
      error.httpStatusCode = 400
      next(error)
    })
})

router.get("/find/user/:id", (req, res) => {
  const { id } = req.params;
  const orders = Order.find({ user: id }).populate("request")

  return res.status(200).json(orders);
})

router.post('/filter', async (req, res) => {
  const {description, user, request} = req.body;
  const orders = await Order.find({}).populate("request")
  res.status(200).json(orders.filter(o => o.user._id === user || o.user.first_name === user || o.user.email=== user || o.description === description || o.request.equipament === request ||  o.request.description === request ));
})

router.get("/find/request/:id", (req, res) => {
  const { id } = req.params;
  const orders = Order.find({ request: { "_id": id } }).populate("request")

  return res.status(200).json(orders);
})

router.get('/file/upload/:id', async (req, res, next) => {
  const { id } = req.params;
  const dir = process.env.UPLOAD_DIR;

  const order = await Order.findOne({ _id: id }).populate('request');
  if (order) {
    return res.download(`./${dir}/${order.attachment}`);
  }

  const error = new Error("Não foi realizar download do arquivo")
  error.httpStatusCode = 400
  next(error)
});

router.post("/file/upload/:id", async (req, res, next) => {
  const { id } = req.params;
  const { attachment } = req.files;
  const dir = process.env.UPLOAD_DIR;

  let name = attachment.name.split(".");
  name[0] = `${name[0]}-${Date.now()}`;
  name = name.join(".");

  attachment.mv(`./${dir}/${name}`, function (err, result) {
    if (err)
      return res.status(400).send(err);

    Order.updateOne({ _id: id, user: { _id: req.userId } }, { attachment: name })
      .then(u => {
        res.status(200).send()
      }).catch(err => {
        console.error("Não foi possível atualizar ordem : ", err)
        const error = new Error("Não foi possível realizar upload de arquivo")
        error.httpStatusCode = 400
        next(error)
      })
  });
});

router.post('/file/upload/aws/:id', async (req, res, next) => {
  const ID = process.env.AWS_ID;
  const SECRET = process.env.AWS_SECRET;
  const BUCKET = process.env.AWS_BUCKET;

  function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
  }

  const {file} = req.files;

  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
  

  let fileName = file.name.split('.');
  fileName[0] = `${fileName[0]}-${Date.now()}-${randomInt(0,1000)}`;
  fileName = fileName.join('.');

  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Body: file.data
  };

  s3.upload(params, function (err, data) {
    if (err) {
      console.error("Não foi possível realizar upload : ", err)
      const error = new Error("Não foi possível realizar upload")
      error.httpStatusCode = 400
      next(error)
    }
    
    Order.updateOne({ _id: id, user: { _id: req.userId } }, { attachment: fileName })
      .then(u => {
        res.status(200).send()
      }).catch(err => {
        console.error("Não foi possível atualizar ordem : ", err)
        const error = new Error("Não foi possível realizar upload de arquivo")
        error.httpStatusCode = 400
        next(error)
      });
  });

  res.send("ok");
});

module.exports = app => app.use('/orders', router);