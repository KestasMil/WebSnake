// Set global variables.
const canvas = document.querySelector('.snake-canvas'); //Get canvas element
canvas.style.position = 'relative';
let horizontalSegCount = 10; //Set number of segments displayed in canvas horizontaly (this defines how big segments will be)
let segSize = canvas.clientWidth / horizontalSegCount;
let verticalSegCount = Number.parseInt(canvas.clientHeight / segSize); //Calculate maximum number of segments fitting vertically.
console.log('Segs vertically: ', verticalSegCount);

// Controlls
let direction = 'RIGHT'; //UP, RIGHT, DOWN, LEFT

// Create snake segment
let headSeg = document.createElement('div');
// Style segment
headSeg.style.width = `${segSize}px`;
headSeg.style.height = `${segSize}px`;
headSeg.style.backgroundColor = '#ffbbcc';
// Positioning
headSeg.style.position = 'absolute';
// Append to canvas
canvas.appendChild(headSeg);

// Snake's head as an object holding x and y segment index as a current location.
const snakeHead = {xSeg: 3, ySeg: 3, segEl: headSeg};
// Array of snakes body segments holding location as an offset from the segment in front. 
// P.S. First element holds an offset from snakes head object.
const segArr = ['U', 'U', 'U', 'L', 'L'];

function PositionHead({xSeg, ySeg, segEl}) {
  // Move to right location
  segEl.style.left = `${xSeg * segSize}px`;
  segEl.style.top = `${ySeg * segSize}px`;
}

function AdjustSnakesBody() {
  //Loop trough each link to possition it correctly.
}

function MoveHead() {
  switch (direction) {
    case 'UP':
      snakeHead.ySeg = (snakeHead.ySeg === 0) ? verticalSegCount-1 : snakeHead.ySeg-1;
      break;
    case 'DOWN':
      snakeHead.ySeg = (snakeHead.ySeg === verticalSegCount-1) ? 0 : snakeHead.ySeg+1;
      break;
    case 'LEFT':
      snakeHead.xSeg = (snakeHead.xSeg === 0) ? horizontalSegCount-1 : snakeHead.xSeg-1;
      break;
    case 'RIGHT':
      snakeHead.xSeg = (snakeHead.xSeg === horizontalSegCount-1) ? 0 : snakeHead.xSeg+1;
      break;
    default:
      break;
  }
}

PositionHead(snakeHead);
setInterval(() => {
  MoveHead();
  PositionHead(snakeHead);
}, 100);
MoveHead();
PositionHead(snakeHead);