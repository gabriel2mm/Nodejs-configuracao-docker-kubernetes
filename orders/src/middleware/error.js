function error (error, req, res, next){
  res.status(error.httpStatusCode|| 404).json({error : error.message || 'endpoint não encontrado'})
}
module.exports = app => app.use(error);