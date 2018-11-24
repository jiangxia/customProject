const Express = require('express')
const ReactSSR = require('react-dom/server')
const favicon = require('serve-favicon')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'

const app = new Express()
app.use(favicon(path.join(__dirname, '../favicon.ico')))
if (!isDev) {
    const ServerEntry = require('../dist/server-entry.js').default
    const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8')
    app.use('/public', Express.static(path.join(__dirname, '../dist')))
    app.get('*', function (req, res) {
        const appString = ReactSSR.renderToString(ServerEntry);
        res.send(template.replace('<!-- app -->', appString));
    });
} else {
    const devStatic = require('./util/dev-static')
    devStatic(app)
}

app.listen(3333, function () {
    console.log('server is linstening 3333')
})
