const socket = io(`http://localhost:5000`);

const controller = { x: 0, y: 0, up: 0, down: 0, left: 0, right: 0 };
let prevController = {};
let WIDTH, HEIGHT;

let game;

function setup() {
  const canvas = createCanvas(600, 600);
  canvas.parent("sketch");
  WIDTH = width;
  HEIGHT = height;

  socket.on("data", data => {
    data = data.split(",").map(x => Number(x));
    controller.x = map(data[0], -10, 10, -1, 1);
    controller.y = map(data[1], -10, 10, -1, 1);
    controller.up = data[2];
    controller.down = data[3];
    controller.left = data[4];
    controller.right = data[5];
  });

  game = new Game();
}

function draw() {
  game.draw();
}

function handleInput() {
  game.handleInput();
}
