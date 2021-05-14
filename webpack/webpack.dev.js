const webpack = require("webpack");
const path = require("path");

const contentDir = path.resolve(".", "./lib");

module.exports = {
  mode: "development",
  devServer: {
    host: "localhost",
    port: 8080,
    contentBase: contentDir,
    writeToDisk: true,
    staticOptions: {
      fallthrough: false
    },
    hot: false, 
    inline: true
  },
  plugins: [
    new webpack.DefinePlugin({
      BUILD_ENV: JSON.stringify("dev")
    })
  ]
};