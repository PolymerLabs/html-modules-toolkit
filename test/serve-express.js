const express = require('express');
const { htmlModulesMiddleware } =
    require('../lib/html-module-transform/express-middleware.js');

const root = './src';
const app = express();

app.use(htmlModulesMiddleware(root));
app.use(express.static(root));

app.listen(3000);
