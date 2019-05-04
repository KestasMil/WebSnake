const webSnake = (function(canvasSelector) {
  // DOM container for a game
  let snakeCanvas;
  // Dimensions of canvas {xSize, ySize}
  let canvasSize;
  // Size of the segment (aprox.).
  let segSize;
  // Number of segments fitting horizontally and vertically.
  let horizontalSegCount;
  let verticalSegCount;
  // Snake segment size.
  let segSizeWidth;
  let segSizeHeight;
  // Game objects
  let snakeHead = {};
  let snakeTail = [];
  let snakeFood = {};
  // Game state
  let direction;
  let initialDirection;
  let speed;
  let startingSegs;
  let foodClassName;
  let segmentClassName;
  let AutoPilotEnabled = false;
  let CurrentScore = 0;
  let HighScore = 0;
  // Game loop timer (pointer)
  let intervalPointer;
  // Subsciber functions to score updates
  let OnScoreChangedSubs = [];


  /**
   * Hookup input events.
   */
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

  /**
   * Public Fields and Methods
   */

  function InitGame(canvasSelector, params) {
    // Default settings OR settings deconstructed from object passed in.
    ({
      segSize=10,
      speed=1000,
      direction = 'RIGHT',
      startingSegs = 5,
      segmentClassName = "",
      foodClassName = ""
    } = params);
    initCanvas(canvasSelector);
    initialDirection = direction;
    //Calc max number of segments to display in canvas horizontaly (to fill canvas without gaps).
    horizontalSegCount = Number.parseInt(snakeCanvas.clientWidth / segSize);
    //Calculate maximum number of segments fitting vertically (to fill canvas without gaps).
    verticalSegCount = Number.parseInt(snakeCanvas.clientHeight / segSize);
    //Based on horizontalSegCount calculate the size of one segment horizontally.
    segSizeWidth = snakeCanvas.clientWidth / horizontalSegCount;
    //Based on verticalSegCount calculate the size of one segment vertically.
    segSizeHeight = snakeCanvas.clientHeight / verticalSegCount;
  }

  function RestartGame() {
    stopGameLoop();
    direction = initialDirection;
    // Clear canvas
    snakeCanvas.innerHTML = '';
    // Initialize game objects.
    snakeHead = initHead();
    snakeTail = initTail(startingSegs, 'L'); //tail with 5 segments. 'L' - all segments to the left of the head. (L, R, A, B)
    snakeFood = initFood();
    // Update tail's segmens coordinates, required after initializing tail for the first time (and on canvas resize).
    updateTailSegmentationCoords();
    startGameLoop();
  }

  function ChangeGameSpeed(newSpeed) {
    speed = newSpeed;
    stopGameLoop();
    startGameLoop();
  }

  function ChangeSegmentSize(newSize) {
    segSize = newSize;
    recalculateValues();
  }

  function OnScoreChanged(func) {
    OnScoreChangedSubs.push(func);
  }

  /**
   * Functions
   */
  function startGameLoop() {
    //Start Game loop
    intervalPointer = setInterval(function(){
      if (AutoPilotEnabled) {
        let directionToGo = GetDirectionToFood();
        if(directionToGo != 0) direction = directionToGo;        
      }
      moveSnake();
      checkForFood();
      if (checkForCollision()) {
        UpdateScore(0);
        clearInterval(intervalPointer);
        RestartGame();
      }
      updateCanvas();
    }, speed);
  }

  function stopGameLoop() {
    clearInterval(intervalPointer);
  }

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

  function initCanvas(canvasSelector) {
    snakeCanvas = document.querySelector(canvasSelector);
    snakeCanvas.style.position = 'relative';
    canvasSize = {xSize: snakeCanvas.clientWidth, ySize: snakeCanvas.clientHeight};
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
    segmentDiv.className = "snake-segment";
    // Style segment
    //--mandatory styles
    segmentDiv.style.width = `${segSizeWidth}px`;
    segmentDiv.style.height = `${segSizeHeight}px`;
    segmentDiv.style.boxSizing = "border-box";
    //--default styles
    if (segmentClassName == "") {
      segmentDiv.style.backgroundColor = '#000000';
    }
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
      if (foodClassName == "") {
        snakeFood.segEl.style.backgroundColor = '#ffcf00';
      } else {
        snakeFood.segEl.className = foodClassName;
      }
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
        UpdateScore(CurrentScore+1);
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

  function moveSnake() {
    // Check if canvas has not changes, if it did recalculate variables required
    if (canvasSize.xSize !== snakeCanvas.clientWidth || canvasSize.ySize !== snakeCanvas.clientHeight) {
      recalculateValues();
    }
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

  function UpdateScore(current) {
    CurrentScore = current;
    if (CurrentScore > HighScore) HighScore = CurrentScore;

    OnScoreChangedSubs.forEach(f => {
      f({CurrentScore: CurrentScore, HighScore: HighScore});
    });
  }

  //=========================
  // AUTOPILOT IMPLEMENTATION
  //=========================
  function GetDirectionToFood() {
    // Test Matrix
    /*let Matrix = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];*/
    // Get Play Area Matrix
    let Matrix = GetPlayAreaMatrix();
  
    // To - That's snake head's possition, end point of the algorythm.
    let To = {x: snakeHead.xSeg, y: snakeHead.ySeg};
    // From - location of food, that's the starting point of the algorythm.
    // approachingFrom - 0 not set, 1 - left, 2 - top, 3 - right, 4 - bottom.
    let From = {x: snakeFood.xSeg, y: snakeFood.ySeg, approachingFrom: 0};  
  
    // Copy of play are matrix
    let Mtrx = Matrix;
  
    // Size of the matrix
    MtrxWidth = Mtrx[0].length;
    MtrxHeight = Mtrx.length;
  
    // Shortest possible distance to target
    let ShortestDistance = 999999;
    // Shortest possible distance to target found
    let ShortestDistanceFound = false;

    // Longest available distance to travel to (in case food is not reachable at the moment)
    let LongestDistance = 0;
    let ApproachedLDFrom = 0;
  
    // Counter of itterations
    let itCounter = 0;
    // Max itterations allowed
    let maxItterations = 100000;
  
    // Side target (To) was approached from
    let ApproachedFrom = 0;
  
    // Trigger search algorithm
    var t0 = performance.now();
    SetCellsDistances([From], 1);
    var t1 = performance.now();

    // TEST BLOCK
    /*console.log("Itterations: ", itCounter);
    console.log("Path Length: " + ShortestDistance);
    console.log("Approached From: " + ApproachedFrom);
    console.log(Mtrx);
    console.log("Time taken: " + (t1 - t0) + " milliseconds.");*/
    // --- END OF TEST BLOCK ---
  
    // RETURN THE RESULT
    // Return direction to food if food is not blocked
    if (ApproachedFrom != 0) {
      if (ApproachedFrom == 1) return "LEFT";
      if (ApproachedFrom == 3) return "RIGHT";
      if (ApproachedFrom == 2) return "UP";
      if (ApproachedFrom == 4) return "DOWN";
      if (ApproachedFrom == 0) return 0;
    } else {
      // Calculate direction to the furthest available cell and return direction to it
      Mtrx[snakeHead.ySeg][snakeHead.xSeg] = -1;
      let ld = 0;
      let goTo = 0;
      To = {x: snakeFood.xSeg, y: snakeFood.ySeg};
      // Up dist
      if (direction != "DOWN") {
        let FromHead = {x: snakeHead.xSeg, y: snakeHead.ySeg, approachingFrom: 0};
        if (FromHead.y == 0) {
          FromHead.y = MtrxHeight-1;
        } else {
          FromHead.y = FromHead.y - 1;
        }
        if (Mtrx[FromHead.y][FromHead.x] !== -1) {
          SetCellsDistances([FromHead], 1);
          if (LongestDistance > ld) {
            ld = LongestDistance;
            goTo = "UP";
          }
        }
      }
      // Down dist
      if (direction != "UP") {
        FromHead = {x: snakeHead.xSeg, y: snakeHead.ySeg, approachingFrom: 0};
        if (FromHead.y == MtrxHeight-1) {
          FromHead.y = 0;
        } else {
          FromHead.y = FromHead.y + 1;
        }
        if (Mtrx[FromHead.y][FromHead.x] !== -1) {
          SetCellsDistances([FromHead], 1);
          if (LongestDistance > ld) {
            ld = LongestDistance;
            goTo = "DOWN";
          }
        }
      }
      // Left dist
      if (direction != "RIGHT") {
        FromHead = {x: snakeHead.xSeg, y: snakeHead.ySeg, approachingFrom: 0};
        if (FromHead.x == 0) {
          FromHead.x = MtrxWidth-1;
        } else {
          FromHead.x = FromHead.x - 1;
        }
        if (Mtrx[FromHead.y][FromHead.x] !== -1) {
          SetCellsDistances([FromHead], 1);
          if (LongestDistance > ld) {
            ld = LongestDistance;
            goTo = "LEFT";
          }
        }
      }
      // Right dist
        if (direction != "LEFT") {
        FromHead = {x: snakeHead.xSeg, y: snakeHead.ySeg, approachingFrom: 0};
        if (FromHead.x == MtrxWidth-1) {
          FromHead.x = 0;
        } else {
          FromHead.x = FromHead.x + 1;
        }
        if (Mtrx[FromHead.y][FromHead.x] !== -1) {
          SetCellsDistances([FromHead], 1);
          if (LongestDistance > ld) {
            ld = LongestDistance;
            goTo = "RIGHT";
          }
        }
      }
      return goTo;
    }
  
    // Local function/algorithm to calculate distance to food
    function SetCellsDistances(cells, distance) {
      let newCells = [];
      if (ShortestDistanceFound) return;
      
      cells.forEach(cell => {
        if (ShortestDistanceFound) return;
        itCounter++;
        // Check if food reached and return if true
        if (cell.y == To.y && cell.x == To.x) {
          if (ShortestDistance > distance) ShortestDistance = distance;
          ShortestDistanceFound = true;
          ApproachedFrom = cell.approachingFrom;
          return;
        } else {
          // Set longest distance in case food is not reachable we will return that
          if (LongestDistance < distance) {
            LongestDistance = distance;
            ApproachedLDFrom = cell.approachingFrom;
          }
        }
    
        // Set distance value if cell distance greater than distance and cell not -1 (-1 are blocked cells)
        if (Mtrx[cell.y][cell.x] !== -1 || Mtrx[cell.y][cell.x] > distance) 
        {
          Mtrx[cell.y][cell.x] = distance;
    
          // Add Adjacent cells to array to be checked next
          // Left
          let cl = {};
          cl.x = cell.x;
          cl.y = cell.y;
          cl.approachingFrom = 3; // 3 - right
          if (cell.x == 0) {
            cl.x = MtrxWidth-1;
          } else {
            cl.x = cell.x - 1;
          }
          if (Mtrx[cl.y][cl.x] !== -1 && (Mtrx[cl.y][cl.x] > distance+1 || Mtrx[cl.y][cl.x] == 0)) {
            if(newCells.filter(function(value){ return (value.x == cl.x && value.y == cl.y); }).length == 0) newCells.push(cl);
          }
          // Right
          cl = {};
          cl.x = cell.x;
          cl.y = cell.y;
          cl.approachingFrom = 1; // 1 - left
          if (cell.x == MtrxWidth-1) {
            cl.x = 0;
          } else {
            cl.x = cell.x + 1;
          }
          if (Mtrx[cl.y][cl.x] !== -1 && (Mtrx[cl.y][cl.x] > distance+1 || Mtrx[cl.y][cl.x] == 0)) {
            if(newCells.filter(function(value){ return (value.x == cl.x && value.y == cl.y); }).length == 0) newCells.push(cl);
          }
          // Up
          cl = {};
          cl.x = cell.x;
          cl.y = cell.y;
          cl.approachingFrom = 4; // 4 - bottom
          if (cell.y == 0) {
            cl.y = MtrxHeight-1;
          } else {
            cl.y = cell.y - 1;
          }
          if (Mtrx[cl.y][cl.x] !== -1 && (Mtrx[cl.y][cl.x] > distance+1 || Mtrx[cl.y][cl.x] == 0)) {
            if(newCells.filter(function(value){ return (value.x == cl.x && value.y == cl.y); }).length == 0) newCells.push(cl);
          }
          // Down
          cl = {};
          cl.x = cell.x;
          cl.y = cell.y;
          cl.approachingFrom = 2; // 2 - above
          if (cell.y == MtrxHeight - 1) {
            cl.y = 0;
          } else {
            cl.y = cell.y + 1;
          }
          if (Mtrx[cl.y][cl.x] !== -1 && (Mtrx[cl.y][cl.x] > distance+1 || Mtrx[cl.y][cl.x] == 0)) {
            if(newCells.filter(function(value){ return (value.x == cl.x && value.y == cl.y); }).length == 0) newCells.push(cl);
          }
        }
    
      });
      if (newCells.length > 0) SetCellsDistances(newCells, distance+1);
    }
  }

  function GetPlayAreaMatrix() {
    let matrix = [];
    // Create empty matrix
    for (let i = 0; i < verticalSegCount; i++) {
      let h = [];
      for (let j = 0; j < horizontalSegCount; j++) {
        h.push(0);
      }
      matrix.push(h);
    }

    // Set body coords
    snakeTail.forEach(seg => {
      matrix[seg.ySeg][seg.xSeg] = -1;
    });

    // Return play are matrix
    return matrix;
  }

  function ToggleAutoPilot() {
    AutoPilotEnabled = !AutoPilotEnabled;
  }
  //===============================
  //END OF AUTOPILOT IMPLEMENTATION
  //===============================

  /**
   * Public Properties
   */
  return {
    InitGame: InitGame,
    RestartGame: RestartGame,
    SetGameSpeed: ChangeGameSpeed,
    SetSegmentSize: ChangeSegmentSize,
    ToggleAutoPilot: ToggleAutoPilot,
    OnScoreChanged: OnScoreChanged
  }
})();