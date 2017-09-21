'use strict';

module.exports = {
  log,
  debug: logSev('debug'),
  info: logSev('info'),
  warn: logSev('warn'),
  error: logSev('error'),
  fatal: logSev('fatal'),
}

function log(severity, msg) {
  console.log(msg);
}

function logSev(severity) {
  return log.bind(this, severity);
}
