const io = require("socket.io-client");
// const Gpio = require('pigpio').Gpio;

const socket = io("http://localhost:9000");


socket.on("connect", () => {
  console.log("Connected to server");
  // socket.emit("newgame",{
  //   name: "croissant"
  // })

  socket.emit("score",{
    points: 50
  })
});
