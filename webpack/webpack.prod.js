const webpack = require("webpack");
const path = require("path");

const contentDir = path.resolve(".", "./lib");

module.exports = {
  mode: "production",
  plugins: [
    new webpack.DefinePlugin({
      BUILD_ENV: JSON.stringify("prod")
    })
  ]
};