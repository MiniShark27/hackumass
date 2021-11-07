const Gpio = require("pigpio").Gpio;
const io = require("socket.io-client");
const socket = io.connect("http://skeeball.croissant.one:9000");

process.stdin.setEncoding("utf8");
process.stdin.on("data", (data) => {
    console.log("You typed", data.trim());
});

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321;
const SCORE_DELAY = 1000;
const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
trigger.digitalWrite(0); // Make sure trigger is low
let throttle = false;
let lastScore = new Date();
const info = [
  { pin: 24, score: 100, echo: null, threshold: 7 },
  { pin: 25, score: 50, echo: null, threshold: 7 },
  { pin: 22, score: 20, echo: null, threshold: 10 },
  { pin: 27, score: 10, echo: null, threshold: 7 },
];

info.forEach(
  x => (x.echo = new Gpio(x.pin, { mode: Gpio.INPUT, alert: true }))
);

socket.on("connect", () => {
  console.log("Connected to server");
});

const watchHCSR04 = () => {
  let startTick;
  info.forEach((x, i) => {
    // x.echo.glitchFilter(500)
    x.echo.on("alert", (level, tick) => {
      if (level == 1) {
        startTick = tick;
      } else {
        const endTick = tick;
        const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
        const temp = diff / 2 / MICROSECDONDS_PER_CM;
        // console.log(`Sensor ${i}: ${temp}`);
        if (temp < x.threshold && !throttle) {
          console.log(`Sensor ${i}: ${temp} < ${x.threshold}`);
          if (new Date() - lastScore > SCORE_DELAY) {
            lastScore = new Date()
            socket.emit("score", {
              points: x.score,
            });
            throttle = true;
            setTimeout(() => {
              throttle = false;
            }, 1000);
          }
        }
      }
    });
  });
};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 100);
