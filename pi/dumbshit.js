const Gpio = require("pigpio").Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321;
const THRESHOLD = 4;
const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
const echo0 = new Gpio(24, { mode: Gpio.INPUT, alert: true });
const echo1 = new Gpio(25, { mode: Gpio.INPUT, alert: true });
const echo2 = new Gpio(22, { mode: Gpio.INPUT, alert: true });
const echo3 = new Gpio(27, { mode: Gpio.INPUT, alert: true });
trigger.digitalWrite(0); // Make sure trigger is low

let throttle = false

const io = require("socket.io-client");

const socket = io.connect("http://skeeball.croissant.one:9000");

socket.on("connect", () => {
	console.log("Connected to server");
});

const watchHCSR04 = () => {
  let startTick;

  echo0.on("alert", (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(`Sensor 0: ${diff / 2 / MICROSECDONDS_PER_CM}`);
      if ((diff / 2 / MICROSECDONDS_PER_CM < THRESHOLD) && !throttle) {
        socket.emit("score",{
          points: 100
        })
        throttle = true
        setTimeout(() => {throttle = false}, 1000)
      }
    }
  });

  echo1.on("alert", (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(`Sensor 1: ${diff / 2 / MICROSECDONDS_PER_CM}`);
      if ((diff / 2 / MICROSECDONDS_PER_CM < THRESHOLD) && !throttle) {
        socket.emit("score",{
          points: 50
        })
        throttle = true
        setTimeout(() => {throttle = false}, 1000)
      }
    }
  });

  echo2.on("alert", (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(`Sensor 2: ${diff / 2 / MICROSECDONDS_PER_CM}`);
      if ((diff / 2 / MICROSECDONDS_PER_CM < THRESHOLD) && !throttle) {
        socket.emit("score",{
          points: 20
        })
        throttle = true
        setTimeout(() => {throttle = false}, 1000)
      }
    }
  });

  echo3.on("alert", (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      console.log(`Sensor 3: ${diff / 2 / MICROSECDONDS_PER_CM}`);
      if (diff / 2 / MICROSECDONDS_PER_CM < THRESHOLD) {
        socket.emit("score",{
          points: 10
        })
        throttle = true
        setTimeout(() => {throttle = false}, 1000)
      }
    }
  });
};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 100);
