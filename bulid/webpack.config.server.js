const path = require('path');
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')

const config = webpackMerge(baseConfig, {
    target: 'node',
    entry: {
        app: path.join(__dirname, '../client/server-entry.js')
    },
    output: {
        filename: 'server-entry.js',
        libraryTarget: 'commonjs2'
    }
})

module.exports = config;
