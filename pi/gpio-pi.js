const Gpio = require("pigpio").Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321;
const THRESHOLD = 4;
const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
const info = [
  { pin: 24, score: 100, echo: null },
  { pin: 25, score: 50, echo: null },
  { pin: 22, score: 20, echo: null },
  { pin: 27, score: 10, echo: null },
];
info.forEach(
  x => (x.echo = new Gpio(x.pin, { mode: Gpio.INPUT, alert: true }))
);

trigger.digitalWrite(0); // Make sure trigger is low

let throttle = false;

let lastScore = new Date();

const io = require("socket.io-client");

const socket = io.connect("http://skeeball.croissant.one:9000");

socket.on("connect", () => {
  console.log("Connected to server");
});

const watchHCSR04 = () => {
  let startTick;
  info.forEach((x,i) => {
    x.echo.glitchFilter(500)
    x.echo.on("alert", (level, tick) => {
      if (level == 1) {
        startTick = tick;
      } else {
        const endTick = tick;
        const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
        console.log(`Sensor ${i}: ${diff / 2 / MICROSECDONDS_PER_CM}`);
        if (diff / 2 / MICROSECDONDS_PER_CM < THRESHOLD && !throttle) {
          if(new Date()-lastScore>5000){
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
