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
        extensions: [".js"],
    },
    devtool: 'source-map',
    //output config
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: '/'
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
        new webpack.NoEmitOnErrorsPlugin(),
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
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [nodeModulesPath],
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: "raw-loader"
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'url-loader?limit=8192'
            }
        ],
    }
};

module.exports = config;
