require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const port = new SerialPort(process.env.USB_PATH, {
  baudRate: 115200
});
const parser = new Readline();
port.pipe(parser);

const { createFileIfNotExists, readFile, appendToFile } = require("./helpers");

const scoreFile = process.env.SCORE_FILE;

app.use(express.static("public"));

app.get("/", (req, res) => res.redirect("/asteroids"));

app.get("/asteroids", (req, res) =>
  res.sendFile(__dirname + "/public/asteroids.html")
);

app.get("/catch", (req, res) => res.sendFile(__dirname + "/public/catch.html"));

app.get("/scoreboard", (req, res) => {
  try {
    createFileIfNotExists(scoreFile, () => {
      readFile(scoreFile, result => {
        const data = [];
        result = result.toString().split(",");
        result.pop();
        result.forEach((x, i) => {
          if (!data[Math.floor(i / 2)]) {
            data[Math.floor(i / 2)] = { name: x };
          } else {
            data[Math.floor(i / 2)].score = Number(x);
          }
        });
        data.sort((x, y) => y.score - x.score);
        res.send(data.slice(0, 5));
      });
    });
  } catch (error) {
    res.send("error");
  }
});

app.post("/scoreboard/:name/:score", (req, res) => {
  try {
    createFileIfNotExists(scoreFile, () => {
      appendToFile(scoreFile, `${req.params.name},${req.params.score},`, () => {
        res.send("success");
      });
    });
  } catch (error) {
    res.send("error");
  }
});

io.on("connection", socket => {
  parser.on("data", line => {
    if (line.includes("modeChanged")) {
      socket.emit("modeChanged");
    } else {
      if (line.trim().match(/([0-9]+,)*[0-9]+/) === null) return;
      socket.emit("data", line.trim());
    }
  });

  socket.on("sound", data => port.write(data));

  socket.on("mode", mode => {
    mode = Number.parseInt(mode, 2);
    port.write(`m${mode}`);
  });
});

server.listen(process.env.PORT);
console.log(`Server started on port ${process.env.PORT}`);
