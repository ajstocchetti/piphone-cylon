'use strict';
const Cylon = require('cylon');
const logger = require('./logger');
const store = require('./reducer');

const NS_PER_SEC = 1e9;
const pulseTimeout = 300; // milliseconds
const pulseTimeoutNs = pulseTimeout * 1e6; // nanoseconds
const pulseFinishTimeout = pulseTimeout + 50; // milliseconds

function hrtToNs(hrt) {
  return ( NS_PER_SEC * hrt[0] ) + hrt[1];
}
function diffHrTimes(hrt1, hrt2) {
  // if hrt1 = earlier, hrt2 = later then nanoseconds will be positive
  return hrtToNs(hrt2) - hrtToNs(hrt1);
  // const diff = [hrt2[0] - hrt1[0], hrt2[1] - hrt1[1]];
  // const nanoseconds = (NS_PER_SEC * diff[0]) + diff[1];
  // return nanoseconds;
}

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
        let lastDown = null;
        let pulseCount = 0;

        function checkPulse(onRelease) {
          return () => {
            if (onRelease === pulseCount) {
              store.dial(pulseCount);
              logger.debug(store.getDialed());
              pulseCount = 0;
            }
          }
        }

        function checkForHangUp(downTimeIn) {
          const downTime = downTimeIn.slice(); // make copy of array
          return () => {
            if (diffHrTimes(lastUp, downTime) > 0) {
              // downTime is after lastUp -> phone is hung up
              store.hangUp();
            }
          }
        }

        my.button.on('push', function() {
          // finishing a pulse or receiver was lifted off hook
          lastUp = process.hrtime();
          store.lineUp();
          if (!lastDown) {
            // lastDown is not set - this is the first time phone is taken off hook
            store.offHook();
            return;
          }

          const downDifNs = hrtToNs(process.hrtime(lastDown));
          if (downDifNs < pulseTimeoutNs) {
            // last down tick was w/in pulse timeout - valid pulse
            setTimeout(checkPulse(++pulseCount), pulseFinishTimeout);
          } else {
            store.offHook();
          }
        });

        my.button.on('release', function() {
            // starting a pulse or receiver is hung up
            store.lineDown();
            lastDown = process.hrtime();
            setTimeout(checkForHangUp(lastDown), pulseTimeout);
        });
    }
}).start();
