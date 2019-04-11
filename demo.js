webSnake.InitGame('.snake-canvas', {
  segSize: 15,
  speed: 80
});
webSnake.RestartGame();

document.querySelector('#mySpeedRange').oninput = function() {
  webSnake.SetGameSpeed(this.value);
  document.querySelector('#speed').textContent = this.value;
}

document.querySelector('#mySegSize').oninput = function() {
  webSnake.SetSegmentSize(this.value);
  document.querySelector('#seg-Size').textContent = this.value;
}