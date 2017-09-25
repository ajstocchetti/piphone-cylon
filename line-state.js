'use strict';
const config = require('./config');
const dialer = require('./dial-queue');
const logger = require('./logger');
const tu = require('./hrtime-utils');

const pulseTimeoutNs = config.pulseTimeout * 1e6; // nanoseconds
const store = {
  lineState: undefined, // 'open' or 'closed'
  lastUp: null,
  lastDown: null,
};
let pulseCount = 0;


module.exports = {
  getLastDown,
  getLastUp,
  getLineState,
  getPhoneState,
  lineDown,
  lineUp,
};


function lineUp() {
  // finishing a pulse or receiver was lifted off hook
  if (getPhoneState() == 'pulsing-down') {
    // line was recently broken. this counts as a complete pulse
    setTimeout(checkPulse(++pulseCount), config.pulseFinishTimeout);
  }
  store.lastUp = process.hrtime();
  store.lineState = 'open';
  return getLastUp();
}
function lineDown() {
  // starting a pulse or receiver is hung up
  store.lastDown = process.hrtime();
  store.lineState = 'closed';
  setTimeout(checkHangUp, config.pulseFinishTimeout);
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

// counting pulses
function checkPulse(onRelease) {
  return () => {
    if (onRelease === pulseCount) {
      const dialed = dialer.dial(pulseCount);
      pulseCount = 0;
    }
  }
}

function checkHangUp() {
  if (getPhoneState() == 'hung-up') {
    dialer.clearDialed();
  }
}
