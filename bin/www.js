#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { server, app } from '../app.js';
import connectDB from '../db.js';
import debugModule from 'debug';
const debug = debugModule('github-pat-11bchhvwi0i6sbexfewjbu-3vvcrds5keadnmunh:server');

/**
 * Get DB url from command line and store in Express.
 */
const dbAddress = process.argv[2];
const username = process.env.dbUsername;
const password = process.env.dbPassword;
await connectDB(username, password, dbAddress);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
