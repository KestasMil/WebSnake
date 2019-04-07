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
  let snakeBody = [];
  let direction = 'RIGHT';
  let speed = 100;

  /**
   * Hookup input
   */
  window.addEventListener('keydown', function(e){
    switch (e.key) {
      case 'w' || 'ArrowUp':
        direction = 'UP';
        break;
      case 's' || 'ArrowDown':
        direction = 'DOWN';
        break;
      case 'a' || 'ArrowLeft':
        direction = 'LEFT';
        break;
      case 'd' || 'ArrowRight':
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

  // Game loop
  setInterval(function(){
    MoveHead();
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
    return {xSeg: 3, ySeg: 3, segEl: headSeg};
  }

  function initCanvas() {
    snakeCanvas.style.position = 'relative';
  }

  function UpdateCanvas() {
    snakeHead.segEl.style.left = `${snakeHead.xSeg * segSizeWidth}px`;
    snakeHead.segEl.style.top = `${snakeHead.ySeg * segSizeHeight}px`;
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