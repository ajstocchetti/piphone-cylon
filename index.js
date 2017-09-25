'use strict';
const Cylon = require('cylon');
const dialer = require('./dial-queue').ee;
const line = require('./line-state');
// const logger = require('./logger');


// function gracefulExit() {
//     logger.info('Shutting down');
// }
//
// process.on('SIGINT', process.exit);
// process.on('exit', gracefulExit);

const robot = Cylon.robot({
    connections: {
        raspi: {
            adaptor: 'raspi'
        }
    },
    devices: {
        led1: { driver: 'led', pin: 11 },
        led2: { driver: 'led', pin: 13 },
        led3: { driver: 'led', pin: 15 },
        phoneLine: { driver: 'button', pin: 16 },
    },
    work: function(my) {
        // my.led.turnOn();
        // setTimeout(() => {
        //     my.led.toggle();
        // }, 5000)
        // setTimeout(my.led.toggle, 10000)
        //  every((1).second(), my.led.toggle);

        my.phoneLine.on('push', function() {
          // starting a pulse or receiver is hung up
          line.lineDown();
        });

        my.phoneLine.on('release', function() {
          // finishing a pulse or receiver was lifted off hook
          line.lineUp();
        });

        dialer.on('dial', dialArr => {
          console.log(dialArr);
        });
    }
});

robot.start();
