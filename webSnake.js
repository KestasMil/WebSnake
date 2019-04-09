const webSnake = (function() {
  /**
   * Main variables defining the parameters of the game.
   */
  const snakeCanvas = document.querySelector('.snake-canvas');
  //Size of the segment (square dimensions aprox.)
  let segSize = 20;
  //Number of segments to display in canvas horizontaly (to fill canvas without gaps).
  let horizontalSegCount = Number.parseInt(snakeCanvas.clientWidth / segSize);
  //Calculate maximum number of segments fitting vertically (to fill canvas without gaps).
  let verticalSegCount = Number.parseInt(snakeCanvas.clientHeight / segSize);
  //Based on horizontalSegCount calculate the size of one segment horizontally.
  let segSizeWidth = snakeCanvas.clientWidth / horizontalSegCount;
  //Based on verticalSegCount calculate the size of one segment vertically.
  let segSizeHeight = snakeCanvas.clientHeight / verticalSegCount;

  let canvasSize = {xSize: snakeCanvas.clientWidth, ySize: snakeCanvas.clientHeight};

  let snakeHead = {};
  let snakeTail = [];
  let snakeFood = {};
  let direction = 'RIGHT';
  let speed = 150;
  let intervalPointer;


  /**
   * Hookup input and set Canvas position to relative.
   */
  initCanvas();
  window.addEventListener('keydown', function(e){
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        direction = (direction === 'DOWN') ? 'DOWN' : 'UP';
        break;
      case 'ArrowDown':
      case 's':
        direction = (direction === 'UP') ? 'UP' : 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
        direction = (direction === 'RIGHT') ? 'RIGHT' : 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
        direction = (direction === 'LEFT') ? 'LEFT' : 'RIGHT';
        break;
      default:
        break;
    }
  });

  RestartGame();

  /**
   * Public Fields and Methods
   */
  function RestartGame() {
    // Clear game loop interval
    clearInterval(intervalPointer);
    // Clear canvas
    snakeCanvas.innerHTML = '';

    // Initialize global variables
    snakeHead = initHead();
    snakeTail = initTail(1, 'L'); //tail with 5 segments. 'L' - all segments to the left of the head. (L, R, A, B)
    snakeFood = initFood();

    // Update tail's segmens coordinates, required after initializing tail for the first time (and on canvas resize).
    updateTailSegmentationCoords();

    //Start Game loop
    intervalPointer = setInterval(function(){
      moveSnake();
      checkForFood();
      if (checkForCollision()) {
        clearInterval(intervalPointer);
        RestartGame();
      }
      updateCanvas();
    }, speed);
  }

  function ChangeGameSpeed(newSpeed) {
    speed = newSpeed;

    // Clear game loop interval
    clearInterval(intervalPointer);

    //Start Game loop
    intervalPointer = setInterval(function(){
      moveSnake();
      checkForFood();
      if (checkForCollision()) {
        clearInterval(intervalPointer);
        RestartGame();
      }
      updateCanvas();
    }, speed);
  }

  /**
   * Functions
   */
  function initTail(numOfSegments, direction) {
    let result = [];
    for (let i = 0; i < numOfSegments; i++) {
      result.push({loc: direction, xSeg: 0, ySeg: 0, segEl: null});
    }
    return result;
  }

  function initHead() {
    xSeg = Math.floor(Math.random() * (horizontalSegCount));
    ySeg = Math.floor(Math.random() * (verticalSegCount));
    return {xSeg: xSeg, ySeg: ySeg, segEl: null};
  }

  function initFood() {
    xSeg = Math.floor(Math.random() * (horizontalSegCount));
    ySeg = Math.floor(Math.random() * (verticalSegCount));
    return {xSeg: xSeg, ySeg: ySeg, segEl: null};
  }

  function initCanvas() {
    snakeCanvas.style.position = 'relative';
  }

  // Check for collision
  function checkForCollision() {
    let ret = false;
    snakeTail.forEach(tailEl => {
      if (tailEl.xSeg === snakeHead.xSeg && tailEl.ySeg === snakeHead.ySeg) {
        ret = true;
      }
    });
    return ret;
  }

  // This function only needs to be called when position of tail segments is required to be calculated
  // in case canvas was resized. Function is also used just after tail is instantiated or grown.
  function updateTailSegmentationCoords() {
    let tempCoords = { x: snakeHead.xSeg, y: snakeHead.ySeg };
    snakeTail.forEach(element => {
      // Set new segment coorditane for tail segment
      switch (element.loc) {
        case 'L':
          element.xSeg = (tempCoords.x > 0) ? tempCoords.x-1 : horizontalSegCount-1;
          element.ySeg = tempCoords.y;
          break;
        case 'R':
          element.xSeg = (tempCoords.x < horizontalSegCount-1) ? tempCoords.x+1 : 0;
          element.ySeg = tempCoords.y;
          break;
        case 'A':
          element.ySeg = (tempCoords.y > 0) ? tempCoords.y-1 : verticalSegCount-1;
          element.xSeg = tempCoords.x;
          break;
        case 'B':
          element.ySeg = (tempCoords.y < verticalSegCount-1) ? tempCoords.y+1 : 0;
          element.xSeg = tempCoords.x;
          break;
      
        default:
          break;
      }
      // Set temp coords to current elements coordinates
      tempCoords.x = element.xSeg;
      tempCoords.y = element.ySeg;
    });
  }

  function createSegmentElementAt(xSeg, ySeg) {
    // Create snake segment
    let segmentDiv = document.createElement('div');
    // Style segment
    segmentDiv.style.width = `${segSizeWidth}px`;
    segmentDiv.style.height = `${segSizeHeight}px`;
    segmentDiv.style.backgroundColor = '#000000';
    // Update position
    segmentDiv.style.position = 'absolute';
    segmentDiv.style.left = `${xSeg * segSizeWidth}px`;
    segmentDiv.style.top = `${ySeg * segSizeHeight}px`;
    // Append to canvas
    snakeCanvas.appendChild(segmentDiv);
    return segmentDiv;
  }

  function updateCanvas() {
    // Update snake heads position
    if(!snakeHead.segEl) snakeHead.segEl = createSegmentElementAt(snakeHead.xSeg, snakeHead.ySeg);
    snakeHead.segEl.style.left = `${snakeHead.xSeg * segSizeWidth}px`;
    snakeHead.segEl.style.top = `${snakeHead.ySeg * segSizeHeight}px`;
    // Update foods position
    if(!snakeFood.segEl) {
      snakeFood.segEl = createSegmentElementAt(snakeFood.xSeg, snakeFood.ySeg);
      //Override color of food after it's created.
      snakeFood.segEl.style.backgroundColor = '#ffcf00';
    }
    snakeFood.segEl.style.left = `${snakeFood.xSeg * segSizeWidth}px`;
    snakeFood.segEl.style.top = `${snakeFood.ySeg * segSizeHeight}px`;
    // Update tails position
    snakeTail.forEach(tailSeg => {
      if(!tailSeg.segEl) tailSeg.segEl = createSegmentElementAt(tailSeg.xSeg, tailSeg.ySeg);
      tailSeg.segEl.style.left = `${tailSeg.xSeg * segSizeWidth}px`;
      tailSeg.segEl.style.top = `${tailSeg.ySeg * segSizeHeight}px`;
    });
  }

  function checkForFood() {
      // Collision with head
      if ((snakeHead.xSeg === snakeFood.xSeg) && (snakeHead.ySeg === snakeFood.ySeg)) {
        randomiseFood();
        growTail();
      }
  }

  function growTail() {
    let x = snakeTail[snakeTail.length-1];
    let cpyObj = {loc: x.loc, xSeg: x.xSeg, ySeg: x.ySeg, segEl: null};
    snakeTail.push(cpyObj);
  }

  function randomiseFood() {
    snakeFood.xSeg = Math.floor(Math.random() * (horizontalSegCount));
    snakeFood.ySeg = Math.floor(Math.random() * (verticalSegCount));

    let colided = false;
    snakeTail.forEach(tailEl => {
      if (tailEl.xSeg === snakeFood.xSeg && tailEl.ySeg === snakeFood.ySeg) {
        colided = true;
      }
    });

    if (snakeHead.xSeg === snakeFood.xSeg && snakeHead.ySeg === snakeFood.ySeg) colided = true;

    if (colided) randomiseFood();
  }

  function recalculateValues() {
    // Check if canvas has not changes, if it did recalculate variables required
    if (canvasSize.xSize !== snakeCanvas.clientWidth || canvasSize.ySize !== snakeCanvas.clientHeight) {
      horizontalSegCount = Number.parseInt(snakeCanvas.clientWidth / segSize);
      verticalSegCount = Number.parseInt(snakeCanvas.clientHeight / segSize);
      segSizeWidth = snakeCanvas.clientWidth / horizontalSegCount;
      segSizeHeight = snakeCanvas.clientHeight / verticalSegCount;

      // Clear canvas
      snakeCanvas.innerHTML = '';

      // Update size and location of snakes tail
      canvasSize = {xSize: snakeCanvas.clientWidth, ySize: snakeCanvas.clientHeight};
      for (let i = 0; i < snakeTail.length; i++) {
        snakeTail[i].segEl = null;
      }

      // Update location and size of snakes head
      snakeHead.segEl = null;
      if (snakeHead.xSeg > horizontalSegCount-1) snakeHead.xSeg = horizontalSegCount-1;
      if (snakeHead.ySeg > verticalSegCount-1) snakeHead.ySeg = verticalSegCount-1;

      // Update size and location of snakes food
      snakeFood.segEl = null;
      if (snakeFood.xSeg > horizontalSegCount-1) snakeFood.xSeg = horizontalSegCount-1;
      if (snakeFood.ySeg > verticalSegCount-1) snakeFood.ySeg = verticalSegCount-1;

      updateTailSegmentationCoords();
    }
  }

  function moveSnake() {
    recalculateValues();
    let oldPos = { x: snakeHead.xSeg, y: snakeHead.ySeg };
    // Move Head
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
    let newPos = { x: snakeHead.xSeg, y: snakeHead.ySeg };
    // Move Tail
    let tempPos;
    for (let i = 0; i < snakeTail.length; i++) {
      const tailSeg = snakeTail[i];
      tempPos = { x: tailSeg.xSeg, y: tailSeg.ySeg };
      tailSeg.xSeg = oldPos.x;
      tailSeg.ySeg = oldPos.y;
      oldPos.x = tempPos.x;
      oldPos.y = tempPos.y;
      // Update orientation value (L/R/A/B) according to segments possition that is at the front of the current segment.
      if ((tailSeg.xSeg+1 === newPos.x) && (tailSeg.ySeg === newPos.y)) {
        tailSeg.loc = 'L'; //on the Left
      } else if ((tailSeg.xSeg-1 === newPos.x) && (tailSeg.ySeg === newPos.y)) {
        tailSeg.loc = 'R'; //on the Right
      } else if ((tailSeg.xSeg === newPos.x) && (tailSeg.ySeg+1 === newPos.y)) {
        tailSeg.loc = 'A'; //Above
      } else if ((tailSeg.xSeg === newPos.x) && (tailSeg.ySeg-1 === newPos.y)) {
        tailSeg.loc = 'B'; //Below
      }
      // Set newPos
      newPos.x = tailSeg.xSeg;
      newPos.y = tailSeg.ySeg;
    }
  }

  /**
   * Public Properties
   */
  return {
    RestartGame: RestartGame,
    SetGameSpeed: ChangeGameSpeed
  }
})();