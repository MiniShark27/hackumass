const { Server } = require("socket.io");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();
app.use(require("cors")());
app.use(express.static("../frontend/build"));
const http = require("http");
const server = http.createServer(app);

const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const { Client } = require("pg");
const client = new Client();
let initialized = false;

async function initConn() {
  client.connect().then(() => (initialized = true));
}

function wait(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };
  return new Promise(poll);
}

async function queryDb(query, args) {
  if (!initialized) wait(() => initialized);
  return client.query(query, args);
}

async function addToScoreboard(score, name) {
  let res = await queryDb(
    "INSERT INTO public.hello(score, name) VALUES ( $1, $2);",
    [score, name]
  );
  console.table(res.rows);
  return res.rows;
}

let globalScore = 0;
let globalName = "";
let globalLeaderBoard = [];
const BALL_COUNT = 5;
let curBallCount = BALL_COUNT;

app.get("/data", (req, res) => {
  resetLeaderBoard();
  res.json({
    score: globalScore,
    name: globalName,
    leaderBoard: globalLeaderBoard,
    ballCount: curBallCount,
  });
});

io.on("connection", (socket) => {
  console.log("New client connected");

  io.emit("gamedata", {
    score: globalScore,
    name: globalName,
    leaderBoard: globalLeaderBoard,
    ballCount: curBallCount,
  });

  socket.on("newgame", (msg) => {
    console.log("New Game: ", msg.name);
    globalScore = 0;
    globalName = msg.name;
    curBallCount = BALL_COUNT;
    io.emit("gamedata", {
      score: globalScore,
      name: globalName,
      leaderBoard: globalLeaderBoard,
      ballCount: curBallCount,
    });
  });

  socket.on("score", (msg) => {
    console.log("Score: ", msg.points);
    globalScore += parseInt(msg.points);
    curBallCount--;
    if (curBallCount < 0) return;
    if (curBallCount == 0) {
      addToScoreboard(globalScore, globalName);
    }
    resetLeaderBoard();
    globalLeaderBoard.push({ score: globalScore, name: globalName });
    globalLeaderBoard.sort((a, b) => b.score - a.score);
    globalLeaderBoard.pop();

    io.emit("gamedata", {
      score: globalScore,
      name: globalName,
      leaderBoard: globalLeaderBoard,
      ballCount: curBallCount,
    });
  });
});

async function resetLeaderBoard() {
  const res = await queryDb(
    "select score,name from hello order by score desc limit 10"
  );
  globalLeaderBoard = res.rows;
  // console.log(globalLeaderBoard)
}

httpServer.listen(PORT, () => {
  initConn()
    .then(resetLeaderBoard)
    .then(() => console.log(`Listening on ${PORT}`));
});
