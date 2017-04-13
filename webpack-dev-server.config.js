const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'target');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
    //Entry points to the project
    entry: [
        'whatwg-fetch',
        path.join(__dirname, '/src/app/app.js'),
    ],
    //Config options on how to interpret requires imports
    resolve: {
        extensions: [".js"],
        //node_modules: ["web_modules", "node_modules"]  (Default Settings)
    },
    //Server Configuration options
    devServer: {
        contentBase: 'src/www',  //Relative directory for base of server
        hot: true,        //Live-reload
        inline: true,
        port: 3001,        //Port Number
        host: '0.0.0.0',  //Change to '0.0.0.0' for external facing server
    },
    devtool: 'eval',
    output: {
        path: buildPath,    //Path of output file
        filename: 'app.js',
    },
    plugins: [
        //Enables Hot Modules Replacement
        new webpack.HotModuleReplacementPlugin(),
        //Allows error warnings but does not stop compiling. Will remove when eslint is added
        new webpack.NoEmitOnErrorsPlugin(),
        //Moves files
        new TransferWebpackPlugin([
            {from: 'www'},
        ], path.resolve(__dirname, "src")),
    ],
    module: {
        loaders: [
            {
                //React-hot loader and
                test: /\.js$/,  //All .js files
                loaders: ['react-hot-loader', 'babel-loader'], //react-hot is like browser sync and babel loads jsx and es6-7
                exclude: [nodeModulesPath],
            },
        ],
    }
};

module.exports = config;
