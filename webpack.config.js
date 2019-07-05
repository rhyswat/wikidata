/*
 Webpack configuration file (environment neutral).

 Defines an entry point js/app.js
  and an output filename
   and a bunch of loaders for different content types
    and transpiles js to a low common denominator for IE
     and puts jquery/$ in global scope
      and configures the dev server
      */

const path = require('path');
const os = require('os');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const SRC = path.resolve(__dirname, 'src');
const WWW = path.resolve(__dirname, 'www');

// run on our LAN ip address to access from other machines
var networkAddressOrNone = function() {
    var interfaces = os.networkInterfaces();
    var address = '127.0.0.1';
    try {
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (/^192/.test(address.address)) {
                    return address.address;
                }
            }
        }
    } catch (e) {
        console.log('tough, you are on ' + address);
    }

    return address;
}

module.exports = {
    entry: path.resolve(__dirname, 'src', 'js', 'app.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'app.js',
    },
    devtool: 'source-map',
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.s?css$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    }
                }],
            }
        ]
    },
    plugins: [
        /* place $ in global scope */
        new webpack.ProvidePlugin({
            $: 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    devServer: {
        "hot": true,
        "port": 8888,
        "host": networkAddressOrNone(),
        "contentBase": "dist/"
    }
}