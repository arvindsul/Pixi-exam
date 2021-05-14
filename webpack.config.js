require("dotenv").config();
const {merge} = require("webpack-merge");

module.exports = (options = {}) => {
  const {env} = options;

  let config = require("./webpack/webpack.base");

  if (env) {
    config = merge(config, require(`./webpack/webpack.${env}`));
  }

  return config;
};
