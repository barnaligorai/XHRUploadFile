const { startServer, createRouter, fileHandler, notFound } = require('myserver');

startServer(4444, createRouter([fileHandler('./public'), notFound]));