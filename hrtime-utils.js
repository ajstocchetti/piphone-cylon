'use strict';
const NS_PER_SEC = 1e9;

module.exports = {
  hrtToNs,
  diffHrTimes,
};

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
