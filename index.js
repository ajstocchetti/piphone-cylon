'use strict';
const Cylon = require('cylon');
const logger = require('./logger');
const store = require('./reducer');

const pulseTimeout = 300;

Cylon.robot({
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

        let lastUp = process.hrtime();
        let pulseCount = 0;

        function checkPulse(onRelease) {
          return () => {
            if (onRelease == pulseCount) {
              store.dial(pulseCount);
              logger.debug(store.getDialed());
              pulseCount = 0;
            }
          }
        }

        my.button.on('push', function() {
          // finishing a pulse or receiver was lifted off hook
          store.lineUp();
          // set last up so we can keep track if the phone is being pulled off the receiver,
          // or if this is actually a pulse
          lastUp = process.hrtime();
        });
        my.button.on('release', function() {
            // starting a pulse or receiver is hung up
            store.lineDown();

            if (process.hrtime(lastUp)[0] > 1) return;
            pulseCount++;
            setTimeout(checkPulse(pulseCount), pulseTimeout);
        });
    }
}).start();
