'use strict';
const EventEmitter = require('events');

const dialed = [];
const dialEmitter = new EventEmitter();

module.exports = {
  clearDialed,
  dial,
  ee: dialEmitter,
  getDialed,
};

function getDialed() {
  // call slice to make a copy
  return dialed.slice();
}

function dial(num) {
  // TODO: validate input
  dialed.push(num);
  emitDialed();
  return getDialed();
}

function clearDialed() {
  dialed.length = 0;
  emitDialed();
  return getDialed();
}

function emitDialed() {
  dialEmitter.emit('dial', getDialed());
}
