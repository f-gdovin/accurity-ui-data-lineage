const webpack = require('webpack');
const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
    node: {
        fs: "empty"
    },
    entry: [path.join(__dirname, '/src/app/app.js')],
    resolve: {
        //When require, do not have to add these extensions to file's name
        extensions: [".js"],
        //node_modules: ["web_modules", "node_modules"]  (Default Settings)
    },
    //Render source-map file for final build
    devtool: 'source-map',
    //output config
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: path.join(__dirname, 'dist')
    },
    plugins: [
        //Minify the bundle
        new webpack.optimize.UglifyJsPlugin({
            sourcemap: true,
            minimize: true,
            beautify: false,
            comments: false,
            compress: {
                warnings: false,
                drop_console: true,
                screw_ie8: true
            },
            mangle: {
                except: [
                    '$', 'webpackJsonp'
                ],
                screw_ie8: true,
                keep_fnames: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        }),
        //Allows error warnings but does not stop compiling. Will remove when eslint is added
        new webpack.NoEmitOnErrorsPlugin(),
        //Transfer Files
        new TransferWebpackPlugin([
            {from: 'www'},
        ], path.resolve(__dirname, "src")),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,          // All .js files
                loader: 'babel-loader', //react-hot is like browser sync and babel loads jsx and es6-7
                exclude: [nodeModulesPath],
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: "raw-loader"
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "file-loader",
                options: {
                    name: '[path].[name].[ext]',
                },
            }
        ],
    }
};

module.exports = config;
