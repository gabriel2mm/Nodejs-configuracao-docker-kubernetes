const fs = require("fs");
const path = require("path");

module.exports = app => {
  fs.readdirSync(__dirname)
  .filter(f => path.basename(__filename) !== f)
  .map(f=> require(path.resolve(__dirname, f))(app));
};
