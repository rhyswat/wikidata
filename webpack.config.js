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

const SRC = path.resolve(__dirname, 'src');
const WWW = path.resolve(__dirname, 'www');

// run on our LAN ip address to access from other machines
var networkAddressOrNone = function () {
    var interfaces = os.networkInterfaces();
    var address = '127.0.0.1';
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (/^192/.test(address.address)) {
                return address.address;
            }
        }
    }

    return address;
}

module.exports = {
    entry: path.join(SRC, 'js', 'app.js'),
    output: {
        path: path.join(WWW, 'js'),
        filename: 'app.bundle.js',
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'file-loader?name=../vendor/images/[name].[ext]'
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=../vendor/fonts/[name].[ext]'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=../vendor/fonts/[name].[ext]'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?name=../vendor/fonts/[name].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=../vendor/fonts/[name].[ext]'
            },
        ]
    },
    plugins: [
        /* place $ in global scope */
        new webpack.ProvidePlugin({
            $: 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        })
    ],
    devServer: {
        "hot": true,
        "port": 4444,
        // "host": networkAddressOrNone(),
        "contentBase": "www/"
    }
}