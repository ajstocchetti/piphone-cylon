'use strict';
const config = require('./config');
const logger = require('./logger');
const tu = require('./hrtime-utils');

const pulseTimeoutNs = config.pulseTimeout * 1e6; // nanoseconds
const store = {
  lineState: undefined, // 'open' or 'closed'
  lastUp: null,
  lastDown: null,
};


module.exports = {
  getLastDown,
  getLastUp,
  getLineState,
  getPhoneState,
  lineDown,
  lineUp,
};


function lineUp() {
  store.lastUp = process.hrtime();
  store.lineState = 'open';
  return getLastUp();
}
function lineDown() {
  store.lastDown = process.hrtime();
  store.lineState = 'closed';
  return getLastDown();
}
function getLineState() {
  return store.lineState;
}


function getLastUp() {
  return store.lastUp.slice();
}
function getLastDown() {
  return store.lastDown.slice();
}


function getPhoneState() {
  // initializing
  // pulsing-up, off-hook
  // pulsing-down, hung-up

  const line  = getLineState();
  if (!line) {
    // line state is not set - nothng has happened yet
    return 'initializing';
  }

  if (line == 'open') {
    // TODO: consider checking if dialed has length -> dialing (as opposed to off-hook)
    return tu.hrtToNs(process.hrtime(getLastUp())) < pulseTimeoutNs ? 'pulsing-up' : 'off-hook';
  } else {
    // line is closed
    return tu.hrtToNs(process.hrtime(getLastDown())) < pulseTimeoutNs ? 'pulsing-down' : 'hung-up';
  }
}
