'use strict';
const logger = require('./logger');

const store = {
  phoneState: undefined, // 'open' or 'closed'
  lineState: undefined, // 'pulsing-up', 'pulsing-down', 'hung-up', 'off-hook'
  dialed: [],
};

module.exports = {
  getPhoneState,
  getLineState,
  getDialed,
  clearDialed,
  dial,
  lineUp,
  lineDown,
  hangUp,
  offHook,
}

// getters
function getPhoneState() { return store.phoneState; }
function getLineState() { return store.lineState; }
function getDialed() { return store.dialed.slice(); } // call slice to make a copy

// setters
function clearDialed() {
  store.dialed.length = 0;
}

function dial(num) {
  // TODO: validate input
  store.dialed.push(num);
}

function lineUp() {
  store.lineState = 'open';
  store.phoneState = 'pulsing-up';
}

function lineDown() {
  store.lineState = 'closed';
  store.phoneState = 'pulsing-down';
}

function hangUp() {
  if (phoneState == 'closed') store.lineState = 'hung-up';
  else logger.warn('Cannot set phone hung up when line is not closed');
}

function offHook() {
  if (phoneState == 'open') store.lineState = 'off-hook';
  else logger.warn('Cannot set phone off-hook when line is not open');
}
