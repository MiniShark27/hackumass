const Gpio = require("pigpio").Gpio;
const io = require("socket.io-client");
const socket = io.connect("http://skeeball.croissant.one:9000");

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius divided by 2 for 2 ways
const MICROSECDONDS_PER_CM = 1e6 / 34321 / 2;
const SCORE_DELAY = 1000;
const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
trigger.digitalWrite(0); // Make sure trigger is low
let lastScore = new Date();
const info = [
  { pin: 24, score: 100, echo: null, threshold: 7 },
  { pin: 25, score: 50, echo: null, threshold: 7 },
  { pin: 22, score: 20, echo: null, threshold: 7 },
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
    x.echo.on("alert", (level, tick) => {
      if (level == 1) {
        startTick = tick;
      } else {
        const endTick = tick;
        const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
        const temp = diff / MICROSECDONDS_PER_CM;
        console.log(`Sensor ${i}: ${temp}`);
        if (temp < x.threshold) {
          console.log(`Sensor ${i}: ${temp} < ${x.threshold}`);
          if (new Date() - lastScore > SCORE_DELAY) {
            lastScore = new Date()
            socket.emit("score", {
              points: x.score,
            });
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