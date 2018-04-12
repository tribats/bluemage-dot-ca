var timerId = null;
var interval = 100;

self.onmessage = function (e) {
  if (e.data === "start") {
    console.log("starting");
    timerId = setInterval(function () {
      postMessage("tick");
    }, interval);
  } else if (e.data.interval) {
    console.log("setting interval");
    interval = e.data.interval;
    console.log("interval=" + interval);

    if (timerId) {
      clearInterval(timerID);
      timerId = setInterval(function () {
        postMessage("tick");
      }, interval);
    }
  } else if (e.data === "stop") {
    console.log("stopping");
    clearInterval(timerId);
    timerId = null;
  }
};
