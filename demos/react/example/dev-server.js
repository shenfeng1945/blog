const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server');

const webpackDevConfig = require('./webpack.config.js');

let compiler = webpack(webpackDevConfig);
let server = new WebpackDevServer(compiler, webpackDevConfig.devServer);

server.listen(8000, 'localhost', (err) => {
    if (err) {
        console.log('err', err.message);
    }
});
