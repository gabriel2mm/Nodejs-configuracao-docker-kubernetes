const notFound = (req, res, next) => {
  res.status(404).json({ error: "Não encontramos nenhum endpoint para esta configuração"});
}

module.exports = app => app.use(notFound);