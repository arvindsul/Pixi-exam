const path = require("path");
const webpack = require("webpack");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const rootDir = path.resolve(".");
const srcDir = path.resolve(".", "./src");
const assetsDir = path.resolve(".", "./lib/assets");
const distDir = path.resolve(".", "./lib/assets/js");
const contentDir = path.resolve(".", "./lib");

const buildVersion = process.env.npm_package_version;
const buildDate = new Date().toString();

module.exports = {
  context: rootDir,
  entry: "/src/main.ts",
  output: {
    filename: "main.js",
    path: distDir,
    pathinfo: false
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    modules: ["node_modules", srcDir, path.resolve(srcDir, "./js")],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
        exclude: /node_modules/
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      BUILD_VERSION: JSON.stringify(buildVersion),
      BUILD_DATE: JSON.stringify(buildDate)
    }),
  ],
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  }
};