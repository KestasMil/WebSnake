const webSnake = (function() {
  /**
   * Main variables defining the parameters of the game.
   */
  const snakeCanvas = document.querySelector('.snake-canvas');
  //Number of segments to display in canvas horizontaly (this defines how big segments will be). (default = 10)
  let horizontalSegCount = 20;
  //Based on horizontalSegCount calculate the size of one segment horizontally.
  let segSizeWidth = snakeCanvas.clientWidth / horizontalSegCount;
  //Calculate maximum number of segments fitting vertically.
  let verticalSegCount = Number.parseInt(snakeCanvas.clientHeight / segSizeWidth);
  //Based on verticalSegCount calculate the size of one segment vertically.
  let segSizeHeight = snakeCanvas.clientHeight / verticalSegCount;

  /**
   * SETUP.
   */
  let snakeHead = {};
  let snakeTail = [];
  let snakeFood = {};
  let direction = 'RIGHT';
  let speed = 200;
  //Test com

  /**
   * Hookup input
   */
  window.addEventListener('keydown', function(e){
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        direction = 'UP';
        break;
      case 'ArrowDown':
      case 's':
        direction = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
        direction = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
        direction = 'RIGHT';
        break;
      default:
        break;
    }
  });


  /** Debugging things. */
  console.log('Seg Width', segSizeWidth);
  console.log('Count Vertically', verticalSegCount);
  console.log('Seg Height', segSizeHeight);

  /**
   * Initialize Game
   */
  initCanvas();
  snakeHead = initHead();
  snakeFood = InitFood();

  // Game loop
  setInterval(function(){
    MoveHead();
    CheckForCollision();
    UpdateCanvas();
  }, speed);

  /**
   * Functions
   */
  function initHead() {
    // Create snake segment
    let headSeg = document.createElement('div');
    // Style segment
    headSeg.style.width = `${segSizeWidth}px`;
    headSeg.style.height = `${segSizeHeight}px`;
    headSeg.style.backgroundColor = '#ffbbcc';
    // Positioning
    headSeg.style.position = 'absolute';
    // Coordinates
    let xSeg = 3, ySeg = 3;
    // Update heads position
    headSeg.style.left = `${xSeg * segSizeWidth}px`;
    headSeg.style.top = `${ySeg * segSizeHeight}px`;
    // Append to canvas
    snakeCanvas.appendChild(headSeg);
    return {xSeg: xSeg, ySeg: ySeg, segEl: headSeg};
  }

  function initCanvas() {
    snakeCanvas.style.position = 'relative';
  }

  function UpdateCanvas() {
    // Update snake heads position
    snakeHead.segEl.style.left = `${snakeHead.xSeg * segSizeWidth}px`;
    snakeHead.segEl.style.top = `${snakeHead.ySeg * segSizeHeight}px`;
    // Update foods position
    snakeFood.segEl.style.left = `${snakeFood.xSeg * segSizeWidth}px`;
    snakeFood.segEl.style.top = `${snakeFood.ySeg * segSizeHeight}px`;
  }

  function CheckForCollision() {
      // Collision with head
      if ((snakeHead.xSeg === snakeFood.xSeg) && (snakeHead.ySeg === snakeFood.ySeg)) {
        RandomiseFood();
      }
  }

  function RandomiseFood() {
    snakeFood.xSeg = Math.floor(Math.random() * (horizontalSegCount));
    snakeFood.ySeg = Math.floor(Math.random() * (verticalSegCount));
  }

  function InitFood() {
    // Create element
    let sf = document.createElement('div');
    // Style segment
    sf.style.width = `${segSizeWidth}px`;
    sf.style.height = `${segSizeHeight}px`;
    sf.style.backgroundColor = '#ffbbcc';
    // Positioning
    sf.style.position = 'absolute';
    // Coordinates
    let xSeg = Math.floor(Math.random() * (horizontalSegCount));
    let ySeg = Math.floor(Math.random() * (verticalSegCount));
    console.log(xSeg, ySeg);
    // Update heads position
    sf.style.left = `${xSeg * segSizeWidth}px`;
    sf.style.top = `${ySeg * segSizeHeight}px`;
    // Append to canvas
    snakeCanvas.appendChild(sf);
    return {xSeg: xSeg, ySeg: ySeg, segEl: sf};
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

  /**
   * Public Properties
   */
  return {

  }
})();