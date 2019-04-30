webSnake.InitGame('.snake-canvas', {
  segSize: 20,
  speed: 60,
  segmentClassName: "snake-segment",
  foodClassName: "snake-food"
});
webSnake.RestartGame();

document.querySelector('#mySpeedRange').oninput = function() {
  webSnake.SetGameSpeed(900 / this.value);
  document.querySelector('#speed').textContent = this.value;
}

document.querySelector('#mySegSize').oninput = function() {
  webSnake.SetSegmentSize(this.value);
  document.querySelector('#seg-Size').textContent = this.value;
}