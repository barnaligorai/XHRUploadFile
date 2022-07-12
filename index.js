const { startServer, createRouter, fileHandler, notFound } = require('myserver');
const { multipartFormParser } = require("./multipartFormParser");
const { injectBody } = require('./src/handler/injectBody');
const { dataHandler } = require('./src/handler/xhrHandler');

startServer(4444, createRouter([
  injectBody,
  multipartFormParser,
  dataHandler,
  fileHandler('./public'),
  notFound
]));
