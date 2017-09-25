'use strict';
const EventEmitter = require('events');

const listener = new EventEmitter();

listener.on('dial', (dialArr) => {
  console.log(dialArr);
});
