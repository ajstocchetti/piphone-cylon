'use strict';
const Cylon = require('cylon');
const config = require('./config');
const logger = require('./logger');
const store = require('./reducer');


function gracefulExit() {
    logger.info('Shutting down');
//    if (robot) robot.halt();
}

process.on('SIGINT', process.exit);
process.on('exit', gracefulExit);

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

        let pulseCount = 0;

        function checkPulse(onRelease) {
          return () => {
            if (onRelease === pulseCount) {
              const dialed = store.dial(pulseCount);
              logger.debug(dialed);
              pulseCount = 0;
            }
          }
        }

        function checkHangUp() {
          if (store.getPhoneState() == 'hung-up') {
            store.clearDialed();
          }
        }

        my.button.on('push', function() {
          // starting a pulse or receiver is hung up
          store.lineDown();
          setTimeout(checkHangUp, config.pulseFinishTimeout);
        });

        my.button.on('release', function() {
          // finishing a pulse or receiver was lifted off hook
          if (store.getPhoneState() == 'pulsing-down') {
            // line was recently broken. this counts as a complete pulse
            setTimeout(checkPulse(++pulseCount), config.pulseFinishTimeout);
          }
          store.lineUp();
        });
    }
});

robot.start();

