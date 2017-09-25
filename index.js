'use strict';
const Cylon = require('cylon');
const config = require('./config');
const dialer = require('./dial-queue').ee;
const line = require('./line-state');
const logger = require('./logger');


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
        led: {
            driver: 'led',
            pin: 11
        },
        button: {
            driver: 'button',
            pin: 16
        }
    },
    work: function(my) {
        // my.led.turnOn();
        // setTimeout(() => {
        //     my.led.toggle();
        // }, 5000)
        // setTimeout(my.led.toggle, 10000)
        //  every((1).second(), my.led.toggle);

        my.button.on('push', function() {
          // starting a pulse or receiver is hung up
          line.lineDown();
        });

        my.button.on('release', function() {
          // finishing a pulse or receiver was lifted off hook
          line.lineUp();
        });
    }
});

robot.start();
