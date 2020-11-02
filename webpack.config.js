const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const miniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  devtool: 'source-map',

  entry: {
    main: [
      path.resolve(__dirname, "./src/scripts/main.js"),
      path.resolve(__dirname, "./src/styles/style.sass"),
    ]
  },

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ "babel-loader" ],
      }, {
        test:/\.(css|scss|sass)$/,
        use: [ miniCssExtractPlugin.loader, "css-loader", "sass-loader" ]
     }
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new miniCssExtractPlugin({
      filename: "style.css"
    }),
  ]
}
