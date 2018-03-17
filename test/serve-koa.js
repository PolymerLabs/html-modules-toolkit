const Koa = require('koa');
const static = require('koa-static');

const { htmlModulesMiddleware } =
    require('../lib/html-module-transform/koa-middleware.js');

const root = './src';
const app = new Koa();

app.use(htmlModulesMiddleware(root));
app.use(static(root));

app.listen(3000);
