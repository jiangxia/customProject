const axios = require("axios")
const path = require("path")
const webpack = require("webpack")
const serverConfig = require("../../bulid/webpack.config.server")
const MemoryFs = require('memory-fs')
const ReactSSR = require('react-dom/server')
const proxy = require('http-proxy-middleware')

const getTemplate = () => {
    return new Promise((resolve, reject) => {
        axios.get("http://localhost:8888/public/index.html")
        .then(res => {
            resolve(res.data)
        })
        .catch(reject)
    })
}

const Module = module.constructor
const mfs = new MemoryFs()
const serverCompiler = webpack(serverConfig)
let serverBoundle
serverCompiler.outputFileSystem = mfs

serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(warn => console.warn(warn))
  
    const bundlePath = path.join(
      serverConfig.output.path,
      serverConfig.output.filename
    )
    const bundle = mfs.readFileSync(bundlePath, 'utf-8')

    const m = new Module()
    m._compile(bundle, 'server-entry.js')
    serverBoundle = m.exports.default
})

module.exports = function (app) {
    app.use('/public', proxy({
        target: 'http://localhost:8888'
    }))
    app.get("*", function (req, res) {
        getTemplate().then(template => {
            const content = ReactSSR.renderToString(serverBoundle)
            res.send(template.replace('<!-- app -->', content));
        })
    });
}